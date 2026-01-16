"use client"

import { useState } from "react"
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
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus } from "lucide-react"

type LinkItem = {
  id: number
  title: string
  url: string
  active: boolean
}

interface SortableItemProps {
  link: LinkItem
  toggleActive: (id: number) => void
}

function SortableLinkItem({ link, toggleActive }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-2xl border border-vasta-border bg-vasta-surface/50 p-4 transition-all hover:bg-vasta-surface ${
        isDragging ? "shadow-2xl brightness-110" : "shadow-sm"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-vasta-muted transition-colors hover:text-vasta-text"
      >
        <GripVertical size={20} />
      </div>

      <div className="flex-1 space-y-0.5">
        <div className="font-semibold text-vasta-text">{link.title}</div>
        <div className="text-xs text-vasta-muted">{link.url}</div>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-lg bg-vasta-surface-soft px-3 py-1.5 text-xs font-medium text-vasta-text transition-colors hover:bg-vasta-border">
          Editar
        </button>
        <button
          onClick={() => toggleActive(link.id)}
          className={`relative h-6 w-11 rounded-full p-1 transition-colors ${
            link.active
              ? "bg-emerald-500"
              : "bg-vasta-muted/30"
          }`}
        >
          <div
            className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              link.active ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  )
}

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([
    { id: 1, title: "LinkedIn", url: "https://linkedin.com/in/seu-perfil", active: true },
    { id: 2, title: "Instagram", url: "https://instagram.com/seu-perfil", active: true },
    { id: 3, title: "Portfólio", url: "https://vasta.pro/seu-perfil", active: true },
    { id: 4, title: "Twitter / X", url: "https://x.com/seu-perfil", active: false }
  ])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const toggleActive = (id: number) => {
    setLinks(current =>
      current.map(link =>
        link.id === id ? { ...link, active: !link.active } : link
      )
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-32">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vasta-text">Meus links</h1>
          <p className="text-sm text-vasta-muted">Organize e gerencie seus links públicos</p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-2xl bg-vasta-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-vasta-primary-soft shadow-lg shadow-vasta-primary/20">
          <Plus size={18} /> Adicionar novo link
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-vasta-surface-soft/50 rounded-2xl w-fit">
        <button className="rounded-xl px-4 py-2 text-sm font-medium bg-vasta-surface text-vasta-text shadow-sm transition-all border border-vasta-border">
          Todos ({links.length})
        </button>
        <button className="rounded-xl px-4 py-2 text-sm font-medium text-vasta-muted hover:text-vasta-text transition-all">
          Ativos ({links.filter(l => l.active).length})
        </button>
        <button className="rounded-xl px-4 py-2 text-sm font-medium text-vasta-muted hover:text-vasta-text transition-all">
          Ocultos ({links.filter(l => !l.active).length})
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4">
          <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
            {links.map(link => (
              <SortableLinkItem key={link.id} link={link} toggleActive={toggleActive} />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {links.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-vasta-border py-20 text-center">
          <p className="text-vasta-muted">Você ainda não possui links cadastrados.</p>
        </div>
      )}
    </div>
  )
}

