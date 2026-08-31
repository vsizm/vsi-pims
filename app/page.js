'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page">
      <div className="topLine" />
      <nav className="nav">
        <Link href="/" className="brand">
          <img src="/VSI LOGO white.png" alt="Visionary Students Initiative" />
          <div><small>VISIONARY STUDENTS INITIATIVE</small><strong>IMS</strong></div>
        </Link>
        <Link href="/login" className="signin">SIGN IN <span>↗</span></Link>
      </nav>

      <section className="hero">
        <div className="left">
          <div className="visual">
            <div className="circleOuter" /><div className="circleMid" /><div className="circleInner" />
            <div className="core"><small>VSI</small><strong>IMS</strong></div>
            <div className="signal signal1" /><div className="signal signal2" /><div className="signal signal3" />
            <div className="tag tag1">PROGRAMMES</div><div className="tag tag2">EVIDENCE</div><div className="tag tag3">RESULTS</div>
            <div className="orbitDot dot1" /><div className="orbitDot dot2" /><div className="orbitDot dot3" />
          </div>
        </div>

        <div className="right">
          <div className="eyebrow"><i /> VSI INFORMATION MANAGEMENT SYSTEM</div>
          <h1>The data, evidence<br />and insight behind<br /><em>our work.</em></h1>
          <p>Connect programmes, activities, reporting and evidence in one institutional system built to help VSI understand its impact, strengthen accountability and make better decisions.</p>
          <Link href="/login" className="cta">Enter VSI IMS <b>↗</b></Link>
          <div className="secondary">Programme intelligence <span>·</span> Accountability <span>·</span> Evidence</div>
        </div>
      </section>

      <div className="bottom"><span>VISIONARY STUDENTS INITIATIVE</span><span>INFORMATION · INTELLIGENCE · IMPACT</span></div>

      <style jsx>{`
        .page{position:relative;min-height:100svh;overflow:hidden;background:linear-gradient(115deg,#180d32 0%,#091b31 52%,#06243b 100%);color:#fff;font-family:Arial,Helvetica,sans-serif;display:flex;flex-direction:column}.topLine{position:absolute;z-index:20;top:0;left:0;right:0;height:3px;background:#ffc300}.page:before{content:"";position:absolute;width:70vw;height:70vw;right:-20vw;top:8vh;border-radius:50%;background:radial-gradient(circle,rgba(62,141,190,.22),transparent 65%);filter:blur(20px)}.page:after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.028) 1px,transparent 1px);background-size:80px 80px;mask-image:linear-gradient(to bottom,transparent,#000 22%,#000 78%,transparent);pointer-events:none}.nav{position:relative;z-index:10;height:86px;padding:0 clamp(24px,6vw,90px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.09)}.brand{display:flex;align-items:center;gap:12px;color:#fff;text-decoration:none}.brand img{width:43px;height:43px;object-fit:contain}.brand small{display:block;color:#91b6cb;font-size:7px;letter-spacing:.17em;font-weight:900}.brand strong{display:block;font-family:Georgia,serif;font-size:20px;line-height:1;margin-top:3px;letter-spacing:.05em}.signin{color:#fff;text-decoration:none;font-size:9px;font-weight:900;letter-spacing:.18em}.signin span{color:#ffc300;font-size:16px;margin-left:8px}.hero{position:relative;z-index:3;flex:1;width:100%;max-width:1450px;margin:auto;display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:40px clamp(24px,6vw,90px) 65px;box-sizing:border-box}.left{height:100%;display:grid;place-items:center}.visual{position:relative;width:min(580px,42vw);height:min(580px,42vw);min-width:400px;min-height:400px;display:grid;place-items:center}.circleOuter,.circleMid,.circleInner{position:absolute;border-radius:50%;border:1px solid rgba(131,190,218,.18)}.circleOuter{width:100%;height:100%;transform:rotateX(65deg) rotateZ(-22deg)}.circleMid{width:76%;height:76%;border-color:rgba(255,195,0,.2);transform:rotateX(65deg) rotateZ(29deg)}.circleInner{width:55%;height:55%;transform:rotateX(65deg) rotateZ(-8deg);border-color:rgba(255,255,255,.14)}.core{width:155px;height:155px;border-radius:50%;display:grid;place-content:center;text-align:center;z-index:5;background:radial-gradient(circle at 32% 25%,#328ab3,#07253d 68%);border:1px solid rgba(255,255,255,.3);box-shadow:0 0 100px rgba(30,134,184,.34),inset 0 0 35px rgba(0,0,0,.25)}.core small{font-size:10px;letter-spacing:.3em;margin-left:.3em}.core strong{font-family:Georgia,serif;font-size:41px;line-height:.9;color:#ffc300}.signal{position:absolute;height:1px;background:linear-gradient(90deg,transparent,rgba(255,195,0,.7),transparent);width:85%;z-index:2}.signal1{transform:rotate(28deg);top:30%;left:3%}.signal2{transform:rotate(-20deg);bottom:27%;right:0}.signal3{transform:rotate(5deg);top:50%;left:8%;opacity:.45}.tag{position:absolute;z-index:8;padding:8px 11px;background:rgba(7,24,41,.8);border:1px solid rgba(255,255,255,.15);font-size:7px;letter-spacing:.15em;color:#d6e3ea;backdrop-filter:blur(8px)}.tag1{top:16%;right:7%}.tag2{left:3%;top:46%}.tag3{right:13%;bottom:17%}.orbitDot{position:absolute;width:6px;height:6px;border-radius:50%;background:#ffc300;box-shadow:0 0 18px rgba(255,195,0,.8)}.dot1{top:10%;left:23%}.dot2{right:2%;top:38%;width:4px;height:4px}.dot3{left:16%;bottom:13%;background:#6db9db;box-shadow:0 0 15px rgba(109,185,219,.8)}.right{max-width:690px;padding-left:clamp(0px,2vw,30px)}.eyebrow{display:flex;align-items:center;gap:11px;color:#8bb9d2;font-size:9px;letter-spacing:.19em;font-weight:900}.eyebrow i{width:27px;height:1px;background:#ffc300}.right h1{font-family:Georgia,serif;font-weight:400;font-size:clamp(50px,6.1vw,88px);line-height:.96;letter-spacing:-.05em;margin:24px 0 27px}.right h1 em{font-style:italic;color:#ffc300}.right p{max-width:570px;color:#b2c2cd;font-size:14px;line-height:1.8;margin:0 0 30px}.cta{display:inline-flex;align-items:center;gap:24px;background:#ffc300;color:#06243b;text-decoration:none;padding:16px 21px;border-radius:999px;font-size:9px;font-weight:900;letter-spacing:.11em;transition:transform .2s ease,box-shadow .2s ease}.cta b{font-size:16px}.cta:hover{transform:translateY(-2px);box-shadow:0 14px 35px rgba(255,195,0,.18)}.secondary{margin-top:21px;color:#718fa2;font-size:7px;letter-spacing:.12em;text-transform:uppercase}.secondary span{color:#ffc300;padding:0 7px}.bottom{position:relative;z-index:10;display:flex;justify-content:space-between;padding:16px clamp(24px,6vw,90px);border-top:1px solid rgba(255,255,255,.09);font-size:7px;letter-spacing:.15em;color:#668699}.bottom span:last-child{color:#829baa}@media(max-width:900px){.hero{grid-template-columns:1fr;padding-top:65px}.left{order:2;margin-top:25px}.right{order:1;padding-left:0}.visual{width:420px;height:420px;min-width:0;min-height:0}.circleOuter{width:100%;height:100%}.bottom{gap:15px;flex-direction:column}}@media(max-width:520px){.nav{height:72px}.brand img{width:36px;height:36px}.brand small{font-size:6px}.brand strong{font-size:17px}.hero{padding-top:48px}.right h1{font-size:48px;margin-top:20px}.right p{font-size:12px;line-height:1.7}.visual{width:300px;height:300px}.core{width:100px;height:100px}.core small{font-size:7px}.core strong{font-size:26px}.tag{font-size:5px;padding:6px 7px}.tag1{right:0}.tag2{left:0}.tag3{right:0}.bottom{font-size:5px}}
      `}</style>
    </main>
  );
}
