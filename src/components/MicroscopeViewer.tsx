import React, { useState, useEffect } from 'react';
import { Microorganism } from '../types/microbe';
import { Eye, ZoomIn, Sun, Crosshair, Play, Pause, Sparkles } from 'lucide-react';

interface MicroscopeViewerProps {
  microbe: Microorganism;
  onSelectAnother?: (id: string) => void;
}

type ObjectiveLens = '10x' | '40x' | '100x' | 'TEM';
type IlluminationMode = 'Brightfield' | 'Darkfield' | 'Phase Contrast' | 'Fluorescence' | 'Electron';

export const MicroscopeViewer: React.FC<MicroscopeViewerProps> = ({ microbe }) => {
  const [lens, setLens] = useState<ObjectiveLens>('40x');
  const [illumination, setIllumination] = useState<IlluminationMode>('Brightfield');
  const [focus, setFocus] = useState<number>(0); // 0 is sharp, -5 to +5 is out of focus
  const [reticle, setReticle] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [tick, setTick] = useState<number>(0);

  // Automatically switch to TEM lens default for viruses
  useEffect(() => {
    if (microbe.microbeGroup === 'Virus') {
      setLens('TEM');
      setIllumination('Electron');
    } else {
      setLens('40x');
      setIllumination('Brightfield');
    }
  }, [microbe.id, microbe.microbeGroup]);

  // Animation loop for living motility / Brownian motion
  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setTick((prev) => (prev + 1) % 1000);
    }, 50);
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Compute zoom scale based on lens
  const getScaleMultiplier = () => {
    switch (lens) {
      case '10x':
        return 0.45;
      case '40x':
        return 1.0;
      case '100x':
        return 1.85;
      case 'TEM':
        return 2.5;
    }
  };

  const scale = getScaleMultiplier();
  const blurAmount = Math.abs(focus) * 1.4;

  // Background style based on illumination mode
  const getViewportBackground = () => {
    switch (illumination) {
      case 'Brightfield':
        return 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%)';
      case 'Darkfield':
        return 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 80%, #000000 100%)';
      case 'Phase Contrast':
        return 'radial-gradient(circle at 50% 50%, #64748b 0%, #475569 70%, #334155 100%)';
      case 'Fluorescence':
        return 'radial-gradient(circle at 50% 50%, #09090b 0%, #020617 80%, #000000 100%)';
      case 'Electron':
        return 'radial-gradient(circle at 50% 50%, #94a3b8 0%, #64748b 70%, #475569 100%)';
    }
  };

  // Get primary stain and cell fill colors
  const getCellColors = () => {
    if (illumination === 'Fluorescence') {
      return { fill: '#22c55e', stroke: '#86efac', glow: 'rgba(34, 197, 94, 0.75)' };
    }
    if (illumination === 'Darkfield') {
      return { fill: '#ffffff', stroke: '#e2e8f0', glow: 'rgba(255, 255, 255, 0.6)' };
    }
    if (illumination === 'Electron') {
      return { fill: '#1e293b', stroke: '#0f172a', glow: 'none' };
    }

    // Brightfield staining colors
    const baseColor = microbe.visual.stainColor;
    const accent = microbe.visual.accentColor;
    return { fill: baseColor, stroke: accent, glow: 'none' };
  };

  const colors = getCellColors();

  // Render SVG cells according to visual type
  const renderSpecimenCells = () => {
    const type = microbe.visual.svgType;
    const wave = Math.sin(tick * 0.15) * 4;
    const jitterX = isAnimating ? Math.sin(tick * 0.2) * 1.5 : 0;
    const jitterY = isAnimating ? Math.cos(tick * 0.18) * 1.5 : 0;

    switch (type) {
      case 'gram_pos_cocci_cluster': // e.g. Staphylococcus aureus
        return (
          <g transform={`translate(${jitterX}, ${jitterY})`}>
            {/* Grape-like cluster of spheres */}
            {[
              { cx: 0, cy: 0, r: 18 },
              { cx: -24, cy: -8, r: 17 },
              { cx: 22, cy: -12, r: 18 },
              { cx: -10, cy: -28, r: 16 },
              { cx: 12, cy: -32, r: 17 },
              { cx: -32, cy: 14, r: 16 },
              { cx: 28, cy: 16, r: 18 },
              { cx: -6, cy: 26, r: 17 },
              { cx: 16, cy: 24, r: 17 },
              { cx: -22, cy: 38, r: 15 },
              { cx: 6, cy: 46, r: 16 },
              { cx: -42, cy: -6, r: 15 },
              { cx: 38, cy: -28, r: 14 },
              { cx: -8, cy: -50, r: 15 },
              { cx: 26, cy: -48, r: 14 },
            ].map((c, idx) => (
              <g key={idx}>
                <circle
                  cx={c.cx}
                  cy={c.cy}
                  r={c.r}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2.5"
                  opacity={0.94}
                />
                {/* 3D sphere highlight */}
                <circle cx={c.cx - c.r * 0.3} cy={c.cy - c.r * 0.3} r={c.r * 0.35} fill="#ffffff" opacity={0.35} />
              </g>
            ))}
          </g>
        );

      case 'gram_pos_cocci_chain': // e.g. Streptococcus pneumoniae
        return (
          <g transform={`translate(${jitterX}, ${jitterY})`}>
            {/* Pairs and short chains of lancet diplococci */}
            {[
              { cx: -60, cy: -20, rot: -15 },
              { cx: -30, cy: -10, rot: 10 },
              { cx: 0, cy: 0, rot: -5 },
              { cx: 32, cy: 12, rot: 15 },
              { cx: 64, cy: 26, rot: -20 },
            ].map((pair, idx) => (
              <g key={idx} transform={`translate(${pair.cx}, ${pair.cy}) rotate(${pair.rot})`}>
                {/* Capsule halo */}
                <ellipse cx="0" cy="0" rx="28" ry="18" fill={colors.stroke} opacity="0.18" />
                {/* Left lancet coccus */}
                <path d="M -14 0 C -14 -10, -3 -11, 0 0 C -3 11, -14 10, -14 0 Z" fill={colors.fill} stroke={colors.stroke} strokeWidth="2" />
                {/* Right lancet coccus */}
                <path d="M 14 0 C 14 -10, 3 -11, 0 0 C 3 11, 14 10, 14 0 Z" fill={colors.fill} stroke={colors.stroke} strokeWidth="2" />
              </g>
            ))}
          </g>
        );

      case 'gram_neg_bacilli': // e.g. E. coli, P. aeruginosa
        return (
          <g>
            {[
              { x: -50, y: -40, rot: 25, speed: 1.2 },
              { x: 30, y: -20, rot: -35, speed: -0.9 },
              { x: -20, y: 35, rot: 15, speed: 1.5 },
              { x: 60, y: 50, rot: 75, speed: -1.1 },
            ].map((rod, idx) => {
              const currentX = rod.x + (isAnimating ? Math.sin(tick * 0.08 * rod.speed) * 8 : 0);
              const currentY = rod.y + (isAnimating ? Math.cos(tick * 0.08 * rod.speed) * 6 : 0);
              return (
                <g key={idx} transform={`translate(${currentX}, ${currentY}) rotate(${rod.rot})`}>
                  {/* Flagella */}
                  {microbe.visual.flagellaCount && (
                    <g stroke={colors.stroke} strokeWidth="1.5" fill="none" opacity="0.6">
                      <path d={`M -30 0 Q -45 ${wave * 1.5}, -60 0 T -75 ${-wave}`} />
                      <path d={`M -30 -6 Q -48 ${-wave * 1.5}, -65 -10 T -80 ${wave}`} />
                      <path d={`M 30 0 Q 45 ${wave * 1.5}, 60 0 T 75 ${-wave}`} />
                    </g>
                  )}
                  {/* Cylindrical Rod Body */}
                  <rect
                    x="-32"
                    y="-12"
                    width="64"
                    height="24"
                    rx="12"
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth="2.5"
                    opacity={0.92}
                  />
                  <ellipse cx="-16" cy="-4" rx="8" ry="3" fill="#ffffff" opacity="0.3" />
                </g>
              );
            })}
          </g>
        );

      case 'acid_fast_bacilli': // Mycobacterium tuberculosis
        return (
          <g>
            {[
              { x: -40, y: -45, rot: 15, l: 65, w: 9 },
              { x: 20, y: -30, rot: -40, l: 70, w: 9 },
              { x: -10, y: 20, rot: 35, l: 60, w: 8 },
              { x: 45, y: 40, rot: -10, l: 75, w: 9 },
              { x: -60, y: 50, rot: 80, l: 62, w: 8 },
            ].map((b, idx) => (
              <g key={idx} transform={`translate(${b.x}, ${b.y}) rotate(${b.rot})`}>
                <rect
                  x={-b.l / 2}
                  y={-b.w / 2}
                  width={b.l}
                  height={b.w}
                  rx={b.w / 2}
                  fill={colors.fill}
                  stroke="#9f1239"
                  strokeWidth="2"
                />
                {/* Beaded appearance typical of M. tuberculosis */}
                {[-20, -5, 10, 22].map((bx, bidx) => (
                  <circle key={bidx} cx={bx} cy="0" r="3" fill="#ffe4e6" opacity="0.75" />
                ))}
              </g>
            ))}
          </g>
        );

      case 'spore_bacilli': // Bacillus anthracis, Clostridium botulinum
        return (
          <g>
            {[
              { x: -40, y: -25, rot: -15 },
              { x: 30, y: 20, rot: 20 },
            ].map((rod, idx) => (
              <g key={idx} transform={`translate(${rod.x}, ${rod.y}) rotate(${rod.rot})`}>
                {/* Square-ended rod */}
                <rect
                  x="-55"
                  y="-18"
                  width="110"
                  height="36"
                  rx="6"
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="3"
                />
                {/* Bright oval Endospore */}
                <ellipse
                  cx="25"
                  cy="0"
                  rx="18"
                  ry="12"
                  fill="#10b981"
                  stroke="#047857"
                  strokeWidth="2.5"
                />
                <circle cx="21" cy="-4" r="4" fill="#ffffff" opacity="0.6" />
              </g>
            ))}
          </g>
        );

      case 'spirochete': // Treponema pallidum
        return (
          <g transform={`translate(${jitterX * 2}, ${jitterY * 2})`}>
            {[
              { y: -35, rot: -10 },
              { y: 10, rot: 15 },
              { y: 45, rot: -5 },
            ].map((sp, idx) => (
              <path
                key={idx}
                d={`M -90 ${sp.y} Q -75 ${sp.y - 12 + wave}, -60 ${sp.y} T -30 ${sp.y} T 0 ${sp.y} T 30 ${sp.y} T 60 ${sp.y} T 90 ${sp.y}`}
                fill="none"
                stroke={colors.fill}
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${sp.rot})`}
              />
            ))}
          </g>
        );

      case 'vibrio': // Vibrio cholerae
        return (
          <g>
            {[
              { x: -35, y: -20, rot: 10 },
              { x: 25, y: 25, rot: -30 },
            ].map((v, idx) => (
              <g key={idx} transform={`translate(${v.x}, ${v.y}) rotate(${v.rot})`}>
                {/* Comma-curved body */}
                <path
                  d="M -25 -8 C -10 -20, 15 -18, 30 0 C 15 15, -10 12, -25 5 C -35 0, -35 -4, -25 -8 Z"
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2.5"
                />
                {/* Single polar flagellum */}
                <path
                  d={`M 30 0 Q 50 ${wave * 2}, 70 0 T 90 ${-wave}`}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth="2"
                />
              </g>
            ))}
          </g>
        );

      case 't4_bacteriophage': // Bacteriophage T4
        return (
          <g transform={`scale(0.85)`}>
            {/* Prolate Icosahedral Head */}
            <polygon
              points="0,-95 40,-75 40,-25 0,-5 -40,-25 -40,-75"
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="3.5"
            />
            {/* DNA packed in head */}
            <path
              d="M -20 -60 Q 0 -80 20 -60 T -15 -40 T 15 -25"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              opacity="0.8"
            />
            {/* Collar & Whiskers */}
            <rect x="-12" y="-5" width="24" height="6" fill="#64748b" />
            {/* Contractile Tail Sheath with rings */}
            <rect x="-10" y="1" width="20" height="55" fill="#334155" stroke={colors.stroke} strokeWidth="2" />
            {[-1, 10, 20, 30, 40, 50].map((ry) => (
              <line key={ry} x1="-10" y1={ry} x2="10" y2={ry} stroke="#94a3b8" strokeWidth="1.5" />
            ))}
            {/* Baseplate */}
            <polygon points="-24,56 24,56 16,66 -16,66" fill="#0f172a" stroke={colors.stroke} strokeWidth="2" />
            {/* Long Jointed Tail Fibers */}
            <g stroke={colors.stroke} strokeWidth="3" fill="none" strokeLinecap="round">
              <path d="M -20 62 L -50 85 L -75 110" />
              <path d="M -15 64 L -30 90 L -50 115" />
              <path d="M 20 62 L 50 85 L 75 110" />
              <path d="M 15 64 L 30 90 L 50 115" />
            </g>
          </g>
        );

      case 'coronavirus': // SARS-CoV-2
        return (
          <g transform={`rotate(${tick * 0.4})`}>
            {/* Lipid envelope */}
            <circle cx="0" cy="0" r="55" fill={colors.fill} stroke="#991b1b" strokeWidth="4" />
            {/* Nucleocapsid internal RNA coils */}
            <circle cx="0" cy="0" r="42" fill="none" stroke="#fca5a5" strokeWidth="3" strokeDasharray="6 4" />
            {/* Spike Glycoproteins (S-protein trimers) radiating around rim */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 360) / 16;
              const rad = (angle * Math.PI) / 180;
              const x1 = Math.cos(rad) * 55;
              const y1 = Math.sin(rad) * 55;
              const x2 = Math.cos(rad) * 78;
              const y2 = Math.sin(rad) * 78;
              return (
                <g key={i}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b91c1c" strokeWidth="3" />
                  <circle cx={x2} cy={y2} r="6" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
                </g>
              );
            })}
          </g>
        );

      case 'influenza': // Influenza A
        return (
          <g transform={`rotate(${tick * -0.3})`}>
            <circle cx="0" cy="0" r="50" fill={colors.fill} stroke="#881337" strokeWidth="3" />
            {/* 8 RNA segments */}
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={i}
                x1={-15 + i * 4}
                y1="-20"
                x2={-15 + i * 4}
                y2="20"
                stroke="#fda4af"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            ))}
            {/* HA rod and NA mushroom spikes */}
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (i * 360) / 14;
              const rad = (angle * Math.PI) / 180;
              const x2 = Math.cos(rad) * 68;
              const y2 = Math.sin(rad) * 68;
              return (
                <g key={i}>
                  <circle cx={x2} cy={y2} r={i % 2 === 0 ? 5 : 7} fill={i % 2 === 0 ? '#9333ea' : '#f43f5e'} />
                </g>
              );
            })}
          </g>
        );

      case 'budding_yeast': // Saccharomyces cerevisiae / Candida
        return (
          <g transform={`translate(${jitterX}, ${jitterY})`}>
            {/* Mother cell */}
            <ellipse cx="-15" cy="0" rx="45" ry="36" fill={colors.fill} stroke={colors.stroke} strokeWidth="3" />
            {/* Vacuole and Nucleus */}
            <circle cx="-25" cy="-8" r="14" fill="#ffffff" opacity="0.3" />
            <circle cx="-5" cy="8" r="8" fill="#4c1d95" opacity="0.6" />
            {/* Bud scar */}
            <ellipse cx="-56" cy="-10" rx="5" ry="8" fill="#c084fc" />
            {/* Daughter bud pinching off */}
            <ellipse cx="32" cy="-12" rx="24" ry="19" fill={colors.fill} stroke={colors.stroke} strokeWidth="2.5" />
            <circle cx="35" cy="-14" r="6" fill="#ffffff" opacity="0.35" />
          </g>
        );

      case 'mold_conidiophore': // Penicillium chrysogenum
        return (
          <g transform="translate(0, 30)">
            {/* Main conidiophore stalk */}
            <path d="M 0 80 L 0 -10" stroke="#047857" strokeWidth="8" strokeLinecap="round" />
            {/* Metulae branches */}
            <path d="M 0 -10 L -25 -35" stroke="#047857" strokeWidth="6" strokeLinecap="round" />
            <path d="M 0 -10 L 0 -42" stroke="#047857" strokeWidth="6" strokeLinecap="round" />
            <path d="M 0 -10 L 25 -35" stroke="#047857" strokeWidth="6" strokeLinecap="round" />
            {/* Chains of spherical conidia beads */}
            {[-35, -25, -12, 0, 12, 25, 35].map((bx, bidx) => (
              <g key={bidx}>
                <circle cx={bx} cy="-52" r="7" fill={colors.fill} stroke={colors.stroke} strokeWidth="1.5" />
                <circle cx={bx * 1.05} cy="-68" r="7" fill={colors.fill} stroke={colors.stroke} strokeWidth="1.5" />
                <circle cx={bx * 1.1} cy="-84" r="6.5" fill={colors.fill} stroke={colors.stroke} strokeWidth="1.5" />
                <circle cx={bx * 1.15} cy="-99" r="6" fill={colors.fill} stroke={colors.stroke} strokeWidth="1.5" />
              </g>
            ))}
          </g>
        );

      case 'paramecium': // Paramecium caudatum
        return (
          <g transform={`translate(${jitterX * 1.5}, ${jitterY * 1.5}) rotate(${isAnimating ? Math.sin(tick * 0.05) * 5 : 0})`}>
            {/* Pellicle & Cilia fringe */}
            <ellipse cx="0" cy="0" rx="90" ry="38" fill="none" stroke="#38bdf8" strokeWidth="4" strokeDasharray="3 3" />
            {/* Body */}
            <path
              d="M -85 0 C -85 -35, 60 -40, 85 0 C 60 40, -85 35, -85 0 Z"
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="3"
              opacity="0.85"
            />
            {/* Oral groove */}
            <path d="M -20 -28 Q 0 -5 20 -28" fill="none" stroke="#0369a1" strokeWidth="3" />
            {/* Kidney-shaped Macronucleus */}
            <path d="M -15 -8 C -15 -2, -5 8, 15 2 C 5 -4, -5 -12, -15 -8 Z" fill="#0284c7" />
            {/* Contractile vacuoles (star radiating canals) */}
            <g transform="translate(-55, 0)">
              <circle cx="0" cy="0" r="7" fill="#ffffff" opacity="0.8" />
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <line
                  key={deg}
                  x1="0"
                  y1="0"
                  x2={Math.cos((deg * Math.PI) / 180) * 14}
                  y2={Math.sin((deg * Math.PI) / 180) * 14}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}
            </g>
          </g>
        );

      case 'giardia': // Giardia lamblia
        return (
          <g transform={`translate(${jitterX}, ${jitterY})`}>
            {/* Symmetrical pyriform heart-shaped body */}
            <path
              d="M 0 -60 C 50 -60, 50 10, 0 65 C -50 10, -50 -60, 0 -60 Z"
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="3"
              opacity="0.9"
            />
            {/* Ventral sucking disk depression */}
            <ellipse cx="0" cy="-22" rx="32" ry="24" fill="none" stroke={colors.stroke} strokeWidth="2" />
            {/* Two large symmetrical nuclei ("eyes") */}
            <ellipse cx="-16" cy="-22" rx="9" ry="12" fill="#ffffff" stroke={colors.stroke} strokeWidth="2" />
            <circle cx="-16" cy="-22" r="4" fill="#0f766e" />
            <ellipse cx="16" cy="-22" rx="9" ry="12" fill="#ffffff" stroke={colors.stroke} strokeWidth="2" />
            <circle cx="16" cy="-22" r="4" fill="#0f766e" />
            {/* Flagella pairs beating */}
            <g stroke={colors.stroke} strokeWidth="2.5" fill="none">
              <path d={`M -10 -50 Q -35 ${-70 + wave}, -60 -45`} />
              <path d={`M 10 -50 Q 35 ${-70 - wave}, 60 -45`} />
              <path d={`M 0 65 Q ${-15 + wave} 90, -25 110`} />
              <path d={`M 0 65 Q ${15 - wave} 90, 25 110`} />
            </g>
          </g>
        );

      case 'halophile_archaea': // Halobacterium
        return (
          <g>
            {[
              { x: -35, y: -25, rot: 20 },
              { x: 30, y: 15, rot: -40 },
              { x: -10, y: 35, rot: 10 },
            ].map((arc, idx) => (
              <g key={idx} transform={`translate(${arc.x}, ${arc.y}) rotate(${arc.rot})`}>
                <rect
                  x="-35"
                  y="-12"
                  width="70"
                  height="24"
                  rx="12"
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2.5"
                />
                {/* Purple bacteriorhodopsin patches */}
                <ellipse cx="-12" cy="0" rx="8" ry="5" fill="#f43f5e" opacity="0.6" />
                <ellipse cx="14" cy="0" rx="7" ry="5" fill="#f43f5e" opacity="0.6" />
              </g>
            ))}
          </g>
        );

      case 'chlamydomonas_alga': // Chlamydomonas reinhardtii
        return (
          <g transform={`translate(${jitterX}, ${jitterY})`}>
            {/* Two anterior swimming flagella */}
            <g stroke="#047857" strokeWidth="2.5" fill="none">
              <path d={`M -8 -45 Q ${-40 + wave * 2} -75, -55 -100`} />
              <path d={`M 8 -45 Q ${40 - wave * 2} -75, 55 -100`} />
            </g>
            {/* Green ovoid cell */}
            <ellipse cx="0" cy="0" rx="40" ry="48" fill={colors.fill} stroke={colors.stroke} strokeWidth="3" />
            {/* Cup-shaped chloroplast & central pyrenoid */}
            <ellipse cx="0" cy="12" rx="28" ry="24" fill="#059669" />
            <circle cx="0" cy="14" r="10" fill="#a7f3d0" stroke="#047857" strokeWidth="1.5" />
            {/* Red Eyespot (Stigma) */}
            <ellipse cx="26" cy="-14" rx="4" ry="7" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
          </g>
        );

      case 'schistosoma_cercaria': // Schistosoma mansoni egg with lateral spine & cercaria
        return (
          <g transform={`translate(${jitterX}, ${jitterY})`}>
            {/* Diagnostic large oval egg with prominent lateral spine */}
            <path
              d="M -35 0 C -35 -45, 30 -50, 40 -15 C 45 5, 55 10, 68 18 C 54 22, 42 26, 38 35 C 25 55, -35 50, -35 0 Z"
              fill="#fef3c7"
              stroke="#b45309"
              strokeWidth="3.5"
            />
            {/* Prominent pointed lateral spine highlight */}
            <path d="M 40 10 L 68 18 L 38 30 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
            {/* Internal developing ciliated miracidium embryo */}
            <ellipse cx="0" cy="0" rx="24" ry="32" fill="#dbeafe" stroke="#0284c7" strokeWidth="2" opacity="0.85" />
            <circle cx="-5" cy="-8" r="5" fill="#0369a1" />
            <circle cx="6" cy="-8" r="5" fill="#0369a1" />
            {/* Tiny swimming cercaria in background */}
            <g transform={`translate(-60, 45) rotate(${isAnimating ? Math.sin(tick * 0.1) * 15 : 0}) scale(0.45)`}>
              <ellipse cx="0" cy="-20" rx="14" ry="24" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
              {/* Bifurcated fork-tail */}
              <line x1="0" y1="4" x2="0" y2="40" stroke="#0284c7" strokeWidth="3" />
              <line x1="0" y1="40" x2="-22" y2="65" stroke="#0284c7" strokeWidth="3" />
              <line x1="0" y1="40" x2="22" y2="65" stroke="#0284c7" strokeWidth="3" />
            </g>
          </g>
        );

      case 'ascaris_ovum': // Ascaris lumbricoides fertilized ovum
        return (
          <g transform={`translate(${jitterX}, ${jitterY})`}>
            {/* Thick golden-brown coarsely mammillated albuminous outer coat */}
            <ellipse cx="0" cy="0" rx="46" ry="36" fill="#d97706" stroke="#78350f" strokeWidth="4" />
            {/* Wavy mammillations / bumps on egg perimeter */}
            {Array.from({ length: 22 }).map((_, idx) => {
              const rad = (idx * 360) / 22 * (Math.PI / 180);
              const bx = Math.cos(rad) * 44;
              const by = Math.sin(rad) * 34;
              return (
                <circle
                  key={idx}
                  cx={bx}
                  cy={by}
                  r="5.5"
                  fill="#b45309"
                  stroke="#78350f"
                  strokeWidth="1.5"
                />
              );
            })}
            {/* Clear lipid inner shell layer */}
            <ellipse cx="0" cy="0" rx="36" ry="27" fill="#fef3c7" stroke="#92400e" strokeWidth="2" />
            {/* Unsegmented central dense granular zygote mass */}
            <ellipse cx="0" cy="0" rx="27" ry="20" fill="#92400e" opacity="0.9" />
            <circle cx="-6" cy="-4" r="5" fill="#451a03" opacity="0.8" />
            <circle cx="8" cy="5" r="4" fill="#451a03" opacity="0.8" />
          </g>
        );

      case 'taenia_scolex': // Taenia solium armed scolex & spherical striated egg
        return (
          <g transform={`translate(${jitterX}, ${jitterY})`}>
            {/* Classic spherical ovum with thick brown radially striated embryophore */}
            <circle cx="-35" cy="15" r="28" fill="#fef3c7" stroke="#78350f" strokeWidth="5" />
            {/* Radial striations across embryophore */}
            {Array.from({ length: 24 }).map((_, idx) => {
              const rad = (idx * 360) / 24 * (Math.PI / 180);
              const x1 = -35 + Math.cos(rad) * 23;
              const y1 = 15 + Math.sin(rad) * 23;
              const x2 = -35 + Math.cos(rad) * 28;
              const y2 = 15 + Math.sin(rad) * 28;
              return <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#451a03" strokeWidth="2" />;
            })}
            {/* Six-hooked oncosphere (hexacanth embryo) */}
            <circle cx="-35" cy="15" r="16" fill="#fed7aa" />
            <path d="M -39 10 L -33 13 L -39 16" stroke="#9a3412" strokeWidth="1.5" fill="none" />
            <path d="M -33 10 L -37 13 L -33 16" stroke="#9a3412" strokeWidth="1.5" fill="none" />
            {/* Armed Scolex illustration */}
            <g transform="translate(32, -15) scale(0.65)">
              <ellipse cx="0" cy="0" rx="34" ry="28" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
              {/* Rostellum prominent projection */}
              <ellipse cx="0" cy="-24" rx="14" ry="10" fill="#cbd5e1" stroke="#334155" strokeWidth="2.5" />
              {/* Armed double crown of hooklets */}
              {[-12, -7, 0, 7, 12].map((hx, hidx) => (
                <path key={hidx} d={`M ${hx} -30 L ${hx} -38 L ${hx + (hx > 0 ? 3 : -3)} -35`} stroke="#b91c1c" strokeWidth="2" fill="none" />
              ))}
              {/* 4 circular muscular suckers */}
              <circle cx="-16" cy="-4" r="8" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
              <circle cx="16" cy="-4" r="8" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
              <circle cx="0" cy="12" r="8" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
            </g>
          </g>
        );

      default:
        return (
          <circle cx="0" cy="0" r="30" fill={colors.fill} stroke={colors.stroke} strokeWidth="3" />
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Eye className="w-3.5 h-3.5" /> Virtual Optical Ocular
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Field Magnification: <strong className="text-slate-800">{lens}</strong>
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              ⚠️ Simulated illustration, not a real micrograph.
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <span className="italic">{microbe.scientificName}</span>
            <span className="text-xs font-normal text-slate-500">({microbe.morphology.dimensions})</span>
          </h3>
        </div>

        {/* Action quick buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isAnimating
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Motility / Brownian Jitter"
          >
            {isAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isAnimating ? 'Pause Motion' : 'Resume Motion'}
          </button>

          <button
            onClick={() => setReticle(!reticle)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              reticle ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Micrometer Reticle Scale"
          >
            <Crosshair className="w-3.5 h-3.5" />
            Reticle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-center">
        {/* Optical Circular Viewport (Main Microscope Eye) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 rounded-full p-2 bg-gradient-to-b from-slate-800 via-slate-900 to-black shadow-2xl border-4 border-slate-700 flex items-center justify-center overflow-hidden">
            {/* Outer Lens Bezel & Internal Condenser Aperture Ring */}
            <div
              className="relative w-full h-full rounded-full overflow-hidden transition-all duration-300"
              style={{
                background: getViewportBackground(),
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.6), inset 0 0 15px rgba(0,0,0,0.8)',
              }}
            >
              {/* Micrometer Reticle Overlay */}
              {reticle && (
                <div className="absolute inset-0 pointer-events-none z-10 opacity-35">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-700" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-slate-600 rounded-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-slate-600 rounded-full" />
                  {/* Calibrated ticks */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-between w-40">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="w-px h-2 bg-slate-700" />
                    ))}
                  </div>
                </div>
              )}

              {/* Specimen Render Canvas (SVG) */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
                style={{
                  filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
                  transform: `scale(${scale})`,
                }}
              >
                <svg
                  viewBox="-120 -120 240 240"
                  className="w-full h-full"
                  style={{
                    filter: colors.glow !== 'none' ? `drop-shadow(0 0 12px ${colors.glow})` : undefined,
                  }}
                >
                  {renderSpecimenCells()}
                </svg>
              </div>

              {/* Real-world micron scale bar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-2 border border-slate-700/60 shadow-xs">
                <div className="w-8 h-1 bg-white rounded-full" />
                <span>{lens === 'TEM' ? '100 nm' : lens === '100x' ? '2 µm' : '10 µm'}</span>
              </div>

              {/* Lens flare / ocular glare highlight */}
              <div className="absolute top-2 left-6 w-32 h-16 bg-white/10 rounded-full blur-md -rotate-35 pointer-events-none" />

              {/* Priority 1 Item 4: Prominent overlay label on the viewport */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-950/75 backdrop-blur-xs text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border border-amber-500/30 whitespace-nowrap">
                Simulated illustration, not a real micrograph.
              </div>
            </div>
          </div>

          <div className="text-center mt-3 text-xs text-slate-500 flex flex-col items-center gap-1">
            <div className="flex items-center gap-3">
              <span>Stain: <strong className="text-slate-700">{microbe.morphology.gramStatus}</strong></span>
              <span>•</span>
              <span>Arrangement: <strong className="text-slate-700">{microbe.morphology.arrangement}</strong></span>
            </div>
            <span className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 mt-1 font-semibold flex items-center gap-1">
              ⚠️ Simulated illustration, not a real micrograph.
            </span>
          </div>
        </div>

        {/* Microscope Hardware Optics Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Objective Lens Turret Selector */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-blue-600" /> Objective Turret Magnification
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['10x', '40x', '100x', 'TEM'] as ObjectiveLens[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setLens(m)}
                  className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all ${
                    lens === m
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-102'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {m}
                  <div className="text-[10px] font-normal opacity-85">
                    {m === '10x' && 'Low power'}
                    {m === '40x' && 'High dry'}
                    {m === '100x' && 'Oil Immers.'}
                    {m === 'TEM' && 'Cryo-TEM'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Illumination Filter Mode */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-600" /> Illumination Mode & Contrast
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(['Brightfield', 'Darkfield', 'Phase Contrast', 'Fluorescence', 'Electron'] as IlluminationMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setIllumination(mode)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-left transition-colors ${
                    illumination === mode
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Fine Focus Adjustment Knob */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Fine Focus Z-Plane
              </label>
              <button
                onClick={() => setFocus(0)}
                className="text-[11px] text-blue-600 hover:underline font-medium"
              >
                Auto-focus
              </button>
            </div>
            <input
              type="range"
              min="-4"
              max="4"
              step="0.5"
              value={focus}
              onChange={(e) => setFocus(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>-4 (Sub-plane)</span>
              <span className={focus === 0 ? 'text-emerald-600 font-bold' : ''}>0 (Sharp Focal Plane)</span>
              <span>+4 (Supra-plane)</span>
            </div>
          </div>

          {/* Microscopic Characteristics Key Callout */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
            <div className="font-semibold text-blue-950 mb-0.5">Cell Wall & Staining Mechanism:</div>
            {microbe.morphology.cellWallStructure}
          </div>
        </div>
      </div>
    </div>
  );
};
