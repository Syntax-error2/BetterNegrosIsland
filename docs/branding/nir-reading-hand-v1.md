# NIR reading poster illustration

Created 3 November 2026 with the built-in `image_gen` tool, generate mode, transparent background. No CLI/API fallback was used. The national BetterGov.PH reading page was a visual direction reference for the page layout; its illustration and logo were not copied into this asset.

- Editable implementation: `src/pages/RegionalChanges.tsx` and `src/styles/regional-changes.css`.
- Original generated master: [nir-reading-hand-v1-master.png](nir-reading-hand-v1-master.png), 1024 × 1536, RGBA PNG.
- Production asset: [nir-reading-hand-v1.webp](../../public/campaign/nir-reading-hand-v1.webp), 1024 × 1536, alpha-preserving WebP. FFmpeg was used only to encode the generated image for web delivery, without changing its composition.
- The selected original is also retained under the Codex generated-images directory. The site consumes the repository copy and does not depend on that local directory.
- Illustration is decorative and marked with empty alternative text. The headline, records and notices remain selectable HTML. The footer discloses the generated illustration and credits the national visual inspiration without implying endorsement.
- Anton, Inter and JetBrains Mono are self-hosted through Fontsource. Their OFL notices are included under `public/`. The page makes no third-party font or illustration request.

Final generation prompt:

> Use case: stylized-concept. Asset type: transparent website editorial poster illustration. Create an ORIGINAL red screen-print / woodcut halftone illustration of one raised human hand tightly holding a fan of loose budget-document sheets, forearm extending vertically out of the bottom of the frame. Anatomically coherent single hand, thumb and curled fingers clearly gripping the papers. Papers fan across the upper third with short abstract ruled marks, NO readable words or numbers. Strong diagonal paper edges, red ink outlines and dense vintage newsprint halftone dots. Single vivid vermilion red (#d62828), with transparent negative space between ink marks and transparent background. Portrait composition roughly 2:3, silhouette fills most of the frame, complete fan of paper at top with a little breathing room and straight forearm cut at bottom. This will sit on the right half of a cream-and-black civic budget reading website. No slogan, no logo, no other objects, no flag, no watermark, no solid white rectangle, no gradient, no 3D.
