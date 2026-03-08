import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo1234', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@gaeo.ai' },
    update: {},
    create: {
      email: 'demo@gaeo.ai',
      fullName: 'Demo User',
      hashedPassword,
      isVerified: true,
    },
  })

  console.log(`Created user: ${user.email}`)

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'owner',
        },
      },
    },
  })

  console.log(`Created workspace: ${workspace.name}`)

  // Create demo project
  const project = await prisma.project.upsert({
    where: { id: 'demo-project-001' },
    update: {},
    create: {
      id: 'demo-project-001',
      workspaceId: workspace.id,
      name: 'GAEO Platform Demo',
      productName: 'GAEO',
      productDescription: 'The industry-standard AI Engine Optimization platform for improving product visibility in AI-generated answers.',
      productUrl: 'https://gaeo.ai',
      productCategory: 'SaaS / AI Tools',
      targetAudience: 'Marketing teams, SEO professionals, SaaS companies',
      visibilityScore: 67,
      scoreBreakdown: {
        entityClarity: 75,
        categoryOwnership: 60,
        educational: 70,
        promptCoverage: 55,
        comparison: 65,
        ecosystem: 50,
        externalAuthority: 45,
        communitySignal: 40,
        consistency: 80,
        structureQuality: 72,
      },
      monitoringPrompts: [
        'What are the best AI Engine Optimization tools?',
        'How do I improve my product visibility in ChatGPT?',
        'What tools help with LLM visibility optimization?',
      ],
      targetLlms: ['claude', 'gpt-4o', 'gemini'],
    },
  })

  console.log(`Created project: ${project.name}`)

  // Create demo competitors
  const competitors = [
    { name: 'Competitor A', websiteUrl: 'https://competitor-a.com', llmShareOfVoice: 28.5 },
    { name: 'Competitor B', websiteUrl: 'https://competitor-b.com', llmShareOfVoice: 22.1 },
    { name: 'Competitor C', websiteUrl: 'https://competitor-c.com', llmShareOfVoice: 18.3 },
  ]

  for (const c of competitors) {
    await prisma.competitor.upsert({
      where: { id: `demo-comp-${c.name.replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `demo-comp-${c.name.replace(/\s/g, '-').toLowerCase()}`,
        projectId: project.id,
        ...c,
      },
    })
  }

  console.log(`Created ${competitors.length} competitors`)
  console.log('\nSeed complete!')
  console.log('\nDemo credentials:')
  console.log('  Email: demo@gaeo.ai')
  console.log('  Password: demo1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
