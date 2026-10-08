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

    const tileSize = 52; // Bigger boxes in px
    const tileGap = 10;  // Wider gap between boxes in px
    const step = tileSize + tileGap;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Refined green color palette for crystal-clear text contrast
    const TIER_COLORS = [
      { fill: "#021a10", stroke: "rgba(4, 47, 30, 0.4)", shadow: "rgba(0, 0, 0, 0.85)" },  // Layer 0: Darkest (100% area)
      { fill: "#043d2c", stroke: "rgba(16, 185, 129, 0.3)", shadow: "rgba(0, 0, 0, 0.75)" }, // Layer 1: Mid-Dark (60% area)
      { fill: "#047857", stroke: "rgba(52, 211, 153, 0.4)", shadow: "rgba(0, 0, 0, 0.65)" }, // Layer 2: Brighter (40% area)
      { fill: "#10b981", stroke: "rgba(110, 231, 183, 0.7)", shadow: "rgba(0, 0, 0, 0.55)" },// Layer 3: Brightest Neon (20% area, bottom-right)
    ];

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) * 0.0012; // Time in seconds

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

          // Organic 2D noise per tile to prevent linear streak lines
          const hashSeed = Math.sin(c * 127.1 + r * 311.7) * 43758.5453;
          const pseudoRand = hashSeed - Math.floor(hashSeed);
          const noiseJitter = (pseudoRand - 0.5) * 0.26;

          const organicScore = Math.max(0, Math.min(1, rawProximity + noiseJitter));

          // Determine layer tier for tile (0: 100%, 1: 60%, 2: 40%, 3: 20%)
          let tier = 0;
          if (organicScore >= 0.72) tier = 3;
          else if (organicScore >= 0.48) tier = 2;
          else if (organicScore >= 0.26) tier = 1;

          const colorConfig = TIER_COLORS[tier];
          const x = c * step + tileGap / 2;
          const y = r * step + tileGap / 2;

          // Organic wave formation originating from bottom-right corner
          const wavePhase = (1 - organicScore) * 8.0 + noiseJitter * 2.5 - elapsed * 1.6;
          const waveVal = (Math.sin(wavePhase) + 1) / 2; // 0.0 to 1.0

          // Time-varying random flicker per tile
          const flickerSpeed = 0.8 + pseudoRand * 1.2;
          const flickerVal = (Math.sin(elapsed * flickerSpeed + pseudoRand * 10) + 1) / 2;

          // Controlled tile opacity to ensure maximum text readability
          const baseAlpha = tier === 3 ? 0.60 : tier === 2 ? 0.40 : tier === 1 ? 0.24 : 0.12;
          const opacity = baseAlpha * (0.35 + 0.65 * (waveVal * 0.6 + flickerVal * 0.4));

          ctx.globalAlpha = Math.min(Math.max(opacity, 0.04), 0.75);

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

          // Specular highlight for top neon layer
          if (tier === 3) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            ctx.fillRect(x + 4, y + 4, tileSize - 8, 2);
          }
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
