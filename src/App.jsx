import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

function App() {
  const containerRef = useRef(null);

  // Initialize smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      smoothWheel: true,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  // Global GSAP Context
  useGSAP(() => {
    // Set global GSAP defaults
    gsap.defaults({ ease: "power3.out" });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-obsidian text-steel">
      <nav className="fixed top-0 left-0 w-full p-6 z-50 mix-blend-difference flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-widest text-forge">BUHURT ARMORY</h1>
        <div className="flex gap-6 text-sm tracking-widest uppercase">
          <a href="#armor" className="hover:text-forge transition-colors">Armor</a>
          <a href="#protocol" className="hover:text-forge transition-colors">Protocol</a>
          <a href="#commission" className="hover:text-forge transition-colors">Commission</a>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="h-screen flex flex-col items-center justify-center border-b border-surface">
          <h2 className="text-6xl md:text-9xl text-forge mb-4 text-center">FORGED IN<br/>FIRE</h2>
          <p className="font-sans text-xl tracking-widest text-steel/70 max-w-lg text-center">
            Premium combat-ready armor for the modern knight.
          </p>
        </section>
        
        {/* R3F ARMOR SHOWCASE (Placeholder for now) */}
        <section id="armor" className="h-screen flex items-center justify-center bg-surface relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <h2 className="text-5xl md:text-8xl opacity-10">3D ARMOR MODEL</h2>
          </div>
          <div className="z-10 bg-obsidian/80 backdrop-blur-md p-8 border border-steel/10 rounded-xl max-w-md text-center">
            <h3 className="text-2xl text-forge mb-4">Awaiting Assets</h3>
            <p className="font-sans text-sm text-steel/80">
              The R3F Canvas and GSAP exploded-view logic will be mounted here once the .glb files are synced to Google Drive.
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <section id="commission" className="h-[50vh] flex flex-col items-center justify-center bg-obsidian">
          <h2 className="text-4xl text-steel mb-8">SECURE YOUR SLOT</h2>
          <button className="px-8 py-4 bg-forge text-obsidian font-bold tracking-widest hover:bg-forge/80 transition-colors">
            COMMISSION A SUIT
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;
