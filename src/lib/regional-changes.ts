import type { ScopedProject } from './scope';
import { analyticsSelection } from './analytics-data';

export const CHANGE_GROUPS=[['house_only','House-only records'],['increased','Higher in the House bill'],['decreased','Lower in the House bill']] as const;
export function regionalChanges(input:readonly ScopedProject[],filters:{province?:string;program?:string;group?:string;query?:string;includeUnconfirmed?:boolean}={}){
  // Reuse conflict/duplicate guards. Only a published NIR region flag qualifies.
  const regional=analyticsSelection(input).rows.filter(p=>p.regionConfirmed===true&&p.region_key==='NIR');
  const eligible=regional.filter(p=>CHANGE_GROUPS.some(([key])=>key===p.bridge_group));
  const excludedUnconfirmed=eligible.filter(p=>p.held).length;
  const q=filters.query?.trim().toLowerCase()??'';
  const base=eligible.filter(p=>(filters.includeUnconfirmed||!p.held)&&(!filters.province||p.provinceMatches?.includes(filters.province))&&(!filters.program||p.dataset===filters.program)&&(!q||`${p.title} ${p.id} ${p.dataset}`.toLowerCase().includes(q)));
  const counts=CHANGE_GROUPS.map(([key,label])=>({key,label,count:base.filter(p=>p.bridge_group===key).length}));
  const rows=base.filter(p=>!filters.group||p.bridge_group===filters.group).sort((a,b)=>{
    const order=(key:string)=>CHANGE_GROUPS.findIndex(([v])=>v===key);
    return order(a.bridge_group)-order(b.bridge_group)||(b.house_php??b.nep_php??0)-(a.house_php??a.nep_php??0)||a.key.localeCompare(b.key);
  });
  return {rows,counts,excludedUnconfirmed,regionalRecords:regional.length};
}
