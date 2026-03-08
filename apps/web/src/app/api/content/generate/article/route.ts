import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { generateArticle } from '@/lib/services/content-optimizer'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
    const body = await req.json()

    const { productName, productDescription, topic, targetAudience, targetPrompts, tone } = body

    if (!productName || !topic) {
      return Response.json({ error: 'productName and topic are required' }, { status: 400 })
    }

    const article = await generateArticle({
      productName,
      productDescription: productDescription || '',
      topic,
      targetAudience: targetAudience || 'general audience',
      targetPrompts: targetPrompts || [],
      tone,
    })

    return Response.json({ article })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    console.error('[content/generate/article]', err)
    return Response.json({ error: 'Article generation failed' }, { status: 500 })
  }
}
