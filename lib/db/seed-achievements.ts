import { db } from './drizzle';
import { achievements } from './schema';
import { eq } from 'drizzle-orm';

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
  },
  {
    name: 'Viral Creator',
    description: 'Share your results 5 times across different platforms',
    iconPath: '/icons/viral-creator.svg',
    badgeColor: '#EF4444',
    criteria: {
      type: 'social_share',
      threshold: 5
    },
    displayOrder: 6,
    active: true
  },
  {
    name: 'Consistent Tracker',
    description: 'Log interactions for 7 consecutive days',
    iconPath: '/icons/consistent-tracker.svg',
    badgeColor: '#84CC16',
    criteria: {
      type: 'streak',
      threshold: 7,
      timeframe: 'days'
    },
    displayOrder: 7,
    active: true
  },
  {
    name: 'Data Enthusiast',
    description: 'Log 50 interactions in total',
    iconPath: '/icons/data-enthusiast.svg',
    badgeColor: '#F97316',
    criteria: {
      type: 'total_interactions',
      threshold: 50
    },
    displayOrder: 8,
    active: true
  },
  {
    name: 'Budget Conscious',
    description: 'Maintain an average cost per interaction under $25',
    iconPath: '/icons/budget-conscious.svg',
    badgeColor: '#14B8A6',
    criteria: {
      type: 'avg_cost_per_interaction',
      threshold: 25,
      comparison: 'less_than'
    },
    displayOrder: 9,
    active: true
  },
  {
    name: 'Efficiency Expert',
    description: 'Achieve a cost per success rate below $15',
    iconPath: '/icons/efficiency-expert.svg',
    badgeColor: '#A855F7',
    criteria: {
      type: 'cost_per_success',
      threshold: 15,
      comparison: 'less_than'
    },
    displayOrder: 10,
    active: true
  }
];

export async function seedAchievements() {
  console.log('🌱 Seeding achievements...');

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

// Run if called directly
if (require.main === module) {
  seedAchievements()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}