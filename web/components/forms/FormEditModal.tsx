"use client"

import { useState, useEffect } from "react"
import { X, Trash2, Loader2, Save, Plus, GripVertical } from "lucide-react"
import { createClient } from "../../lib/supabase/client"
import { useAuth } from "../../lib/AuthContext"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface FormEditModalProps {
    isOpen: boolean
    onClose: () => void
    formId: number | null
    onSuccess: () => void
}

type FormFieldType = 'text' | 'email' | 'tel' | 'textarea' | 'select'

interface FormField {
    id: string
    label: string
    type: FormFieldType
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

function SortableFieldItem({
    field,
    index,
    onUpdate,
    onRemove,
    canRemove
}: {
    field: FormField
    index: number
    onUpdate: (id: string, updates: Partial<FormField>) => void
    onRemove: (id: string) => void
    canRemove: boolean
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-4 rounded-xl border border-vasta-border bg-vasta-surface-soft space-y-3 ${isDragging ? 'shadow-lg z-50' : ''
                }`}
        >
            <div className="flex items-start gap-2 sm:gap-3 flex-wrap">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-vasta-muted hover:text-vasta-text transition-colors p-1.5 shrink-0 mt-1"
                    title="Arrastar para reordenar"
                >
                    <GripVertical size={16} />
                </button>
                <span className="text-xs font-bold text-vasta-muted w-5 shrink-0 mt-2">#{index + 1}</span>

                <div className="flex-1 min-w-[150px]">
                    <input
                        type="text"
                        value={field.label}
                        onChange={e => onUpdate(field.id, { label: e.target.value })}
                        placeholder="Nome do campo"
                        className="w-full rounded-lg border border-vasta-border bg-vasta-surface px-3 py-2 text-sm text-vasta-text focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary outline-none"
                    />
                </div>

                <div className="w-full sm:w-auto sm:min-w-[140px]">
                    <select
                        value={field.type}
                        onChange={e => onUpdate(field.id, { type: e.target.value as FormFieldType })}
                        className="w-full rounded-lg border border-vasta-border bg-vasta-surface px-3 py-2 text-sm text-vasta-text focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary outline-none"
                    >
                        <option value="text">Texto</option>
                        <option value="email">Email</option>
                        <option value="tel">Telefone</option>
                        <option value="textarea">Texto Longo</option>
                        <option value="select">Seleção</option>
                    </select>
                </div>

                <label className="flex items-center gap-1.5 text-xs text-vasta-muted whitespace-nowrap shrink-0">
                    <input
                        type="checkbox"
                        checked={field.required}
                        onChange={e => onUpdate(field.id, { required: e.target.checked })}
                        className="rounded"
                    />
                    <span className="hidden sm:inline">Obrigatório</span>
                    <span className="sm:hidden">Obrig.</span>
                </label>

                {canRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(field.id)}
                        className="text-vasta-muted hover:text-red-500 transition-colors p-1.5 shrink-0"
                        title="Remover campo"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {field.type === 'select' && (
                <div>
                    <input
                        type="text"
                        value={field.options?.join(', ') || ''}
                        onChange={e => onUpdate(field.id, {
                            options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        placeholder="Opções separadas por vírgula (Ex: Opção 1, Opção 2)"
                        className="w-full rounded-lg border border-vasta-border bg-vasta-surface px-3 py-2 text-xs text-vasta-text focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary outline-none"
                    />
                </div>
            )}

            {field.type !== 'select' && (
                <div>
                    <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={e => onUpdate(field.id, { placeholder: e.target.value })}
                        placeholder="Placeholder (opcional)"
                        className="w-full rounded-lg border border-vasta-border bg-vasta-surface px-3 py-2 text-xs text-vasta-text focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary outline-none"
                    />
                </div>
            )}
        </div>
    )
}

export function FormEditModal({ isOpen, onClose, formId, onSuccess }: FormEditModalProps) {
    const { user } = useAuth()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [formData, setFormData] = useState<FormData | null>(null)
    const [fields, setFields] = useState<FormField[]>([])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

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
            setFields(data.fields || [])
        } catch (error) {
            console.error('Error fetching form:', error)
            alert('Erro ao carregar formulário')
        }
    }

    const addField = () => {
        const newField: FormField = {
            id: Date.now().toString(),
            label: 'Novo Campo',
            type: 'text',
            required: false,
            order: fields.length
        }
        setFields([...fields, newField])
    }

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
    }

    const removeField = (id: string) => {
        const newFields = fields.filter(f => f.id !== id)
        setFields(newFields.map((f, index) => ({ ...f, order: index })))
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setFields((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id)
                const newIndex = items.findIndex(item => item.id === over.id)
                const newItems = arrayMove(items, oldIndex, newIndex)
                return newItems.map((item, index) => ({ ...item, order: index }))
            })
        }
    }

    const handleSave = async () => {
        if (!formData || !user) return

        // Validation
        if (!formData.title.trim()) {
            alert('O título do formulário é obrigatório')
            return
        }

        if (fields.length === 0) {
            alert('Adicione pelo menos um campo ao formulário')
            return
        }

        for (const field of fields) {
            if (!field.label.trim()) {
                alert(`O campo #${fields.indexOf(field) + 1} precisa de um nome`)
                return
            }
            if (field.type === 'select' && (!field.options || field.options.length === 0)) {
                alert(`O campo "${field.label}" precisa de opções para seleção`)
                return
            }
        }

        setLoading(true)

        try {
            // Prepare form fields
            const formFields = fields.map(f => ({
                label: f.label.trim(),
                type: f.type,
                required: f.required,
                placeholder: f.placeholder?.trim() || null,
                options: f.options || null,
                order: f.order
            }))

            // Update form
            const { error: formError } = await supabase
                .from('forms')
                .update({
                    title: formData.title.trim(),
                    description: formData.description?.trim() || null,
                    destination_email: formData.destination_email?.trim() || null,
                    fields: formFields
                })
                .eq('id', formData.id)

            if (formError) throw formError

            // Update associated link title
            if (formData.link_id) {
                await supabase
                    .from('links')
                    .update({ title: formData.title.trim() })
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="w-full max-w-2xl bg-vasta-surface rounded-2xl border border-vasta-border shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-vasta-border shrink-0">
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

                <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="form-title-input" className="block text-xs font-semibold text-vasta-muted uppercase mb-2">
                                Título do Formulário <span className="text-red-500">*</span>
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
                            <label htmlFor="form-email-input" className="block text-xs font-semibold text-vasta-muted uppercase mb-2">
                                E-mail de Destino (opcional)
                            </label>
                            <input
                                id="form-email-input"
                                type="email"
                                value={formData.destination_email || ''}
                                onChange={(e) => setFormData({ ...formData, destination_email: e.target.value })}
                                placeholder="exemplo@email.com"
                                className="w-full rounded-xl border border-vasta-border bg-vasta-surface-soft px-4 py-3 text-sm text-vasta-text focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-semibold text-vasta-muted uppercase">
                                Campos do Formulário <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={addField}
                                className="flex items-center gap-1.5 text-xs font-bold text-vasta-primary hover:text-vasta-primary-soft transition-colors px-3 py-1.5 rounded-lg hover:bg-vasta-primary/10"
                            >
                                <Plus size={14} />
                                Adicionar Campo
                            </button>
                        </div>

                        {fields.length === 0 ? (
                            <div className="p-8 rounded-xl border border-dashed border-vasta-border bg-vasta-surface-soft/50 text-center">
                                <p className="text-sm text-vasta-muted mb-3">Nenhum campo adicionado</p>
                                <button
                                    type="button"
                                    onClick={addField}
                                    className="text-sm font-bold text-vasta-primary hover:underline"
                                >
                                    Adicionar primeiro campo
                                </button>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={fields.map(f => f.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {fields.map((field, index) => (
                                            <SortableFieldItem
                                                key={field.id}
                                                field={field}
                                                index={index}
                                                onUpdate={updateField}
                                                onRemove={removeField}
                                                canRemove={fields.length > 1}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-vasta-border shrink-0 space-y-3 bg-vasta-surface/50">
                    <div className="flex gap-3">
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
                            Salvar Alterações
                        </button>
                    </div>

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
