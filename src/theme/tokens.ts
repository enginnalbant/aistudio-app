// Design System Tokens for Apex OS (Sketch Symbol Architecture)

export const tokens = {
  colors: {
    brand: {
      indigo: '#6366f1',
      purple: '#a855f7',
      cyan: '#22d3ee',
      emerald: '#34d399',
      amber: '#fbbf24',
      rose: '#f43f5e',
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/30 shadow-[0_0_15px_rgba(99,102,241,0.4)]',
      secondary: 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10',
      accent: 'text-cyan-400 fill-cyan-400/20',
      gradient: 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400',
      gradientText: 'bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent',
    },
    surface: {
      base: 'bg-[#070a12]',
      header: 'bg-[#0b0f19]/90 border-white/10 backdrop-blur-2xl',
      sidebar: 'bg-[#080b14] border-white/10',
      subPanel: 'bg-[#0b0f1c]/95 border-white/10 backdrop-blur-xl',
      card: 'bg-slate-900/40 border-white/5 hover:border-white/15 hover:bg-slate-900/70',
      cardSelected: 'bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border-indigo-500/50 shadow-xl',
      input: 'bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500/40',
    },
    text: {
      primary: 'text-slate-100',
      secondary: 'text-slate-400',
      muted: 'text-slate-500',
      accent: 'text-indigo-400',
    }
  },
  radius: {
    xs: 'rounded-md',
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    pill: 'rounded-full',
  },
  shadows: {
    glowIndigo: 'shadow-[0_0_20px_rgba(99,102,241,0.5)]',
    glowCyan: 'shadow-[0_0_15px_rgba(34,211,238,0.4)]',
    card: 'shadow-lg shadow-black/40',
    inner: 'shadow-inner',
  },
  typography: {
    fontDisplay: 'font-display font-extrabold tracking-tight',
    fontBody: 'font-sans font-normal',
    fontMono: 'font-mono text-xs',
  }
} as const;

export type DesignTokens = typeof tokens;
