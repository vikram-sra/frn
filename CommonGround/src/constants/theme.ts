/**
 * 🎨 PREMIUM DESIGN SYSTEM - Common Ground
 * Ultra-modern glassmorphism + cosmic gradient aesthetic
 * Designed for maximum visual impact and user delight
 */

// ═══════════════════════════════════════════════════════════════
// 🌈 CATEGORY ACCENT COLORS - Rich, vibrant gradients
// ═══════════════════════════════════════════════════════════════
export const CATEGORY_COLORS: Record<string, {
    primary: string;
    secondary: string;
    gradient: string[];
    glow: string;
    accent: string;
}> = {
    "Modern Life": {
        primary: '#A855F7',
        secondary: '#C084FC',
        gradient: ['#A855F7', '#7C3AED', '#6D28D9'],
        glow: 'rgba(168, 85, 247, 0.5)',
        accent: '#E879F9',
    },
    "Artificial Intelligence": {
        primary: '#06B6D4',
        secondary: '#22D3EE',
        gradient: ['#06B6D4', '#0891B2', '#0E7490'],
        glow: 'rgba(6, 182, 212, 0.5)',
        accent: '#67E8F9',
    },
    "Social Media": {
        primary: '#F43F5E',
        secondary: '#FB7185',
        gradient: ['#F43F5E', '#E11D48', '#BE123C'],
        glow: 'rgba(244, 63, 94, 0.5)',
        accent: '#FDA4AF',
    },
    "Work Culture": {
        primary: '#F59E0B',
        secondary: '#FBBF24',
        gradient: ['#F59E0B', '#D97706', '#B45309'],
        glow: 'rgba(245, 158, 11, 0.5)',
        accent: '#FDE047',
    },
    "Climate Action": {
        primary: '#10B981',
        secondary: '#34D399',
        gradient: ['#10B981', '#059669', '#047857'],
        glow: 'rgba(16, 185, 129, 0.5)',
        accent: '#6EE7B7',
    },
    "Digital Privacy": {
        primary: '#6366F1',
        secondary: '#818CF8',
        gradient: ['#6366F1', '#4F46E5', '#4338CA'],
        glow: 'rgba(99, 102, 241, 0.5)',
        accent: '#A5B4FC',
    },
    "Education Reform": {
        primary: '#F97316',
        secondary: '#FB923C',
        gradient: ['#F97316', '#EA580C', '#C2410C'],
        glow: 'rgba(249, 115, 22, 0.5)',
        accent: '#FDBA74',
    },
    "Future of Cities": {
        primary: '#14B8A6',
        secondary: '#2DD4BF',
        gradient: ['#14B8A6', '#0D9488', '#0F766E'],
        glow: 'rgba(20, 184, 166, 0.5)',
        accent: '#5EEAD4',
    },
};

// ═══════════════════════════════════════════════════════════════
// 🎨 CORE COLOR PALETTE - Deep, immersive darks with vivid accents
// ═══════════════════════════════════════════════════════════════
export const COLORS = {
    // Deep space backgrounds
    bgPrimary: '#030712',      // Near black with blue undertone
    bgSecondary: '#0F172A',    // Deep navy
    bgTertiary: '#1E293B',     // Slate
    bgCard: 'rgba(15, 23, 42, 0.85)',
    bgElevated: 'rgba(30, 41, 59, 0.9)',

    // Premium Glassmorphism
    glassBg: 'rgba(255, 255, 255, 0.03)',
    glassBgHover: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassBorderLight: 'rgba(255, 255, 255, 0.15)',
    glassHighlight: 'rgba(255, 255, 255, 0.12)',

    // Text hierarchy
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textDim: '#475569',

    // Semantic colors - vibrant
    success: '#22C55E',
    successDark: '#16A34A',
    successGlow: 'rgba(34, 197, 94, 0.4)',
    successBg: 'rgba(34, 197, 94, 0.1)',

    error: '#EF4444',
    errorDark: '#DC2626',
    errorGlow: 'rgba(239, 68, 68, 0.4)',
    errorBg: 'rgba(239, 68, 68, 0.1)',

    warning: '#F59E0B',
    warningGlow: 'rgba(245, 158, 11, 0.4)',

    info: '#3B82F6',
    infoDark: '#2563EB',
    infoGlow: 'rgba(59, 130, 246, 0.4)',
    infoBg: 'rgba(59, 130, 246, 0.1)',

    // Column colors - atmospheric
    columnGreen: 'rgba(16, 185, 129, 0.12)',
    columnGreenBorder: 'rgba(34, 197, 94, 0.25)',
    columnRed: 'rgba(239, 68, 68, 0.12)',
    columnRedBorder: 'rgba(239, 68, 68, 0.25)',

    // Accent colors
    accentPurple: '#A855F7',
    accentCyan: '#06B6D4',
    accentPink: '#EC4899',
    accentBlue: '#3B82F6',
    accentGold: '#F59E0B',

    // Cosmic effects
    cosmicPurple: '#7C3AED',
    cosmicBlue: '#2563EB',
    cosmicCyan: '#0891B2',
    cosmicPink: '#DB2777',

    // Particles/Stars
    starWhite: 'rgba(255, 255, 255, 0.8)',
    starGlow: 'rgba(255, 255, 255, 0.4)',
};

// ═══════════════════════════════════════════════════════════════
// 📝 TYPOGRAPHY - Clean, modern font scale
// ═══════════════════════════════════════════════════════════════
export const TYPOGRAPHY = {
    // Font weights
    weightLight: '300' as const,
    weightRegular: '400' as const,
    weightMedium: '500' as const,
    weightSemibold: '600' as const,
    weightBold: '700' as const,
    weightExtrabold: '800' as const,
    weightBlack: '900' as const,

    // Font sizes (responsive scale)
    sizeXs: 11,
    sizeSm: 13,
    sizeMd: 15,
    sizeLg: 17,
    sizeXl: 20,
    size2xl: 24,
    size3xl: 30,
    size4xl: 36,
    size5xl: 48,
    size6xl: 60,
    size7xl: 72,
    size8xl: 96,

    // Letter spacing
    trackingTighter: -1,
    trackingTight: -0.5,
    trackingNormal: 0,
    trackingWide: 0.5,
    trackingWider: 1,
    trackingWidest: 2,
    trackingUltra: 4,

    // Line heights
    lineHeightTight: 1.1,
    lineHeightSnug: 1.25,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.625,
};

// ═══════════════════════════════════════════════════════════════
// 📐 SPACING - Consistent, harmonious scale
// ═══════════════════════════════════════════════════════════════
export const SPACING = {
    '2xs': 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
    '7xl': 80,
    '8xl': 96,
};

// ═══════════════════════════════════════════════════════════════
// 🔘 BORDER RADIUS - Soft, modern corners
// ═══════════════════════════════════════════════════════════════
export const RADIUS = {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    '4xl': 32,
    full: 9999,
};

// ═══════════════════════════════════════════════════════════════
// 🌟 SHADOWS & GLOWS - Depth and atmosphere
// ═══════════════════════════════════════════════════════════════
export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 5,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 15,
    },
    glow: (color: string, intensity: number = 0.6, radius: number = 20) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: intensity,
        shadowRadius: radius,
        elevation: 12,
    }),
    innerGlow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 0,
    }),
};

// ═══════════════════════════════════════════════════════════════
// ⏱️ ANIMATION TIMING
// ═══════════════════════════════════════════════════════════════
export const DURATIONS = {
    instant: 50,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
    slowest: 1200,
    dramatic: 2000,
};

export const EASING = {
    // Standard easings
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    // Expressive easings
    bounce: [0.68, -0.55, 0.265, 1.55],
    elastic: [0.175, 0.885, 0.32, 1.275],
    smooth: [0.25, 0.1, 0.25, 1],
};

// ═══════════════════════════════════════════════════════════════
// 💎 GLASSMORPHISM CARD STYLES
// ═══════════════════════════════════════════════════════════════
export const GLASS_CARD = {
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.xl,
};

export const GLASS_CARD_ELEVATED = {
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.glassBorderLight,
    borderRadius: RADIUS['2xl'],
    ...SHADOWS.lg,
};

export const GLASS_BUTTON = {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.lg,
};

// ═══════════════════════════════════════════════════════════════
// 🛠️ UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════
export const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS["Modern Life"];
};

export const hexToRgba = (hex: string, alpha: number = 1): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0, 0, 0, ${alpha})`;
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
};

// Gradient presets for LinearGradient
export const GRADIENTS = {
    cosmic: ['#030712', '#0F172A', '#1E1B4B'],
    purple: ['#7C3AED', '#A855F7', '#C084FC'],
    cyan: ['#0891B2', '#06B6D4', '#22D3EE'],
    sunset: ['#F43F5E', '#F97316', '#FBBF24'],
    ocean: ['#0F766E', '#14B8A6', '#2DD4BF'],
    midnight: ['#030712', '#1E1B4B', '#312E81'],
    aurora: ['#06B6D4', '#A855F7', '#EC4899'],
};
