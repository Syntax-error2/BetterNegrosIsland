export const CORRECTIONS_EMAIL = 'aquraitssuport@gmail.com';
export const correctionMailto = 'mailto:'+CORRECTIONS_EMAIL+'?subject='+encodeURIComponent('BetterNegrosIsland — correction or privacy request');
export interface CorrectionEntry { date:string; version:string; record:string; summary:string; source:string }
export function correctionLog(value:unknown):CorrectionEntry[] {
  const log=value as {schema?:number;entries?:CorrectionEntry[]};
  if(log?.schema!==1 || !Array.isArray(log.entries))throw Error('Correction log unavailable');
  for(const e of log.entries){
    if(!e || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || ![e.version,e.record,e.summary,e.source].every(v=>typeof v==='string'&&v.length>0&&v.length<=2000))throw Error('Invalid correction entry');
    const u=new URL(e.source);
    if(u.protocol!=='https:'||u.username||u.password)throw Error('Invalid correction source');
  }
  return log.entries;
}
