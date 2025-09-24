import bcrypt from 'bcryptjs'
import { db } from '../lib/db'
import { users, categories, tags, tracts } from '../lib/db/schema'

async function seed() {
  console.log('🌱 Starting seed...')

  try {
    // Get admin credentials from environment variables or use defaults
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    const [adminUser] = await db.insert(users).values({
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      emailVerified: new Date(),
    }).returning()

    console.log('✅ Created admin user')

    // Create categories
    const categoryData = [
      { name: 'Evangelism', slug: 'evangelism', description: 'Salvation, witnessing, outreach', icon: '❤️' },
      { name: 'Discipleship', slug: 'discipleship', description: 'Christian growth, spiritual disciplines', icon: '📖' },
      { name: 'Apologetics', slug: 'apologetics', description: 'Defending the faith, addressing doubts', icon: '🛡️' },
      { name: 'Youth', slug: 'youth', description: 'Children and teen-focused materials', icon: '👦' },
      { name: 'Family', slug: 'family', description: 'Marriage, parenting, relationships', icon: '👨‍👩‍👧‍👦' },
      { name: 'Seasonal', slug: 'seasonal', description: 'Christmas, Easter, special occasions', icon: '🎄' },
    ]

    const insertedCategories = await db.insert(categories).values(categoryData).returning()
    console.log(`✅ Created ${insertedCategories.length} categories`)

    // Create tags
    const tagData = [
      { name: 'salvation', slug: 'salvation' },
      { name: 'gospel', slug: 'gospel' },
      { name: 'prayer', slug: 'prayer' },
      { name: 'bible-study', slug: 'bible-study' },
      { name: 'christmas', slug: 'christmas' },
      { name: 'easter', slug: 'easter' },
      { name: 'teens', slug: 'teens' },
      { name: 'children', slug: 'children' },
      { name: 'marriage', slug: 'marriage' },
      { name: 'faith', slug: 'faith' },
    ]

    const insertedTags = await db.insert(tags).values(tagData).returning()
    console.log(`✅ Created ${insertedTags.length} tags`)

    // Create sample tracts
    const tractData = [
      {
        title: 'The Roman Road to Salvation',
        description: 'A clear explanation of salvation using verses from Romans. This tract walks through the key verses in Romans that explain our need for salvation and God\'s provision through Jesus Christ.',
        authorId: adminUser.id,
        denomination: 'Baptist',
        language: 'en',
        fileUrl: '/sample-tracts/roman-road.pdf',
        fileName: 'roman-road.pdf',
        fileSize: 245000,
        status: 'approved' as const,
        featured: true,
      },
      {
        title: 'Steps to Peace with God',
        description: 'Billy Graham\'s classic gospel presentation that has led millions to faith in Christ. Simple, clear, and powerful.',
        authorId: adminUser.id,
        denomination: 'Non-denominational',
        language: 'en',
        fileUrl: '/sample-tracts/steps-to-peace.pdf',
        fileName: 'steps-to-peace.pdf',
        fileSize: 189000,
        status: 'approved' as const,
        featured: true,
      },
      {
        title: 'Who is Jesus?',
        description: 'An introduction to the person and work of Jesus Christ, perfect for seekers and new believers.',
        authorId: adminUser.id,
        denomination: 'Methodist',
        language: 'en',
        fileUrl: '/sample-tracts/who-is-jesus.pdf',
        fileName: 'who-is-jesus.pdf',
        fileSize: 156000,
        status: 'approved' as const,
      },
      {
        title: 'The Bridge to Life',
        description: 'A visual illustration of the gospel using the bridge metaphor to explain separation from God and reconciliation through Christ.',
        authorId: adminUser.id,
        denomination: 'Presbyterian',
        language: 'en',
        fileUrl: '/sample-tracts/bridge-to-life.pdf',
        fileName: 'bridge-to-life.pdf',
        fileSize: 312000,
        status: 'approved' as const,
      },
      {
        title: 'Growing in Christ - First Steps',
        description: 'A discipleship tract for new believers covering prayer, Bible reading, fellowship, and witnessing.',
        authorId: adminUser.id,
        denomination: 'Baptist',
        language: 'en',
        fileUrl: '/sample-tracts/growing-in-christ.pdf',
        fileName: 'growing-in-christ.pdf',
        fileSize: 423000,
        status: 'approved' as const,
      },
      {
        title: 'The True Meaning of Christmas',
        description: 'Share the real story of Christmas and the gift of salvation through Jesus Christ.',
        authorId: adminUser.id,
        denomination: 'Lutheran',
        language: 'en',
        fileUrl: '/sample-tracts/christmas-meaning.pdf',
        fileName: 'christmas-meaning.pdf',
        fileSize: 278000,
        status: 'approved' as const,
      },
      {
        title: 'Easter: The Greatest Victory',
        description: 'Celebrate the resurrection and what it means for believers today.',
        authorId: adminUser.id,
        denomination: 'Catholic',
        language: 'en',
        fileUrl: '/sample-tracts/easter-victory.pdf',
        fileName: 'easter-victory.pdf',
        fileSize: 298000,
        status: 'approved' as const,
      },
      {
        title: 'Faith for Teens',
        description: 'Addressing common questions and challenges faced by Christian teenagers.',
        authorId: adminUser.id,
        denomination: 'Youth for Christ',
        language: 'en',
        fileUrl: '/sample-tracts/faith-for-teens.pdf',
        fileName: 'faith-for-teens.pdf',
        fileSize: 334000,
        status: 'approved' as const,
      },
    ]

    const insertedTracts = await db.insert(tracts).values(tractData).returning()
    console.log(`✅ Created ${insertedTracts.length} sample tracts`)

    console.log('🎉 Seed completed successfully!')
    console.log(`📧 Admin login: ${adminEmail}`)
    console.log('🔑 Admin password: Check your .env file (DEFAULT_ADMIN_PASSWORD)')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seed()