
import { useState, useEffect } from 'react';
import { toast as sonnerToast, Toast } from 'sonner';

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
};

export const toast = {
  success: (message: string, options = {}) => {
    sonnerToast.success(message, options);
  },
  error: (message: string, options = {}) => {
    sonnerToast.error(message, options);
  },
  warning: (message: string, options = {}) => {
    sonnerToast.warning(message, options);
  },
  info: (message: string, options = {}) => {
    sonnerToast.message(message, options);
  },
  // For custom toast with more options
  custom: ({ title, description, variant, action }: ToastProps) => {
    sonnerToast(title, {
      description,
      action,
      className: variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : ''
    });
  }
};

export const useToast = () => {
  const [open, setOpen] = useState(false);
  const [currentToast, setCurrentToast] = useState<ToastProps | null>(null);

  const showToast = (props: ToastProps) => {
    setCurrentToast(props);
    setOpen(true);
    toast.custom(props);
  };

  const dismissToast = () => {
    setOpen(false);
  };

  return {
    toast: showToast,
    dismiss: dismissToast,
    isOpen: open
  };
};
