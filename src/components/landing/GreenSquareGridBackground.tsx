"use client";

import React, { useEffect, useRef } from "react";

export const GreenSquareGridBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const tileSize = 20; // Smaller boxes
    const tileGap = 4;   // Smaller gap
    const step = tileSize + tileGap;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Refined green color palette for crystal-clear text contrast
    const TIER_COLORS = [
      { fill: "#021a10", stroke: "rgba(4, 47, 30, 0.4)", shadow: "rgba(0, 0, 0, 0.85)" },  // Layer 0: Darkest
      { fill: "#043d2c", stroke: "rgba(16, 185, 129, 0.3)", shadow: "rgba(0, 0, 0, 0.75)" }, // Layer 1: Mid-Dark
      { fill: "#047857", stroke: "rgba(52, 211, 153, 0.5)", shadow: "rgba(0, 0, 0, 0.65)" }, // Layer 2: Brighter
      { fill: "#34d399", stroke: "rgba(110, 231, 183, 1)", shadow: "rgba(0, 0, 0, 0.55)" },// Layer 3: Brightest Neon
    ];

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) * 0.0005; // Reduced from 0.0012 for slower, majestic wave

      const cols = Math.ceil(width / step);
      const rows = Math.ceil(height / step);

      // Deep dark background base for high text contrast
      ctx.fillStyle = "#020503";
      ctx.fillRect(0, 0, width, height);

      // Single pass render loop over viewport grid
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Radial distance from Bottom-Right corner
          const relC = (cols - 1 - c) / Math.max(cols - 1, 1);
          const relR = (rows - 1 - r) / Math.max(rows - 1, 1);
          const distFromCorner = Math.hypot(relC, relR);
          const rawProximity = Math.max(0, 1 - distFromCorner / 1.35);

          // Fluid cohesive wave ("school of fish" / ocean wave)
          const freqX = c * 0.08;
          const freqY = r * 0.08;
          
          const wave1 = Math.sin(freqX + elapsed * 1.5);
          const wave2 = Math.cos(freqY - elapsed * 1.1);
          const wave3 = Math.sin((freqX + freqY) * 0.6 - elapsed * 1.8);
          
          // Combined fluid wave normalized from 0.0 to 1.0
          const fluidWave = (wave1 + wave2 + wave3 + 3) / 6;

          // Merge proximity with the fluid wave to determine the macro intensity
          const organicScore = Math.max(0, Math.min(1, rawProximity * 0.55 + fluidWave * 0.65));

          // "not all boxes in pattern will have active colour" - only 45% of boxes can blink
          const hashSeed = Math.sin(c * 127.1 + r * 311.7) * 43758.5453;
          const pseudoRand = hashSeed - Math.floor(hashSeed);
          const isActiveBox = pseudoRand > 0.55;

          // Default state: bottom-most layer
          let tier = 0;
          let opacity = 0.08; 

          if (isActiveBox) {
            // "blinking and movement of the school should be at same speed"
            // The blink phase uses a similar time multiplier as the wave
            const blinkPhase = Math.sin(elapsed * 2.0 + pseudoRand * Math.PI * 2);
            
            // "blinking makes the movement effect"
            // The box only blinks ON if the macro wave is over it AND its blink phase is positive
            if (blinkPhase > 0) {
              const blinkIntensity = blinkPhase * organicScore;

              // "blinking is from the current colour and colour at bottom most"
              // Discrete steps instead of smooth fades to create a true "blink" effect
              // Removed the brightest tier (tier 3) per user request
              if (blinkIntensity > 0.4) {
                tier = 2;
                opacity = 0.5;
              } else if (blinkIntensity > 0.15) {
                tier = 1;
                opacity = 0.3;
              }
            }
          }

          const colorConfig = TIER_COLORS[tier];
          const x = c * step + tileGap / 2;
          const y = r * step + tileGap / 2;

          ctx.globalAlpha = opacity;

          // Simulated drop shadow (fast 0ms performance)
          ctx.fillStyle = colorConfig.shadow;
          ctx.fillRect(x + 3, y + 3, tileSize, tileSize);

          // Tile main fill
          ctx.fillStyle = colorConfig.fill;
          ctx.fillRect(x, y, tileSize, tileSize);

          // Tile border
          ctx.strokeStyle = colorConfig.stroke;
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, tileSize, tileSize);
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};
