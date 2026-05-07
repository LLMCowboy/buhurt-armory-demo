import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  useGSAP(() => {
    gsap.defaults({ ease: "power3.out" });
    
    // Basic SplitText simulation (since we don't have the actual premium plugin imported yet)
    // We will do a simple stagger reveal for now.
    gsap.from(".hero-text", {
      y: 100,
      opacity: 0,
      stagger: 0.1,
      duration: 1.5,
      ease: "power4.out",
      delay: 0.2
    });

    // Nav pill reveal
    gsap.from(".nav-pill", {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      delay: 0.5
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-obsidian text-steel p-2 md:p-6 flex flex-col gap-6">
      
      {/* FLOATING PILL NAV */}
      <nav className="nav-pill fixed top-6 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-surface/80 backdrop-blur-xl border border-steel/10 rounded-full flex gap-8 items-center text-sm font-sans tracking-widest uppercase">
        <a href="#home" className="hover:text-forge transition-colors duration-spring">Home</a>
        <a href="#armor" className="hover:text-forge transition-colors duration-spring">Medieval Armor</a>
        <a href="#showcase" className="hover:text-forge transition-colors duration-spring">Build</a>
      </nav>

      {/* HERO SECTION (Double-Bezel) */}
      <section className="bezel-container h-[90vh]">
        <div className="bezel-content flex flex-col items-center justify-center relative bg-[#0a0a0a]">
          {/* Placeholder for canvas forging scroll */}
          <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-forge/20 via-obsidian to-obsidian pointer-events-none"></div>
          
          <div className="z-10 text-center overflow-hidden flex flex-col items-center">
            <h1 className="text-[12vw] leading-[0.8] text-steel mb-6 hero-text mix-blend-difference">
              BUHURT<br/>TECH
            </h1>
            <p className="hero-text font-sans text-lg md:text-xl tracking-widest text-steel/60 max-w-md">
              THE APEX OF MEDIEVAL COMBAT ENGINEERING.
            </p>
          </div>
        </div>
      </section>

      {/* BENTO CATEGORY GRID (Double-Bezel) */}
      <section id="armor" className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-screen">
        <div className="col-span-12 md:col-span-8 bezel-container h-[50vh] md:h-auto group cursor-pointer">
          <div className="bezel-content flex flex-col justify-end p-8 md:p-12 transition-transform duration-spring group-hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent z-10"></div>
            {/* Image Placeholder */}
            <div className="absolute inset-0 bg-[#151515] z-0"></div>
            <div className="relative z-20 flex justify-between items-end">
              <div>
                <h2 className="text-4xl md:text-6xl text-steel mb-2">COMPLETE SETS</h2>
                <p className="font-sans text-steel/60 tracking-wider">Titanium & Spring Steel</p>
              </div>
              <div className="w-12 h-12 rounded-full border border-steel/20 flex items-center justify-center group-hover:bg-forge group-hover:border-forge transition-colors duration-spring">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
          <div className="bezel-container h-[40vh] md:h-1/2 group cursor-pointer">
            <div className="bezel-content p-8 transition-transform duration-spring group-hover:scale-[1.02] flex flex-col justify-end bg-[#111]">
              <div className="relative z-20">
                <h3 className="text-3xl text-steel">HELMETS</h3>
                <p className="font-sans text-sm text-steel/50 mt-1">Griffon, Bascinet, Wolf Rib</p>
              </div>
            </div>
          </div>
          <div className="bezel-container h-[40vh] md:h-1/2 group cursor-pointer">
            <div className="bezel-content p-8 transition-transform duration-spring group-hover:scale-[1.02] flex flex-col justify-end bg-[#111]">
              <div className="relative z-20">
                <h3 className="text-3xl text-steel">GAUNTLETS</h3>
                <p className="font-sans text-sm text-steel/50 mt-1">Mitten & Hourglass</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 bezel-container h-[50vh] group cursor-pointer">
          <div className="bezel-content p-8 transition-transform duration-spring group-hover:scale-[1.02] flex flex-col justify-end bg-[#131313]">
            <div className="relative z-20">
              <h3 className="text-4xl text-steel">ARMS & LEGS</h3>
              <p className="font-sans text-steel/50 mt-2 tracking-wider">Anatomical Protection</p>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-7 bezel-container h-[50vh] group cursor-pointer">
          <div className="bezel-content p-8 transition-transform duration-spring group-hover:scale-[1.02] flex flex-col justify-end bg-[#151515]">
            <div className="relative z-20">
              <h3 className="text-4xl text-steel">BRIGANDINES</h3>
              <p className="font-sans text-steel/50 mt-2 tracking-wider">Chalkis & Visby Patterns</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3D ARMOR SHOWCASE (Double-Bezel) */}
      <section id="showcase" className="bezel-container h-[90vh]">
        <div className="bezel-content flex items-center justify-center relative bg-obsidian">
          <div className="absolute inset-0 opacity-5 flex items-center justify-center">
            <h2 className="text-[20vw] leading-none select-none">3D MODEL</h2>
          </div>
          <div className="z-10 bg-surface/90 backdrop-blur-md p-8 md:p-12 border border-steel/10 rounded-2xl max-w-lg text-center">
            <h3 className="text-3xl text-forge mb-4">AWAITING 3D ASSETS</h3>
            <p className="font-sans text-sm text-steel/80 leading-relaxed">
              This Double-Bezel container is the designated mount point for the R3F Canvas. Once the .glb files are in the public folder, the interactive exploded-view armor will render here.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-20 px-8 py-12 flex flex-col md:flex-row justify-between items-center border-t border-steel/10 font-sans text-xs tracking-[0.2em] text-steel/40 uppercase">
        <p>© 2026 BUHURT TECH. ENGINEERED FOR COMBAT.</p>
        <div className="flex items-center gap-4 mt-6 md:mt-0">
          <div className="w-2 h-2 rounded-full bg-forge animate-pulse"></div>
          <span>SYSTEM OPERATIONAL</span>
        </div>
      </footer>

    </div>
  );
}
