// Botanical drawing primitives for the garden scene.
// Hydrangea blossoms replace the original rose petals while preserving
// the sprite layers expected by garden's existing bloom animation.
(() => {
  'use strict';

  function createSeededRandom(seed = 1) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function rgbaStr(hex, alpha = 1) {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Palette keys are kept unchanged because garden references these names.
  const ROSE_PALETTES = {
    sweetBlush: {
      deepCore: '#B83370', innerShadow: '#DC76A0', midBelly: '#F49DBD',
      outerBlush: '#FCD8E6', lipHighlight: '#FFF7FB',
      creviceShadow: 'rgba(122, 28, 66, 0.22)'
    },
    pastelPink: {
      deepCore: '#C44578', innerShadow: '#E884A9', midBelly: '#F8B5CD',
      outerBlush: '#FDE5EF', lipHighlight: '#FFFAFC',
      creviceShadow: 'rgba(135, 38, 76, 0.2)'
    },
    creamPeach: {
      deepCore: '#C98277', innerShadow: '#E9A99F', midBelly: '#F7C9BC',
      outerBlush: '#FDEDE6', lipHighlight: '#FFFCF9',
      creviceShadow: 'rgba(138, 72, 65, 0.18)'
    },
    pearlVintage: {
      deepCore: '#9E5A82', innerShadow: '#C78BAE', midBelly: '#E8B6D0',
      outerBlush: '#F9E1ED', lipHighlight: '#FFFAFD',
      creviceShadow: 'rgba(105, 42, 76, 0.2)'
    },
    berryRomance: {
      deepCore: '#8E356C', innerShadow: '#BA5C91', midBelly: '#E28DB7',
      outerBlush: '#F8C6DE', lipHighlight: '#FFF3F9',
      creviceShadow: 'rgba(92, 26, 64, 0.24)'
    },
    paleGreen: {
      deepCore: '#6B9062', innerShadow: '#99B984', midBelly: '#C9DFB8',
      outerBlush: '#E9F4DF', lipHighlight: '#FBFFF6',
      creviceShadow: 'rgba(58, 89, 49, 0.18)', shadowTone: '#344A31'
    },
    skyBlue: {
      deepCore: '#416EAA', innerShadow: '#729FD0', midBelly: '#B3D3EF',
      outerBlush: '#DFEEFB', lipHighlight: '#F8FCFF',
      creviceShadow: 'rgba(42, 76, 119, 0.2)', shadowTone: '#314867'
    },
    pearlWhite: {
      deepCore: '#889D9F', innerShadow: '#BECDCC', midBelly: '#E5EDE9',
      outerBlush: '#F6FAF4', lipHighlight: '#FFFFFF',
      creviceShadow: 'rgba(73, 95, 96, 0.16)', shadowTone: '#43595B'
    }
  };

  /** Draws one small four-petaled hydrangea floret. */
  function drawHydrangeaFloret(ctx, x, y, size, palette, rotation = 0, alpha = 1, seed = 1) {
    const rand = createSeededRandom(seed);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha *= alpha;

    // A soft shadow gives each small floret separation from its neighbors.
    ctx.shadowColor = palette.creviceShadow;
    ctx.shadowBlur = size * 0.1;
    ctx.shadowOffsetY = size * 0.035;

    for (let p = 0; p < 4; p++) {
      ctx.save();
      ctx.rotate(p * Math.PI / 2 + (rand() - 0.5) * 0.09);
      const scale = 0.91 + rand() * 0.13;
      ctx.scale(scale, scale);
      ctx.beginPath();
      ctx.moveTo(0, size * 0.045);
      ctx.bezierCurveTo(-size * 0.17, -size * 0.03, -size * 0.31, -size * 0.29, -size * 0.135, -size * 0.43);
      ctx.quadraticCurveTo(0, -size * 0.54, size * 0.135, -size * 0.43);
      ctx.bezierCurveTo(size * 0.31, -size * 0.29, size * 0.17, -size * 0.03, 0, size * 0.045);
      ctx.closePath();

      const petal = ctx.createLinearGradient(-size * 0.2, -size * 0.08, size * 0.1, -size * 0.48);
      petal.addColorStop(0, palette.innerShadow);
      petal.addColorStop(0.42, palette.midBelly);
      petal.addColorStop(0.82, palette.outerBlush);
      petal.addColorStop(1, palette.lipHighlight);
      ctx.fillStyle = petal;
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = rgbaStr(palette.lipHighlight, 0.72);
      ctx.lineWidth = Math.max(0.45, size * 0.014);
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }

    // Tiny center dot, characteristic of the individual hydrangea florets.
    ctx.shadowColor = 'transparent';
    const center = ctx.createRadialGradient(-size * 0.018, -size * 0.025, size * 0.008, 0, 0, size * 0.085);
    center.addColorStop(0, palette.lipHighlight);
    center.addColorStop(0.5, palette.outerBlush);
    center.addColorStop(1, palette.deepCore);
    ctx.fillStyle = center;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.075, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Creates one hydrangea flower head in separate layers.
   * The return structure intentionally matches the former rose sprite API so
   * garden's existing animation can unfold and rotate the layers unchanged.
   */
  function createRealisticRoseSprite(config = {}) {
    const {
      radius = 68,
      paletteKey = 'sweetBlush',
      variety = 'garden',
      tiltX = 0,
      tiltY = 0,
      seed = 101,
      hasDewdrop = false
    } = config;

    const dpr = Math.min(window.devicePixelRatio || 2, 2.2);
    const pad = radius * 0.62;
    const logicalSize = (radius + pad) * 2;

    function createLayerCanvas() {
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(logicalSize * dpr);
      canvas.height = Math.ceil(logicalSize * dpr);
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      return { canvas, ctx };
    }

    const baseLayer = createLayerCanvas();
    const whorlLayers = [createLayerCanvas(), createLayerCanvas(), createLayerCanvas(), createLayerCanvas()];
    const cx = logicalSize / 2;
    const cy = logicalSize / 2;
    const rand = createSeededRandom(seed);
    const palette = ROSE_PALETTES[paletteKey] || ROSE_PALETTES.sweetBlush;

    // Base shadow and subtle green sepals behind the rounded flower head.
    const baseCtx = baseLayer.ctx;
    const shadowTone = palette.shadowTone || '#6D4058';
    const shadow = baseCtx.createRadialGradient(cx + tiltX * 3, cy + radius * 0.12 + tiltY * 3, radius * 0.12, cx, cy + radius * 0.08, radius * 1.12);
    shadow.addColorStop(0, rgbaStr(shadowTone, 0.3));
    shadow.addColorStop(0.62, rgbaStr(shadowTone, 0.12));
    shadow.addColorStop(1, rgbaStr(shadowTone, 0));
    baseCtx.fillStyle = shadow;
    baseCtx.beginPath();
    baseCtx.arc(cx, cy + radius * 0.08, radius * 1.12, 0, Math.PI * 2);
    baseCtx.fill();

    const sepalCount = variety === 'bud' ? 5 : 6;
    for (let i = 0; i < sepalCount; i++) {
      const angle = Math.atan2(tiltY, tiltX) + i * Math.PI * 2 / sepalCount + (rand() - 0.5) * 0.2;
      const length = radius * (0.78 + rand() * 0.15);
      baseCtx.save();
      baseCtx.translate(cx, cy + radius * 0.06);
      baseCtx.rotate(angle);
      baseCtx.beginPath();
      baseCtx.moveTo(-radius * 0.04, radius * 0.035);
      baseCtx.quadraticCurveTo(length * 0.28, -radius * 0.18, length, 0);
      baseCtx.quadraticCurveTo(length * 0.34, radius * 0.2, -radius * 0.04, radius * 0.035);
      baseCtx.closePath();
      const green = baseCtx.createLinearGradient(0, 0, length, 0);
      green.addColorStop(0, '#36563E');
      green.addColorStop(0.64, '#52785A');
      green.addColorStop(1, '#89A989');
      baseCtx.fillStyle = green;
      baseCtx.fill();
      baseCtx.restore();
    }

    // Four concentric groups of small florets make a dense, rounded head.
    // Each group lives on its own canvas to preserve the existing bloom animation.
    const rings = [
      { count: 10, distance: 0.56, size: 0.47, offset: 0.08 },
      { count: 8, distance: 0.39, size: 0.45, offset: 0.47 },
      { count: 7, distance: 0.215, size: 0.405, offset: 0.17 },
      { count: 5, distance: 0.075, size: 0.34, offset: 0.72 }
    ];

    rings.forEach((ring, layerIndex) => {
      const ctx = whorlLayers[layerIndex].ctx;
      for (let i = 0; i < ring.count; i++) {
        const angle = ring.offset + i * Math.PI * 2 / ring.count + (rand() - 0.5) * 0.16;
        const radiusJitter = 0.93 + rand() * 0.13;
        const x = cx + Math.cos(angle) * radius * ring.distance * radiusJitter + tiltX * radius * 0.16;
        const y = cy + Math.sin(angle) * radius * ring.distance * radiusJitter + tiltY * radius * 0.16;
        const floretSize = radius * ring.size * (0.9 + rand() * 0.18);
        drawHydrangeaFloret(ctx, x, y, floretSize, palette, rand() * Math.PI * 2, 0.94 + rand() * 0.06, seed + layerIndex * 71 + i * 13);
      }
    });

    // Optional dew drop, kept on the outer layer for compatibility with existing sprites.
    if (hasDewdrop) {
      const ctx = whorlLayers[0].ctx;
      const angle = rand() * Math.PI * 2;
      const distance = radius * (0.48 + rand() * 0.13);
      const x = cx + Math.cos(angle) * distance;
      const y = cy + Math.sin(angle) * distance;
      const dropRadius = 2.4 + rand() * 1.5;
      ctx.save();
      ctx.fillStyle = 'rgba(75, 90, 120, 0.18)';
      ctx.beginPath();
      ctx.ellipse(x + 0.8, y + 1.1, dropRadius, dropRadius * 0.78, 0.2, 0, Math.PI * 2);
      ctx.fill();
      const drop = ctx.createRadialGradient(x - dropRadius * 0.32, y - dropRadius * 0.3, 0.2, x, y, dropRadius);
      drop.addColorStop(0, 'rgba(255,255,255,0.98)');
      drop.addColorStop(0.55, 'rgba(239,247,255,0.58)');
      drop.addColorStop(1, 'rgba(255,255,255,0.72)');
      ctx.fillStyle = drop;
      ctx.beginPath();
      ctx.arc(x, y, dropRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    return {
      baseCanvas: baseLayer.canvas,
      whorlCanvases: whorlLayers.map(layer => layer.canvas),
      logicalSize,
      radius,
      palette
    };
  }

  /** Draws a leaf used by the garden scene. */
  function drawBotanicalLeaf(ctx, x, y, angle, length, width, type = 'roseLeaf') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.shadowColor = 'rgba(35, 45, 38, 0.22)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(length * 0.28, -width, length * 0.72, -width * 0.85, length, 0);
    ctx.bezierCurveTo(length * 0.72, width * 0.85, length * 0.28, width, 0, 0);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, -width * 0.6, length, width * 0.6);
    if (type === 'eucalyptus') {
      gradient.addColorStop(0, '#4E6E5D');
      gradient.addColorStop(0.5, '#6E8F7D');
      gradient.addColorStop(1, '#94B3A2');
    } else {
      gradient.addColorStop(0, '#2E4F38');
      gradient.addColorStop(0.55, '#466D4F');
      gradient.addColorStop(1, '#688F6E');
    }
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.quadraticCurveTo(length * 0.5, -1, length * 0.92, 0);
    ctx.strokeStyle = type === 'eucalyptus' ? 'rgba(215, 235, 224, 0.45)' : 'rgba(185, 215, 175, 0.4)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    for (let v = 1; v <= 4; v++) {
      const vx = length * (v * 0.18);
      const vw = width * (1 - Math.abs(v * 0.18 - 0.45)) * 0.65;
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.quadraticCurveTo(vx + 6, -vw * 0.5, vx + 12, -vw * 0.8);
      ctx.moveTo(vx, 0);
      ctx.quadraticCurveTo(vx + 6, vw * 0.5, vx + 12, vw * 0.8);
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Compact hydrangea cluster for the small bud sprites used in the garden.
  function createRoseBudSprite({ radius = 28, paletteKey = 'sweetBlush' } = {}) {
    const palette = ROSE_PALETTES[paletteKey] || ROSE_PALETTES.sweetBlush;
    const logicalSize = radius * 5;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = Math.ceil(logicalSize * dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.translate(logicalSize / 2, logicalSize / 2);

    // Green backing sepals and a short stem.
    ctx.save();
    ctx.strokeStyle = '#537653';
    ctx.lineWidth = radius * 0.11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.65);
    ctx.quadraticCurveTo(radius * 0.04, radius * 1.05, radius * 0.12, radius * 1.45);
    ctx.stroke();
    ctx.fillStyle = '#52785A';
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI * 2 / 5);
      ctx.beginPath();
      ctx.moveTo(0, radius * 0.5);
      ctx.quadraticCurveTo(radius * 0.4, radius * 0.55, radius * 0.7, radius * 0.12);
      ctx.quadraticCurveTo(radius * 0.25, radius * 0.25, 0, radius * 0.5);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    const mini = [
      [-0.28, -0.35, 0.34], [0.12, -0.42, 0.36], [0.42, -0.16, 0.31],
      [-0.43, 0.02, 0.33], [-0.08, -0.02, 0.38], [0.2, 0.18, 0.34],
      [-0.22, 0.32, 0.31], [0.04, -0.68, 0.26], [0.5, 0.18, 0.23]
    ];
    mini.forEach(([x, y, size], i) => {
      drawHydrangeaFloret(ctx, x * radius, y * radius, size * radius, palette, i * 0.49, 0.96, i + 37);
    });
    return { canvas, logicalSize, radius };
  }

  window.GardenBotany = Object.freeze({
    createRealisticRoseSprite,
    createRoseBudSprite,
    drawBotanicalLeaf
  });
})();
