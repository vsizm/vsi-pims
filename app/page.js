'use client';

const backgroundImages = [
  '/Civic%20leadership.jpg',
  '/Youth%20development%202.webp',
  '/cleaning%20programme1.jpg',
  '/research.JPG',
  '/vsi%20mental%20health.jpg',
  '/vsi%20outreach%20(2).jpg',
  '/vsi%20outreach.jpg',
  '/vsi%20volunteers%201.jpg',
  '/vsi%20volunteers%204.jpg',
  '/vsi%20volunteers%205.jpg',
  '/vsi%20volunteers%207.jpg',
  '/vsi%20what%20we%20stand%20on%201.jpg',
];

export default function HomePage() {
  return (
    <main style={{minHeight:'100vh',margin:0,padding:0,background:'#003566',color:'#fff',fontFamily:'Arial,Helvetica,sans-serif',position:'relative',overflow:'hidden'}}>
      <div style={{height:10,background:'#ffc300',width:'100%',position:'relative',zIndex:20}} />
      <div aria-hidden="true" className="photoCollage">
        {backgroundImages.map((src,index)=>(
          <div key={src} className={`photo photo${index + 1}`} style={{animationDelay:`${index * 1.15}s`}}><img src={src} alt="" /></div>
        ))}
      </div>
      <div aria-hidden="true" className="photoVeil" />
      <div aria-hidden="true" className="network">
        {[[8,18,14],[18,42,10],[7,70,12],[25,12,8],[31,82,13],[43,22,9],[48,68,11],[58,12,12],[66,43,9],[76,20,13],[87,58,10],[94,30,12],[84,82,9],[64,88,12],[39,52,8],[14,88,9],[52,38,7],[92,86,8]].map(([left,top,size],i)=><span key={i} className="node" style={{left:`${left}%`,top:`${top}%`,width:size,height:size,animationDelay:`${i*0.35}s`}} />)}
        <svg className="lines" viewBox="0 0 1000 700" preserveAspectRatio="none"><g fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="1"><path d="M80 126 L180 294 L310 84 L430 364 L520 266 L660 84 L760 300 L870 140 L940 406" /><path d="M70 490 L180 294 L390 574 L520 266 L640 616 L760 300 L840 574 L940 406" /><path d="M250 84 L390 574 M310 84 L520 266 M660 84 L640 616 M180 294 L520 266 M760 300 L640 616" /></g></svg>
      </div>
      <div style={{position:'relative',zIndex:5,minHeight:'calc(100vh - 10px)',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'40px 24px',boxSizing:'border-box'}}>
        <div style={{width:'100%',maxWidth:1000}}>
          <div style={{fontSize:12,fontWeight:800,letterSpacing:'.22em',color:'#ffc300',marginBottom:22}}>VISIONARY STUDENTS INITIATIVE</div>
          <h1 style={{margin:0,lineHeight:1.02,fontSize:'clamp(42px,7vw,82px)',fontWeight:800,letterSpacing:'-.04em',textShadow:'0 2px 24px rgba(0,0,0,.35)'}}><span style={{display:'block',color:'#ffc300'}}>VSI Information</span><span style={{display:'block',color:'#fff'}}>Management System</span></h1>
          <p style={{margin:'26px auto 38px',fontSize:'clamp(17px,2.2vw,25px)',lineHeight:1.5,color:'#fff',maxWidth:720,textShadow:'0 2px 16px rgba(0,0,0,.35)'}}>Data, evidence and insight behind our work</p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}><a href="https://ims.vsizambia.org/activity-report" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'14px 28px',borderRadius:9999,background:'#fff',color:'#003566',fontSize:15,fontWeight:700,textDecoration:'none',boxShadow:'0 8px 30px rgba(0,0,0,.22)'}}>Submit an activity report</a><a href="https://www.vsizambia.org/activities/submit" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'14px 28px',borderRadius:9999,background:'#ffc300',color:'#003566',fontSize:15,fontWeight:700,textDecoration:'none',boxShadow:'0 8px 30px rgba(0,0,0,.22)'}}>Volunteer Activity Logbook</a></div>
          <div style={{marginTop:65,fontSize:10,fontWeight:800,letterSpacing:'.18em',color:'rgba(255,255,255,.8)'}}>INFORMATION · INTELLIGENCE · IMPACT</div>
        </div>
      </div>
      <style jsx>{`
        .photoCollage{position:absolute;inset:10px 0 0;pointer-events:none;z-index:0;overflow:hidden;opacity:.13}
        .photo{position:absolute;overflow:hidden;border-radius:18px;filter:saturate(.75) contrast(.92);animation:photoFloat 14s ease-in-out infinite alternate}
        .photo img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.04);animation:photoZoom 18s ease-in-out infinite alternate}
        .photo1{left:-4%;top:4%;width:31%;height:34%;transform:rotate(-3deg)} .photo2{left:28%;top:-8%;width:27%;height:31%;transform:rotate(2deg)} .photo3{right:-5%;top:3%;width:31%;height:35%;transform:rotate(3deg)}
        .photo4{left:5%;top:39%;width:27%;height:31%;transform:rotate(2deg)} .photo5{left:36%;top:30%;width:29%;height:38%;transform:rotate(-1deg)} .photo6{right:5%;top:39%;width:27%;height:31%;transform:rotate(-2deg)}
        .photo7{left:-5%;bottom:-7%;width:31%;height:34%;transform:rotate(3deg)} .photo8{left:27%;bottom:-9%;width:28%;height:34%;transform:rotate(-2deg)} .photo9{right:-4%;bottom:-6%;width:31%;height:35%;transform:rotate(2deg)}
        .photo10{left:12%;top:17%;width:22%;height:25%;transform:rotate(-4deg)} .photo11{right:13%;top:16%;width:22%;height:25%;transform:rotate(4deg)} .photo12{left:39%;bottom:8%;width:22%;height:25%;transform:rotate(1deg)}
        .photoVeil{position:absolute;inset:10px 0 0;background:radial-gradient(circle at center,rgba(0,53,102,.45) 0%,rgba(0,53,102,.78) 48%,rgba(0,53,102,.9) 100%);z-index:1;pointer-events:none}
        .network{position:absolute;inset:10px 0 0;pointer-events:none;z-index:2;opacity:.55}.lines{position:absolute;inset:0;width:100%;height:100%;opacity:.55}
        .node{position:absolute;border-radius:50%;background:#ffc300;box-shadow:0 0 14px rgba(255,195,0,.38);opacity:.38;animation:pulse 4.5s ease-in-out infinite,drift 9s ease-in-out infinite alternate}
        @keyframes pulse{0%,100%{opacity:.18;transform:scale(.75)}50%{opacity:.48;transform:scale(1.25)}} @keyframes drift{from{margin-left:-5px;margin-top:-3px}to{margin-left:5px;margin-top:4px}}
        @keyframes photoFloat{0%{margin-top:-7px}100%{margin-top:7px}} @keyframes photoZoom{0%{transform:scale(1.03)}100%{transform:scale(1.09)}}
        @media(max-width:600px){.photoCollage{opacity:.09}.network{opacity:.38}.lines{opacity:.45}.photo{border-radius:12px}.photo10,.photo11,.photo12{display:none}}
        @media(prefers-reduced-motion:reduce){.node,.photo,.photo img{animation:none}}
      `}</style>
    </main>
  );
}
