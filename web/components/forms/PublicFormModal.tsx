"use client"

import { useState, useEffect, useMemo } from "react"
import { X, Loader2, Send, CheckCircle2 } from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"

interface FormField {
    id: string
    label: string
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
    required: boolean
    placeholder?: string
    options?: string[]
    order: number
}

interface FormConfig {
    id: string
    title: string
    description?: string
    fields: FormField[]
    destination_email?: string
}

interface PublicFormModalProps {
    isOpen: boolean
    onClose: () => void
    form: FormConfig | null
    accentColor?: string
    isDark?: boolean
}

export function PublicFormModal({ isOpen, onClose, form, accentColor = "#000", isDark = false }: PublicFormModalProps) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState<Record<string, string>>({})
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const [turnstileError, setTurnstileError] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Normalize fields to ensure unique IDs
    const normalizedForm = useMemo(() => {
        if (!form) return null

        return {
            ...form,
            fields: form.fields.map((field, index) => ({
                ...field,
                id: field.id || `field-${form.id}-${index}`
            }))
        }
    }, [form])

    if (!isOpen || !normalizedForm) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)

        if (!captchaToken) {
            setSubmitError('Por favor, aguarde a verificação de segurança.')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    formId: normalizedForm.id,
                    data: formData,
                    captchaToken
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao enviar formulário')
            }

            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                setFormData({})
                setSubmitError(null)
                onClose()
            }, 3000)

        } catch (error: any) {
            console.error('Error submitting form:', error)
            setSubmitError(error.message || 'Erro ao enviar formulário. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (fieldId: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }))
    }

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`
                relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden 
                animate-in zoom-in-95 slide-in-from-bottom-5 duration-300
                flex flex-col max-h-[85vh]
                ${isDark ? 'bg-[#0B0E14] text-gray-100' : 'bg-white text-gray-900'}
            `}>

                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                    <div>
                        <h2 className="text-xl font-bold leading-tight">{normalizedForm.title}</h2>
                        {normalizedForm.description && (
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {normalizedForm.description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        aria-label="Fechar formulário"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Success State */}
                {success ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold">Enviado com sucesso!</h3>
                        <p className={`max-w-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Agradecemos seu contato. Sua resposta foi registrada com sucesso.
                        </p>
                    </div>
                ) : (
                    /* Form */
                    <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 custom-scrollbar">
                        {normalizedForm.fields
                            .sort((a, b) => a.order - b.order)
                            .map((field) => (
                                <div key={field.id} className="space-y-2">
                                    <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>

                                    {field.type === 'textarea' ? (
                                        <textarea
                                            required={field.required}
                                            placeholder={field.placeholder || ''}
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            rows={4}
                                            className={`w-full rounded-xl px-4 py-3 text-sm transition-all outline-none border focus:ring-1 ${isDark
                                                ? 'bg-white/5 border-white/10 focus:border-white/30 text-white placeholder:text-white/20'
                                                : 'bg-gray-50 border-gray-200 focus:border-gray-400 text-gray-900 placeholder:text-gray-400'
                                                }`}
                                        />
                                    ) : field.type === 'select' ? (
                                        <div className="relative">
                                            <select
                                                required={field.required}
                                                value={formData[field.id] || ''}
                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                aria-label={field.label}
                                                className={`w-full rounded-xl px-4 py-3 text-sm transition-all outline-none border focus:ring-1 appearance-none ${isDark
                                                    ? 'bg-white/5 border-white/10 focus:border-white/30 text-white'
                                                    : 'bg-gray-50 border-gray-200 focus:border-gray-400 text-gray-900'
                                                    }`}
                                            >
                                                <option value="" disabled selected>Selecione uma opção</option>
                                                {field.options?.map((opt, idx) => (
                                                    <option key={idx} value={opt} className={isDark ? 'bg-stone-900' : 'bg-white'}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <input
                                            type={field.type}
                                            required={field.required}
                                            placeholder={field.placeholder || ''}
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            className={`w-full rounded-xl px-4 py-3 text-sm transition-all outline-none border focus:ring-1 ${isDark
                                                ? 'bg-white/5 border-white/10 focus:border-white/30 text-white placeholder:text-white/20'
                                                : 'bg-gray-50 border-gray-200 focus:border-gray-400 text-gray-900 placeholder:text-gray-400'
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                    </form>
                )}

                {/* Footer Actions */}
                {!success && (
                    <div className={`p-6 border-t ${isDark ? 'border-white/10' : 'border-gray-100'} bg-opacity-50 space-y-4`}>
                        {/* Turnstile Captcha */}
                        <div className="w-full">
                            {/* @ts-ignore - Turnstile library has incomplete type definitions */}
                            <Turnstile
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAACLyd4XoDMS56kOLRKOQfMRUUJU'}
                                onSuccess={(token) => {
                                    setCaptchaToken(token)
                                    setTurnstileError(false)
                                }}
                                onError={() => {
                                    setCaptchaToken(null)
                                    setTurnstileError(true)
                                }}
                                onExpire={() => {
                                    setCaptchaToken(null)
                                    setTurnstileError(false)
                                }}
                                options={{
                                    theme: isDark ? 'dark' : 'light',
                                    size: 'flexible',
                                }}
                            />
                            {turnstileError && (
                                <p className="text-red-500 text-xs text-center animate-pulse">
                                    Erro na verificação de segurança. Recarregue a página.
                                </p>
                            )}
                            {!captchaToken && !turnstileError && (
                                <p className={`text-xs text-center animate-pulse ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Verificando segurança...
                                </p>
                            )}
                        </div>

                        {submitError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">
                                {submitError}
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: accentColor }}
                            aria-label="Enviar resposta do formulário"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Enviar Resposta
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
