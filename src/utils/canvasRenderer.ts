import { CardData, PhotoShape } from '../types';
import { TEQX_LOGO_DATA_URL } from '../assets/logoBase64';

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1350;

// Image cache to ensure silky 60fps rendering during drags/slider adjustments
const imageCache: { [url: string]: HTMLImageElement } = {};

export function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache[src] && imageCache[src].complete && imageCache[src].naturalWidth > 0) {
    return Promise.resolve(imageCache[src]);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = src;
  });
}

// Preload the Teqx logo
loadImage(TEQX_LOGO_DATA_URL).catch((e) => {
  console.warn('Failed to preload Teqx logo:', e);
});

interface WrapResult {
  lines: string[];
  fontSize: number;
  lineHeight: number;
}

/**
 * Fits multi-line text into a bounded box with automatic font size downscaling
 * and truncation with '…' if it exceeds maximum lines.
 */
function fitAndWrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  initialFontSize: number,
  minFontSize: number,
  fontFamily: string,
  fontWeight: string | number = 400,
  lineHeightRatio = 1.35,
  maxLines = 10
): WrapResult {
  let fontSize = initialFontSize;

  while (fontSize >= minFontSize) {
    const lineHeight = Math.round(fontSize * lineHeightRatio);
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Single word wider than maxWidth, forced break
          lines.push(word);
          currentLine = '';
        }
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    const totalHeight = lines.length * lineHeight;
    if (totalHeight <= maxHeight && lines.length <= maxLines) {
      return { lines, fontSize, lineHeight };
    }

    fontSize -= 2;
  }

  // Fallback: at minFontSize, enforce max allowed lines and truncate with ellipsis
  fontSize = minFontSize;
  const lineHeight = Math.round(fontSize * lineHeightRatio);
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  
  const allowedLinesCount = Math.max(1, Math.min(maxLines, Math.floor(maxHeight / lineHeight)));
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (lines.length + 1 >= allowedLinesCount) {
        // Last line: truncate with ellipsis
        let truncated = currentLine;
        while (truncated.length > 0 && ctx.measureText(`${truncated}…`).width > maxWidth) {
          truncated = truncated.slice(0, -1).trim();
        }
        lines.push(`${truncated}…`);
        currentLine = '';
        break;
      }
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine && lines.length < allowedLinesCount) {
    lines.push(currentLine);
  }

  return { lines, fontSize, lineHeight };
}

/**
 * Draws rounded rectangle path
 */
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
 * Draws a forward-slanted parallelogram (like the Teqx brand speed bars)
 */
function drawSlantedParallelogram(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  slantOffset: number
) {
  ctx.beginPath();
  ctx.moveTo(x + slantOffset, y);
  ctx.lineTo(x + w + slantOffset, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

/**
 * Main rendering routine for the 1080x1350 Teqx Founder Card
 */
export async function renderFounderCard(
  canvas: HTMLCanvasElement,
  data: CardData
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Make sure canvas internal dimensions are exactly 1080x1350
  if (canvas.width !== CANVAS_WIDTH) canvas.width = CANVAS_WIDTH;
  if (canvas.height !== CANVAS_HEIGHT) canvas.height = CANVAS_HEIGHT;

  // Ensure custom web fonts are active
  if (document.fonts) {
    await document.fonts.ready;
  }

  // Pre-load images if needed
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImage(TEQX_LOGO_DATA_URL);
  } catch (err) {
    console.warn('Could not load logo image:', err);
  }

  let userPhotoImg: HTMLImageElement | null = null;
  if (data.photoUrl) {
    try {
      userPhotoImg = await loadImage(data.photoUrl);
    } catch (err) {
      console.warn('Could not load user photo:', err);
    }
  }

  // Clear canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 1. Crisp White Background (#FFFFFF)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Subtle brand speed bars in background top-right (light mist #F0F5FD)
  ctx.fillStyle = '#EAF1FB';
  const bgBarSlant = 60;
  drawSlantedParallelogram(ctx, 820, 40, 240, 36, bgBarSlant);
  ctx.fill();
  drawSlantedParallelogram(ctx, 850, 90, 220, 36, bgBarSlant);
  ctx.fill();
  drawSlantedParallelogram(ctx, 880, 140, 200, 36, bgBarSlant);
  ctx.fill();

  // Subtle outer hairline frame
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, CANVAS_WIDTH - 80, CANVAS_HEIGHT - 80);

  // 2. Teqx Studio Logo (Top-Left)
  const logoX = 80;
  const logoY = 80;
  const logoW = 270;
  const logoH = Math.round(logoW / 1.9745); // ~137px

  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
  } else {
    // Elegant fallback typography if image is still mounting
    ctx.font = 'italic 900 48px Archivo, sans-serif';
    ctx.fillStyle = '#0B63CE';
    ctx.fillText('TEQX.', logoX, logoY + 54);
    ctx.font = '700 32px Manrope, sans-serif';
    ctx.fillStyle = '#231F20';
    ctx.fillText('Studio', logoX, logoY + 105);
  }

  // 3. Right Side: Blue Slanted Panel & Photo Frame
  // Panel center around X = 780, Y = 400
  const photoCenterX = 780;
  const photoCenterY = 390;

  // Background deep layered slanted panels (Brand motion cut)
  ctx.save();
  // Deep Blue shadow accent panel
  ctx.fillStyle = '#063A82';
  drawSlantedParallelogram(ctx, photoCenterX - 200, photoCenterY - 215, 390, 440, 52);
  ctx.fill();

  // Main Teqx Blue slanted panel
  ctx.fillStyle = '#0B63CE';
  drawSlantedParallelogram(ctx, photoCenterX - 215, photoCenterY - 225, 410, 450, 52);
  ctx.fill();

  // Secondary Sky blue speed streak
  ctx.fillStyle = '#5AA2F0';
  drawSlantedParallelogram(ctx, photoCenterX - 230, photoCenterY + 235, 340, 14, 52);
  ctx.fill();
  ctx.restore();

  // Setup Photo Frame geometry based on shape
  let frameW = 360;
  let frameH = 440;
  let frameX = photoCenterX - frameW / 2;
  let frameY = photoCenterY - frameH / 2;

  if (data.photoShape === 'square') {
    frameW = 390;
    frameH = 390;
    frameX = photoCenterX - frameW / 2;
    frameY = photoCenterY - frameH / 2;
  } else if (data.photoShape === 'circle') {
    frameW = 390;
    frameH = 390;
    frameX = photoCenterX - frameW / 2;
    frameY = photoCenterY - frameH / 2;
  }

  // Create clip path for the photo
  const clipPhotoPath = () => {
    ctx.beginPath();
    if (data.photoShape === 'circle') {
      const radius = frameW / 2;
      ctx.arc(frameX + radius, frameY + radius, radius, 0, Math.PI * 2);
    } else {
      const radius = 24;
      drawRoundedRect(ctx, frameX, frameY, frameW, frameH, radius);
    }
    ctx.closePath();
  };

  // Draw photo shadow
  ctx.save();
  ctx.shadowColor = 'rgba(14, 17, 24, 0.32)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = '#FFFFFF';
  clipPhotoPath();
  ctx.fill();
  ctx.restore();

  // Draw user image or graphic placeholder inside clip
  ctx.save();
  clipPhotoPath();
  ctx.clip();

  if (userPhotoImg && userPhotoImg.complete && userPhotoImg.naturalWidth > 0) {
    // Fill background with light neutral in case of transparent PNG
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(frameX, frameY, frameW, frameH);

    // Calculate image fitting with zoom and offset
    const imgW = userPhotoImg.naturalWidth;
    const imgH = userPhotoImg.naturalHeight;
    const coverScale = Math.max(frameW / imgW, frameH / imgH);
    const finalScale = coverScale * Math.max(1, Math.min(3, data.zoom || 1));

    const drawW = imgW * finalScale;
    const drawH = imgH * finalScale;
    const drawX = frameX + (frameW - drawW) / 2 + (data.offsetX || 0);
    const drawY = frameY + (frameH - drawH) / 2 + (data.offsetY || 0);

    ctx.drawImage(userPhotoImg, drawX, drawY, drawW, drawH);
  } else {
    // High-fidelity Graphic Placeholder
    ctx.fillStyle = '#EAF1FB';
    ctx.fillRect(frameX, frameY, frameW, frameH);

    // Subtle radial light
    const grad = ctx.createRadialGradient(
      frameX + frameW / 2,
      frameY + frameH / 2 - 20,
      10,
      frameX + frameW / 2,
      frameY + frameH / 2,
      frameW / 1.5
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(1, '#EAF1FB');
    ctx.fillStyle = grad;
    ctx.fillRect(frameX, frameY, frameW, frameH);

    // Silhouette icon
    ctx.fillStyle = '#0B63CE';
    const cx = frameX + frameW / 2;
    const cy = frameY + frameH / 2 - 24;
    
    // Head
    ctx.beginPath();
    ctx.arc(cx, cy - 28, 38, 0, Math.PI * 2);
    ctx.fill();
    
    // Shoulders
    ctx.beginPath();
    ctx.arc(cx, cy + 64, 68, Math.PI, 0);
    ctx.fill();

    // Text: "Add your photo"
    ctx.font = '700 18px Manrope, sans-serif';
    ctx.fillStyle = '#231F20';
    ctx.textAlign = 'center';
    ctx.fillText('Add your photo', cx, cy + 96);
    ctx.font = '500 13px Manrope, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('Upload in editor', cx, cy + 118);
    ctx.textAlign = 'left';
  }
  ctx.restore();

  // White border on top of photo (12px)
  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 12;
  clipPhotoPath();
  ctx.stroke();
  ctx.restore();

  // 4. Left-Side Content: FOUNDER Tag, Big Name, Role
  const leftX = 80;
  const leftMaxW = 440; // Leaves clear space before photo frame

  // "FOUNDER" tag (slanted badge in #0B63CE with white bold text)
  const tagY = 252;
  const tagW = 142;
  const tagH = 36;
  const tagSlant = 16;
  ctx.fillStyle = '#0B63CE';
  drawSlantedParallelogram(ctx, leftX, tagY, tagW, tagH, tagSlant);
  ctx.fill();

  ctx.font = '800 14px "Archivo Black", Archivo, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.letterSpacing = '2px';
  ctx.fillText('FOUNDER', leftX + 22, tagY + 23);

  // Big Name: Archivo Black
  const nameY = 328;
  const rawName = (data.name || '').trim() || 'YOUR NAME';
  const nameFit = fitAndWrapText(
    ctx,
    rawName,
    leftMaxW,
    140, // max height for name
    52,  // initial font size
    28,  // min font size
    '"Archivo Black", sans-serif',
    900,
    1.1, // tight line height as per brand guide
    2    // max 2 lines
  );

  ctx.fillStyle = '#231F20';
  ctx.font = `900 ${nameFit.fontSize}px "Archivo Black", sans-serif`;
  let currentNameY = nameY + nameFit.fontSize * 0.9;
  for (const line of nameFit.lines) {
    ctx.fillText(line, leftX, currentNameY);
    currentNameY += nameFit.lineHeight;
  }

  // Founder Role: Manrope 700 in #0B63CE
  const roleY = currentNameY + 12;
  const rawRole = (data.role || '').trim() || 'FOUNDER & CEO';
  const roleFit = fitAndWrapText(
    ctx,
    rawRole,
    leftMaxW,
    80,
    26,
    17,
    'Manrope, sans-serif',
    700,
    1.25,
    2
  );

  ctx.fillStyle = '#0B63CE';
  ctx.font = `700 ${roleFit.fontSize}px Manrope, sans-serif`;
  let currentRoleY = roleY + roleFit.fontSize * 0.85;
  for (const line of roleFit.lines) {
    ctx.fillText(line, leftX, currentRoleY);
    currentRoleY += roleFit.lineHeight;
  }

  // Small brand speed accent below role
  ctx.fillStyle = '#0B63CE';
  drawSlantedParallelogram(ctx, leftX, currentRoleY + 16, 64, 4, 8);
  ctx.fill();

  // 5. Middle Section: "MY VIEW ON TEQX STUDIO"
  const viewSectionY = 660;
  const fullContentW = 920; // 80 to 1000

  // Section Header Kicker
  ctx.fillStyle = '#0B63CE';
  drawSlantedParallelogram(ctx, leftX, viewSectionY, 24, 6, 6);
  ctx.fill();

  ctx.font = '800 15px Manrope, sans-serif';
  ctx.fillStyle = '#0B63CE';
  ctx.fillText('MY VIEW ON TEQX STUDIO', leftX + 36, viewSectionY + 8);

  // Large subtle quotation mark accent in background
  ctx.font = 'italic 900 120px Archivo, serif';
  ctx.fillStyle = '#F1F5F9';
  ctx.fillText('“', leftX, viewSectionY + 105);

  // Quote body text
  const rawView = (data.viewOnTeqx || '').trim() ||
    'Teqx Studio builds fast, fearless digital products that move companies forward before anyone else does. The energy, rigor, and speed of execution here are unmatched in the industry.';
  
  const viewFit = fitAndWrapText(
    ctx,
    `“${rawView}”`,
    fullContentW,
    200, // maxHeight
    29,  // initial fontSize
    20,  // minFontSize
    'Manrope, sans-serif',
    500,
    1.45,
    5
  );

  ctx.fillStyle = '#231F20';
  ctx.font = `500 ${viewFit.fontSize}px Manrope, sans-serif`;
  let currentQuoteY = viewSectionY + 44 + viewFit.fontSize * 0.9;
  for (const line of viewFit.lines) {
    ctx.fillText(line, leftX, currentQuoteY);
    currentQuoteY += viewFit.lineHeight;
  }

  // 6. Lower Section: Black Rounded Box with "FUN FACT"
  const boxX = 80;
  const boxY = 940;
  const boxW = 920;
  const boxH = 205;
  const boxRadius = 24;

  // Draw black/ink rounded box (#231F20)
  ctx.save();
  ctx.fillStyle = '#231F20';
  drawRoundedRect(ctx, boxX, boxY, boxW, boxH, boxRadius);
  ctx.fill();

  // Subtle interior top border highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, boxX, boxY, boxW, boxH, boxRadius);
  ctx.stroke();

  // "FUN FACT" blue pill tag inside black box
  const pillX = boxX + 36;
  const pillY = boxY + 28;
  const pillW = 120;
  const pillH = 32;
  const pillRadius = 16;

  ctx.fillStyle = '#0B63CE';
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillRadius);
  ctx.fill();

  ctx.font = '800 13px "Archivo Black", Archivo, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('FUN FACT', pillX + pillW / 2, pillY + 21);
  ctx.textAlign = 'left';

  // Fun fact white text inside black box
  const rawFact = (data.funFact || '').trim() ||
    'Can debug complex distributed architecture problems at 2 AM, but will spend 45 minutes debating which coffee mug has the best thermal dynamics.';

  const factFit = fitAndWrapText(
    ctx,
    rawFact,
    boxW - 72,
    100, // maxHeight
    24,  // initial fontSize
    17,  // minFontSize
    'Manrope, sans-serif',
    500,
    1.4,
    3
  );

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `500 ${factFit.fontSize}px Manrope, sans-serif`;
  let currentFactY = pillY + pillH + 28 + factFit.fontSize * 0.85;
  for (const line of factFit.lines) {
    ctx.fillText(line, pillX, currentFactY);
    currentFactY += factFit.lineHeight;
  }
  ctx.restore();

  // 7. Footer Section
  const footerDividerY = 1220;
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, footerDividerY);
  ctx.lineTo(CANVAS_WIDTH - 80, footerDividerY);
  ctx.stroke();

  // Left side footer: TEQX STUDIO in Archivo Italic 900
  ctx.font = 'italic 900 22px Archivo, sans-serif';
  ctx.fillStyle = '#231F20';
  ctx.fillText('TEQX STUDIO', 80, footerDividerY + 48);

  ctx.font = '600 13px Manrope, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('teqxstudio.com', 80, footerDividerY + 70);

  // Right side footer: FOUNDER SPOTLIGHT · 2026
  ctx.font = '800 13px Manrope, sans-serif';
  ctx.fillStyle = '#0B63CE';
  ctx.textAlign = 'right';
  ctx.fillText('FOUNDER SPOTLIGHT', CANVAS_WIDTH - 80, footerDividerY + 48);

  ctx.font = '600 12px Manrope, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('OCTOBER 2026 EDITION', CANVAS_WIDTH - 80, footerDividerY + 70);
  ctx.textAlign = 'left';

  // Bottom brand strip: solid Teqx Blue bar + 3 slanted motion tabs
  const stripH = 16;
  ctx.fillStyle = '#0B63CE';
  ctx.fillRect(0, CANVAS_HEIGHT - stripH, CANVAS_WIDTH, stripH);

  // Slanted cut highlights on top of bottom strip
  ctx.fillStyle = '#5AA2F0';
  drawSlantedParallelogram(ctx, CANVAS_WIDTH - 180, CANVAS_HEIGHT - stripH, 70, stripH, 20);
  ctx.fill();
  ctx.fillStyle = '#063A82';
  drawSlantedParallelogram(ctx, CANVAS_WIDTH - 90, CANVAS_HEIGHT - stripH, 50, stripH, 20);
  ctx.fill();
}
