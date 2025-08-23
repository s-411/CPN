import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { users, teams, teamMembers, achievements } from './schema';
import { hashPassword } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const baseProduct = await stripe.products.create({
    name: 'Base',
    description: 'Base subscription plan',
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description: 'Plus subscription plan',
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function seedAchievements() {
  console.log('🌱 Seeding achievements...');

  const initialAchievements = [
    {
      name: 'First Score',
      description: 'Calculate your first CPN score',
      iconPath: '/icons/first-score.svg',
      badgeColor: '#4F46E5',
      criteria: {
        type: 'first_calculation',
        threshold: 1
      },
      displayOrder: 1,
      active: true
    },
    {
      name: 'High Performer',
      description: 'Achieve a CPN score of 80 or higher',
      iconPath: '/icons/high-performer.svg',
      badgeColor: '#10B981',
      criteria: {
        type: 'score_threshold',
        threshold: 80
      },
      displayOrder: 2,
      active: true
    },
    {
      name: 'Elite Status',
      description: 'Achieve a CPN score of 90 or higher',
      iconPath: '/icons/elite-status.svg',
      badgeColor: '#F59E0B',
      criteria: {
        type: 'score_threshold',
        threshold: 90
      },
      displayOrder: 3,
      active: true
    },
    {
      name: 'Top Percentile',
      description: 'Score in the top 10% of all users',
      iconPath: '/icons/top-percentile.svg',
      badgeColor: '#8B5CF6',
      criteria: {
        type: 'percentile_rank',
        threshold: 90
      },
      displayOrder: 4,
      active: true
    },
    {
      name: 'Social Sharer',
      description: 'Share your results on social media',
      iconPath: '/icons/social-sharer.svg',
      badgeColor: '#06B6D4',
      criteria: {
        type: 'social_share',
        threshold: 1
      },
      displayOrder: 5,
      active: true
    }
  ];

  try {
    for (const achievement of initialAchievements) {
      // Check if achievement already exists
      const existing = await db
        .select()
        .from(achievements)
        .where(eq(achievements.name, achievement.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(achievements).values(achievement);
        console.log(`✅ Created achievement: ${achievement.name}`);
      } else {
        console.log(`⏭️  Achievement already exists: ${achievement.name}`);
      }
    }

    console.log('🎉 Achievement seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    throw error;
  }
}

async function seed() {
  const email = 'test@test.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        passwordHash: passwordHash,
        role: "owner",
      },
    ])
    .returning();

  console.log('Initial user created.');

  const [team] = await db
    .insert(teams)
    .values({
      name: 'Test Team',
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: 'owner',
  });

  await createStripeProducts();
  await seedAchievements();
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
