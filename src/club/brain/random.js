export function seeded(seed=Date.now()){
  let value=Number(seed)>>>0;
  return ()=>{value+=0x6D2B79F5;let n=value;n=Math.imul(n^n>>>15,n|1);n^=n+Math.imul(n^n>>>7,n|61);return ((n^n>>>14)>>>0)/4294967296;};
}
export function shuffled(values,random=Math.random){
  const result=[...values];
  for(let i=result.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
