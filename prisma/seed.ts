import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

async function main() {
  console.log('Seeding database...')

  // 1. Create admin user
  const adminHash = await bcrypt.hash('admin123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vanamitra.in' },
    update: {},
    create: {
      email: 'admin@vanamitra.in',
      passwordHash: adminHash,
      name: 'Karsanbhai Patel',
      city: 'Kheda',
      isAdmin: true,
    },
  })
  console.log('Admin:', admin.email)

  // 2. Create demo user
  const demoHash = await bcrypt.hash('demo123456', 12)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@vanamitra.in' },
    update: {},
    create: {
      email: 'demo@vanamitra.in',
      passwordHash: demoHash,
      name: 'Aarti Patel',
      city: 'Mumbai',
    },
  })
  console.log('Demo user:', demo.email)

  // 3. Seed badges
  const badges = [
    { key: 'first',    name: 'First Sapling',      description: 'Planted your first tree',        tier: 'BRONZE'   as const, icon: '🌱', treesRequired: 1  },
    { key: 'trio',     name: "Three's a grove",     description: 'Planted three trees',            tier: 'BRONZE'   as const, icon: '🍃', treesRequired: 3  },
    { key: 'mother',   name: 'Mother Tongue',       description: 'Planted "for mother"',           tier: 'SILVER'   as const, icon: '❤️', treesRequired: null },
    { key: 'memory',   name: 'In Loving Memory',    description: 'Planted in remembrance',         tier: 'SILVER'   as const, icon: '🕯️', treesRequired: null },
    { key: 'visit',    name: 'Boots on Soil',       description: 'Visited your tree on the farm',  tier: 'SILVER'   as const, icon: '🗺️', treesRequired: null },
    { key: 'streak10', name: 'Ten on the Trot',     description: '10-month planting streak',       tier: 'SILVER'   as const, icon: '🔥', streakRequired: 10 },
    { key: 'native',   name: 'Native Speaker',      description: 'Planted 5 native species',       tier: 'SILVER'   as const, icon: '🍃', treesRequired: 5  },
    { key: 'gift10',   name: 'Habitual Giver',      description: 'Gifted 10 trees',                tier: 'GOLD'     as const, icon: '🎁', treesRequired: 10 },
    { key: 'grove',    name: 'Grove Keeper',        description: 'Reach 10 trees lifetime',        tier: 'GOLD'     as const, icon: '⭐', treesRequired: 10 },
    { key: 'streak24', name: 'Two Year Roots',      description: '24-month planting streak',       tier: 'GOLD'     as const, icon: '🔥', streakRequired: 24 },
    { key: 'forest',   name: 'Forest Steward',      description: 'Reach 20 trees lifetime',        tier: 'GOLD'     as const, icon: '⭐', treesRequired: 20 },
    { key: 'visit5',   name: 'Frequent Walker',     description: 'Visit the farm 5 times',         tier: 'PLATINUM' as const, icon: '🗺️', treesRequired: null },
    { key: 'all8',     name: 'All Eight',           description: 'Plant for all 8 occasions',      tier: 'PLATINUM' as const, icon: '⭐', treesRequired: 8  },
    { key: 'century',  name: 'A Hundred Strong',    description: 'Plant 100 trees',                tier: 'PLATINUM' as const, icon: '⭐', treesRequired: 100 },
    { key: 'corridor', name: 'Wildlife Friend',     description: 'Plant in a corridor block',      tier: 'GOLD'     as const, icon: '🍃', treesRequired: null },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: {},
      create: badge,
    })
  }
  console.log(`Seeded ${badges.length} badges`)

  // 4. Seed blog posts
  const posts = [
    { slug: 'where-donation-goes', tag: 'Transparency', title: 'Where your tree donation really goes — a complete breakdown', excerpt: 'Of every ₹500, ₹312 reaches the soil. Here is the receipt — sapling, labour, three years of care, and the photo we take when it is taller than you.', readTime: '7 min', content: 'Of every ₹500 you dedicate, here is exactly where it goes: ₹84 for a quality 18-month sapling from a certified nursery. ₹96 for skilled planting labour and site preparation. ₹132 for three years of mulching, irrigation, and care. ₹78 for monthly photography and updates. ₹64 for land use and tree-guard. ₹46 for replacement guarantee fund.\n\nWe publish this breakdown every quarter. The numbers have not changed since March 2024.' },
    { slug: 'matters-2026',        tag: 'Awareness',    title: 'Why tree plantation matters more than ever in 2026',            excerpt: 'Gujarat lost 2.1% of canopy cover last decade. The math on what one tree gives back — and what a thousand can.', readTime: '5 min', content: 'Gujarat has lost roughly 2.1% of its canopy cover over the last decade. In absolute terms, that is 14,000 hectares of shade, oxygen, and groundwater recharge — gone to roads, construction, and agricultural expansion.\n\nA single mature native tree absorbs approximately 24 kilograms of CO₂ per year, releases enough oxygen for two people, and recharges 1,000 litres of groundwater annually through its root system. Multiply by a thousand trees and you begin to see the math of what a small farm can do.' },
    { slug: 'native-vs-non',       tag: 'Science',      title: 'Native vs non-native trees: what we plant and why',            excerpt: 'Why 87% of what we plant is native to the Sabarmati basin — and the careful exceptions we make.', readTime: '6 min', content: 'Eighty-seven percent of the trees on our farm are native to the Sabarmati river basin. Neem, Peepal, Banyan, Arjun, Drumstick — trees that evolved here, support local insects, birds, and soil fungi, and require far less irrigation once established.\n\nThe exceptions we make are deliberate: Gulmohar (Delonix regia) is technically introduced but naturalised over 200 years and beloved by summer birds. Mango, introduced from the sub-Himalayan foothills, has been a Gujarat staple for centuries.\n\nWe do not plant eucalyptus, acacia, or other aggressive non-natives that damage soil biology.' },
    { slug: 'survival',            tag: 'Process',      title: 'Ensuring survival — what happens after a tree is planted',      excerpt: 'Three years of mulching, irrigation, fencing and visits. The boring work that actually grows a forest.', readTime: '8 min', content: 'The first 90 days after planting are the hardest. A sapling\'s root system is shallow, vulnerable to drought, waterlogging, and competition from grass. Our team checks every tree twice a week during this window.\n\nWeek 1-4: Daily watering, protective tree-guard installed.\nMonth 2-6: Mulching ring replenished monthly, irrigation reduced as roots establish.\nYear 1-3: Quarterly soil health checks, replacement if mortality is detected within 30 days.' },
    { slug: 'community',           tag: 'People',       title: 'Meet the people behind the trees',                              excerpt: 'Karsanbhai, Rinaben and the eleven others who walk the rows every morning at six.', readTime: '4 min', content: 'At 6 am, before the Gujarat summer makes outdoor work impossible, Karsanbhai Patel walks the rows. He has been a farmer in Vasna village for 34 years. When we asked him to lead our farm, he spent two weeks walking the land before he said yes.\n\n"A tree is a 50-year decision," he told us. "You cannot rush it and you cannot fake it. The soil knows."\n\nOur team of thirteen includes Rinaben, who manages the irrigation schedules, and young Jigar, who photographs every tree on the first of each month - 400+ photos now, filed by plot number.' },
    { slug: 'gift-that-grows',     tag: 'Stories',      title: 'A gift that grows: why donating a tree is different',           excerpt: 'Soap, sweets, candles, scarves. And then this — something that gets bigger, not smaller, with each year.', readTime: '5 min', content: 'Most gifts depreciate. Sweets are eaten, flowers fade, candles burn down. A tree is the opposite: it compounds. Year one it is a sapling. Year five it is shade. Year twenty it is a landmark. Year fifty it is a gathering place.\n\nThe families who have dedicated trees with us describe something we did not anticipate: the tree becomes a reason to visit Gujarat. Aarti from Mumbai told us her mother now asks about "her tree" before she asks about the grandchildren. The Mehta family from Ahmedabad visits every Diwali and brings new family members who have never met the tree before.' },
  ]

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    })
  }
  console.log(`Seeded ${posts.length} blog posts`)

  // 5. Seed a demo inventory tree + dedication for demo user
  const invTree = await prisma.inventoryTree.upsert({
    where: { uniqueId: 'VM-demo-001' },
    update: {},
    create: {
      uniqueId: 'VM-demo-001',
      speciesId: 'mango',
      plotBlock: 'C',
      plotRow: '4',
      plotPosition: '28',
      price: 500,
      heightCm: 142,
      healthStatus: 'healthy',
      status: 'ALLOCATED',
      qrCodeData: 'https://vanamitra.in/tree/VM-demo-001',
      addedBy: admin.name,
    },
  })

  const dedication = await prisma.dedication.upsert({
    where: { treeId: invTree.id },
    update: {},
    create: {
      treeId: invTree.id,
      userId: demo.id,
      occasionId: 'mother',
      recipientName: 'Sushilaben Patel',
      recipientFrom: 'Aarti, your daughter',
      message: 'Maa, I tried to find a gift that would outlast you. This is the closest I got.',
      status: 'CONFIRMED',
    },
  })

  // Add a demo update
  await prisma.treeUpdate.upsert({
    where: { id: 'demo-update-001' },
    update: {},
    create: {
      id: 'demo-update-001',
      treeId: invTree.id,
      message: "Maa\'s mango sapling is in the ground at Block C, Row 4, Position 28. The soil was well-prepared and the sapling is looking strong. She is about 142 cm tall. — Karsanbhai",
      createdBy: admin.name,
    },
  })

  console.log('Demo inventory tree and dedication created', dedication.id)
  console.log('\n✓ Seed complete!')
  console.log('\nDemo credentials:')
  console.log('  Admin  → admin@vanamitra.in / admin123456')
  console.log('  User   → demo@vanamitra.in  / demo123456')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
