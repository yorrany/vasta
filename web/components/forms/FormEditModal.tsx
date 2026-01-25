"use client"

import { useState, useEffect } from "react"
import { X, Trash2, Loader2, Save } from "lucide-react"
import { createClient } from "../../lib/supabase/client"
import { useAuth } from "../../lib/AuthContext"

interface FormEditModalProps {
    isOpen: boolean
    onClose: () => void
    formId: number | null
    onSuccess: () => void
}

interface FormField {
    id: string
    label: string
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
    required: boolean
    placeholder?: string
    options?: string[]
    order: number
}

interface FormData {
    id: number
    title: string
    description: string
    destination_email: string
    fields: FormField[]
    link_id: number
}

export function FormEditModal({ isOpen, onClose, formId, onSuccess }: FormEditModalProps) {
    const { user } = useAuth()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [formData, setFormData] = useState<FormData | null>(null)

    useEffect(() => {
        if (isOpen && formId) {
            fetchFormData()
        }
    }, [isOpen, formId])

    const fetchFormData = async () => {
        if (!formId) return
        try {
            const { data, error } = await supabase
                .from('forms')
                .select('*')
                .eq('id', formId)
                .single()

            if (error) throw error
            setFormData(data)
        } catch (error) {
            console.error('Error fetching form:', error)
            alert('Erro ao carregar formulário')
        }
    }

    const handleSave = async () => {
        if (!formData || !user) return
        setLoading(true)

        try {
            // Update form
            const { error: formError } = await supabase
                .from('forms')
                .update({
                    title: formData.title,
                    description: formData.description,
                    destination_email: formData.destination_email
                })
                .eq('id', formData.id)

            if (formError) throw formError

            // Update associated link title
            if (formData.link_id) {
                await supabase
                    .from('links')
                    .update({ title: formData.title })
                    .eq('id', formData.link_id)
            }

            onSuccess()
            onClose()
        } catch (error) {
            console.error('Error updating form:', error)
            alert('Erro ao atualizar formulário')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!formData || !confirm('Tem certeza que deseja excluir este formulário? Todas as respostas também serão excluídas.')) return

        setDeleteLoading(true)
        try {
            // Delete form (cascade will delete submissions)
            const { error: formError } = await supabase
                .from('forms')
                .delete()
                .eq('id', formData.id)

            if (formError) throw formError

            // Delete associated link
            if (formData.link_id) {
                await supabase
                    .from('links')
                    .delete()
                    .eq('id', formData.link_id)
            }

            onSuccess()
            onClose()
        } catch (error) {
            console.error('Error deleting form:', error)
            alert('Erro ao excluir formulário')
        } finally {
            setDeleteLoading(false)
        }
    }

    if (!isOpen || !formData) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-vasta-surface rounded-2xl border border-vasta-border shadow-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-vasta-text">
                        Editar Formulário
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-vasta-muted hover:text-vasta-text transition-colors"
                        aria-label="Fechar modal"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="form-title-input" className="block text-xs font-semibold text-vasta-muted uppercase mb-2">
                            Título do Formulário
                        </label>
                        <input
                            id="form-title-input"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-xl border border-vasta-border bg-vasta-surface-soft px-4 py-3 text-sm text-vasta-text focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="form-desc-input" className="block text-xs font-semibold text-vasta-muted uppercase mb-2">
                            Descrição (opcional)
                        </label>
                        <textarea
                            id="form-desc-input"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            className="w-full rounded-xl border border-vasta-border bg-vasta-surface-soft px-4 py-3 text-sm text-vasta-text focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-vasta-muted uppercase mb-2">
                            E-mail de Destino (opcional)
                        </label>
                        <input
                            type="email"
                            value={formData.destination_email || ''}
                            onChange={(e) => setFormData({ ...formData, destination_email: e.target.value })}
                            placeholder="exemplo@email.com"
                            className="w-full rounded-xl border border-vasta-border bg-vasta-surface-soft px-4 py-3 text-sm text-vasta-text focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary outline-none"
                        />
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <p className="text-xs text-blue-400 font-medium">
                            ℹ️ Para editar os campos do formulário, você precisará recriar o formulário.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-vasta-border bg-transparent text-vasta-text py-3 text-sm font-bold hover:bg-vasta-surface-soft transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-vasta-primary text-white py-3 text-sm font-bold hover:bg-vasta-primary-soft transition-all shadow-lg shadow-vasta-primary/20 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Salvar
                    </button>
                </div>

                <div className="mt-4 pt-4 border-t border-vasta-border">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 py-3 text-sm font-bold hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                        {deleteLoading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                        Excluir Formulário
                    </button>
                </div>
            </div>
        </div>
    )
}
