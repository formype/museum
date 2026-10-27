// Procedural 360 Equirectangular Panorama Canvas Generator
// Generates high-res (2048x1024) realistic panoramic backgrounds for each celestial space

export function generatePanoramaDataUrl(spaceId: string): string {
  if (typeof window === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const w = canvas.width;
  const h = canvas.height;

  // Render based on space
  switch (spaceId) {
    case "sun": {
      // Fiery plasma swirling background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#450a0a");
      grad.addColorStop(0.3, "#991b1b");
      grad.addColorStop(0.5, "#ea580c");
      grad.addColorStop(0.7, "#f59e0b");
      grad.addColorStop(1, "#7c2d12");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Plasma filaments
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 20 + Math.random() * 80;
        const radGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        radGrad.addColorStop(0, "rgba(254, 240, 138, 0.8)");
        radGrad.addColorStop(0.5, "rgba(249, 115, 22, 0.4)");
        radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "mars": {
      // Martian horizon with reddish dusty sky and rocky reddish terrain
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
      skyGrad.addColorStop(0, "#180a0a");
      skyGrad.addColorStop(0.4, "#451a03");
      skyGrad.addColorStop(0.9, "#9a3412");
      skyGrad.addColorStop(1, "#c2410c");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.55);

      // Distant mountains
      ctx.fillStyle = "#7c2d12";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.55);
      for (let x = 0; x <= w; x += 40) {
        const my = h * 0.55 - Math.sin(x * 0.01) * 35 - Math.cos(x * 0.025) * 20;
        ctx.lineTo(x, my);
      }
      ctx.lineTo(w, h * 0.55);
      ctx.fill();

      // Martian Ground
      const groundGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
      groundGrad.addColorStop(0, "#991b1b");
      groundGrad.addColorStop(0.3, "#7f1d1d");
      groundGrad.addColorStop(0.7, "#450a0a");
      groundGrad.addColorStop(1, "#2e0505");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, h * 0.55, w, h * 0.45);

      // Rocks and craters on ground
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * w;
        const y = h * 0.55 + Math.random() * (h * 0.45);
        const r = 2 + Math.random() * 8;
        ctx.fillStyle = "rgba(254, 202, 202, 0.3)";
        ctx.beginPath();
        ctx.ellipse(x, y, r * 2, r, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "moon": {
      // Lunar surface with pure black space, stars, and gray regolith
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, w, h * 0.52);

      // Stars
      drawStars(ctx, w, h * 0.52, 600);

      // Earth visible in lunar sky!
      const earthX = w * 0.75;
      const earthY = h * 0.22;
      const earthGrad = ctx.createRadialGradient(earthX, earthY, 5, earthX, earthY, 45);
      earthGrad.addColorStop(0, "#93c5fd");
      earthGrad.addColorStop(0.6, "#1d4ed8");
      earthGrad.addColorStop(0.9, "#1e3a8a");
      earthGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, 45, 0, Math.PI * 2);
      ctx.fill();

      // Lunar Ground
      const moonGround = ctx.createLinearGradient(0, h * 0.52, 0, h);
      moonGround.addColorStop(0, "#475569");
      moonGround.addColorStop(0.4, "#334155");
      moonGround.addColorStop(1, "#0f172a");
      ctx.fillStyle = moonGround;
      ctx.fillRect(0, h * 0.52, w, h * 0.48);

      // Lunar craters
      for (let i = 0; i < 250; i++) {
        const x = Math.random() * w;
        const y = h * 0.53 + Math.random() * (h * 0.47);
        const rx = 5 + Math.random() * 25;
        const ry = rx * 0.35;
        ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(203, 213, 225, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      break;
    }

    case "earth": {
      // High orbital view: Deep space, curved blue earth horizon, atmosphere glow
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, w, h);
      drawStars(ctx, w, h, 800);

      // Huge curved Earth occupying lower half
      const earthGrad = ctx.createLinearGradient(0, h * 0.4, 0, h);
      earthGrad.addColorStop(0, "#0284c7");
      earthGrad.addColorStop(0.3, "#0369a1");
      earthGrad.addColorStop(0.7, "#0c4a6e");
      earthGrad.addColorStop(1, "#082f49");
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h * 1.5, h * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric limb glow
      ctx.strokeStyle = "rgba(56, 189, 248, 0.8)";
      ctx.lineWidth = 14;
      ctx.stroke();

      // Swirling white clouds
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * w;
        const y = h * 0.5 + Math.random() * (h * 0.45);
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.beginPath();
        ctx.ellipse(x, y, 60 + Math.random() * 90, 15 + Math.random() * 25, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "saturn": {
      // Space above Saturn with prominent glowing ring band
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, w, h);
      drawStars(ctx, w, h, 700);

      // Giant Saturn Cloud Bands
      const saturnGrad = ctx.createLinearGradient(0, h * 0.3, 0, h);
      saturnGrad.addColorStop(0, "#ca8a04");
      saturnGrad.addColorStop(0.3, "#eab308");
      saturnGrad.addColorStop(0.6, "#fde047");
      saturnGrad.addColorStop(1, "#854d0e");
      ctx.fillStyle = saturnGrad;
      ctx.fillRect(0, h * 0.45, w, h * 0.55);

      // Rings arc across the sky
      const ringGrad = ctx.createLinearGradient(0, 0, w, h);
      ringGrad.addColorStop(0, "rgba(254, 240, 138, 0.7)");
      ringGrad.addColorStop(0.5, "rgba(202, 138, 4, 0.5)");
      ringGrad.addColorStop(1, "rgba(254, 240, 138, 0.8)");
      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.45, w * 0.6, 60, -0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "iss-station": {
      // Cupola Window Interior framing Earth & Deep Space
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, w, h);
      drawStars(ctx, w, h, 600);

      // Earth visible below window
      const earthGrad = ctx.createLinearGradient(0, h * 0.35, 0, h);
      earthGrad.addColorStop(0, "#06b6d4");
      earthGrad.addColorStop(0.4, "#0284c7");
      earthGrad.addColorStop(1, "#0f172a");
      ctx.fillStyle = earthGrad;
      ctx.fillRect(0, h * 0.4, w, h * 0.6);

      // Station metallic structure frames
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 30;
      ctx.strokeRect(0, 0, w, h);

      // Cupola Geodesic Struts
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 16;
      for (let i = 1; i <= 6; i++) {
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo((w / 7) * i, h);
        ctx.stroke();
      }
      break;
    }

    default: {
      // Cosmic Deep Space with Galaxy Nebula
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, w, h);
      drawStars(ctx, w, h, 1000);

      // Colorful Nebula clouds
      const nebGrad = ctx.createRadialGradient(w * 0.4, h * 0.5, 50, w * 0.4, h * 0.5, 400);
      nebGrad.addColorStop(0, "rgba(168, 85, 247, 0.3)");
      nebGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.2)");
      nebGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = nebGrad;
      ctx.beginPath();
      ctx.arc(w * 0.4, h * 0.5, 400, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  return canvas.toDataURL("image/jpeg", 0.9);
}

function drawStars(ctx: CanvasRenderingContext2D, w: number, h: number, count: number) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 1.8;
    const alpha = 0.3 + Math.random() * 0.7;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}
