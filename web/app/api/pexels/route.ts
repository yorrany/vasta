import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    // Falback suave se não houver chave configurada
    console.warn("PEXELS_API_KEY is missing.");
    return NextResponse.json({
        error: "Missing API Key",
        portraits: [],
        banners: [],
        products: []
    }, { status: 200 }); 
  }

  const headers = {
    Authorization: apiKey,
  };

  // Helper para randomizar página (1 a 20)
  const randomPage = () => Math.floor(Math.random() * 20) + 1;

  const fetchPexels = async (query: string, count: number) => {
    try {
        // Adiciona &page=random para variar os resultados
        const page = randomPage();
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&page=${page}&orientation=portrait`, { headers });
        if (!res.ok) throw new Error(`Pexels Error: ${res.status}`);
        const data = await res.json();
        return data.photos?.map((p: any) => ({
          url: p.src.large2x || p.src.large,
          photographer: p.photographer,
          photographer_url: p.photographer_url
        })) || [];
    } catch (e) {
        console.error(e);
        return [];
    }
  };

  // Buscando categorias com queries mais refinadas e estéticas
  const [portraits, banners, products] = await Promise.all([
    fetchPexels('diverse professional headshot portrait face smiling', 10), // Rostos claros e amigáveis para perfil
    fetchPexels('abstract dark neon gradient 3d render', 10), 
    fetchPexels('minimalist tech desk setup dark mode', 10) 
  ]);

  return NextResponse.json({
    portraits,
    banners,
    products
  });
}
