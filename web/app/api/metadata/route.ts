import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge' // Usar Edge Runtime para performance se possível, ou nodejs se precisar de libs mais pesadas. Regex funciona no edge.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const targetUrl = searchParams.get('url')

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 })
  }

  try {
    // Validate if it is a URL, if not return 400
    if (!targetUrl || targetUrl.startsWith('#') || targetUrl.startsWith('data:')) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Adicionar protocolo se faltar
    const urlToFetch = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`

    // Double check URL validity
    try {
      new URL(urlToFetch)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

    const res = await fetch(urlToFetch, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VastaBot/1.0; +https://vasta.pro)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal,
      next: { revalidate: 86400 } // Cache de 24h
    } as any)
    
    clearTimeout(timeoutId)

    if (!res.ok) {
        return NextResponse.json({ error: 'Fetch failed upstream' }, { status: 500 })
    }

    const html = await res.text()

    // Extração simples via Regex (leve e rápido para Edge)
    // Busca og:image, twitter:image ou link rel=image_src
    
    // Helper para extrair content de meta tags
    const getMetaContent = (prop: string) => {
        const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i')
        const match = html.match(regex)
        // Tentativa reversa (content antes do property)
        if (!match) {
            const regexRev = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i')
            const matchRev = html.match(regexRev)
            return matchRev ? matchRev[1] : null
        }
        return match ? match[1] : null
    }

    let image = getMetaContent('og:image') || 
                getMetaContent('twitter:image') || 
                getMetaContent('twitter:image:src')

    // Resolver URL relativa
    if (image && !image.startsWith('http')) {
        const urlObj = new URL(urlToFetch)
        if (image.startsWith('//')) {
            image = `${urlObj.protocol}${image}`
        } else if (image.startsWith('/')) {
            image = `${urlObj.origin}${image}`
        } else {
            image = `${urlObj.origin}/${image}` // Caminho relativo simples
        }
    }

    // Decoding HTML entities simples se necessário (geralmente URLs em meta tags já vem limpas, mas &amp; pode ocorrer)
    if (image) {
        image = image.replace(/&amp;/g, '&')
    }

    return NextResponse.json({ image }, {
        headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=600'
        }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Metadata extraction failed' }, { status: 500 })
  }
}
