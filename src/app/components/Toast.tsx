"use client"

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

// Toast types
export type ToastType = "success" | "error" | "info" | "warning"

export interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    toasts: Toast[]
    addToast: (message: string, type?: ToastType, duration?: number) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }
    return context
}

// Toast Provider Component
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const addToast = useCallback((message: string, type: ToastType = "info", duration: number = 5000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newToast: Toast = { id, message, type, duration }

        setToasts(prev => [...prev, newToast])

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => removeToast(id), duration)
        }
    }, [removeToast])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

// Toast Container (renders all toasts)
function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    )
}

// Single Toast Item
function ToastItem({ toast, onClose }: { toast: Toast, onClose: () => void }) {
    const [isExiting, setIsExiting] = useState(false)

    const handleClose = () => {
        setIsExiting(true)
        setTimeout(onClose, 200) // Wait for exit animation
    }

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
    }

    const backgrounds = {
        success: "bg-green-900/90 border-green-600/50",
        error: "bg-red-900/90 border-red-600/50",
        warning: "bg-yellow-900/90 border-yellow-600/50",
        info: "bg-blue-900/90 border-blue-600/50",
    }

    return (
        <div
            className={`
                flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg
                ${backgrounds[toast.type]}
                ${isExiting ? "animate-out fade-out slide-out-to-right duration-200" : "animate-in fade-in slide-in-from-right duration-300"}
            `}
        >
            {icons[toast.type]}
            <p className="flex-1 text-sm text-white">{toast.message}</p>
            <button
                onClick={handleClose}
                className="text-neutral-400 hover:text-white transition"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
