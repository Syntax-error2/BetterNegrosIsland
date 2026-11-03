export const LEGAL_VERSION = '2026-11-03-privacy.9';
export const ACK_KEY = 'betternegrosisland:legal';
export function hasAcknowledgment(storage: Pick<Storage, 'getItem'> | undefined): boolean {
  try { return storage?.getItem(ACK_KEY) === LEGAL_VERSION; } catch { return false; }
}
export function saveAcknowledgment(storage: Pick<Storage, 'setItem'> | undefined): void {
  try { storage?.setItem(ACK_KEY, LEGAL_VERSION); } catch { /* Session state still permits entry. */ }
}
