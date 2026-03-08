import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { generateEntityDefinition } from '@/lib/services/content-optimizer'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
    const { entityName, productName, category } = await req.json()

    if (!entityName || !productName) {
      return Response.json({ error: 'entityName and productName are required' }, { status: 400 })
    }

    const definition = await generateEntityDefinition({
      entityName,
      productName,
      category: category || 'Software',
    })

    return Response.json({ definition })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Entity definition generation failed' }, { status: 500 })
  }
}
