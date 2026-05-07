import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { PingPongSim } from './components/advanced/PingPongSim.jsx';
import { Magnetic } from './components/advanced/Magnetic.jsx';

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
    
    // Stagger reveal for the main hero text
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

    // Simple parallax on the hero background
    gsap.to(".hero-bg", {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-obsidian text-steel p-2 md:p-6 flex flex-col gap-6">
      
      {/* FLOATING PILL NAV */}
      <Magnetic className="fixed top-6 left-1/2 -translate-x-1/2 z-50 nav-pill" strength={0.1}>
        <nav className="px-8 py-4 bg-surface/80 backdrop-blur-xl border border-steel/10 rounded-full flex gap-8 items-center text-sm font-sans tracking-widest uppercase shadow-2xl">
          <a href="#home" className="hover:text-forge transition-colors duration-spring">Home</a>
          <a href="#armor" className="hover:text-forge transition-colors duration-spring">Collection</a>
          <a href="#showcase" className="hover:text-forge transition-colors duration-spring">3D Build</a>
        </nav>
      </Magnetic>

      {/* HERO SECTION */}
      <section className="hero-section bezel-container h-[90vh]">
        <div className="bezel-content flex flex-col items-center justify-center relative">
          
          {/* Authentic Buhurt Tech Hero Background */}
          <div 
            className="hero-bg absolute inset-0 z-0 bg-cover bg-top -top-[10%] h-[120%]"
            style={{ backgroundImage: 'url("https://static.wixstatic.com/media/6d045f_4dfec19a056f47188449408afb05a593~mv2.jpg")' }}
          ></div>
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent"></div>
          
          {/* TIER 3 GPU SIMULATION - Forge Sparks */}
          <div className="absolute inset-0 z-10 mix-blend-screen opacity-80">
            <PingPongSim color="#ea580c" speed={1.2} className="w-full h-full" />
          </div>
          
          <div className="z-20 text-center overflow-hidden flex flex-col items-center pt-20 pointer-events-none">
            <h1 className="text-[12vw] leading-[0.8] text-steel mb-6 hero-text drop-shadow-2xl">
              BUHURT<br/>TECH
            </h1>
            <p className="hero-text font-sans text-lg md:text-xl tracking-widest text-steel/80 max-w-md drop-shadow-md">
              THE APEX OF MEDIEVAL COMBAT ENGINEERING.
            </p>
          </div>
        </div>
      </section>

      {/* BENTO CATEGORY GRID */}
      <section id="armor" className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-screen">
        
        {/* Full Sets - Squire */}
        <Magnetic className="col-span-12 md:col-span-8 group cursor-pointer" strength={0.03}>
          <div className="bezel-container h-[50vh] md:h-full">
            <div className="bezel-content flex flex-col justify-end p-8 md:p-12 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-spring group-hover:scale-105 z-0"
                style={{ backgroundImage: 'url("https://static.wixstatic.com/media/6d045f_5601a6bb5b584b6a8a2f80f552a68e30~mv2.jpg")' }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-transparent z-10 transition-opacity duration-spring group-hover:opacity-80"></div>
              
              <div className="relative z-20 flex justify-between items-end transform transition-transform duration-spring group-hover:translate-y-[-4px]">
                <div>
                  <h2 className="text-4xl md:text-6xl text-steel mb-2">COMPLETE SETS</h2>
                  <p className="font-sans text-steel/80 tracking-wider uppercase text-sm">Featuring The "Squire" Set</p>
                </div>
                <div className="w-12 h-12 rounded-full border border-steel/40 flex items-center justify-center group-hover:bg-forge group-hover:border-forge transition-colors duration-spring backdrop-blur-md">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            </div>
          </div>
        </Magnetic>


        {/* Vertical Stack (Training & Poleaxes) */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
          <Magnetic className="group cursor-pointer h-[40vh] md:h-1/2" strength={0.05}>
            <div className="bezel-container h-full w-full">
              <div className="bezel-content p-8 flex flex-col justify-end overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-spring group-hover:scale-105 z-0"
                  style={{ backgroundImage: 'url("https://static.wixstatic.com/media/ac5c11_063a4e7d9ed74ec6a08dab05701d2cb9~mv2.jpg")' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 to-transparent z-10 transition-opacity duration-spring group-hover:opacity-80"></div>
                
                <div className="relative z-20 transform transition-transform duration-spring group-hover:translate-y-[-4px]">
                  <h3 className="text-3xl text-steel">TRAINING ARMOR</h3>
                  <p className="font-sans text-sm text-steel/70 mt-1 uppercase tracking-widest">"Ares" Soft Kit</p>
                </div>
              </div>
            </div>
          </Magnetic>
          
          <Magnetic className="group cursor-pointer h-[40vh] md:h-1/2" strength={0.05}>
            <div className="bezel-container h-full w-full">
              <div className="bezel-content p-8 flex flex-col justify-end overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-spring group-hover:scale-105 z-0"
                  style={{ backgroundImage: 'url("https://static.wixstatic.com/media/6d045f_7ecaea9fda8b4934bd3a6c4e953036dd~mv2.jpg")', backgroundPosition: 'center 30%' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 to-transparent z-10 transition-opacity duration-spring group-hover:opacity-80"></div>
                
                <div className="relative z-20 transform transition-transform duration-spring group-hover:translate-y-[-4px]">
                  <h3 className="text-3xl text-steel">HEAVY POLEAXES</h3>
                  <p className="font-sans text-sm text-steel/70 mt-1 uppercase tracking-widest">"Eclipse" Combat Axe</p>
                </div>
              </div>
            </div>
          </Magnetic>
        </div>

        {/* Spears */}
        <Magnetic className="col-span-12 md:col-span-5 group cursor-pointer" strength={0.04}>
          <div className="bezel-container h-[50vh]">
            <div className="bezel-content p-8 flex flex-col justify-end overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-spring group-hover:scale-105 z-0"
                style={{ backgroundImage: 'url("https://static.wixstatic.com/media/ac5c11_6bac582e6cea417c8aa1b7354912ab6c~mv2.jpg")' }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 to-transparent z-10 transition-opacity duration-spring group-hover:opacity-80"></div>
              
              <div className="relative z-20 transform transition-transform duration-spring group-hover:translate-y-[-4px]">
                <h3 className="text-4xl text-steel">SPEARS</h3>
                <p className="font-sans text-sm text-steel/70 mt-2 tracking-widest uppercase">"Dragonslayer" Pattern</p>
              </div>
            </div>
          </div>
        </Magnetic>

        {/* Glaives */}
        <Magnetic className="col-span-12 md:col-span-7 group cursor-pointer" strength={0.04}>
          <div className="bezel-container h-[50vh]">
            <div className="bezel-content p-8 flex flex-col justify-end overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-spring group-hover:scale-105 z-0"
                style={{ backgroundImage: 'url("https://static.wixstatic.com/media/398c04_3ecc29b1358547089cbd282b0e971738~mv2.jpg")' }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 to-transparent z-10 transition-opacity duration-spring group-hover:opacity-80"></div>
              
              <div className="relative z-20 transform transition-transform duration-spring group-hover:translate-y-[-4px]">
                <h3 className="text-4xl text-steel">GLAIVES</h3>
                <p className="font-sans text-sm text-steel/70 mt-2 tracking-widest uppercase">Tournament Grade Precision</p>
              </div>
            </div>
          </div>
        </Magnetic>
      </section>

      {/* 3D ARMOR SHOWCASE (Double-Bezel) */}
      <section id="showcase" className="bezel-container h-[90vh]">
        <div className="bezel-content flex items-center justify-center relative bg-obsidian">
          <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
            <h2 className="text-[20vw] leading-none select-none overflow-hidden">3D MODEL</h2>
          </div>
          <div className="z-10 bg-surface/90 backdrop-blur-md p-8 md:p-12 border border-steel/10 rounded-2xl max-w-lg text-center shadow-2xl">
            <h3 className="text-3xl text-forge mb-4">AWAITING 3D ASSETS</h3>
            <p className="font-sans text-sm text-steel/80 leading-relaxed">
              This Double-Bezel container is the designated mount point for the R3F Canvas. Once the .glb files are in the public folder, the interactive exploded-view armor will render here.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-20 px-8 py-12 flex flex-col md:flex-row justify-between items-center border-t border-steel/10 font-sans text-xs tracking-[0.2em] text-steel/40 uppercase bg-obsidian/50 rounded-t-[4rem]">
        <p>© 2026 BUHURT TECH. ENGINEERED FOR COMBAT.</p>
        <div className="flex items-center gap-4 mt-6 md:mt-0">
          <div className="w-2 h-2 rounded-full bg-forge animate-pulse"></div>
          <span>SYSTEM OPERATIONAL</span>
        </div>
      </footer>

    </div>
  );
}
