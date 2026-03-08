import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { runFullAnalysis } from '@/lib/services/analysis'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
    const { projectId } = await req.json()

    if (!projectId) {
      return Response.json({ error: 'projectId required' }, { status: 400 })
    }

    // Run analysis in background (fire and forget for long operations)
    // For production, this would be a job queue. Here we run async.
    const reportId = await runFullAnalysis(projectId)

    return Response.json({ reportId, status: 'completed' }, { status: 202 })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    console.error('[analysis/run]', err)
    return Response.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
