
import * as React from "react"
import { toast as sonnerToast } from "sonner"

export type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

// Define a unified toast interface
export const toast = {
  toast: (props: ToastProps) => {
    return sonnerToast(props.title as string, {
      description: props.description,
      action: props.action,
    })
  },
  success: (message: string, options = {}) => {
    return sonnerToast.success(message, options)
  },
  error: (message: string, options = {}) => {
    return sonnerToast.error(message, options)
  },
  warning: (message: string, options = {}) => {
    return sonnerToast.warning(message, options)
  },
  info: (message: string, options = {}) => {
    return sonnerToast.info(message, options)
  },
  custom: ({ title, description, variant, action }: ToastProps) => {
    return sonnerToast(title as string, {
      description,
      action,
    })
  },
  dismiss: (toastId?: string) => {
    sonnerToast.dismiss(toastId)
  }
}

// This hook returns the toast functions
export const useToast = () => {
  return {
    toast: toast.toast,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    custom: toast.custom,
    dismiss: toast.dismiss
  }
}
