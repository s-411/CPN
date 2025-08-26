/**
 * CPN (Cost Per Nut) Calculation Engine
 * 
 * This module handles all CPN score calculations, category analysis,
 * and performance metrics based on user interaction data.
 */

import { db } from './db/drizzle';
import { userInteractions, userProfiles, cpnScores, users } from './db/schema';
import { eq, sum, count, avg, and, gte, lte } from 'drizzle-orm';
import type { UserInteraction, NewCpnScore } from './db/schema';

// Types for calculation results
export interface CPNCalculationResult {
  overallScore: number;
  categoryScores: {
    cost_efficiency: number;
    time_management: number;
    success_rate: number;
  };
  metrics: {
    totalCost: number;
    totalNuts: number;
    totalTimeMinutes: number;
    averageCostPerNut: number;
    averageTimePerNut: number;
    totalSessions: number;
    successRate: number;
  };
  recommendations: string[];
}

export interface CPNTrendAnalysis {
  trend: 'improving' | 'declining' | 'stable';
  percentChange: number;
  period: 'week' | 'month';
}

/**
 * Calculate the primary CPN score based on cost efficiency
 */
function calculateCostEfficiency(totalCost: number, totalNuts: number): number {
  if (totalNuts === 0) return 0;
  
  const costPerNut = totalCost / totalNuts;
  
  // Score mapping (lower cost per nut = higher score)
  // $0-15: 90-100 points (excellent)
  // $15-25: 80-90 points (very good)  
  // $25-40: 60-80 points (good)
  // $40-60: 40-60 points (fair)
  // $60+: 0-40 points (poor)
  
  if (costPerNut <= 15) {
    return Math.max(90, 100 - (costPerNut / 15) * 10);
  } else if (costPerNut <= 25) {
    return Math.max(80, 90 - ((costPerNut - 15) / 10) * 10);
  } else if (costPerNut <= 40) {
    return Math.max(60, 80 - ((costPerNut - 25) / 15) * 20);
  } else if (costPerNut <= 60) {
    return Math.max(40, 60 - ((costPerNut - 40) / 20) * 20);
  } else {
    return Math.max(0, 40 - ((costPerNut - 60) / 40) * 40);
  }
}

/**
 * Calculate time management efficiency score
 */
function calculateTimeEfficiency(totalTimeMinutes: number, totalNuts: number): number {
  if (totalNuts === 0) return 0;
  
  const timePerNut = totalTimeMinutes / totalNuts;
  
  // Score mapping (less time per nut = higher score)
  // 0-30 minutes: 90-100 points (excellent)
  // 30-60 minutes: 75-90 points (very good)
  // 60-120 minutes: 60-75 points (good)
  // 120-180 minutes: 40-60 points (fair)
  // 180+ minutes: 0-40 points (poor)
  
  if (timePerNut <= 30) {
    return Math.max(90, 100 - (timePerNut / 30) * 10);
  } else if (timePerNut <= 60) {
    return Math.max(75, 90 - ((timePerNut - 30) / 30) * 15);
  } else if (timePerNut <= 120) {
    return Math.max(60, 75 - ((timePerNut - 60) / 60) * 15);
  } else if (timePerNut <= 180) {
    return Math.max(40, 60 - ((timePerNut - 120) / 60) * 20);
  } else {
    return Math.max(0, 40 - ((timePerNut - 180) / 120) * 40);
  }
}

/**
 * Calculate success rate score
 */
function calculateSuccessRate(totalSessions: number, totalNuts: number): number {
  if (totalSessions === 0) return 0;
  
  const successRate = totalNuts / totalSessions;
  
  // Score mapping (higher nuts per session = higher score)
  // 2+ nuts per session: 90-100 points (excellent)
  // 1.5-2 nuts: 80-90 points (very good)
  // 1-1.5 nuts: 60-80 points (good)  
  // 0.5-1 nuts: 40-60 points (fair)
  // 0-0.5 nuts: 0-40 points (poor)
  
  if (successRate >= 2) {
    return Math.min(100, 90 + (successRate - 2) * 5);
  } else if (successRate >= 1.5) {
    return 80 + ((successRate - 1.5) / 0.5) * 10;
  } else if (successRate >= 1) {
    return 60 + ((successRate - 1) / 0.5) * 20;
  } else if (successRate >= 0.5) {
    return 40 + ((successRate - 0.5) / 0.5) * 20;
  } else {
    return Math.max(0, successRate * 80);
  }
}

/**
 * Generate personalized recommendations based on performance
 */
function generateRecommendations(metrics: CPNCalculationResult['metrics'], categoryScores: CPNCalculationResult['categoryScores']): string[] {
  const recommendations: string[] = [];
  
  // Cost efficiency recommendations
  if (categoryScores.cost_efficiency < 60) {
    if (metrics.averageCostPerNut > 50) {
      recommendations.push("Consider more budget-friendly date options to improve cost efficiency");
    }
    recommendations.push("Focus on activities with higher success rates to maximize your investment");
  }
  
  // Time management recommendations
  if (categoryScores.time_management < 60) {
    if (metrics.averageTimePerNut > 120) {
      recommendations.push("Try shorter, more focused interactions to improve time efficiency");
    }
    recommendations.push("Plan activities with clear objectives to make better use of your time");
  }
  
  // Success rate recommendations  
  if (categoryScores.success_rate < 60) {
    if (metrics.successRate < 1) {
      recommendations.push("Focus on quality over quantity - fewer, better-planned interactions may yield better results");
    }
    recommendations.push("Analyze your most successful interactions and replicate those strategies");
  }
  
  // Overall performance recommendations
  const overallScore = (categoryScores.cost_efficiency + categoryScores.time_management + categoryScores.success_rate) / 3;
  
  if (overallScore >= 80) {
    recommendations.push("Excellent performance! Consider sharing your strategies to help others");
  } else if (overallScore >= 60) {
    recommendations.push("Good progress! Focus on your lowest-scoring category for maximum improvement");
  } else {
    recommendations.push("Track your interactions more consistently to identify improvement opportunities");
  }
  
  return recommendations.slice(0, 3); // Return top 3 recommendations
}

/**
 * Main CPN calculation function
 */
export async function calculateCPNScore(clerkId: string): Promise<CPNCalculationResult | null> {
  try {
    // Get user data
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
      
    if (!user.length) {
      throw new Error('User not found');
    }

    // Get all user interactions
    const interactions = await db
      .select()
      .from(userInteractions)
      .where(eq(userInteractions.clerkId, clerkId));

    if (interactions.length === 0) {
      return {
        overallScore: 0,
        categoryScores: {
          cost_efficiency: 0,
          time_management: 0,
          success_rate: 0
        },
        metrics: {
          totalCost: 0,
          totalNuts: 0,
          totalTimeMinutes: 0,
          averageCostPerNut: 0,
          averageTimePerNut: 0,
          totalSessions: 0,
          successRate: 0
        },
        recommendations: ["Start tracking your interactions to generate your CPN score"]
      };
    }

    // Calculate aggregate metrics
    const totalCost = interactions.reduce((sum, interaction) => sum + Number(interaction.cost), 0);
    const totalNuts = interactions.reduce((sum, interaction) => sum + interaction.nuts, 0);
    const totalTimeMinutes = interactions.reduce((sum, interaction) => sum + interaction.timeMinutes, 0);
    const totalSessions = interactions.length;
    
    const averageCostPerNut = totalNuts > 0 ? totalCost / totalNuts : 0;
    const averageTimePerNut = totalNuts > 0 ? totalTimeMinutes / totalNuts : 0;
    const successRate = totalSessions > 0 ? totalNuts / totalSessions : 0;

    // Calculate category scores
    const costEfficiencyScore = calculateCostEfficiency(totalCost, totalNuts);
    const timeManagementScore = calculateTimeEfficiency(totalTimeMinutes, totalNuts);
    const successRateScore = calculateSuccessRate(totalSessions, totalNuts);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (costEfficiencyScore * 0.5) + // Cost efficiency is most important
      (timeManagementScore * 0.3) +  // Time efficiency is second
      (successRateScore * 0.2)       // Success rate is supporting
    );

    const categoryScores = {
      cost_efficiency: Math.round(costEfficiencyScore),
      time_management: Math.round(timeManagementScore),
      success_rate: Math.round(successRateScore)
    };

    const metrics = {
      totalCost,
      totalNuts,
      totalTimeMinutes,
      averageCostPerNut,
      averageTimePerNut,
      totalSessions,
      successRate
    };

    const recommendations = generateRecommendations(metrics, categoryScores);

    return {
      overallScore,
      categoryScores,
      metrics,
      recommendations
    };

  } catch (error) {
    console.error('Error calculating CPN score:', error);
    return null;
  }
}

/**
 * Save calculated CPN score to database
 */
export async function saveCPNScore(clerkId: string, calculationResult: CPNCalculationResult): Promise<boolean> {
  try {
    // Get user and team
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
      
    if (!user.length) {
      throw new Error('User not found');
    }

    // For now, use a default team ID of 1 (created during seeding)
    // In a full implementation, you'd get the user's actual team
    const teamId = 1;

    // Create new CPN score record
    const scoreData: NewCpnScore = {
      userId: user[0].id,
      teamId: teamId,
      score: calculationResult.overallScore,
      categoryScores: calculationResult.categoryScores,
      peerPercentile: null // Will be calculated separately
    };

    await db.insert(cpnScores).values(scoreData);
    
    return true;
  } catch (error) {
    console.error('Error saving CPN score:', error);
    return false;
  }
}

/**
 * Calculate and save CPN score for a user
 */
export async function calculateAndSaveCPNScore(clerkId: string): Promise<CPNCalculationResult | null> {
  const result = await calculateCPNScore(clerkId);
  
  if (result && result.overallScore > 0) {
    await saveCPNScore(clerkId, result);
  }
  
  return result;
}

/**
 * Analyze CPN trends over time
 */
export async function analyzeCPNTrends(clerkId: string, period: 'week' | 'month' = 'week'): Promise<CPNTrendAnalysis | null> {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
      
    if (!user.length) return null;

    // Get recent scores
    const scores = await db
      .select()
      .from(cpnScores)
      .where(eq(cpnScores.userId, user[0].id))
      .orderBy(cpnScores.createdAt)
      .limit(10);

    if (scores.length < 2) {
      return {
        trend: 'stable',
        percentChange: 0,
        period
      };
    }

    const latestScore = scores[scores.length - 1].score;
    const previousScore = scores[scores.length - 2].score;
    
    const percentChange = previousScore > 0 
      ? ((latestScore - previousScore) / previousScore) * 100 
      : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (percentChange > 5) {
      trend = 'improving';
    } else if (percentChange < -5) {
      trend = 'declining';
    }

    return {
      trend,
      percentChange: Math.round(percentChange * 100) / 100,
      period
    };

  } catch (error) {
    console.error('Error analyzing CPN trends:', error);
    return null;
  }
}