"use client"

import { useState, useEffect } from "react"
import { Package, Plus, Loader2, Edit, Share2, Wallet, CheckCircle2, AlertCircle, Trash2 } from "lucide-react"
import { createClient } from "../../../lib/supabase/client"
import { useConfirm } from "../layout"
import { PLANS, PlanCode } from "../../../lib/plans"
import { useAuth } from "../../../lib/AuthContext"
import { ProductModal } from "../../../components/products/ProductModal"
import { useRouter } from "next/navigation"

type Product = {
  id: number
  title: string
  description: string
  price: number
  image_url: string | null
  file_url: string | null
  status: string
  type: 'digital' | 'service' | 'physical'
}

export default function MinhaLojaPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [isCheckingStripe, setIsCheckingStripe] = useState(true)
  const [stripeConnected, setStripeConnected] = useState(false)

  // Plan & Limit State
  const [planCode, setPlanCode] = useState<PlanCode>('start')
  const [productLimit, setProductLimit] = useState<number | null>(3)

  const { confirm } = useConfirm()
  const router = useRouter()


  const checkStripeStatus = async () => {
    if (!user) return
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id, plan_code')
      .eq('id', user.id)
      .single()

    setStripeConnected(!!profile?.stripe_account_id)
    if (profile?.plan_code) {
      setPlanCode(profile.plan_code as PlanCode)
      const plan = PLANS.find(p => p.code === profile.plan_code)
      if (plan) setProductLimit(plan.offer_limit)
    }
    setIsCheckingStripe(false)
  }

  const fetchProducts = async () => {
    if (!user) return
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
    checkStripeStatus()
  }, [user])

  const handleConnectStripe = async () => {
    try {
      const response = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro na solicitação")
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        alert("Erro inesperado: URL de conexão não recebida.")
      }
    } catch (error: any) {
      console.error("Error connecting to Stripe:", error)
      alert(`Erro ao conectar com Stripe: ${error.message || "Tente novamente mais tarde."}`)
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    confirm({
      title: "Excluir Produto",
      description: `Tem certeza que deseja excluir "${product.title}"? Esta ação não pode ser desfeita.`,
      variant: "danger",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', product.id)

          if (error) throw error

          fetchProducts()
        } catch (error) {
          console.error("Error deleting product:", error)
          alert("Erro ao excluir produto. Tente novamente.")
        }
      }
    })
  }

  const openNewProductModal = () => {
    if (productLimit !== null && products.length >= productLimit) {
      confirm({
        title: "Limite Atingido",
        description: `Seu plano atual permite apenas ${productLimit} produtos. Faça upgrade para adicionar mais.`,
        variant: "info",
        confirmText: "Ver Planos",
        cancelText: "Fechar",
        onConfirm: () => router.push('/dashboard/billing')
      })
      return
    }
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-vasta-primary" /></div>
  }

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vasta-text">Minha Loja</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-vasta-muted">Gerencie seus produtos digitais e serviços</p>
            {productLimit !== null && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-vasta-surface border border-vasta-border text-vasta-muted font-medium">
                {products.length} / {productLimit} produtos
              </span>
            )}
          </div>
        </div>
        <button
          onClick={openNewProductModal}
          disabled={productLimit !== null && products.length >= productLimit}
          className="flex items-center justify-center gap-2 rounded-2xl bg-vasta-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-vasta-primary-soft shadow-lg shadow-vasta-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
        >
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <section className="space-y-6">
        <div className={`rounded-[2rem] border p-6 relative overflow-hidden transition-all ${stripeConnected
          ? 'border-emerald-500/20 bg-emerald-500/5'
          : 'border-amber-500/20 bg-amber-500/5'
          }`}>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            {stripeConnected
              ? <CheckCircle2 size={100} className="text-emerald-500" />
              : <Wallet size={100} className="text-amber-500" />
            }
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold mb-2 border ${stripeConnected
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                {stripeConnected ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Carteira Ativa
                  </>
                ) : (
                  <>
                    <AlertCircle size={12} />
                    Configuração Necessária
                  </>
                )}
              </div>
              <h3 className="text-lg font-bold text-vasta-text">
                {stripeConnected ? "Você está pronto para vender!" : "Ative seus recebimentos"}
              </h3>
              <p className="text-sm text-vasta-muted mt-1 max-w-md">
                {stripeConnected
                  ? "Seus produtos aparecerão automaticamente no seu perfil público e os pagamentos cairão direto na sua conta bancária."
                  : "Para vender seus produtos, você precisa conectar uma conta Stripe para receber seus pagamentos de forma segura."
                }
              </p>
            </div>

            {!stripeConnected && (
              <button
                onClick={handleConnectStripe}
                className="shrink-0 flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
              >
                <Wallet size={18} />
                Conectar Carteira
              </button>
            )}

            {stripeConnected && (
              <button
                onClick={handleConnectStripe} // Re-using logic to login to dashboard if needed, or we custom link
                className="shrink-0 flex items-center gap-2 bg-vasta-surface border border-vasta-border text-vasta-text px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/50 transition-all"
              >
                <Wallet size={18} />
                Gerenciar Carteira
              </button>
            )}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-vasta-border py-24 text-center bg-vasta-surface/30">
            <div className="h-20 w-20 rounded-3xl bg-vasta-surface-soft flex items-center justify-center mb-6 text-vasta-muted shadow-sm">
              <Package size={40} />
            </div>
            <h3 className="text-xl font-bold text-vasta-text mb-2">Sua loja está vazia</h3>
            <p className="text-vasta-muted max-w-xs mx-auto mb-8 leading-relaxed">Comece a monetizar sua audiência vendendo e-books, consultorias ou presets.</p>
            <button
              onClick={openNewProductModal}
              disabled={productLimit !== null && products.length >= productLimit}
              className="text-sm font-bold text-vasta-primary hover:underline underline-offset-4 disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
            >
              Criar primeiro produto
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(product => (
              <div
                key={product.id}
                className="group flex flex-col rounded-[2rem] border border-vasta-border bg-vasta-surface overflow-hidden hover:shadow-xl hover:shadow-black/5 hover:border-vasta-primary/30 transition-all duration-300"
              >
                <div className="h-48 bg-vasta-surface-soft relative overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-vasta-bg/50">
                      <Package className="text-vasta-muted/30" size={40} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                      {(product.type === 'digital' && 'Digital') ||
                        (product.type === 'service' && 'Serviço') ||
                        (product.type === 'physical' && 'Físico') ||
                        product.type}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-bold text-vasta-text leading-tight line-clamp-2">{product.title}</h3>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-vasta-primary">
                      {product.price > 0 ? `R$ ${product.price.toFixed(2).replace('.', ',')}` : 'Grátis'}
                    </p>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className="text-vasta-muted hover:text-red-500 transition-colors p-1"
                      title="Excluir produto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-vasta-surface-soft border border-vasta-border py-2.5 text-xs font-bold text-vasta-text hover:bg-vasta-border/50 transition-colors"
                    >
                      <Edit size={14} /> Editar
                    </button>
                    <button title="Compartilhar" className="flex items-center justify-center p-2.5 rounded-xl bg-vasta-surface-soft border border-vasta-border text-vasta-muted hover:text-vasta-text hover:bg-vasta-border/50 transition-colors">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
        onSuccess={fetchProducts}
      />
    </div>
  )
}

