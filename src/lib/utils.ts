import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to darken a hex color for better contrast
export function darkenColor(color: string, amount: number = 0.3): string {
  // Remove # if present
  const hex = color.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Darken each component
  const newR = Math.round(r * (1 - amount));
  const newG = Math.round(g * (1 - amount));
  const newB = Math.round(b * (1 - amount));

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

// Generate category badge styles with better contrast
export function getCategoryBadgeStyles(color?: string) {
  if (!color) {
    return {
      backgroundColor: "#f3f4f6",
      color: "#374151",
    };
  }

  return {
    backgroundColor: `${color}30`, // Slightly more opaque background (30% instead of 20%)
    color: darkenColor(color, 0.4), // Darker text for better contrast
  };
}
