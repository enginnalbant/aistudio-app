import { STUDIO_PRESETS, MATERIAL_PRESETS, generateThemeCSSVariables } from '../themeStudioEngine';

describe('Theme Studio Intelligence Engine Tests', () => {
  test('Contains valid studio and material presets', () => {
    expect(STUDIO_PRESETS.length).toBeGreaterThan(0);
    expect(MATERIAL_PRESETS.length).toBeGreaterThan(0);

    const cyber = STUDIO_PRESETS.find(p => p.id === 'cyberpunk-neon' || p.category === 'Cyberpunk');
    expect(cyber).toBeDefined();
  });

  test('Generates valid CSS variable map from palette and config', () => {
    const preset = STUDIO_PRESETS[0];
    const cssVars = generateThemeCSSVariables(preset.palette, preset.config as any);
    
    expect(typeof cssVars).toBe('object');
    expect(cssVars['--focus-neon']).toBeDefined();
    expect(cssVars['--app-bg']).toBeDefined();
  });

  test('Material presets contain expected surface properties', () => {
    const glass = MATERIAL_PRESETS.find(m => m.id === 'glass');
    expect(glass).toBeDefined();
    expect(glass?.config.cardBlur).toBeDefined();
  });
});
