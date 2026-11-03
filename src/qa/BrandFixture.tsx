import BrandLogo from "../components/BrandLogo";
export default function BrandFixture() {
  return <main id="main-content" className="page page--wide main" tabIndex={-1}>
    <h1>Development brand composite checks</h1><p>Source-derived theme variants. Not a vector trace; original edge texture retained.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:24}}>
      {[{name:"White",color:"#ffffff",theme:"light"},{name:"Light gray",color:"#edf1f6",theme:"light"},{name:"Deep navy",color:"#10243f",theme:"dark"},{name:"Near-black",color:"#080d14",theme:"dark"}].map(s => <section key={s.name} style={{background:s.color,padding:24,border:"1px solid #8597a8",color:s.theme === "dark" ? "#fff":"#122b43"}}><h2 style={{color:"inherit",fontSize:16,marginBottom:24}}>{s.name}</h2><BrandLogo theme={s.theme as "light"|"dark"} /></section>)}
    </div>
  </main>;
}
