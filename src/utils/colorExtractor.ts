export interface ExtractedPalette {
  primaryNeon: string;     // E.g. "#3b82f6" (Most vibrant dominant hue)
  secondaryMain: string;   // E.g. "#1d4ed8" (Supporting rich tone)
  darkObsidian: string;    // E.g. "#0a0d14" (Deep atmospheric tone)
  glassTint: string;       // E.g. "rgba(15, 23, 42, 0.75)"
  glowRgb: string;         // E.g. "59, 130, 246"
  accentHexList: string[]; // Top 6 distinct dominant colors extracted
  isDarkTheme: boolean;    // Is the overall image dark or light?
  luminance: number;       // 0 - 1 average brightness
}

// Convert RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert HEX to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 59, g: 130, b: 246 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Calculate color saturation (0-1)
function getSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  if (max === min) return 0;
  const l = (max + min) / 2;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

// Calculate luminance (0-1)
function getLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Extracts a harmonic 6-color palette and UI theme properties from an HTML Image, Video frame, or Canvas.
 */
export async function extractPaletteFromMedia(
  mediaSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | string
): Promise<ExtractedPalette> {
  return new Promise((resolve) => {
    const processImage = (imgEl: HTMLImageElement | HTMLCanvasElement) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const sampleSize = 120; // 120x120 for fast high-accuracy analysis
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        if (!ctx) {
          resolve(getDefaultPalette());
          return;
        }

        ctx.drawImage(imgEl, 0, 0, sampleSize, sampleSize);
        const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imgData.data;

        // Bucket pixel colors
        const colorBuckets: { [key: string]: { r: number; g: number; b: number; count: number; sat: number; lum: number } } = {};
        let totalLum = 0;
        let pixelCount = 0;

        for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel for speed
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue; // Skip transparent pixels

          // Quantize color into buckets of 24
          const qr = Math.floor(r / 24) * 24;
          const qg = Math.floor(g / 24) * 24;
          const qb = Math.floor(b / 24) * 24;
          const key = `${qr},${qg},${qb}`;

          const sat = getSaturation(r, g, b);
          const lum = getLuminance(r, g, b);

          totalLum += lum;
          pixelCount++;

          if (!colorBuckets[key]) {
            colorBuckets[key] = { r, g, b, count: 0, sat, lum };
          }
          colorBuckets[key].count++;
        }

        const avgLum = pixelCount > 0 ? totalLum / pixelCount : 0.5;
        const sortedBuckets = Object.values(colorBuckets).sort((a, b) => b.count - a.count);

        if (sortedBuckets.length === 0) {
          resolve(getDefaultPalette());
          return;
        }

        // Find vibrant accent colors (high saturation, medium luminance)
        const vibrantBuckets = Object.values(colorBuckets)
          .filter(b => b.sat > 0.25 && b.lum > 0.15 && b.lum < 0.85)
          .sort((a, b) => (b.sat * 1.5 + b.count / 100) - (a.sat * 1.5 + a.count / 100));

        // Dominant hex list
        const accentHexList: string[] = [];
        const uniqueSet = new Set<string>();

        // Add vibrant colors first
        vibrantBuckets.forEach(b => {
          const hex = rgbToHex(b.r, b.g, b.b);
          if (!uniqueSet.has(hex) && accentHexList.length < 6) {
            uniqueSet.add(hex);
            accentHexList.push(hex);
          }
        });

        // Fill with overall dominant buckets if needed
        sortedBuckets.forEach(b => {
          const hex = rgbToHex(b.r, b.g, b.b);
          if (!uniqueSet.has(hex) && accentHexList.length < 6) {
            uniqueSet.add(hex);
            accentHexList.push(hex);
          }
        });

        const primaryNeon = accentHexList[0] || "#3b82f6";
        const secondaryMain = accentHexList[1] || accentHexList[0] || "#1d4ed8";

        // Find darkest background tone
        const darkBucket = sortedBuckets
          .filter(b => b.lum < 0.35)
          .sort((a, b) => b.count - a.count)[0];

        const darkObsidian = darkBucket 
          ? rgbToHex(Math.min(darkBucket.r, 20), Math.min(darkBucket.g, 25), Math.min(darkBucket.b, 35)) 
          : "#090d16";

        const primaryRgb = hexToRgb(primaryNeon);
        const glowRgb = `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`;
        const glassTint = `rgba(${Math.round(primaryRgb.r * 0.1)}, ${Math.round(primaryRgb.g * 0.12)}, ${Math.round(primaryRgb.b * 0.18)}, 0.75)`;

        resolve({
          primaryNeon,
          secondaryMain,
          darkObsidian,
          glassTint,
          glowRgb,
          accentHexList: accentHexList.length >= 3 ? accentHexList : [primaryNeon, secondaryMain, "#60a5fa", "#38bdf8", "#818cf8", "#a855f7"],
          isDarkTheme: avgLum < 0.6,
          luminance: avgLum
        });
      } catch (err) {
        console.error("Color extraction error:", err);
        resolve(getDefaultPalette());
      }
    };

    if (typeof mediaSource === 'string') {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => processImage(img);
      img.onerror = () => resolve(getDefaultPalette());
      img.src = mediaSource;
    } else if (mediaSource instanceof HTMLVideoElement) {
      const canvas = document.createElement('canvas');
      canvas.width = mediaSource.videoWidth || 300;
      canvas.height = mediaSource.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(mediaSource, 0, 0, canvas.width, canvas.height);
        processImage(canvas);
      } else {
        resolve(getDefaultPalette());
      }
    } else {
      processImage(mediaSource);
    }
  });
}

export function getDefaultPalette(): ExtractedPalette {
  return {
    primaryNeon: "#3b82f6",
    secondaryMain: "#1d4ed8",
    darkObsidian: "#070a12",
    glassTint: "rgba(15, 23, 42, 0.75)",
    glowRgb: "59, 130, 246",
    accentHexList: ["#3b82f6", "#1d4ed8", "#60a5fa", "#38bdf8", "#818cf8", "#a855f7"],
    isDarkTheme: true,
    luminance: 0.2
  };
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generateDynamicPaletteFromName(name: string): ExtractedPalette {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const primaryNeon = hslToHex(hue, 85, 60);
  const secondaryMain = hslToHex((hue + 40) % 360, 80, 50);
  const darkHue = (hue + 15) % 360;
  const darkObsidian = hslToHex(darkHue, 40, 6);
  const primaryRgb = hexToRgb(primaryNeon);
  const accent1 = primaryNeon;
  const accent2 = secondaryMain;
  const accent3 = hslToHex((hue + 90) % 360, 75, 65);
  const accent4 = hslToHex((hue + 180) % 360, 75, 65);
  const accent5 = hslToHex((hue + 270) % 360, 75, 65);
  const accent6 = hslToHex((hue + 45) % 360, 90, 70);

  return {
    primaryNeon,
    secondaryMain,
    darkObsidian,
    glassTint: `rgba(${Math.round(primaryRgb.r * 0.12)}, ${Math.round(primaryRgb.g * 0.15)}, ${Math.round(primaryRgb.b * 0.22)}, 0.78)`,
    glowRgb: `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`,
    accentHexList: [accent1, accent2, accent3, accent4, accent5, accent6],
    isDarkTheme: true,
    luminance: 0.2
  };
}
