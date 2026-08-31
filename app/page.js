'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="landing">
      <div className="glow glowA" /><div className="glow glowB" /><div className="grid" />
      <nav className="nav">
        <Link href="/" className="brand"><img src="/VSI LOGO white.png" alt="Visionary Students Initiative" /><span>VSI <b>IMS</b></span></Link>
        <Link className="login" href="/login">Sign in <span>→</span></Link>
      </nav>
      <section className="hero">
        <div className="copy">
          <div className="eyebrow"><i /> INFORMATION MANAGEMENT SYSTEM</div>
          <h1>Data that moves<br /><em>VSI forward.</em></h1>
          <p>One connected system for programmes, activities, reporting, monitoring, evaluation, finance and evidence.</p>
          <Link className="cta" href="/login">Enter VSI IMS <span>↗</span></Link>
        </div>
        <div className="visual" aria-hidden="true">
          <div className="ring ring1" /><div className="ring ring2" /><div className="ring ring3" />
          <div className="core"><span>VSI</span><b>IMS</b></div>
          <div className="orbit orbit1"><span>PROGRAMMES</span></div>
          <div className="orbit orbit2"><span>MEAL</span></div>
          <div className="orbit orbit3"><span>FINANCE</span></div>
          <div className="beam beam1" /><div className="beam beam2" />
        </div>
      </section>
      <div className="bottom"><span>VISIONARY STUDENTS INITIATIVE</span><span>PROGRAMME INTELLIGENCE · ACCOUNTABILITY · EVIDENCE</span></div>
      <style jsx>{`.landing{position:relative;min-height:100svh;overflow:hidden;background:#031321;color:#fff;font-family:Arial,Helvetica,sans-serif;display:flex;flex-direction:column}.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:70px 70px;mask-image:linear-gradient(to bottom,transparent,#000 25%,#000 75%,transparent)}.glow{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none}.glowA{width:500px;height:500px;left:43%;top:12%;background:rgba(7,111,170,.22)}.glowB{width:280px;height:280px;right:-50px;bottom:-40px;background:rgba(255,195,0,.10)}.nav{position:relative;z-index:5;height:86px;padding:0 clamp(22px,5vw,70px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08)}.brand{display:flex;align-items:center;gap:11px;color:#fff;text-decoration:none;font-size:14px;letter-spacing:.08em;font-weight:900}.brand img{width:42px;height:42px;object-fit:contain}.brand b{color:#ffc300}.login{color:#fff;text-decoration:none;font-size:11px;font-weight:800;letter-spacing:.08em}.login span{color:#ffc300;font-size:17px;margin-left:8px}.hero{position:relative;z-index:2;flex:1;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:20px;max-width:1400px;width:100%;margin:auto;padding:40px clamp(22px,5vw,80px) 70px;box-sizing:border-box}.copy{max-width:700px}.eyebrow{display:flex;align-items:center;gap:10px;color:#7fb7d7;font-size:9px;letter-spacing:.2em;font-weight:900}.eyebrow i{width:25px;height:1px;background:#ffc300}.copy h1{font-family:Georgia,serif;font-weight:500;font-size:clamp(55px,7vw,96px);line-height:.92;letter-spacing:-.055em;margin:23px 0}.copy h1 em{font-style:normal;color:#ffc300}.copy p{max-width:510px;color:#a5b9c8;font-size:15px;line-height:1.7;margin:0 0 30px}.cta{display:inline-flex;align-items:center;gap:20px;background:#ffc300;color:#03233d;text-decoration:none;padding:15px 20px;border-radius:7px;font-size:10px;font-weight:900;letter-spacing:.08em}.cta span{font-size:17px}.visual{height:min(620px,65vw);min-height:390px;position:relative;display:grid;place-items:center}.ring{position:absolute;border:1px solid rgba(116,181,223,.19);border-radius:50%;transform:rotateX(68deg) rotateZ(-18deg)}.ring1{width:500px;height:500px}.ring2{width:390px;height:390px;border-color:rgba(255,195,0,.25);transform:rotateX(68deg) rotateZ(28deg)}.ring3{width:280px;height:280px}.core{width:150px;height:150px;border-radius:50%;display:grid;place-content:center;text-align:center;background:radial-gradient(circle at 35% 30%,#216b96,#05233a 68%);border:1px solid rgba(255,255,255,.25);box-shadow:0 0 80px rgba(22,133,190,.35),inset 0 0 30px rgba(255,255,255,.06);z-index:3}.core span{font-size:11px;letter-spacing:.25em;margin-left:.25em}.core b{font-family:Georgia,serif;font-size:35px;color:#ffc300;line-height:.9}.orbit{position:absolute;z-index:4;padding:7px 10px;border:1px solid rgba(255,255,255,.16);background:rgba(3,19,33,.8);backdrop-filter:blur(8px);border-radius:5px;font-size:7px;letter-spacing:.13em;color:#d3e0e8}.orbit1{top:15%;right:10%}.orbit2{left:7%;top:43%}.orbit3{right:8%;bottom:18%}.beam{position:absolute;height:1px;background:linear-gradient(90deg,transparent,rgba(255,195,0,.7),transparent);width:80%;transform:rotate(-20deg)}.beam1{top:28%;left:9%}.beam2{bottom:29%;right:3%;transform:rotate(25deg)}.bottom{position:relative;z-index:5;display:flex;justify-content:space-between;padding:17px clamp(22px,5vw,70px);border-top:1px solid rgba(255,255,255,.08);font-size:7px;letter-spacing:.14em;color:#66859a}.bottom span:last-child{color:#849bab}@media(max-width:850px){.hero{grid-template-columns:1fr;padding-top:65px}.copy{max-width:650px}.visual{height:430px;min-height:0}.ring1{width:370px;height:370px}.ring2{width:290px;height:290px}.ring3{width:210px;height:210px}.bottom{gap:20px;flex-direction:column}.orbit1{right:2%}.orbit3{right:3%}}@media(max-width:520px){.nav{height:72px}.brand img{width:35px;height:35px}.copy h1{font-size:54px}.copy p{font-size:13px}.visual{height:350px}.ring1{width:300px;height:300px}.ring2{width:235px;height:235px}.ring3{width:170px;height:170px}.core{width:105px;height:105px}.core b{font-size:27px}.orbit{font-size:6px}.orbit1{top:7%;right:0}.orbit2{left:0}.orbit3{bottom:8%;right:0}.bottom{font-size:6px}}`}</style>
    </main>
  );
}
