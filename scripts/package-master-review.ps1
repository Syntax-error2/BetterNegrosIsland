param([ValidatePattern('^[a-z][a-z0-9-]{0,40}$')][string]$Sprint = 'master-layout')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$reviewRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$packageRoot = [IO.Path]::GetFullPath((Join-Path $reviewRoot ('release/' + $Sprint)))
if (-not $packageRoot.StartsWith($reviewRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid package destination' }
New-Item -ItemType Directory -Force -Path $packageRoot | Out-Null
$staticArchive = Join-Path $packageRoot ('betternegrosisland-' + $Sprint + '-static-review.zip')
$sourceArchive = Join-Path $packageRoot ('betternegrosisland-' + $Sprint + '-source-review.zip')
foreach ($archivePath in @($staticArchive,$sourceArchive)) { if (Test-Path -LiteralPath $archivePath) { throw "Existing review archive retained: $archivePath" } }
[IO.Compression.ZipFile]::CreateFromDirectory((Join-Path $reviewRoot 'dist'), $staticArchive, [IO.Compression.CompressionLevel]::Optimal, $false)
$files = @()
foreach ($directoryName in @('src','scripts','public','tests','docs')) {
    $files += Get-ChildItem -LiteralPath (Join-Path $reviewRoot $directoryName) -Recurse -File
}
$rootNames = @('.env.example','.gitignore','DESIGN.md','eslint.config.js','FRONTEND_CONTRACT.md','index.html','LICENSE','netlify.toml','package-lock.json','package.json','portal.config.ts','README.md','tsconfig.app.json','tsconfig.json','tsconfig.node.json','UI_QA_REPORT.md','vercel.json','vite.config.ts','wrangler.jsonc')
foreach ($fileName in $rootNames) { $files += Get-Item -LiteralPath (Join-Path $reviewRoot $fileName) }
$zip = [IO.Compression.ZipFile]::Open($sourceArchive, [IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($file in ($files | Sort-Object FullName -Unique)) {
        $entryName = $file.FullName.Substring($reviewRoot.Length + 1).Replace('\','/')
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$file.FullName,$entryName,[IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
} finally { $zip.Dispose() }
function Verify-ReviewArchive([string]$ArchivePath,[string]$OwningRoot) {
    $zip = [IO.Compression.ZipFile]::OpenRead($ArchivePath)
    try {
        if (-not ($zip.Entries | Where-Object FullName -eq 'index.html')) { throw 'Missing entry point' }
        foreach ($entry in $zip.Entries) {
            if ($entry.FullName.EndsWith('/')) { continue }
            $filePath = [IO.Path]::GetFullPath((Join-Path $OwningRoot $entry.FullName))
            if (-not $filePath.StartsWith($OwningRoot + [IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Archive path escaped source' }
            $stream = $entry.Open()
            try { $sha = [Security.Cryptography.SHA256]::Create(); $entryHash = [Convert]::ToHexString($sha.ComputeHash($stream)); $sha.Dispose() } finally { $stream.Dispose() }
            if ($entryHash -ne (Get-FileHash -Algorithm SHA256 -LiteralPath $filePath).Hash) { throw "Archive content mismatch: $($entry.FullName)" }
        }
        return @{name=[IO.Path]::GetFileName($ArchivePath);bytes=(Get-Item -LiteralPath $ArchivePath).Length;files=$zip.Entries.Count;sha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $ArchivePath).Hash.ToLower();member_hash_validation='PASS'}
    } finally { $zip.Dispose() }
}
$results = @((Verify-ReviewArchive $staticArchive (Join-Path $reviewRoot 'dist')),(Verify-ReviewArchive $sourceArchive $reviewRoot))
@{status='LOCAL REVIEW ONLY; public launch remains pending';packages=$results} | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $packageRoot 'package-validation.json')
$results | ConvertTo-Json -Depth 6
