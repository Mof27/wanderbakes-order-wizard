
import { CakeColor } from "@/types";

// Helper function to create CSS for colors (both solid and gradient)
export const getColorStyle = (color: string | CakeColor): React.CSSProperties => {
  // Handle legacy string color
  if (typeof color === 'string') {
    return { backgroundColor: color };
  }

  // Handle new color structure
  if (color.type === 'solid') {
    return { backgroundColor: color.color };
  } else if (color.type === 'gradient') {
    // Create gradient
    const gradientColors = color.colors.join(', ');
    return { background: `linear-gradient(to right, ${gradientColors})` };
  } else {
    // Custom color - use a placeholder or return a simple style
    return { backgroundColor: '#f0f0f0' }; // Light gray as placeholder
  }
};

// Helper function to get display name of the color
export const getColorDisplayName = (color: string | CakeColor): string => {
  // Handle legacy string color
  if (typeof color === 'string') {
    return color;
  }

  // Handle new color structure
  if (color.type === 'solid') {
    return color.color;
  } else if (color.type === 'gradient') {
    return `Gradient (${color.colors.length} colors)`;
  } else {
    // Custom color
    return `Custom: ${color.notes.substring(0, 20)}${color.notes.length > 20 ? '...' : ''}`;
  }
};
