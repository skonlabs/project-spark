import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.hashedPassword) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.hashedPassword)
    if (!valid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!user.isActive) {
      return Response.json({ error: 'Account disabled' }, { status: 403 })
    }

    // Get primary workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: user.id, isActive: true },
      include: { workspace: true },
      orderBy: { createdAt: 'asc' },
    })

    const token = await signToken({
      sub: user.id,
      email: user.email,
      workspaceId: membership?.workspaceId,
    })

    return Response.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
      workspace: membership?.workspace
        ? {
            id: membership.workspace.id,
            name: membership.workspace.name,
            slug: membership.workspace.slug,
          }
        : null,
    })
  } catch (err) {
    console.error('[login]', err)
    return Response.json({ error: 'Login failed' }, { status: 500 })
  }
}
