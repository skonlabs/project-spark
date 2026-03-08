import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, workspaceName } = await req.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        hashedPassword,
        isVerified: true, // skip email verification for now
      },
    })

    // Create default workspace
    const slug = (workspaceName || fullName || email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 50)

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName || fullName || email.split('@')[0],
        slug: `${slug}-${Date.now()}`,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'owner',
          },
        },
      },
    })

    const token = await signToken({
      sub: user.id,
      email: user.email,
      workspaceId: workspace.id,
    })

    return Response.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
        },
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[register]', err)
    return Response.json({ error: 'Registration failed' }, { status: 500 })
  }
}
