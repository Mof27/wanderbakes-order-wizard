
import * as React from "react"
import { toast as sonnerToast, type ToasterToast } from "sonner"

import type { ToastActionElement } from "@/components/ui/toast"

export type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

// Define a unified toast interface
const toast = {
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

const useToast = () => {
  return {
    toast,
    dismiss: toast.dismiss
  }
}

export { useToast, toast }
