import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import { callClaudeJSON } from '@/lib/services/anthropic'
import { logger } from '@/lib/logger'

const log = logger('api/topics/generate')

interface TopicNode {
  name: string
  slug: string
  description: string
  nodeType: 'core' | 'adjacent' | 'gap'
  importanceScore: number
  relatedPrompts: string[]
  children?: TopicNode[]
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const { projectId } = await req.json()

    if (!projectId) return Response.json({ error: 'projectId required' }, { status: 400 })

    const project = await prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      include: { contentAssets: { where: { status: 'completed' }, take: 30 } },
    })

    const topicsFromContent = [
      ...new Set(project.contentAssets.flatMap((a) => a.topics as string[])),
    ]

    log.info('Generating topic graph', { userId: auth.sub, projectId, existingTopics: topicsFromContent.length })

    const graph = await callClaudeJSON<{ nodes: TopicNode[] }>(
      `Generate a comprehensive topic graph for an AI Engine Optimization strategy.

PRODUCT: ${project.productName}
CATEGORY: ${project.productCategory || 'Software'}
DESCRIPTION: ${project.productDescription || ''}
TARGET AUDIENCE: ${project.targetAudience || 'Not specified'}
EXISTING TOPICS FROM CONTENT: ${topicsFromContent.join(', ')}

Create a topic hierarchy with:
- Core topics (directly about the product/category)
- Adjacent topics (related areas the product touches)
- Gap topics (important topics with no current content)

For each topic, include:
- name: display name
- slug: url-friendly slug
- description: 1-2 sentence description
- nodeType: "core" | "adjacent" | "gap"
- importanceScore: 0-100 (how important for AEO)
- relatedPrompts: 2-3 user prompts that would surface this topic

Generate 15-25 total topics in a hierarchy.

Respond with JSON: {"nodes": [...topics with optional children array...]}`,
      'You are an AEO topic strategy expert. Build comprehensive topic graphs for AI discoverability.'
    )

    // Clear existing nodes for this project
    await prisma.topicNode.deleteMany({ where: { projectId } })

    // Insert nodes recursively
    const nodeIds: Record<string, string> = {}

    async function insertNodes(nodes: TopicNode[], parentId?: string, depth = 0) {
      for (const node of nodes) {
        const created = await prisma.topicNode.create({
          data: {
            projectId,
            name: node.name,
            slug: node.slug,
            description: node.description,
            nodeType: node.nodeType,
            importanceScore: node.importanceScore,
            relatedPrompts: node.relatedPrompts,
            parentId: parentId || null,
            depth,
            isCovered: topicsFromContent.some(
              (t) => t.toLowerCase().includes(node.name.toLowerCase())
            ),
          },
        })
        nodeIds[node.slug] = created.id
        if (node.children?.length) {
          await insertNodes(node.children, created.id, depth + 1)
        }
      }
    }

    await insertNodes(graph.nodes)

    const allNodes = await prisma.topicNode.findMany({
      where: { projectId },
      include: { children: true },
    })

    log.info('Topic graph generated', { userId: auth.sub, projectId, nodeCount: allNodes.length })
    return Response.json({ nodes: allNodes }, { status: 201 })
  } catch (err: unknown) {
    if ((err as Error).name === 'AuthError') return authErrorResponse()
    log.error('Failed to generate topic graph', { error: (err as Error).message })
    return Response.json({ error: 'Failed to generate topic graph' }, { status: 500 })
  }
}
