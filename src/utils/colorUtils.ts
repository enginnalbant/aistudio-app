/**
 * colorUtils.ts
 * Utility for Liquid Glass (iOS 26 specification) contrast control and luminance calculation.
 * Computes average image luminance and determines dynamic scrim opacity to ensure high readability.
 */

/**
 * Calculates the average luminance (0.0 to 1.0) from an image source URL or Data URI.
 * @param imageUrl URL, Blob URL, or Data URI of the background wallpaper
 * @returns Promise<number> Luminance value between 0.0 (pitch black) and 1.0 (pure white)
 */
export async function calculateImageLuminance(imageUrl: string): Promise<number> {
  if (!imageUrl) return 0.2; // Default fallback to dark tone

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const sampleSize = 64; // Fast 64x64 pixel sample
          canvas.width = sampleSize;
          canvas.height = sampleSize;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(0.3);
            return;
          }

          ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
          const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
          const data = imageData.data;

          let totalLuminance = 0;
          let count = 0;

          for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel for high efficiency
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 128) continue; // Skip transparent pixels

            // Perceptual Rec. 709 luminance calculation formula
            const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            totalLuminance += lum;
            count++;
          }

          const avgLuminance = count > 0 ? totalLuminance / count : 0.3;
          resolve(Math.min(1, Math.max(0, avgLuminance)));
        } catch (err) {
          console.warn('Luminance canvas calculation error (CORS/Blob fallback):', err);
          resolve(0.3);
        }
      };

      img.onerror = () => {
        resolve(0.3);
      };

      img.src = imageUrl;
    } catch {
      resolve(0.3);
    }
  });
}

/**
 * Calculates dynamic Scrim opacity according to Apple Liquid Glass contrast specification:
 * Scrim Opacity Formula: 0.1 + (0.4 * (1 - luminance))
 * High contrast protection when dark wallpaper is selected in Light Mode or bright wallpaper in Dark Mode.
 */
export function calculateScrimOpacity(luminance: number, isDarkTheme: boolean = true): number {
  // Enforce valid luminance bounds
  const safeLum = Math.min(1, Math.max(0, luminance));
  
  // Apple Liquid Glass Scrim formula: 0.1 + (0.4 * (1 - luminance))
  let opacity = 0.1 + 0.4 * (1 - safeLum);

  // If contrast conflict occurs (e.g. Dark Wallpaper in Light Theme)
  if (!isDarkTheme && safeLum < 0.5) {
    // Boost scrim slightly in light mode over dark wallpapers to guarantee text contrast
    opacity = Math.min(0.65, opacity + 0.15);
  } else if (isDarkTheme && safeLum > 0.6) {
    // Boost scrim slightly in dark mode over bright wallpapers
    opacity = Math.min(0.65, opacity + 0.1);
  }

  return Number(Math.min(0.85, Math.max(0.05, opacity)).toFixed(3));
}

/**
 * Returns the exact CSS RGBA color string for the Scrim layer.
 * Light mode -> White scrim (RGB 255, 255, 255)
 * Dark mode -> Black scrim (RGB 0, 0, 0)
 */
export function getScrimColor(isDarkTheme: boolean, scrimOpacity: number): string {
  const rgb = isDarkTheme ? '0, 0, 0' : '255, 255, 255';
  return `rgba(${rgb}, ${scrimOpacity})`;
}

/**
 * Detects whether Liquid Glass (backdrop-filter) is natively supported by current browser runtime/device.
 */
export function isLiquidGlassSupported(): boolean {
  if (typeof window === 'undefined' || typeof CSS === 'undefined') return false;
  return (
    CSS.supports('backdrop-filter', 'blur(10px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
  );
}
