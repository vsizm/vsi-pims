'use client';

export default function HomePage() {
  return (
    <main style={{minHeight:'100vh',margin:0,padding:0,background:'#003566',color:'#fff',fontFamily:'Arial,Helvetica,sans-serif'}}>
      <div style={{height:10,background:'#ffc300',width:'100%'}} />
      <div style={{minHeight:'calc(100vh - 10px)',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'40px 24px',boxSizing:'border-box'}}>
        <div style={{width:'100%',maxWidth:1000}}>
          <div style={{fontSize:12,fontWeight:800,letterSpacing:'.22em',color:'#ffc300',marginBottom:22}}>VISIONARY STUDENTS INITIATIVE</div>
          <h1 style={{margin:0,lineHeight:1.02,fontSize:'clamp(42px,7vw,82px)',fontWeight:800,letterSpacing:'-.04em'}}>
            <span style={{display:'block',color:'#ffc300'}}>VSI Information</span>
            <span style={{display:'block',color:'#fff'}}>Management System</span>
          </h1>
          <p style={{margin:'26px auto 38px',fontSize:'clamp(17px,2.2vw,25px)',lineHeight:1.5,color:'#fff',maxWidth:720}}>Data, evidence and insight behind our work</p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="https://ims.vsizambia.org/activity-report" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'14px 28px',borderRadius:9999,background:'#fff',color:'#003566',fontSize:15,fontWeight:700,textDecoration:'none'}}>Submit an activity report</a>
            <a href="https://www.vsizambia.org/activities/submit" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'14px 28px',borderRadius:9999,background:'#ffc300',color:'#003566',fontSize:15,fontWeight:700,textDecoration:'none'}}>Volunteer Activity Logbook</a>
          </div>
          <div style={{marginTop:65,fontSize:10,fontWeight:800,letterSpacing:'.18em',color:'rgba(255,255,255,.8)'}}>INFORMATION · INTELLIGENCE · IMPACT</div>
        </div>
      </div>
    </main>
  );
}
