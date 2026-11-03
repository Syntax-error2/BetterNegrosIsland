import QRCode from 'qrcode';
import { wrapEvidenceText, type EvidenceModel } from './evidence';

/** Local canvas + QR rendering. No external image/export service or visitor upload. */
export async function buildEvidencePng(model: EvidenceModel): Promise<string> {
  if (!model.source) throw Error('A verified source link is required to export this card.');
  await document.fonts.ready;
  const logo = new Image();
  logo.src = '/brand/bni-regional-wordmark.png';
  await logo.decode();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw Error('Image export is unavailable in this browser.');
  const width = 1080, padding = 64, textWidth = width - padding * 2;
  const font = '"Plus Jakarta Sans", Arial, sans-serif';
  const blocks: { lines: string[]; size: number; weight: number; color: string; gap: number }[] = [];
  const add = (text: string, size: number, weight = 400, color = '#102a43', gap = 20) => {
    ctx.font = `${weight} ${size}px ${font}`;
    blocks.push({ lines: wrapEvidenceText(text, textWidth, s => ctx.measureText(s).width), size, weight, color, gap });
  };
  add('Published project evidence · FY2027', 26, 600, '#364152');
  add(model.title, 38, 700, '#102a43', 28);
  add(model.stage, 28, 600, '#123e99', 12);
  add(model.amount, 48, 700, '#102a43', 24);
  add(`${model.dataset} · Source record ${model.recordId}`, 24);
  add(`Dated snapshot retrieved: ${model.retrieved}\nComparison source built: ${model.sourceBuilt}`, 24);
  add('Read this figure in context', 28, 700);
  for (const note of model.notes) add(note, 23, 400, '#364152', 16);
  add('Source reference · scan the QR code or use this URL', 26, 700);
  add(model.source, 23, 400, '#123e99');
  const height = Math.ceil(190 + blocks.reduce((n, b) => n + b.lines.length * b.size * 1.55 + b.gap, 0) + 390);
  if (height > 30000) throw Error('This record is too long for a single image. Read or copy the evidence as text instead.');
  canvas.width = width; canvas.height = height;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
  ctx.drawImage(logo, padding, 42, 360, 360 * logo.naturalHeight / logo.naturalWidth);
  ctx.fillStyle = '#d5dce3'; ctx.fillRect(padding, 166, textWidth, 2);
  let y = 198;
  ctx.textBaseline = 'top';
  for (const block of blocks) {
    ctx.font = `${block.weight} ${block.size}px ${font}`;
    ctx.fillStyle = block.color;
    for (const line of block.lines) { ctx.fillText(line, padding, y); y += block.size * 1.55; }
    y += block.gap;
  }
  const qr = QRCode.create(model.source, { errorCorrectionLevel: 'M' });
  const moduleSize = Math.max(3, Math.floor(250 / (qr.modules.size + 8)));
  const qrSide = (qr.modules.size + 8) * moduleSize;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(padding, y, qrSide, qrSide);
  ctx.fillStyle = '#000000';
  for (let row = 0; row < qr.modules.size; row++) for (let col = 0; col < qr.modules.size; col++) {
    if (qr.modules.get(row, col)) ctx.fillRect(padding + (col + 4) * moduleSize, y + (row + 4) * moduleSize, moduleSize, moduleSize);
  }
  const footerX = padding + qrSide + 32;
  ctx.fillStyle = '#102a43'; ctx.font = `600 23px ${font}`;
  const footer = wrapEvidenceText(model.provider + '\nIndependent civic transparency initiative.\nNo government affiliation or endorsement implied.', width - padding - footerX, s => ctx.measureText(s).width);
  footer.forEach((line, i) => ctx.fillText(line, footerX, y + 18 + i * 36));
  return canvas.toDataURL('image/png');
}
