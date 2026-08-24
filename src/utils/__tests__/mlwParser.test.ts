import { parseLivelyInfoJson, detectLivelyWallpaperType } from '../mlwParser';

describe('Lively Wallpaper & MLW Parser Tests', () => {
  test('Parses LivelyProperty JSON metadata', () => {
    const sampleLivelyInfo = JSON.stringify({
      Title: 'Cyberpunk Neon City 4K',
      Author: 'Apex Designer',
      Description: 'Futuristic rainy skyline with neon glow',
      FileName: 'scene.mp4',
      Thumbnail: 'preview.jpg',
      Type: 'video'
    });

    const parsed = parseLivelyInfoJson(sampleLivelyInfo);
    expect(parsed.Title).toBe('Cyberpunk Neon City 4K');
    expect(parsed.FileName).toBe('scene.mp4');
  });

  test('Correctly detects wallpaper types by file extension', () => {
    expect(detectLivelyWallpaperType('background.mp4')).toBe('video');
    expect(detectLivelyWallpaperType('cyber.webm')).toBe('video');
    expect(detectLivelyWallpaperType('skyline.png')).toBe('image');
    expect(detectLivelyWallpaperType('index.html')).toBe('html');
  });
});
