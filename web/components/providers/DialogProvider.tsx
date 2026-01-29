"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { LogOut, Sparkles } from "lucide-react"

interface ConfirmOptions {
  title: string
  description: string
  content?: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'info'
  onConfirm: () => void
}

interface DialogContextType {
  confirm: (options: ConfirmOptions) => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export const useConfirm = () => {
  const context = useContext(DialogContext)
  if (!context) throw new Error("useConfirm must be used within DialogProvider")
  return context
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogConfig, setDialogConfig] = useState<ConfirmOptions | null>(null)

  const confirm = (options: ConfirmOptions) => {
    setDialogConfig(options)
    setDialogOpen(true)
  }

  const handleConfirm = () => {
    dialogConfig?.onConfirm()
    setDialogOpen(false)
  }

  return (
    <DialogContext value={{ confirm }}>
      {children}
      {dialogOpen && dialogConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[2rem] bg-vasta-surface border border-vasta-border shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center ${dialogConfig.variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-vasta-primary/10 text-vasta-primary'}`}>
                {dialogConfig.variant === 'danger' ? <LogOut size={24} /> : <Sparkles size={24} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-vasta-text">{dialogConfig.title}</h3>
                <p className="text-sm text-vasta-muted mt-2">{dialogConfig.description}</p>
              </div>
              {dialogConfig.content && (
                <div className="py-2 flex justify-center w-full">
                  {dialogConfig.content}
                </div>
              )}
              <div className={`grid gap-3 pt-2 ${dialogConfig.cancelText?.trim() ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {dialogConfig.cancelText && dialogConfig.cancelText.trim() !== "" && (
                  <button
                    onClick={() => setDialogOpen(false)}
                    className="py-3 rounded-xl font-bold text-sm border border-vasta-border text-vasta-text hover:bg-vasta-surface-soft transition-colors"
                  >
                    {dialogConfig.cancelText}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className={`py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${dialogConfig.variant === 'danger'
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                    : 'bg-vasta-primary hover:bg-vasta-primary-soft shadow-vasta-primary/20'
                    }`}
                >
                  {dialogConfig.confirmText || "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContext>
  )
}
