import JSZip from 'jszip';
import { extractPaletteFromMedia, ExtractedPalette, getDefaultPalette, generateDynamicPaletteFromName } from './colorExtractor';

export interface ParsedLivelyWallpaper {
  title: string;
  type: 'video' | 'image' | 'html' | 'lively';
  mediaUrl: string;
  previewUrl: string | null;
  mimeType: string;
  palette: ExtractedPalette;
  rawFileName: string;
  description?: string;
  author?: string;
  livelyType?: string | number;
}

/**
 * Helper to test if a file is actually a raw video or image format directly
 * (e.g. when an .mp4 or .webm or .gif/.png file is directly renamed to .mlw)
 */
async function tryFallbackDirectMedia(file: File): Promise<ParsedLivelyWallpaper | null> {
  const mediaUrl = URL.createObjectURL(file);
  const rawFileName = file.name;
  const title = rawFileName.replace(/\.[^/.]+$/, "");

  // 1. Try testing as Video
  const isVideoSupported = await new Promise<boolean>((resolve) => {
    const video = document.createElement('video');
    video.src = mediaUrl;
    video.muted = true;
    let timer = setTimeout(() => resolve(false), 2000);
    video.onloadedmetadata = () => {
      clearTimeout(timer);
      resolve(true);
    };
    video.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
  });

  if (isVideoSupported) {
    const video = document.createElement('video');
    video.src = mediaUrl;
    video.muted = true;
    video.playsInline = true;
    await new Promise<void>((res) => {
      video.onloadeddata = () => {
        video.currentTime = 0.5;
      };
      video.onseeked = () => res();
      video.onerror = () => res();
      setTimeout(res, 2000);
    });
    let palette = await extractPaletteFromMedia(video);
    if (!palette || palette.luminance < 0.05 || !palette.primaryNeon) {
      palette = generateDynamicPaletteFromName(title);
    }
    return {
      title,
      type: 'video',
      mediaUrl,
      previewUrl: null,
      mimeType: file.type || 'video/mp4',
      palette,
      rawFileName
    };
  }

  // 2. Try testing as Image
  const isImageSupported = await new Promise<boolean>((resolve) => {
    const img = new Image();
    img.src = mediaUrl;
    let timer = setTimeout(() => resolve(false), 2000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
  });

  if (isImageSupported) {
    const palette = await extractPaletteFromMedia(mediaUrl);
    return {
      title,
      type: 'image',
      mediaUrl,
      previewUrl: mediaUrl,
      mimeType: file.type || 'image/png',
      palette,
      rawFileName
    };
  }

  // Clean up Object URL if fallback failed
  URL.revokeObjectURL(mediaUrl);
  return null;
}

/**
 * Extracts all assets from an HTML Lively Wallpaper zip archive,
 * maps relative references, and returns an Object URL to the main HTML document.
 */
async function processHtmlLivelyWallpaper(zip: JSZip, mainHtmlPath: string): Promise<string> {
  const assetMap = new Map<string, string>();

  // Extract all non-HTML files as blob Object URLs
  const allFiles = Object.keys(zip.files);
  for (const filePath of allFiles) {
    if (filePath.endsWith('/') || filePath === mainHtmlPath) continue;
    const zipObj = zip.file(filePath);
    if (!zipObj) continue;

    const blob = await zipObj.async('blob');
    const objUrl = URL.createObjectURL(blob);

    assetMap.set(filePath, objUrl);
    assetMap.set(filePath.toLowerCase(), objUrl);

    // Also store stripped path name (without directory) for simple relative references
    const fileNameOnly = filePath.split('/').pop();
    if (fileNameOnly && !assetMap.has(fileNameOnly.toLowerCase())) {
      assetMap.set(fileNameOnly.toLowerCase(), objUrl);
    }
  }

  // Get main HTML file content
  const htmlEntry = zip.file(mainHtmlPath) || zip.file(new RegExp(`${mainHtmlPath.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'))[0];
  if (!htmlEntry) {
    throw new Error(`.mlw içinde HTML dosyası (${mainHtmlPath}) bulunamadı.`);
  }

  let htmlText = await htmlEntry.async('text');

  // Replace relative paths with Object URLs
  assetMap.forEach((objUrl, pathKey) => {
    const escapedKey = pathKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(["'(])(\\./)?${escapedKey}(["')])`, 'gi');
    htmlText = htmlText.replace(regex, `$1${objUrl}$3`);
  });

  const htmlBlob = new Blob([htmlText], { type: 'text/html' });
  return URL.createObjectURL(htmlBlob);
}

/**
 * Parses an `.mlw` file or zip archive, extracts the primary media video/image/html and thumbnail preview,
 * and performs color extraction.
 */
export async function parseMlwFile(file: File): Promise<ParsedLivelyWallpaper> {
  const fileName = file.name;
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  // If directly uploading an mp4/webm/mov/m4v video file or video mime type
  const isVideoFile = ['.mp4', '.m4v', '.webm', '.mov', '.avi', '.mkv', '.ogv', '.3gp'].includes(extension) || file.type?.startsWith('video/');

  if (isVideoFile) {
    const mediaUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = mediaUrl;
    video.muted = true;
    video.playsInline = true;

    let palette = null;
    for (const timeSec of [0.5, 1.5, 3.0]) {
      await new Promise<void>((res) => {
        video.onloadeddata = () => {
          video.currentTime = timeSec;
        };
        video.onseeked = () => res();
        video.onerror = () => res();
        setTimeout(res, 1500);
      });
      const p = await extractPaletteFromMedia(video);
      if (p && p.luminance >= 0.05 && p.primaryNeon) {
        palette = p;
        break;
      }
    }

    const title = fileName.replace(/\.[^/.]+$/, "");
    if (!palette || palette.luminance < 0.05 || !palette.primaryNeon) {
      palette = generateDynamicPaletteFromName(title);
    }

    return {
      title,
      type: 'video',
      mediaUrl,
      previewUrl: null,
      mimeType: file.type || (extension === '.mp4' ? 'video/mp4' : 'video/webm'),
      palette,
      rawFileName: fileName
    };
  }

  // If uploading standard image
  if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(extension)) {
    const mediaUrl = URL.createObjectURL(file);
    const palette = await extractPaletteFromMedia(mediaUrl);

    return {
      title: fileName.replace(/\.[^/.]+$/, ""),
      type: 'image',
      mediaUrl,
      previewUrl: mediaUrl,
      mimeType: file.type || 'image/png',
      palette,
      rawFileName: fileName
    };
  }

  // If uploading `.mlw` or `.zip` file archive
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);

    let livelyInfo: any = null;
    let mediaFileZipPath: string | null = null;
    let previewFileZipPath: string | null = null;

    // Search for LivelyInfo.json or info.json
    const infoEntry = contents.file(/LivelyInfo\.json$/i)[0] || contents.file(/info\.json$/i)[0];

    if (infoEntry) {
      const infoText = await infoEntry.async('text');
      try {
        livelyInfo = JSON.parse(infoText);
        if (livelyInfo.FileName) {
          mediaFileZipPath = livelyInfo.FileName;
        }
        if (livelyInfo.Preview) {
          previewFileZipPath = livelyInfo.Preview;
        }
      } catch (e) {
        console.warn('Could not parse LivelyInfo.json in zip', e);
      }
    }

    // Find video, html or image file if path not explicitly in LivelyInfo
    if (!mediaFileZipPath) {
      const videoFiles = contents.file(/\.(mp4|webm|ogv|mov)$/i);
      if (videoFiles.length > 0) {
        mediaFileZipPath = videoFiles[0].name;
      } else {
        const htmlFiles = contents.file(/\.html$/i);
        if (htmlFiles.length > 0) {
          mediaFileZipPath = htmlFiles[0].name;
        } else {
          const imageFiles = contents.file(/\.(png|jpg|jpeg|webp|gif)$/i);
          if (imageFiles.length > 0) {
            mediaFileZipPath = imageFiles[0].name;
          }
        }
      }
    }

    // Find preview thumbnail if not found
    if (!previewFileZipPath) {
      const previewFiles = contents.file(/preview\.(png|jpg|jpeg|webp|gif)$/i) || contents.file(/\.(png|jpg|jpeg|webp)$/i);
      if (previewFiles.length > 0) {
        previewFileZipPath = previewFiles[0].name;
      }
    }

    if (!mediaFileZipPath) {
      throw new Error('.mlw dosyasında geçerli bir medya (.mp4, .webm, .html, .png, .jpg) bulunamadı.');
    }

    const isVideo = /\.(mp4|webm|ogv|mov)$/i.test(mediaFileZipPath);
    const isHtml = /\.html?$/i.test(mediaFileZipPath) || livelyInfo?.Type === 1 || livelyInfo?.Type === 2 || livelyInfo?.Type === 'HTML' || livelyInfo?.Type === 'Web';
    
    let mediaUrl = '';
    let mimeType = 'video/mp4';
    let mediaType: 'video' | 'html' | 'image' = 'video';

    if (isHtml) {
      mediaType = 'html';
      mimeType = 'text/html';
      mediaUrl = await processHtmlLivelyWallpaper(contents, mediaFileZipPath);
    } else {
      // Find exact file in zip (case-insensitive fallback)
      let mediaZipObj = contents.file(mediaFileZipPath);
      if (!mediaZipObj) {
        const matched = contents.file(new RegExp(`${mediaFileZipPath.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'))[0];
        if (matched) mediaZipObj = matched;
      }

      if (!mediaZipObj) {
        throw new Error(`.mlw içinde ${mediaFileZipPath} dosyasına erişilemedi.`);
      }

      const mediaBlob = await mediaZipObj.async('blob');
      mediaUrl = URL.createObjectURL(mediaBlob);
      mediaType = isVideo ? 'video' : 'image';
      mimeType = mediaBlob.type || (isVideo ? 'video/mp4' : 'image/png');
    }

    // Extract preview thumbnail if available
    let previewUrl: string | null = null;
    let palette = getDefaultPalette();
    const fallbackTitle = livelyInfo?.Title || fileName.replace(/\.[^/.]+$/, "");

    let previewEntry = previewFileZipPath ? contents.file(previewFileZipPath) : null;
    if (!previewEntry && previewFileZipPath) {
      previewEntry = contents.file(new RegExp(`${previewFileZipPath.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'))[0] || null;
    }

    const allImages = contents.file(/\.(png|jpg|jpeg|webp)$/i);
    let bestImageEntry = previewEntry;
    if (!bestImageEntry && allImages.length > 0) {
      bestImageEntry = allImages.find(f => /preview|thumb|bg|background|cover|wallpaper|screen/i.test(f.name)) || allImages[0];
    }

    if (bestImageEntry) {
      const prevBlob = await bestImageEntry.async('blob');
      const prevUrl = URL.createObjectURL(prevBlob);
      if (!previewUrl) {
        previewUrl = prevUrl;
      }
      palette = await extractPaletteFromMedia(prevUrl);
    } else if (mediaType === 'image') {
      previewUrl = mediaUrl;
      palette = await extractPaletteFromMedia(mediaUrl);
    } else if (mediaType === 'video') {
      const video = document.createElement('video');
      video.src = mediaUrl;
      video.muted = true;
      video.playsInline = true;
      
      let videoPalette = null;
      for (const timeSec of [0.5, 1.5, 3.0]) {
        await new Promise<void>((res) => {
          video.onloadeddata = () => {
            video.currentTime = timeSec;
          };
          video.onseeked = () => res();
          video.onerror = () => res();
          setTimeout(res, 1500);
        });
        const p = await extractPaletteFromMedia(video);
        if (p && p.luminance >= 0.05 && p.primaryNeon) {
          videoPalette = p;
          break;
        }
      }
      palette = videoPalette || getDefaultPalette();
    }

    // Ensure palette is vibrant and not dull/black
    if (!palette || palette.luminance < 0.05 || !palette.primaryNeon) {
      palette = generateDynamicPaletteFromName(fallbackTitle);
    }

    return {
      title: fallbackTitle,
      type: 'lively',
      mediaUrl,
      previewUrl,
      mimeType,
      palette,
      rawFileName: fileName,
      description: livelyInfo?.Description,
      author: livelyInfo?.Author,
      livelyType: livelyInfo?.Type
    };

  } catch (err: any) {
    console.warn('MLW zip extraction failed, trying direct video/image fallback parsing...', err);

    // Fallback: If JSZip fails (e.g. "Can't find end of central directory" when a raw video or image file is named .mlw)
    const fallbackResult = await tryFallbackDirectMedia(file);
    if (fallbackResult) {
      return fallbackResult;
    }

    const cleanErrorMsg = err?.message?.includes('central directory')
      ? 'Yüklenen .mlw dosyası geçerli bir ZIP arşivi veya ham video/resim medyası değil.'
      : (err.message || 'Bozuk veya desteklenmeyen arşiv.');

    throw new Error(`.mlw dosyası işlenirken hata oluştu: ${cleanErrorMsg}`);
  }
}
