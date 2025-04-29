
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
  } else {
    // Create gradient
    const gradientColors = color.colors.join(', ');
    return { background: `linear-gradient(to right, ${gradientColors})` };
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
  } else {
    return 'Gradient';
  }
};
