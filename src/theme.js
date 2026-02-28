import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

// Arcane Forge theme: amber primary, dark form fields, purple accents
const ForgePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#e8a042',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.600}',
          contrastColor: '#fdf8f0',
          hoverColor: '{primary.500}',
          activeColor: '{primary.400}',
        },
        formField: {
          background: '#f0e8d8',
          color: '#2c2018',
          borderColor: '#d8ccb4',
          hoverBorderColor: '#6d3fcf',
          focusBorderColor: '#6d3fcf',
          placeholderColor: '#7a6a50',
          shadow: 'inset 0 2px 4px rgba(100, 70, 20, 0.08)',
        },
      },
      dark: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#0a0812',
          hoverColor: '{primary.400}',
          activeColor: '{primary.300}',
        },
        formField: {
          background: '#24202e',
          color: '#c8c4d4',
          borderColor: '#383245',
          hoverBorderColor: '#8b5cf6',
          focusBorderColor: '#8b5cf6',
          placeholderColor: '#8a849a',
          shadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
        },
      },
    },
  },
})

export default ForgePreset
