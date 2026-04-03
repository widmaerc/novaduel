'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RadarChartProps {
  data: {
    finish: number;
    dribble: number;
    passes: number;
    vision: number;
    creativity: number;
  };
  labels: {
    finish: string;
    dribble: string;
    passes: string;
    vision: string;
    creativity: string;
  };
}

export default function RadarChart({ data, labels }: RadarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const center = 50;
  const getCoords = (angleDeg: number, val: number) => {
    const r = (val / 100) * 35;
    const angleRad = (angleDeg - 90) * Math.PI / 180;
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad),
      angle: angleDeg
    };
  };

  const statValues = [
    data.finish,
    data.dribble,
    data.passes,
    data.vision,
    data.creativity
  ];

  const statLabels = [
    labels.finish,
    labels.dribble,
    labels.passes,
    labels.vision,
    labels.creativity
  ];

  const angles = [0, 72, 144, 216, 288];
  const pts = angles.map((angle, i) => getCoords(angle, statValues[i]));
  const pointsStr = pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

  return (
    <div className="relative w-full h-[240px] flex items-center justify-center -mt-4 select-none">
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow-[0_8px_32px_rgba(30,64,175,0.2)] overflow-visible">
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.1" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Grid Lines */}
        {[1, 0.75, 0.5, 0.25].map(scale => {
          const gridPts = angles.map(a => getCoords(a, scale * 100));
          return (
            <polygon 
              key={scale} 
              points={gridPts.map(p => `${p.x},${p.y}`).join(' ')} 
              fill="none" 
              stroke="#e2e8f0" 
              strokeWidth="0.3" 
            />
          );
        })}

        {/* Radar Area */}
        <motion.polygon 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          points={pointsStr} 
          fill="url(#radarGradient)" 
          stroke="var(--color-primary)" 
          strokeWidth="1.5" 
          filter="url(#glow)" 
          className="radar-area-current" 
        />

        {/* Data Points + Interaction Hit Areas */}
        {pts.map((pt, i) => (
          <g key={i} 
             onMouseEnter={() => setHoveredIndex(i)} 
             onMouseLeave={() => setHoveredIndex(null)}
             className="cursor-pointer"
          >
            {/* Larger invisible hit area */}
            <circle cx={pt.x} cy={pt.y} r="5" fill="transparent" />
            
            {/* Visual point */}
            <motion.circle 
              cx={pt.x} 
              cy={pt.y} 
              animate={{ 
                r: hoveredIndex === i ? 2.2 : 1.2,
                strokeWidth: hoveredIndex === i ? 0.8 : 0.4
              }}
              fill="var(--color-primary)" 
              stroke="white" 
            />
          </g>
        ))}

        {/* Floating Tooltips inside SVG */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.g
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              <rect 
                x={pts[hoveredIndex].x - 6} 
                y={pts[hoveredIndex].y - 10} 
                width="12" 
                height="7" 
                rx="2" 
                fill="#1e293b" 
                className="shadow-xl"
              />
              <text 
                x={pts[hoveredIndex].x} 
                y={pts[hoveredIndex].y - 5.5} 
                textAnchor="middle" 
                fill="white" 
                style={{ fontSize: '3.5px', fontWeight: '900' }}
                className="font-hl"
              >
                {statValues[hoveredIndex]}
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Labels with Footnote References */}
        <text className="label-caps font-black opacity-40 capitalize" style={{ fontSize: '4px' }} x="50" y="8" textAnchor="middle">
          {statLabels[0]}<tspan dy="-1.5" fontSize="2.5px" fill="var(--color-primary)" opacity="0.8">[2]</tspan>
        </text>
        <text className="label-caps font-black opacity-40 capitalize" style={{ fontSize: '4px' }} x="92" y="42" textAnchor="start">
          {statLabels[1]}<tspan dy="-1.5" fontSize="2.5px" fill="var(--color-primary)" opacity="0.8">[5]</tspan>
        </text>
        <text className="label-caps font-black opacity-40 capitalize" style={{ fontSize: '4px' }} x="72" y="90" textAnchor="middle">
          {statLabels[2]}<tspan dy="-1.5" fontSize="2.5px" fill="var(--color-primary)" opacity="0.8">[3]</tspan>
        </text>
        <text className="label-caps font-black opacity-40 capitalize" style={{ fontSize: '4px' }} x="28" y="90" textAnchor="middle">
          {statLabels[3]}<tspan dy="-1.5" fontSize="2.5px" fill="var(--color-primary)" opacity="0.8">[3]</tspan>
        </text>
        <text className="label-caps font-black opacity-40 capitalize" style={{ fontSize: '4px' }} x="8" y="42" textAnchor="end">
          {statLabels[4]}<tspan dy="-1.5" fontSize="2.5px" fill="var(--color-primary)" opacity="0.8">[3]</tspan>
        </text>
      </svg>
    </div>
  );
}
