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

  const fetchPexels = async (query: string, count: number) => {
    try {
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait`, { headers });
        if (!res.ok) throw new Error(`Pexels Error: ${res.status}`);
        const data = await res.json();
        return data.photos?.map((p: any) => p.src.large2x || p.src.large) || [];
    } catch (e) {
        console.error(e);
        return [];
    }
  };

  // Buscando categorias específicas para o Hero
  const [portraits, banners, products] = await Promise.all([
    fetchPexels('professional headshot portrait', 8), // Fotos de perfil
    fetchPexels('abstract gradient vibrant wallpaper', 8), // Banner do celular
    fetchPexels('software code ui design mockup', 8) // Produtos/Cards
  ]);

  return NextResponse.json({
    portraits,
    banners,
    products
  });
}
