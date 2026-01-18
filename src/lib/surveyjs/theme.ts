// SurveyJS theme configuration using the official theming API
// Reference: https://surveyjs.io/form-library/documentation/manage-default-themes-and-styles
// Colors matched to website theme from globals.css

// Light theme configuration - matches website light mode
// Primary: #2563eb (blue-600)
export const lightTheme = {
  cssVariables: {
    // Background colors - white for dropdown popups, dim variants for form container
    "--sjs-general-backcolor": "rgba(255, 255, 255, 1)",
    "--sjs-general-backcolor-dark": "rgba(243, 244, 246, 1)",
    "--sjs-general-backcolor-dim": "rgba(255, 255, 255, 1)",
    "--sjs-general-backcolor-dim-light": "rgba(255, 255, 255, 1)",
    "--sjs-general-backcolor-dim-dark": "rgba(243, 244, 246, 1)",
    // Editor/Input backgrounds - gray-100 for better contrast against white modal
    "--sjs-editor-background": "rgba(243, 244, 246, 1)",
    "--sjs-editorpanel-backcolor": "rgba(243, 244, 246, 1)",
    "--sjs-questionpanel-backcolor": "transparent",
    // Foreground colors - dark text
    "--sjs-general-forecolor": "rgba(10, 10, 10, 0.91)",
    "--sjs-general-forecolor-light": "rgba(115, 115, 115, 1)",
    "--sjs-general-dim-forecolor": "rgba(10, 10, 10, 0.91)",
    "--sjs-general-dim-forecolor-light": "rgba(115, 115, 115, 1)",
    // Primary color - blue-600 (#2563eb)
    "--sjs-primary-backcolor": "rgba(37, 99, 235, 1)",
    "--sjs-primary-backcolor-light": "rgba(37, 99, 235, 0.1)",
    "--sjs-primary-backcolor-dark": "rgba(29, 78, 216, 1)",
    "--sjs-primary-forecolor": "rgba(255, 255, 255, 1)",
    "--sjs-primary-forecolor-light": "rgba(255, 255, 255, 0.25)",
    // Layout
    "--sjs-base-unit": "8px",
    "--sjs-corner-radius": "6px",
    // Secondary color
    "--sjs-secondary-backcolor": "rgba(245, 245, 245, 1)",
    "--sjs-secondary-backcolor-light": "rgba(245, 245, 245, 0.5)",
    "--sjs-secondary-backcolor-semi-light": "rgba(245, 245, 245, 0.75)",
    "--sjs-secondary-forecolor": "rgba(10, 10, 10, 1)",
    "--sjs-secondary-forecolor-light": "rgba(10, 10, 10, 0.5)",
    // Shadows
    "--sjs-shadow-small": "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
    "--sjs-shadow-medium": "0px 2px 4px 0px rgba(0, 0, 0, 0.1)",
    "--sjs-shadow-large": "0px 4px 8px 0px rgba(0, 0, 0, 0.1)",
    "--sjs-shadow-inner": "inset 0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
    // Borders - visible borders for inputs
    "--sjs-border-light": "rgba(229, 229, 229, 1)",
    "--sjs-border-default": "rgba(229, 229, 229, 1)",
    "--sjs-border-inside": "rgba(229, 229, 229, 1)",
    // Special colors
    "--sjs-special-red": "rgba(220, 38, 38, 1)",
    "--sjs-special-red-light": "rgba(220, 38, 38, 0.1)",
    "--sjs-special-red-forecolor": "rgba(255, 255, 255, 1)",
    "--sjs-special-green": "rgba(22, 163, 74, 1)",
    "--sjs-special-green-light": "rgba(22, 163, 74, 0.1)",
    "--sjs-special-green-forecolor": "rgba(255, 255, 255, 1)",
    "--sjs-special-blue": "rgba(37, 99, 235, 1)",
    "--sjs-special-blue-light": "rgba(37, 99, 235, 0.1)",
    "--sjs-special-blue-forecolor": "rgba(255, 255, 255, 1)",
    "--sjs-special-yellow": "rgba(234, 179, 8, 1)",
    "--sjs-special-yellow-light": "rgba(234, 179, 8, 0.1)",
    "--sjs-special-yellow-forecolor": "rgba(255, 255, 255, 1)",
    // Font settings
    "--sjs-font-size": "14px",
  },
  isPanelless: true,
};

// Dark theme configuration - matches website dark mode
// Primary: #3b82f6 (blue-500)
// Background should match modal bg-background which is neutral-900 (#171717)
export const darkTheme = {
  cssVariables: {
    // Background colors - solid for dropdown popups
    "--sjs-general-backcolor": "rgba(23, 23, 23, 1)",
    "--sjs-general-backcolor-dark": "rgba(38, 38, 38, 1)",
    "--sjs-general-backcolor-dim": "rgba(23, 23, 23, 1)",
    "--sjs-general-backcolor-dim-light": "rgba(23, 23, 23, 1)",
    "--sjs-general-backcolor-dim-dark": "rgba(38, 38, 38, 1)",
    // Editor/Input backgrounds - slightly lighter for visibility against modal bg
    "--sjs-editor-background": "rgba(38, 38, 38, 1)",
    "--sjs-editorpanel-backcolor": "rgba(38, 38, 38, 1)",
    "--sjs-questionpanel-backcolor": "transparent",
    // Foreground colors - light text
    "--sjs-general-forecolor": "rgba(250, 250, 250, 0.91)",
    "--sjs-general-forecolor-light": "rgba(163, 163, 163, 1)",
    "--sjs-general-dim-forecolor": "rgba(250, 250, 250, 0.91)",
    "--sjs-general-dim-forecolor-light": "rgba(163, 163, 163, 1)",
    // Primary color - blue-500 (#3b82f6)
    "--sjs-primary-backcolor": "rgba(59, 130, 246, 1)",
    "--sjs-primary-backcolor-light": "rgba(59, 130, 246, 0.15)",
    "--sjs-primary-backcolor-dark": "rgba(37, 99, 235, 1)",
    "--sjs-primary-forecolor": "rgba(255, 255, 255, 1)",
    "--sjs-primary-forecolor-light": "rgba(255, 255, 255, 0.25)",
    // Layout
    "--sjs-base-unit": "8px",
    "--sjs-corner-radius": "6px",
    // Secondary color
    "--sjs-secondary-backcolor": "rgba(38, 38, 38, 1)",
    "--sjs-secondary-backcolor-light": "rgba(38, 38, 38, 0.5)",
    "--sjs-secondary-backcolor-semi-light": "rgba(38, 38, 38, 0.75)",
    "--sjs-secondary-forecolor": "rgba(250, 250, 250, 1)",
    "--sjs-secondary-forecolor-light": "rgba(250, 250, 250, 0.5)",
    // Shadows
    "--sjs-shadow-small": "0px 1px 2px 0px rgba(0, 0, 0, 0.3)",
    "--sjs-shadow-medium": "0px 2px 4px 0px rgba(0, 0, 0, 0.3)",
    "--sjs-shadow-large": "0px 4px 8px 0px rgba(0, 0, 0, 0.3)",
    "--sjs-shadow-inner": "inset 0px 1px 2px 0px rgba(0, 0, 0, 0.3)",
    // Borders - visible borders for inputs in dark mode
    "--sjs-border-light": "rgba(64, 64, 64, 1)",
    "--sjs-border-default": "rgba(82, 82, 82, 1)",
    "--sjs-border-inside": "rgba(64, 64, 64, 1)",
    // Special colors
    "--sjs-special-red": "rgba(239, 68, 68, 1)",
    "--sjs-special-red-light": "rgba(239, 68, 68, 0.15)",
    "--sjs-special-red-forecolor": "rgba(255, 255, 255, 1)",
    "--sjs-special-green": "rgba(34, 197, 94, 1)",
    "--sjs-special-green-light": "rgba(34, 197, 94, 0.15)",
    "--sjs-special-green-forecolor": "rgba(255, 255, 255, 1)",
    "--sjs-special-blue": "rgba(59, 130, 246, 1)",
    "--sjs-special-blue-light": "rgba(59, 130, 246, 0.15)",
    "--sjs-special-blue-forecolor": "rgba(255, 255, 255, 1)",
    "--sjs-special-yellow": "rgba(250, 204, 21, 1)",
    "--sjs-special-yellow-light": "rgba(250, 204, 21, 0.15)",
    "--sjs-special-yellow-forecolor": "rgba(0, 0, 0, 1)",
    // Font settings
    "--sjs-font-size": "14px",
  },
  isPanelless: true,
};

// Function to get the appropriate theme based on dark mode
export function getSurveyTheme(isDarkMode: boolean) {
  return isDarkMode ? darkTheme : lightTheme;
}

// Legacy function for backwards compatibility (no longer needed but kept for safety)
export function applySurveyJSTheme() {
  // Theme is now applied via model.applyTheme() in each component
}
