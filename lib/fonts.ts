import localFont from 'next/font/local'

// National 2 Condensed Bold for headings
export const national2Condensed = localFont({
  src: '../public/fonts/National-2-Condensed-Bold.ttf',
  variable: '--font-heading',
  display: 'swap',
  weight: '700',
  fallback: ['Arial Black', 'sans-serif'],
})

// ES Klarheit Grotesk for body text
export const esKlarheit = localFont({
  src: '../public/fonts/ESKlarheitGrotesk-Rg.otf',
  variable: '--font-body',
  display: 'swap',
  weight: '400',
  fallback: ['Inter', 'system-ui', 'sans-serif'],
})

// Combined font variables for easy use
export const fontVariables = `${national2Condensed.variable} ${esKlarheit.variable}`