
import { useState, useEffect } from 'react';
import { toast as sonnerToast, ToastT } from 'sonner';

type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
};

// Create a global array to store toasts
let TOAST_STORE: ToastProps[] = [];
let LISTENERS: Function[] = [];

// Function to notify listeners when the toast store changes
const notifyListeners = () => {
  LISTENERS.forEach(listener => listener(TOAST_STORE));
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
  },
  // For shadcn toast compatibility
  toast: (props: ToastProps) => {
    const id = props.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast = { ...props, id };
    TOAST_STORE = [...TOAST_STORE, newToast];
    notifyListeners();
    return {
      id,
      dismiss: () => toast.dismiss(id),
      update: (props: ToastProps) => toast.update({ ...props, id })
    };
  },
  dismiss: (id?: string) => {
    if (id) {
      TOAST_STORE = TOAST_STORE.filter(t => t.id !== id);
    } else {
      TOAST_STORE = [];
    }
    notifyListeners();
  },
  update: (props: ToastProps) => {
    if (props.id) {
      TOAST_STORE = TOAST_STORE.map(t => 
        t.id === props.id ? { ...t, ...props } : t
      );
      notifyListeners();
    }
  }
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>(TOAST_STORE);
  
  useEffect(() => {
    // Subscribe to toast store changes
    const listener = (store: ToastProps[]) => {
      setToasts([...store]);
    };
    LISTENERS.push(listener);
    
    // Cleanup
    return () => {
      LISTENERS = LISTENERS.filter(l => l !== listener);
    };
  }, []);
  
  return {
    toast: toast.toast,
    dismiss: toast.dismiss,
    update: toast.update,
    toasts,
    isOpen: toasts.length > 0
  };
};
