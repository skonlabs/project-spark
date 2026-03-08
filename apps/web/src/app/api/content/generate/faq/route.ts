import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { generateFAQ } from '@/lib/services/content-optimizer'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
    const { productName, topic, numQuestions } = await req.json()

    if (!productName || !topic) {
      return Response.json({ error: 'productName and topic are required' }, { status: 400 })
    }

    const faq = await generateFAQ({ productName, topic, numQuestions })
    return Response.json({ faq })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'FAQ generation failed' }, { status: 500 })
  }
}
