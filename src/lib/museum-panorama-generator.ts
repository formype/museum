// High quality procedural 360 panorama canvas generator for Museum Virtual Tour

export function generateMuseumPanorama(bgType: string): string {
  if (typeof window === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const w = canvas.width;
  const h = canvas.height;

  switch (bgType) {
    case "grand_hall": {
      // Grand Classical Architecture with Arches and Marble
      // Upper ceiling with gold chandelier glow
      const ceilingGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
      ceilingGrad.addColorStop(0, "#1e1b18");
      ceilingGrad.addColorStop(0.5, "#451a03");
      ceilingGrad.addColorStop(1, "#78350f");
      ctx.fillStyle = ceilingGrad;
      ctx.fillRect(0, 0, w, h * 0.5);

      // Chandelier / Dome light in ceiling
      const domeGrad = ctx.createRadialGradient(w / 2, h * 0.2, 10, w / 2, h * 0.2, 250);
      domeGrad.addColorStop(0, "rgba(254, 240, 138, 0.9)");
      domeGrad.addColorStop(0.4, "rgba(245, 158, 11, 0.4)");
      domeGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = domeGrad;
      ctx.fillRect(0, 0, w, h * 0.5);

      // Architectural Pillars
      for (let x = 100; x < w; x += 280) {
        ctx.fillStyle = "#92400e";
        ctx.fillRect(x - 25, h * 0.15, 50, h * 0.4);
        ctx.fillStyle = "#b45309";
        ctx.fillRect(x - 15, h * 0.15, 30, h * 0.4);
        // Pillar top capital
        ctx.fillStyle = "#fde68a";
        ctx.fillRect(x - 35, h * 0.14, 70, 16);
      }

      // Polished Marble Floor
      const floorGrad = ctx.createLinearGradient(0, h * 0.5, 0, h);
      floorGrad.addColorStop(0, "#b45309");
      floorGrad.addColorStop(0.2, "#451a03");
      floorGrad.addColorStop(0.7, "#1c1917");
      floorGrad.addColorStop(1, "#0c0a09");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, h * 0.5, w, h * 0.5);

      // Perspective floor grid tiles (Google Street View floor style)
      ctx.strokeStyle = "rgba(254, 215, 170, 0.25)";
      ctx.lineWidth = 2;
      for (let x = 0; x < w; x += 120) {
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.5);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = h * 0.52; y <= h; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Central Display Pedestal in distance
      drawDisplayPlinth(ctx, w / 2, h * 0.52, 140, 50, "#f59e0b");
      break;
    }

    case "relics_gallery": {
      // Historical Relics Room (Crimson wall panels, red carpet, spotlight vitrines)
      const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
      wallGrad.addColorStop(0, "#1f1212");
      wallGrad.addColorStop(0.4, "#450a0a");
      wallGrad.addColorStop(1, "#7f1d1d");
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, w, h * 0.55);

      // Spotlights on wall displays
      for (let x = 160; x < w; x += 320) {
        const spot = ctx.createRadialGradient(x, h * 0.35, 10, x, h * 0.35, 120);
        spot.addColorStop(0, "rgba(254, 243, 199, 0.8)");
        spot.addColorStop(0.6, "rgba(239, 68, 68, 0.2)");
        spot.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = spot;
        ctx.fillRect(x - 120, h * 0.15, 240, 240);

        // Frame
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 4;
        ctx.strokeRect(x - 70, h * 0.22, 140, 90);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(x - 68, h * 0.23, 136, 86);
      }

      // Crimson Museum Carpet Floor
      const floorGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
      floorGrad.addColorStop(0, "#991b1b");
      floorGrad.addColorStop(0.4, "#7f1d1d");
      floorGrad.addColorStop(0.8, "#450a0a");
      floorGrad.addColorStop(1, "#180505");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, h * 0.55, w, h * 0.45);

      // Gold Floor Guide Lines
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.3, h);
      ctx.lineTo(w * 0.45, h * 0.55);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.7, h);
      ctx.lineTo(w * 0.55, h * 0.55);
      ctx.stroke();

      drawDisplayPlinth(ctx, w * 0.5, h * 0.56, 150, 60, "#ef4444");
      break;
    }

    case "space_heritage": {
      // Futuristic Dark Blue Astronomy Museum Room
      const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
      wallGrad.addColorStop(0, "#020617");
      wallGrad.addColorStop(0.5, "#0f172a");
      wallGrad.addColorStop(1, "#1e293b");
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, w, h * 0.55);

      // Celestial constellation murals on wall
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * w;
        const y = Math.random() * (h * 0.5);
        ctx.fillStyle = "rgba(56, 189, 248, 0.7)";
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Neon blue light strips
      ctx.strokeStyle = "rgba(56, 189, 248, 0.8)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.15);
      ctx.lineTo(w, h * 0.15);
      ctx.stroke();

      // Glossy dark floor
      const floorGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
      floorGrad.addColorStop(0, "#0369a1");
      floorGrad.addColorStop(0.2, "#0f172a");
      floorGrad.addColorStop(1, "#020617");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, h * 0.55, w, h * 0.45);

      // Blue floor grid lines
      ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
      ctx.lineWidth = 2;
      for (let x = 0; x < w; x += 100) {
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.55);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      drawDisplayPlinth(ctx, w * 0.5, h * 0.56, 160, 60, "#38bdf8");
      break;
    }

    case "cultural_art": {
      // Emerald & Warm Wooden Art Gallery
      const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
      wallGrad.addColorStop(0, "#064e3b");
      wallGrad.addColorStop(0.6, "#047857");
      wallGrad.addColorStop(1, "#065f46");
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, w, h * 0.55);

      // Wood plank floor
      const floorGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
      floorGrad.addColorStop(0, "#78350f");
      floorGrad.addColorStop(0.5, "#451a03");
      floorGrad.addColorStop(1, "#1c1917");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, h * 0.55, w, h * 0.45);

      // Wooden floor planks lines
      ctx.strokeStyle = "rgba(180, 83, 9, 0.4)";
      ctx.lineWidth = 3;
      for (let y = h * 0.56; y <= h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      drawDisplayPlinth(ctx, w * 0.5, h * 0.57, 140, 50, "#10b981");
      break;
    }

    case "courtyard": {
      // Outdoor Heritage Garden with Blue Sky, Green Trees & Stone Walkway
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.52);
      skyGrad.addColorStop(0, "#0284c7");
      skyGrad.addColorStop(0.5, "#38bdf8");
      skyGrad.addColorStop(0.9, "#bae6fd");
      skyGrad.addColorStop(1, "#f0f9ff");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.52);

      // Sun flare
      const sun = ctx.createRadialGradient(w * 0.3, h * 0.2, 10, w * 0.3, h * 0.2, 160);
      sun.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      sun.addColorStop(0.3, "rgba(253, 224, 71, 0.6)");
      sun.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sun;
      ctx.fillRect(w * 0.1, 0, w * 0.4, h * 0.45);

      // Distant Trees & Garden Greenery
      for (let x = 0; x < w; x += 60) {
        ctx.fillStyle = x % 120 === 0 ? "#14532d" : "#166534";
        ctx.beginPath();
        ctx.arc(x, h * 0.52, 50 + Math.sin(x) * 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stone Courtyard Floor & Lawn
      const lawnGrad = ctx.createLinearGradient(0, h * 0.52, 0, h);
      lawnGrad.addColorStop(0, "#15803d");
      lawnGrad.addColorStop(0.3, "#166534");
      lawnGrad.addColorStop(0.7, "#334155");
      lawnGrad.addColorStop(1, "#1e293b");
      ctx.fillStyle = lawnGrad;
      ctx.fillRect(0, h * 0.52, w, h * 0.48);

      // Central Stone Pathway
      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.moveTo(w * 0.45, h * 0.52);
      ctx.lineTo(w * 0.55, h * 0.52);
      ctx.lineTo(w * 0.75, h);
      ctx.lineTo(w * 0.25, h);
      ctx.fill();
      break;
    }
  }

  return canvas.toDataURL("image/jpeg", 0.9);
}

function drawDisplayPlinth(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pw: number,
  ph: number,
  accentColor: string
) {
  // Pedestal body
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(cx - pw / 2, cy, pw, ph);

  // Pedestal top rim
  ctx.fillStyle = accentColor;
  ctx.fillRect(cx - pw / 2 - 10, cy - 8, pw + 20, 8);

  // Glass Vitrine Case Dome
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.fillRect(cx - pw / 2 + 5, cy - 80, pw - 10, 72);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - pw / 2 + 5, cy - 80, pw - 10, 72);

  // Glow inside case
  const spot = ctx.createRadialGradient(cx, cy - 45, 5, cx, cy - 45, 45);
  spot.addColorStop(0, "rgba(255, 255, 255, 0.8)");
  spot.addColorStop(0.5, accentColor);
  spot.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = spot;
  ctx.beginPath();
  ctx.arc(cx, cy - 45, 40, 0, Math.PI * 2);
  ctx.fill();
}
