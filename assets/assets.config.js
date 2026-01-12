/**
 * Assets Configuration
 * Contains paths and references to static assets used throughout the application
 */

const assetsConfig = {
  icons: {
    default: 'assets/icons/default.svg',
    sizes: [16, 32, 48, 64, 128, 256, 512],
    formats: ['svg', 'png', 'ico']
  },
  
  audio: {
    formats: ['mp3', 'wav', 'ogg', 'm4a'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    sampleRates: [16000, 22050, 44100, 48000]
  },
  
  images: {
    formats: ['jpg', 'png', 'webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxDimensions: { width: 4096, height: 4096 }
  },
  
  fonts: {
    formats: ['ttf', 'otf', 'woff', 'woff2'],
    families: ['Inter', 'Roboto Mono', 'Noto Sans CJK']
  },
  
  manifest: {
    name: 'Neural Voice OS',
    shortName: 'NeuralVoice',
    description: 'Local AI Voice Operating System',
    themeColor: '#0f172a',
    backgroundColor: '#0f172a'
  }
};

module.exports = assetsConfig;
