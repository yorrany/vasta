"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Loader2, Save, Upload, Image as ImageIcon, DollarSign, Type, Check, RefreshCw } from "lucide-react"
import { createClient } from "../../lib/supabase/client"
import { useAuth } from "../../lib/AuthContext"
import Cropper from "react-easy-crop"
import getCroppedImg from "../../lib/canvasUtils"

type Product = {
  id?: number
  title: string
  description: string
  price: number
  image_url: string | null
  gallery_urls?: string[]
  file_url: string | null
  type: 'digital' | 'service' | 'physical'
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  productToEdit?: Product | null
  onSuccess: () => void
}

export function ProductModal({ isOpen, onClose, productToEdit, onSuccess }: ProductModalProps) {
  const [title, setTitle] = useState(productToEdit?.title || "")
  const [description, setDescription] = useState(productToEdit?.description || "")
  const [price, setPrice] = useState<string>(productToEdit?.price?.toString() || "")
  const [imageUrl, setImageUrl] = useState<string | null>(productToEdit?.image_url || null)
  const [galleryUrls, setGalleryUrls] = useState<string[]>(productToEdit?.gallery_urls || [])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Crop State
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  const { user } = useAuth()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTitle(productToEdit?.title || "")
      setDescription(productToEdit?.description || "")
      setPrice(productToEdit?.price?.toString() || "")
      setImageUrl(productToEdit?.image_url || null)
      setGalleryUrls(productToEdit?.gallery_urls || [])
    }
  }, [isOpen, productToEdit])

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        alert("Imagem deve ter no máximo 5MB")
        return
      }

      const reader = new FileReader()
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null)
        setIsCropping(true)
      })
      reader.readAsDataURL(file)
    }
  }

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return

    setUploadingImage(true)
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (!croppedImageBlob) throw new Error("Erro ao cortar imagem")

      // Upload Blob
      const fileName = `${user.id}/products/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('avatars') // Using avatars bucket for now as per previous code, ideally specific bucket
        .upload(fileName, croppedImageBlob)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setImageUrl(publicUrl)
      setIsCropping(false)
      setImageSrc(null)
    } catch (error) {
      console.error("Error cropping/uploading image:", error)
      alert("Erro ao processar imagem.")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return
    if (galleryUrls.length + e.target.files.length > 4) {
      alert("Máximo de 4 fotos na galeria.")
      return
    }

    setUploadingImage(true)
    try {
      const newUrls: string[] = []

      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i]
        if (file.size > 5 * 1024 * 1024) continue

        const fileName = `${user.id}/products/gallery_${Date.now()}_${i}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)

        newUrls.push(publicUrl)
      }

      setGalleryUrls(prev => [...prev, ...newUrls])
    } catch (error) {
      console.error("Error uploading gallery:", error)
      alert("Erro ao enviar fotos da galeria.")
    } finally {
      setUploadingImage(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setGalleryUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const numericPrice = parseFloat(price.replace(',', '.'))
    if (description.length > 450) {
      alert("A descrição deve ter no máximo 450 caracteres.")
      setLoading(false)
      return
    }

    try {
      const productData = {
        title,
        description,
        price: isNaN(numericPrice) ? 0 : numericPrice,
        image_url: imageUrl,
        gallery_urls: galleryUrls,
        type: 'digital',
        profile_id: user.id
      }

      if (productToEdit?.id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productToEdit.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData)
        if (error) throw error
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Erro ao salvar produto.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-lg bg-vasta-surface rounded-[2rem] border border-vasta-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <div className="flex justify-between items-center p-6 border-b border-vasta-border bg-vasta-surface z-10 relative">
          <h2 className="text-xl font-bold text-vasta-text">
            {isCropping ? 'Ajustar Imagem' : (productToEdit ? 'Editar Produto' : 'Novo Produto')}
          </h2>
          <button onClick={() => isCropping ? setIsCropping(false) : onClose()} className="text-vasta-muted hover:text-vasta-text transition-colors p-2 hover:bg-vasta-surface-soft rounded-full">
            <X size={20} />
          </button>
        </div>

        {isCropping ? (
          <div className="p-6 h-[400px] flex flex-col">
            <div className="relative flex-1 rounded-xl overflow-hidden bg-black mb-6">
              <Cropper
                image={imageSrc || ""}
                crop={crop}
                zoom={zoom}
                aspect={9 / 12} // Portrait aspect ratio (3:4 or similar tailored for cards)
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 flex items-center gap-2 px-2">
                <span className="text-xs font-bold text-vasta-muted">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-vasta-border rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <button
                onClick={handleCropSave}
                disabled={uploadingImage}
                className="flex items-center gap-2 bg-vasta-primary text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-vasta-primary-soft"
              >
                {uploadingImage ? <Loader2 className="animate-spin" /> : <Check size={18} />}
                Confirmar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">

            {/* Image Upload */}
            <div className="flex justify-center gap-4">
              {/* Main Cover */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer w-40 h-52 rounded-2xl bg-vasta-surface-soft border-2 border-dashed border-vasta-border hover:border-vasta-primary/50 transition-all flex flex-col items-center justify-center overflow-hidden shrink-0"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-vasta-muted group-hover:text-vasta-primary transition-colors">
                    <div className="p-2 bg-vasta-bg rounded-full shadow-sm">
                      <ImageIcon size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center px-2">Capa<br />(Retrato)</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold backdrop-blur-[1px]">
                  <Upload size={20} />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
              </div>

              {/* Gallery - Vertical Stack / Grid */}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-vasta-muted uppercase tracking-wider">Galeria ({galleryUrls.length}/4)</span>
                  {galleryUrls.length < 4 && (
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="text-[10px] font-bold text-vasta-primary bg-vasta-primary/10 px-2 py-1 rounded-lg hover:bg-vasta-primary/20 transition-colors"
                    >
                      + Adicionar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {galleryUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-vasta-border group">
                      <img src={url} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {[...Array(Math.max(0, 4 - galleryUrls.length))].map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg border border-dashed border-vasta-border bg-vasta-surface-soft/50 flex items-center justify-center text-vasta-muted/30">
                      <ImageIcon size={16} />
                    </div>
                  ))}
                </div>
                <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} />
                <p className="text-[10px] text-vasta-muted leading-tight">Adicione fotos extras para mostrar detalhes do seu produto.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-vasta-muted uppercase tracking-wider mb-2">Nome do Produto</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-vasta-muted" size={16} />
                  <input
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: E-book de Receitas"
                    className="w-full rounded-xl bg-vasta-surface-soft border border-vasta-border py-3 pl-10 pr-4 text-sm font-medium text-vasta-text focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-vasta-muted uppercase tracking-wider mb-2">Preço (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-vasta-muted" size={16} />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="29.90"
                    className="w-full rounded-xl bg-vasta-surface-soft border border-vasta-border py-3 pl-10 pr-4 text-sm font-medium text-vasta-text focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-vasta-muted uppercase tracking-wider">Descrição</label>
                  <span className={`text-[10px] font-bold ${description.length > 450 ? 'text-red-500' : 'text-vasta-muted/70'}`}>
                    {description.length}/450
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detalhes incríveis sobre seu produto..."
                  rows={4}
                  maxLength={450}
                  className="w-full rounded-xl bg-vasta-surface-soft border border-vasta-border p-4 text-sm font-medium text-vasta-text focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || uploadingImage || description.length > 450}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-vasta-primary py-4 text-sm font-bold text-white shadow-lg shadow-vasta-primary/20 hover:bg-vasta-primary-soft hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvar Produto</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
