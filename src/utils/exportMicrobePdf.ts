import { jsPDF } from 'jspdf';
import { Microorganism } from '../types/microbe';
import { Language } from '../data/i18n';

/**
 * Generates a high-resolution 2D Canvas rendering of the organism's ocular micrograph.
 * Synchronous and self-contained to guarantee instant PNG generation.
 */
export function generateMicrobeOcularCanvas(microbe: Microorganism): string {
  const canvas = document.createElement('canvas');
  const size = 500;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.44;

  // 1. Dark outer bezel / microscope frame
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);

  // Outer brass/metallic ring
  const bezelGrad = ctx.createLinearGradient(0, 0, size, size);
  bezelGrad.addColorStop(0, '#334155');
  bezelGrad.addColorStop(0.5, '#64748b');
  bezelGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = bezelGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
  ctx.fill();

  // Dark inner groove
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
  ctx.fill();

  // 2. Ocular aperture illumination (Circular field of view)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // Field illumination background (Brightfield vs darkfield)
  const isAcellular = microbe.cellularType.includes('Acellular');
  const isDarkfield = microbe.microbeGroup === 'Virus' || microbe.visual.svgType === 'spirochete';

  if (isDarkfield) {
    const darkGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
    darkGrad.addColorStop(0, '#0f172a');
    darkGrad.addColorStop(0.7, '#020617');
    darkGrad.addColorStop(1, '#000000');
    ctx.fillStyle = darkGrad;
  } else {
    const lightGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, r);
    lightGrad.addColorStop(0, '#ffffff');
    lightGrad.addColorStop(0.65, '#f8fafc');
    lightGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = lightGrad;
  }
  ctx.fillRect(0, 0, size, size);

  // Condenser vignette shadow
  const shadowGrad = ctx.createRadialGradient(cx, cy, r * 0.75, cx, cy, r);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(0, 0, size, size);

  // 3. Calibrated Micrometer Reticle (Ocular grid overlay)
  ctx.strokeStyle = isDarkfield ? 'rgba(148, 163, 184, 0.25)' : 'rgba(71, 85, 105, 0.22)';
  ctx.lineWidth = 1;

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.stroke();

  // Concentric calibrated rings
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
  ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  // Ticks along horizontal crosshair
  const tickSpacing = 22;
  for (let x = cx - 110; x <= cx + 110; x += tickSpacing) {
    ctx.beginPath();
    const isMajor = Math.abs(x - cx) % (tickSpacing * 2) === 0;
    const h = isMajor ? 8 : 4;
    ctx.moveTo(x, cy - h);
    ctx.lineTo(x, cy + h);
    ctx.stroke();
  }

  // 4. Render Specimen Morphology Cells
  const fill = microbe.visual.stainColor || '#7e22ce';
  const stroke = microbe.visual.accentColor || '#3b0764';
  const svgType = microbe.visual.svgType;

  ctx.save();
  ctx.translate(cx, cy);

  drawSpecimenMorphology(ctx, svgType, fill, stroke);

  ctx.restore();

  // 5. Scale Bar Overlay & Legend
  const barY = cy + r - 36;
  const barWidth = 70;
  ctx.fillStyle = isDarkfield ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.88)';
  ctx.strokeStyle = isDarkfield ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.fillRect(cx - barWidth / 2 - 12, barY - 14, barWidth + 24, 26);
  ctx.strokeRect(cx - barWidth / 2 - 12, barY - 14, barWidth + 24, 26);

  // Bar line
  ctx.strokeStyle = isDarkfield ? '#38bdf8' : '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - barWidth / 2, barY);
  ctx.lineTo(cx + barWidth / 2, barY);
  ctx.moveTo(cx - barWidth / 2, barY - 4);
  ctx.lineTo(cx - barWidth / 2, barY + 4);
  ctx.moveTo(cx + barWidth / 2, barY - 4);
  ctx.lineTo(cx + barWidth / 2, barY + 4);
  ctx.stroke();

  ctx.fillStyle = isDarkfield ? '#e2e8f0' : '#0f172a';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isAcellular ? '100 nm' : '10 µm', cx, barY - 4);

  ctx.restore(); // unclip

  // Label at bottom
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CALIBRATED VIRTUAL OCULAR FIELD (1000x OIL IMMERSION)', cx, size - 8);

  return canvas.toDataURL('image/png');
}

/**
 * Draws the cells onto 2D canvas context based on svgType
 */
function drawSpecimenMorphology(
  ctx: CanvasRenderingContext2D,
  type: string,
  fill: string,
  stroke: string
) {
  switch (type) {
    case 'gram_pos_cocci_cluster': {
      // S. aureus - grape-like clusters
      const spheres = [
        { x: 0, y: 0, r: 24 },
        { x: -30, y: -10, r: 22 },
        { x: 28, y: -16, r: 23 },
        { x: -12, y: -36, r: 21 },
        { x: 16, y: -42, r: 22 },
        { x: -40, y: 18, r: 21 },
        { x: 36, y: 20, r: 23 },
        { x: -8, y: 34, r: 22 },
        { x: 20, y: 32, r: 22 },
        { x: -28, y: 50, r: 19 },
        { x: 8, y: 60, r: 21 },
        { x: -54, y: -8, r: 19 },
        { x: 48, y: -36, r: 18 },
        { x: -10, y: -64, r: 20 },
        { x: 34, y: -62, r: 18 },
      ];
      spheres.forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = stroke;
        ctx.stroke();

        // 3D sphere highlight
        ctx.beginPath();
        ctx.arc(c.x - c.r * 0.35, c.y - c.r * 0.35, c.r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();
      });
      break;
    }

    case 'gram_pos_cocci_chain': {
      // S. pneumoniae / S. pyogenes - chains and lancet pairs
      const pairs = [
        { x: -75, y: -25, rot: -0.25 },
        { x: -38, y: -12, rot: 0.15 },
        { x: 0, y: 0, rot: -0.1 },
        { x: 40, y: 15, rot: 0.25 },
        { x: 80, y: 32, rot: -0.3 },
      ];
      pairs.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        // Capsule halo
        ctx.fillStyle = stroke;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.ellipse(0, 0, 35, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Coccus 1
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-11, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Coccus 2
        ctx.beginPath();
        ctx.arc(11, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });
      break;
    }

    case 'gram_neg_bacilli': {
      // E. coli, Pseudomonas - rounded cylindrical rods
      const rods = [
        { x: -60, y: -50, rot: 0.4 },
        { x: 40, y: -25, rot: -0.6 },
        { x: -25, y: 45, rot: 0.25 },
        { x: 75, y: 60, rot: 1.3 },
      ];
      rods.forEach((r) => {
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(r.rot);

        // Flagella lines
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.bezierCurveTo(-55, -20, -70, 20, -90, -10);
        ctx.moveTo(-40, -10);
        ctx.bezierCurveTo(-60, -35, -75, 10, -95, 5);
        ctx.moveTo(40, 0);
        ctx.bezierCurveTo(55, 20, 70, -20, 90, 10);
        ctx.stroke();

        // Cylindrical body
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 3;
        drawRoundedRect(ctx, -42, -15, 84, 30, 15);
        ctx.fill();
        ctx.stroke();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.ellipse(-20, -5, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
      break;
    }

    case 'acid_fast_bacilli': {
      // M. tuberculosis - slender beaded fuchsia rods
      const rods = [
        { x: -50, y: -55, rot: 0.25, l: 80, w: 12 },
        { x: 25, y: -38, rot: -0.7, l: 90, w: 12 },
        { x: -12, y: 25, rot: 0.6, l: 75, w: 11 },
        { x: 55, y: 50, rot: -0.2, l: 95, w: 12 },
        { x: -75, y: 60, rot: 1.4, l: 80, w: 11 },
      ];
      rods.forEach((r) => {
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(r.rot);

        ctx.fillStyle = fill;
        ctx.strokeStyle = '#9f1239';
        ctx.lineWidth = 2.5;
        drawRoundedRect(ctx, -r.l / 2, -r.w / 2, r.l, r.w, r.w / 2);
        ctx.fill();
        ctx.stroke();

        // Beaded granules
        ctx.fillStyle = '#ffe4e6';
        [-25, -8, 12, 28].forEach((bx) => {
          ctx.beginPath();
          ctx.arc(bx, 0, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      });
      break;
    }

    case 'spore_bacilli': {
      // B. anthracis, C. botulinum - large square-ended rods with oval endospores
      const bacilli = [
        { x: -50, y: -32, rot: -0.25 },
        { x: 40, y: 25, rot: 0.35 },
      ];
      bacilli.forEach((b) => {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);

        // Rod body
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 3.5;
        drawRoundedRect(ctx, -70, -22, 140, 44, 8);
        ctx.fill();
        ctx.stroke();

        // Bright green oval endospore
        ctx.fillStyle = '#10b981';
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(32, 0, 22, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Endospore light glint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(28, -5, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
      break;
    }

    case 'spirochete': {
      // Treponema pallidum - sinusoidal spirals
      const spiros = [
        { y: -45, rot: -0.15 },
        { y: 15, rot: 0.2 },
        { y: 60, rot: -0.1 },
      ];
      spiros.forEach((sp) => {
        ctx.save();
        ctx.translate(0, sp.y);
        ctx.rotate(sp.rot);
        ctx.strokeStyle = fill;
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-110, 0);
        for (let x = -110; x <= 110; x += 10) {
          const y = Math.sin((x / 110) * Math.PI * 5) * 14;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      });
      break;
    }

    case 'vibrio': {
      // Vibrio cholerae - comma-shaped rods
      const vibrios = [
        { x: -45, y: -25, rot: 0.2 },
        { x: 35, y: 30, rot: -0.5 },
      ];
      vibrios.forEach((v) => {
        ctx.save();
        ctx.translate(v.x, v.y);
        ctx.rotate(v.rot);

        // Curved comma body
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-30, -10);
        ctx.bezierCurveTo(-12, -25, 20, -22, 40, 0);
        ctx.bezierCurveTo(20, 20, -12, 16, -30, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Polar flagellum
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.bezierCurveTo(65, 25, 90, -25, 115, 0);
        ctx.stroke();

        ctx.restore();
      });
      break;
    }

    case 't4_bacteriophage': {
      // T4 phage - icosahedral capsid, tail sheath, fibers
      ctx.save();
      ctx.scale(1.1, 1.1);

      // Capsid Head (Polygon)
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -110);
      ctx.lineTo(46, -88);
      ctx.lineTo(46, -30);
      ctx.lineTo(0, -6);
      ctx.lineTo(-46, -30);
      ctx.lineTo(-46, -88);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // DNA in head
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -58, 22, 0, Math.PI * 1.5);
      ctx.stroke();

      // Tail sheath
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2.5;
      ctx.fillRect(-12, 0, 24, 65);
      ctx.strokeRect(-12, 0, 24, 65);

      // Rings
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      for (let y = 10; y <= 60; y += 10) {
        ctx.beginPath();
        ctx.moveTo(-12, y);
        ctx.lineTo(12, y);
        ctx.stroke();
      }

      // Baseplate
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-28, 65);
      ctx.lineTo(28, 65);
      ctx.lineTo(18, 77);
      ctx.lineTo(-18, 77);
      ctx.closePath();
      ctx.fill();

      // Tail fibers
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-24, 72);
      ctx.lineTo(-60, 98);
      ctx.lineTo(-90, 126);
      ctx.moveTo(-18, 74);
      ctx.lineTo(-35, 102);
      ctx.lineTo(-58, 132);
      ctx.moveTo(24, 72);
      ctx.lineTo(60, 98);
      ctx.lineTo(90, 126);
      ctx.moveTo(18, 74);
      ctx.lineTo(35, 102);
      ctx.lineTo(58, 132);
      ctx.stroke();

      ctx.restore();
      break;
    }

    case 'coronavirus': {
      // SARS-CoV-2 - spherical envelope with spike trimers
      // Lipid envelope
      ctx.fillStyle = fill;
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Internal RNA ring
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 16 Spike glycoproteins
      for (let i = 0; i < 16; i++) {
        const rad = (i * Math.PI * 2) / 16;
        const x1 = Math.cos(rad) * 65;
        const y1 = Math.sin(rad) * 65;
        const x2 = Math.cos(rad) * 92;
        const y2 = Math.sin(rad) * 92;

        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x2, y2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }

    case 'influenza': {
      // Influenza A - enveloped with HA/NA spikes
      ctx.fillStyle = fill;
      ctx.strokeStyle = '#881337';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 8 RNA segments
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 8; i++) {
        const x = -20 + i * 5.5;
        ctx.beginPath();
        ctx.moveTo(x, -25);
        ctx.lineTo(x, 25);
        ctx.stroke();
      }

      // Spikes
      for (let i = 0; i < 16; i++) {
        const rad = (i * Math.PI * 2) / 16;
        const x2 = Math.cos(rad) * 80;
        const y2 = Math.sin(rad) * 80;
        ctx.fillStyle = i % 2 === 0 ? '#9333ea' : '#f43f5e';
        ctx.beginPath();
        ctx.arc(x2, y2, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'budding_yeast': {
      // Mother yeast & daughter bud
      // Mother
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(-18, 0, 52, 42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Vacuole
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(-30, -10, 16, 0, Math.PI * 2);
      ctx.fill();

      // Nucleus
      ctx.fillStyle = '#4c1d95';
      ctx.beginPath();
      ctx.arc(-8, 10, 10, 0, Math.PI * 2);
      ctx.fill();

      // Daughter bud
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(38, -14, 28, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'mold_conidiophore': {
      // Penicillium - brush-like conidiophore
      ctx.save();
      ctx.translate(0, 35);
      // Main stalk
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 90);
      ctx.lineTo(0, -15);
      ctx.stroke();

      // Branches
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(-30, -42);
      ctx.moveTo(0, -15);
      ctx.lineTo(0, -50);
      ctx.moveTo(0, -15);
      ctx.lineTo(30, -42);
      ctx.stroke();

      // Conidia beads
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.8;
      [-42, -30, -15, 0, 15, 30, 42].forEach((bx) => {
        [-62, -80, -98, -116].forEach((by) => {
          ctx.beginPath();
          ctx.arc(bx, by, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      });
      ctx.restore();
      break;
    }

    case 'paramecium': {
      // Ciliated slipper organism
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 105, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cilia fringe
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(0, 0, 112, 52, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Macronucleus
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 14, 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'giardia': {
      // Heart-shaped trophozoite
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.bezierCurveTo(60, -70, 60, 15, 0, 75);
      ctx.bezierCurveTo(-60, 15, -60, -70, 0, -70);
      ctx.fill();
      ctx.stroke();

      // Ventral disc
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, -25, 38, 28, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Two nuclei "eyes"
      [-18, 18].forEach((nx) => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(nx, -25, 10, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.arc(nx, -25, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'halophile_archaea': {
      // Halobacterium rods
      [-40, 35].forEach((rx, idx) => {
        ctx.save();
        ctx.translate(rx, idx === 0 ? -30 : 25);
        ctx.rotate(idx === 0 ? 0.3 : -0.5);

        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 3;
        drawRoundedRect(ctx, -42, -15, 84, 30, 15);
        ctx.fill();
        ctx.stroke();

        // Purple bacteriorhodopsin patches
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.ellipse(-14, 0, 10, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(16, 0, 9, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
      break;
    }

    case 'chlamydomonas_alga': {
      // Green biflagellate unicellular alga
      // Flagella
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, -50);
      ctx.bezierCurveTo(-45, -85, -60, -110, -70, -125);
      ctx.moveTo(10, -50);
      ctx.bezierCurveTo(45, -85, 60, -110, 70, -125);
      ctx.stroke();

      // Green cell body
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 48, 58, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cup chloroplast
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.ellipse(0, 15, 34, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pyrenoid
      ctx.fillStyle = '#a7f3d0';
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 18, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Red eyespot (stigma)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(32, -16, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'schistosoma_cercaria': {
      // Diagnostic large oval ovum with lateral spine
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-35, 0);
      ctx.bezierCurveTo(-35, -45, 30, -50, 40, -15);
      ctx.bezierCurveTo(45, 5, 55, 10, 68, 18);
      ctx.bezierCurveTo(54, 22, 42, 26, 38, 35);
      ctx.bezierCurveTo(25, 55, -35, 50, -35, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Lateral spine
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(40, 10);
      ctx.lineTo(68, 18);
      ctx.lineTo(38, 30);
      ctx.closePath();
      ctx.fill();

      // Miracidium inside
      ctx.fillStyle = '#93c5fd';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'ascaris_ovum': {
      // Golden-brown mammillated oval ovum
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 46, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Mammillations
      ctx.fillStyle = '#b45309';
      for (let i = 0; i < 20; i++) {
        const rad = (i * 360 / 20) * (Math.PI / 180);
        const bx = Math.cos(rad) * 44;
        const by = Math.sin(rad) * 34;
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Inner zygote
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.ellipse(0, 0, 34, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'taenia_scolex': {
      // Striated spherical oncosphere egg
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(-25, 10, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Striations
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 20; i++) {
        const rad = (i * 360 / 20) * (Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(-25 + Math.cos(rad) * 23, 10 + Math.sin(rad) * 23);
        ctx.lineTo(-25 + Math.cos(rad) * 28, 10 + Math.sin(rad) * 28);
        ctx.stroke();
      }

      // Hexacanth core
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(-25, 10, 16, 0, Math.PI * 2);
      ctx.fill();

      // Scolex
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(35, -15, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rostellum & hooklets
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(35, -30, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    default: {
      // General stained spherical or rod cell
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Main PDF Export Function
 * Generates an authoritative, publication-quality microbiological specimen report.
 */
export async function exportMicrobePdf(
  microbe: Microorganism,
  language: Language = 'en'
): Promise<void> {
  const isAr = language === 'ar';

  // Create A4 portrait document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  let currentY = margin;

  // Generate high-resolution ocular micrograph image
  let ocularImgData = '';
  try {
    ocularImgData = generateMicrobeOcularCanvas(microbe);
  } catch (err) {
    console.warn('Could not generate micrograph canvas:', err);
  }

  // --- Helper Layout Functions ---
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 16;
      renderRunningHeader();
    }
  };

  const renderRunningHeader = () => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(
      `MICROBIOLOGICAL SPECIMEN DOSSIER • ${microbe.scientificName.toUpperCase()}`,
      margin,
      10
    );
    doc.text(`CONFIDENTIAL LABORATORY RECORD`, pageWidth - margin, 10, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // --- 1. COVER / HEADER BANNER (Page 1) ---
  // Top deep navy title bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, currentY, contentWidth, 20, 'F');

  // Title text inside banner
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('MICROBIOLOGICAL SPECIMEN DOSSIER & ATLAS', margin + 6, currentY + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    'STANDARD CLINICAL & ACADEMIC TAXONOMIC CHARACTERIZATION RECORD',
    margin + 6,
    currentY + 14
  );

  // Report Reference Metadata on the right
  const reportRef = `REF-MIC-${microbe.id.toUpperCase()}-${new Date().getFullYear()}`;
  doc.setFontSize(7.5);
  doc.setFont('courier', 'bold');
  doc.setTextColor(203, 213, 225);
  doc.text(reportRef, pageWidth - margin - 6, currentY + 8, { align: 'right' });

  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.text(`Exported: ${exportDate} • CLSI/Bergey's v3`, pageWidth - margin - 6, currentY + 14, {
    align: 'right',
  });

  currentY += 22;

  // Safety Disclaimer Warning Strip
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, 7, 1, 1, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14); // amber-900
  doc.text(
    'WARNING: EDUCATIONAL & SCIENTIFIC USE ONLY • NOT FOR CLINICAL DIAGNOSIS OR DIRECT MEDICAL TREATMENT',
    margin + 4,
    currentY + 4.8
  );
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Biosafety Containment: ${microbe.pathology.biosafetyLevel}`,
    pageWidth - margin - 4,
    currentY + 4.8,
    { align: 'right' }
  );

  currentY += 10;

  // --- 2. HERO BOX: ORGANISM IDENTITY & MICROGRAPH IMAGE ---
  const heroBoxHeight = 56;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, heroBoxHeight, 2, 2, 'FD');

  // Left Section: Organism Details
  const textLeftX = margin + 6;
  let textY = currentY + 8;

  // Taxon Pills / Badges
  doc.setFillColor(219, 234, 254); // blue-100
  doc.roundedRect(textLeftX, textY - 4, 26, 5, 1, 1, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175); // blue-800
  doc.text(microbe.microbeGroup.toUpperCase(), textLeftX + 13, textY - 0.5, { align: 'center' });

  // Cellularity badge
  doc.setFillColor(226, 232, 240); // slate-200
  doc.roundedRect(textLeftX + 29, textY - 4, 38, 5, 1, 1, 'F');
  doc.setTextColor(51, 65, 85);
  doc.text(microbe.cellularType, textLeftX + 48, textY - 0.5, { align: 'center' });

  // Biosafety badge
  const bslColor =
    microbe.pathology.biosafetyLevel === 'BSL-3' || microbe.pathology.biosafetyLevel === 'BSL-4'
      ? [254, 226, 226]
      : [254, 243, 199];
  const bslTextColor =
    microbe.pathology.biosafetyLevel === 'BSL-3' || microbe.pathology.biosafetyLevel === 'BSL-4'
      ? [153, 27, 27]
      : [146, 64, 14];
  doc.setFillColor(bslColor[0], bslColor[1], bslColor[2]);
  doc.roundedRect(textLeftX + 70, textY - 4, 18, 5, 1, 1, 'F');
  doc.setTextColor(bslTextColor[0], bslTextColor[1], bslTextColor[2]);
  doc.text(microbe.pathology.biosafetyLevel, textLeftX + 79, textY - 0.5, { align: 'center' });

  // Verification badge
  if (microbe.reviewed) {
    doc.setFillColor(209, 250, 229); // emerald-100
    doc.roundedRect(textLeftX + 91, textY - 4, 24, 5, 1, 1, 'F');
    doc.setTextColor(6, 95, 70);
    doc.text('VERIFIED DATA', textLeftX + 103, textY - 0.5, { align: 'center' });
  }

  textY += 9;

  // Scientific Name (Large, Italicized)
  doc.setFontSize(16);
  doc.setFont('times', 'bolditalic');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(microbe.scientificName, textLeftX, textY);

  textY += 5.5;

  // Common Name & Strain
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Common Name: `, textLeftX, textY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${microbe.commonName}${microbe.taxonomy.strainOrGroup ? ` (${microbe.taxonomy.strainOrGroup})` : ''}`,
    textLeftX + 22,
    textY
  );

  textY += 5;

  // Verified by credentials
  if (microbe.reviewedBy) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Peer-Reviewed By: ${microbe.reviewedBy} (Verified: ${microbe.reviewDate})`,
      textLeftX,
      textY
    );
    textY += 4.5;
  }

  // Ecological / Industrial role preview
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const roleLines = doc.splitTextToSize(
    `Role: ${microbe.ecologicalOrIndustrialRole}`,
    contentWidth - 66
  );
  doc.text(roleLines.slice(0, 3), textLeftX, textY);

  // Right Section: Embedded Ocular Micrograph Image
  if (ocularImgData) {
    const imgSize = 48;
    const imgX = pageWidth - margin - imgSize - 4;
    const imgY = currentY + 4;

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(imgX - 1, imgY - 1, imgSize + 2, imgSize + 2, 2, 2, 'F');
    doc.addImage(ocularImgData, 'PNG', imgX, imgY, imgSize, imgSize);
  }

  currentY += heroBoxHeight + 5;

  // --- 3. COMPLETE 8-TIER TAXONOMIC HIERARCHY ---
  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(margin, currentY, contentWidth, 5.5, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('I. FORMAL 8-TIER TAXONOMIC HIERARCHY (LINEAGE)', margin + 4, currentY + 3.8);

  currentY += 5.5;

  const taxonomyTiers = [
    { rank: 'Domain', val: microbe.taxonomy.domain },
    { rank: 'Kingdom', val: microbe.taxonomy.kingdom },
    { rank: 'Phylum', val: microbe.taxonomy.phylum },
    { rank: 'Class', val: microbe.taxonomy.classTaxon },
    { rank: 'Order', val: microbe.taxonomy.orderTaxon },
    { rank: 'Family', val: microbe.taxonomy.family },
    { rank: 'Genus', val: microbe.taxonomy.genus, italic: true },
    { rank: 'Species', val: microbe.taxonomy.species, italic: true },
  ];

  const colWidth = contentWidth / 8;
  const tableHeight = 13;

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);

  taxonomyTiers.forEach((tier, idx) => {
    const x = margin + idx * colWidth;

    // Header cell
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(x, currentY, colWidth, 5, 'FD');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(tier.rank.toUpperCase(), x + colWidth / 2, currentY + 3.5, { align: 'center' });

    // Value cell
    doc.setFillColor(255, 255, 255);
    doc.rect(x, currentY + 5, colWidth, 8, 'FD');
    doc.setFontSize(7.5);
    doc.setFont(tier.italic ? 'times' : 'helvetica', tier.italic ? 'italic' : 'bold');
    doc.setTextColor(15, 23, 42);

    // Truncate if long
    let displayVal = tier.val || '—';
    if (displayVal.length > 13) displayVal = displayVal.slice(0, 11) + '…';
    doc.text(displayVal, x + colWidth / 2, currentY + 10, { align: 'center' });
  });

  currentY += tableHeight + 5;

  // --- 4. MORPHOLOGICAL & STRUCTURAL ARCHITECTURE ---
  checkPageBreak(50);
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, currentY, contentWidth, 5.5, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('II. MORPHOLOGICAL, CYTOLOGICAL & CELL ENVELOPE ARCHITECTURE', margin + 4, currentY + 3.8);

  currentY += 7.5;

  const halfWidth = (contentWidth - 4) / 2;

  // Left card: Shape, gram stain, dimensions
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, halfWidth, 34, 1.5, 1.5, 'FD');

  let morphY = currentY + 5;
  const renderField = (label: string, val: string, x: number, y: number, boldVal = false) => {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(`${label}:`, x, y);
    doc.setFont('helvetica', boldVal ? 'bold' : 'normal');
    doc.setTextColor(15, 23, 42);
    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.text(val, x + labelWidth, y);
  };

  renderField('Shape & Form', microbe.morphology.shape, margin + 4, morphY, true);
  morphY += 5;
  renderField('Arrangement', microbe.morphology.arrangement, margin + 4, morphY);
  morphY += 5;
  renderField('Gram Stain Status', microbe.morphology.gramStatus, margin + 4, morphY, true);
  morphY += 5;
  renderField('Cell Dimensions', microbe.morphology.dimensions, margin + 4, morphY);
  morphY += 5;
  renderField('Motility', microbe.morphology.motility, margin + 4, morphY);
  morphY += 5;
  renderField('Endospore Formation', microbe.morphology.sporeFormation, margin + 4, morphY);

  // Right card: Cell Wall Chemistry
  const rightX = margin + halfWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightX, currentY, halfWidth, 34, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Cell Envelope & Biochemical Architecture:', rightX + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const wallLines = doc.splitTextToSize(microbe.morphology.cellWallStructure, halfWidth - 8);
  doc.text(wallLines.slice(0, 6), rightX + 4, currentY + 10);

  currentY += 37;

  // --- 5. PHYSIOLOGICAL & METABOLIC PROFILE ---
  checkPageBreak(50);
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, currentY, contentWidth, 5.5, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('III. PHYSIOLOGICAL, ENZYMATIC & METABOLIC CHARACTERISTICS', margin + 4, currentY + 3.8);

  currentY += 7.5;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, halfWidth, 32, 1.5, 1.5, 'FD');

  let physY = currentY + 5;
  renderField('Oxygen Requirement', microbe.physiology.oxygenRequirement, margin + 4, physY, true);
  physY += 5;
  renderField('Trophic / Nutritional Mode', microbe.physiology.trophicType, margin + 4, physY);
  physY += 5;
  renderField(
    'Catalase / Oxidase',
    `Catalase: ${microbe.physiology.catalase} | Oxidase: ${microbe.physiology.oxidase}`,
    margin + 4,
    physY
  );
  physY += 5;
  renderField(
    'Growth Optima',
    `Temp: ${microbe.physiology.optimalTemp} | pH: ${microbe.physiology.optimalPh}`,
    margin + 4,
    physY
  );

  // Right card: Unique Metabolic Features
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightX, currentY, halfWidth, 32, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Diagnostic Metabolic Milestones:', rightX + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  let metaY = currentY + 9.5;
  microbe.physiology.uniqueMetabolicFeatures.slice(0, 3).forEach((feat) => {
    const fLines = doc.splitTextToSize(`• ${feat}`, halfWidth - 8);
    doc.text(fLines, rightX + 4, metaY);
    metaY += fLines.length * 3.8;
  });

  currentY += 35;

  // --- 6. STANDARD BIOCHEMICAL PROFILE TABLE (IMViC & TSI) ---
  if (microbe.physiology.biochemicals) {
    checkPageBreak(30);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Standard Biochemical Profile (IMViC, Urease & TSI):', margin, currentY);

    currentY += 2;

    const bio = microbe.physiology.biochemicals;
    const bioCols = [
      { name: 'Indole', val: bio.indole },
      { name: 'Methyl Red', val: bio.methylRed },
      { name: 'Voges-Prosk.', val: bio.vogesProskauer },
      { name: 'Citrate', val: bio.citrate },
      { name: 'Urease', val: bio.urease },
      { name: 'TSI Slant', val: bio.tsiSlant },
      { name: 'TSI Butt', val: bio.tsiButt },
      { name: 'H2S Prod.', val: bio.tsiH2S },
      { name: 'Gas Prod.', val: bio.tsiGas },
      { name: 'SIM Motil.', val: bio.motilitySim },
    ];

    const bioWidth = contentWidth / bioCols.length;
    doc.setDrawColor(203, 213, 225);

    bioCols.forEach((col, idx) => {
      const bx = margin + idx * bioWidth;

      doc.setFillColor(241, 245, 249);
      doc.rect(bx, currentY, bioWidth, 4.5, 'FD');
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(col.name, bx + bioWidth / 2, currentY + 3.2, { align: 'center' });

      doc.setFillColor(255, 255, 255);
      doc.rect(bx, currentY + 4.5, bioWidth, 6, 'FD');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      let valShort: string = String(col.val || '—');
      if (valShort.length > 9) valShort = valShort.slice(0, 8);
      doc.text(valShort, bx + bioWidth / 2, currentY + 8.5, { align: 'center' });
    });

    currentY += 14;
  }

  // --- 7. PATHOLOGY, VIRULENCE & CLINICAL ANTIMICROBIALS ---
  checkPageBreak(50);
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, currentY, contentWidth, 5.5, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('IV. CLINICAL PATHOLOGY, VIRULENCE & ANTIMICROBIAL TARGETS', margin + 4, currentY + 3.8);

  currentY += 7.5;

  doc.setFillColor(254, 243, 199, 0.4); // light amber
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(margin, currentY, halfWidth, 38, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text(`Clinical Status: ${microbe.pathology.clinicalRole}`, margin + 4, currentY + 5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Associated Diseases / Pathologies:', margin + 4, currentY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  let disY = currentY + 14;
  microbe.pathology.diseases.slice(0, 4).forEach((d) => {
    doc.text(`• ${d}`, margin + 4, disY);
    disY += 3.8;
  });

  // Right card: Virulence & Therapeutics
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightX, currentY, halfWidth, 38, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Key Virulence Factors & Toxins:', rightX + 4, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const virLines = doc.splitTextToSize(
    microbe.pathology.virulenceFactors.join('; '),
    halfWidth - 8
  );
  doc.text(virLines.slice(0, 3), rightX + 4, currentY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Therapeutic Targets / First-Line Regimens:', rightX + 4, currentY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const txLines = doc.splitTextToSize(
    microbe.pathology.treatmentTargets.join(', '),
    halfWidth - 8
  );
  doc.text(txLines.slice(0, 3), rightX + 4, currentY + 26);

  currentY += 42;

  // --- 8. KIRBY-BAUER ANTIBIOTIC SUSCEPTIBILITY TABLE (AST) ---
  if (
    microbe.pathology.susceptibilityProfile &&
    microbe.pathology.susceptibilityProfile.length > 0
  ) {
    checkPageBreak(35);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('CLSI Kirby-Bauer Antibiotic Susceptibility Profile (Disk Diffusion):', margin, currentY);

    currentY += 2.5;

    // Header
    const colA = 50;
    const colB = 25;
    const colC = 25;
    const colD = 28;
    const colE = contentWidth - (colA + colB + colC + colD);

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, currentY, contentWidth, 5, 'FD');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Antimicrobial Agent', margin + 3, currentY + 3.5);
    doc.text('Disk Content', margin + colA + 3, currentY + 3.5);
    doc.text('Zone (mm)', margin + colA + colB + 3, currentY + 3.5);
    doc.text('Interpretation', margin + colA + colB + colC + 3, currentY + 3.5);
    doc.text('Mechanism of Action', margin + colA + colB + colC + colD + 3, currentY + 3.5);

    currentY += 5;

    microbe.pathology.susceptibilityProfile.forEach((s) => {
      checkPageBreak(6);
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, currentY, contentWidth, 5, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(s.antibiotic, margin + 3, currentY + 3.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(s.diskContent, margin + colA + 3, currentY + 3.5);
      doc.text(`${s.zoneDiameterMm} mm`, margin + colA + colB + 3, currentY + 3.5);

      // Interpretation badge color
      if (s.interpretation === 'Sensitive') {
        doc.setTextColor(5, 150, 105); // emerald
      } else if (s.interpretation === 'Resistant') {
        doc.setTextColor(225, 29, 72); // rose
      } else {
        doc.setTextColor(217, 119, 6); // amber
      }
      doc.setFont('helvetica', 'bold');
      doc.text(s.interpretation.toUpperCase(), margin + colA + colB + colC + 3, currentY + 3.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const mech = s.mechanism ? (s.mechanism.length > 32 ? s.mechanism.slice(0, 30) + '…' : s.mechanism) : '—';
      doc.text(mech, margin + colA + colB + colC + colD + 3, currentY + 3.5);

      currentY += 5;
    });

    currentY += 4;
  }

  // --- 9. DEFINITIVE DIAGNOSTIC CRITERIA & CULTURE MEDIA ---
  checkPageBreak(30);
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, currentY, contentWidth, 5.5, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('V. DEFINITIVE DIAGNOSTIC CRITERIA & CULTURE ISOLATION', margin + 4, currentY + 3.8);

  currentY += 7.5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  const diagBoxHeight = Math.max(22, microbe.diagnosticCriteria.length * 4.5 + 5);
  doc.roundedRect(margin, currentY, contentWidth, diagBoxHeight, 1.5, 1.5, 'FD');

  let diagY = currentY + 5;
  microbe.diagnosticCriteria.forEach((crit) => {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('✓', margin + 4, diagY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const cLines = doc.splitTextToSize(crit, contentWidth - 14);
    doc.text(cLines, margin + 9, diagY);
    diagY += cLines.length * 3.8;
  });

  currentY += diagBoxHeight + 5;

  // --- 10. SCIENTIFIC REFERENCES & LITERATURE CITATIONS ---
  if (microbe.sources && microbe.sources.length > 0) {
    checkPageBreak(25);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Scientific Literature & Authoritative References:', margin, currentY);

    currentY += 3.5;
    microbe.sources.forEach((src) => {
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const srcLines = doc.splitTextToSize(`• ${src}`, contentWidth);
      doc.text(srcLines, margin, currentY);
      currentY += srcLines.length * 3.2;
    });
  }

  // --- FOOTERS ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `MicrobeClassify Atlas • Scientific Record for ${microbe.scientificName} • Educational Reference`,
      margin,
      pageHeight - 8
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // Save PDF file
  const safeFilename = `${microbe.scientificName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Specimen_Report.pdf`;
  doc.save(safeFilename);
}
