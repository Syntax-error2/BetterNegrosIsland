/** A long server cooldown aborts this refresh rather than retrying before permission. */
export function retryDelay(header:string|null,attempt:number,now=Date.now()):number {
 const numeric=header==null?NaN:Number(header);
 const requested=header==null?0:Number.isFinite(numeric)?numeric*1000:Math.max(0,Date.parse(header)-now);
 if(requested>10000)throw Error('Source requests a longer cooldown; last successful snapshot preserved. Retry later.');
 return Math.max(500*2**attempt,Number.isFinite(requested)?requested:0);
}
