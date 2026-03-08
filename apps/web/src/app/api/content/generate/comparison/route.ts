import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { generateComparison } from '@/lib/services/content-optimizer'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
    const { productName, competitorName, productDescription, features } = await req.json()

    if (!productName || !competitorName) {
      return Response.json({ error: 'productName and competitorName are required' }, { status: 400 })
    }

    const comparison = await generateComparison({
      productName,
      competitorName,
      productDescription: productDescription || '',
      features,
    })

    return Response.json({ comparison })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    return Response.json({ error: 'Comparison generation failed' }, { status: 500 })
  }
}
