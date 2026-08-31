'use client';

export default function HomePage() {
  return (
    <main style={{minHeight:'100vh',margin:0,padding:0,background:'#003566',color:'#fff',fontFamily:'Arial,Helvetica,sans-serif',position:'relative',overflow:'hidden'}}>
      <div style={{height:10,background:'#ffc300',width:'100%',position:'relative',zIndex:10}} />

      <div aria-hidden="true" className="network">
        {[
          [8,18,14],[18,42,10],[7,70,12],[25,12,8],[31,82,13],[43,22,9],[48,68,11],[58,12,12],[66,43,9],[76,20,13],[87,58,10],[94,30,12],[84,82,9],[64,88,12],[39,52,8],[14,88,9],[52,38,7],[92,86,8]
        ].map(([left,top,size],i)=><span key={i} className="node" style={{left:`${left}%`,top:`${top}%`,width:size,height:size,animationDelay:`${i*0.35}s`}} />)}
        <svg className="lines" viewBox="0 0 1000 700" preserveAspectRatio="none">
          <g fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="1">
            <path d="M80 126 L180 294 L310 84 L430 364 L520 266 L660 84 L760 300 L870 140 L940 406" />
            <path d="M70 490 L180 294 L390 574 L520 266 L640 616 L760 300 L840 574 L940 406" />
            <path d="M250 84 L390 574 M310 84 L520 266 M660 84 L640 616 M180 294 L520 266 M760 300 L640 616" />
          </g>
        </svg>
      </div>

      <div style={{position:'relative',zIndex:2,minHeight:'calc(100vh - 10px)',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'40px 24px',boxSizing:'border-box'}}>
        <div style={{width:'100%',maxWidth:1000}}>
          <div style={{fontSize:12,fontWeight:800,letterSpacing:'.22em',color:'#ffc300',marginBottom:22}}>VISIONARY STUDENTS INITIATIVE</div>
          <h1 style={{margin:0,lineHeight:1.02,fontSize:'clamp(42px,7vw,82px)',fontWeight:800,letterSpacing:'-.04em',textShadow:'0 2px 24px rgba(0,0,0,.12)'}}>
            <span style={{display:'block',color:'#ffc300'}}>VSI Information</span>
            <span style={{display:'block',color:'#fff'}}>Management System</span>
          </h1>
          <p style={{margin:'26px auto 38px',fontSize:'clamp(17px,2.2vw,25px)',lineHeight:1.5,color:'#fff',maxWidth:720,textShadow:'0 2px 16px rgba(0,0,0,.15)'}}>Data, evidence and insight behind our work</p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="https://ims.vsizambia.org/activity-report" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'14px 28px',borderRadius:9999,background:'#fff',color:'#003566',fontSize:15,fontWeight:700,textDecoration:'none',boxShadow:'0 8px 30px rgba(0,0,0,.16)'}}>Submit an activity report</a>
            <a href="https://www.vsizambia.org/activities/submit" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'14px 28px',borderRadius:9999,background:'#ffc300',color:'#003566',fontSize:15,fontWeight:700,textDecoration:'none',boxShadow:'0 8px 30px rgba(0,0,0,.16)'}}>Volunteer Activity Logbook</a>
          </div>
          <div style={{marginTop:65,fontSize:10,fontWeight:800,letterSpacing:'.18em',color:'rgba(255,255,255,.8)'}}>INFORMATION · INTELLIGENCE · IMPACT</div>
        </div>
      </div>

      <style jsx>{`
        .network{position:absolute;inset:10px 0 0;pointer-events:none;opacity:.55}
        .lines{position:absolute;inset:0;width:100%;height:100%;opacity:.55}
        .node{position:absolute;border-radius:50%;background:#ffc300;box-shadow:0 0 14px rgba(255,195,0,.38);opacity:.38;animation:pulse 4.5s ease-in-out infinite,drift 9s ease-in-out infinite alternate}
        @keyframes pulse{0%,100%{opacity:.18;transform:scale(.75)}50%{opacity:.48;transform:scale(1.25)}}
        @keyframes drift{from{margin-left:-5px;margin-top:-3px}to{margin-left:5px;margin-top:4px}}
        @media(max-width:600px){.network{opacity:.38}.lines{opacity:.45}}
        @media(prefers-reduced-motion:reduce){.node{animation:none}}
      `}</style>
    </main>
  );
}
