'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface Toast {
  id: string
  message: string
  type: 'success' | 'destructive'
}

interface ToastContextValue {
  toast: (message: string, type: 'success' | 'destructive') => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: 'success' | 'destructive') => {
    const id = Date.now().toString()
    const newToast: Toast = { id, message, type }

    setToasts(prev => [...prev, newToast])

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-center justify-between rounded-md border px-4 py-3 shadow-lg',
              'min-w-[300px] max-w-[500px]',
              t.type === 'success' && 'bg-green-50 border-green-200 text-green-800',
              t.type === 'destructive' && 'bg-red-50 border-red-200 text-red-800'
            )}
          >
            <p className="text-sm">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-4 text-sm opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
} 