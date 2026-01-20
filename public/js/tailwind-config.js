// Global Tailwind Configuration for Wanderlust Project
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: { 
        // Global colors
        "primary": "#5c0eaa",
        "electric-blue": "#1E90FF",
        "emerald": "#00C853",
        "emerald-success": "#29C978",
        "emerald-green": "#00A36C",
        "emerald-status": "#10b981",
        "sky-blue": "#72c6ef",
        "emerald-accent": "#10b981",
        "charcoal": "#2C2C2F",
        "royal-purple": "#4b22c3",
        
        // Additional colors
        "accent-blue": "#2d63ed",
        "emerald-green": "#1F9960",
        "sage-green": "#9BB587",
        "accent-purple": "#9966CC",
        "accent-green": "#10b981",
        
        // Background colors
        "background-light": "#f9fafa",
        "surface-light": "#F8F8FA",
        "background-dark": "#18181b",
        
        // Admin-specific colors
        "admin-primary": "#6b28d7",
        "accent-blue": "#3B82F6",
        "body-bg": "#f8fafc",
      },
      fontFamily: { 
        "display": ["Poppins", "Manrope", "sans-serif"],
        "sans": ["Manrope", "sans-serif"]
      },
      borderRadius: { 
        "DEFAULT": "0.25rem",
        "lg": "1rem", 
        "xl": "1.5rem",
        "full": "9999px"
      },
    },
  },
}
