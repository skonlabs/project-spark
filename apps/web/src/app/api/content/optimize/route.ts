import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { optimizeContent } from '@/lib/services/content-optimizer'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
    const { content, productName, targetPrompts } = await req.json()

    if (!content || !productName) {
      return Response.json({ error: 'content and productName are required' }, { status: 400 })
    }

    const result = await optimizeContent({ content, productName, targetPrompts: targetPrompts || [] })
    return Response.json(result)
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Optimization failed' }, { status: 500 })
  }
}
