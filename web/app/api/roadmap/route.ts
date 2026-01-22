
import { NextResponse } from "next/server";

const MOCK_ROADMAP = [
  {
    id: "1",
    title: "Integração Personalizada de Domínio",
    description: "Permitir que usuários conectem seus próprios domínios .com.br direto na plataforma.",
    status: "in_progress",
    votes_count: 120
  },
  {
    id: "2",
    title: "Vendas de Produtos Físicos",
    description: "Expansão da loja para suportar frete e estoque de produtos físicos.",
    status: "planned",
    votes_count: 85
  },
  {
    id: "3",
    title: "Temas Dark/Light Automáticos",
    description: "Adaptação automática do tema da página baseada na preferência do visitante.",
    status: "live",
    votes_count: 200
  }
];

export async function GET() {
  // In the future, replace this with Supabase query:
  // const { data } = await supabase.from('roadmap_features').select('*');
  
  return NextResponse.json({
    features: MOCK_ROADMAP,
    total_votes: 405
  });
}
