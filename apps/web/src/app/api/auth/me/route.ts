import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, authErrorResponse } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return authErrorResponse()

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      plan: true,
      isVerified: true,
      isSuperuser: true,
      createdAt: true,
      workspaceMemberships: {
        where: { isActive: true },
        include: {
          workspace: {
            select: { id: true, name: true, slug: true, plan: true, logoUrl: true },
          },
        },
      },
    },
  })

  if (!user) return authErrorResponse()

  return Response.json({ user })
}
