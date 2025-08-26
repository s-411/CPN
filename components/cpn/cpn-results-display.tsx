'use client'

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import useSWR from 'swr';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Share, Trophy, TrendingUp, Users } from 'lucide-react';
import { generateShareGraphic } from '@/app/actions/cpn-actions';

// Types
interface CpnResultsData {
  score: number;
  categoryScores: {
    cost_efficiency: number;
    time_management: number;
    success_rate: number;
  };
  peerPercentile: number;
  achievements: Achievement[];
  peerComparison: {
    averageScore: number;
    demographicGroup: string;
    totalUsers: number;
  };
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  iconPath: string;
  badgeColor: string;
  earnedAt: string;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch CPN results');
  }
  return response.json();
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const scoreRevealVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
      duration: 0.8
    }
  }
};

// Score Display Component
const ScoreDisplay: React.FC<{ score: number; percentile: number }> = ({ score, percentile }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: [1, 1.1, 1],
      transition: { duration: 0.6, ease: "easeInOut" }
    });
  }, [controls]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-cpn-yellow';
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-cpn-gray';
    return 'text-orange-500';
  };

  return (
    <motion.div
      variants={scoreRevealVariants}
      className="text-center py-8"
      animate={controls}
    >
      <motion.h1 
        className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}
        variants={itemVariants}
      >
        {score}
      </motion.h1>
      <motion.p 
        className="text-lg text-cpn-gray mb-2"
        variants={itemVariants}
      >
        CPN Score
      </motion.p>
      <motion.div 
        className="flex items-center justify-center space-x-2 text-sm text-cpn-gray"
        variants={itemVariants}
      >
        <TrendingUp size={16} />
        <span>Top {100 - percentile}% of users</span>
      </motion.div>
    </motion.div>
  );
};

// Category Score Bar Component
const CategoryScoreBar: React.FC<{ 
  label: string; 
  score: number; 
  delay: number; 
}> = ({ label, score, delay }) => {
  return (
    <motion.div
      className="mb-4"
      variants={itemVariants}
      transition={{ delay }}
    >
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-cpn-gray capitalize">
          {label.replace('_', ' ')}
        </span>
        <span className="text-sm font-semibold text-cpn-white">{score}</span>
      </div>
      <div className="w-full bg-cpn-gray/20 rounded-full h-3">
        <motion.div
          className="bg-cpn-yellow h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ 
            duration: 1.2, 
            delay: delay + 0.3,
            ease: "easeOut" 
          }}
        />
      </div>
    </motion.div>
  );
};

// Achievement Badge Component
const AchievementBadge: React.FC<{ 
  achievement: Achievement; 
  delay: number;
  onClick: () => void;
}> = ({ achievement, delay, onClick }) => {
  return (
    <motion.button
      className="min-w-[44px] min-h-[44px] relative group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
      variants={itemVariants}
      transition={{ delay }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
        style={{ backgroundColor: achievement.badgeColor }}
      >
        <Trophy size={20} />
      </div>
      <motion.div
        className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.5, type: "spring" }}
      />
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-cpn-dark text-cpn-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 border border-cpn-gray/20">
        {achievement.name}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-cpn-dark"></div>
      </div>
    </motion.button>
  );
};

// Peer Comparison Component
const PeerComparison: React.FC<{ 
  userScore: number;
  averageScore: number;
  totalUsers: number;
  demographicGroup: string;
}> = ({ userScore, averageScore, totalUsers, demographicGroup }) => {
  const difference = userScore - averageScore;
  const isAboveAverage = difference > 0;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-cpn-dark border border-cpn-gray/20 rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Users size={20} className="text-cpn-yellow" />
          <span className="font-medium text-cpn-white">Peer Comparison</span>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-cpn-gray">Your Score:</span>
          <span className="font-semibold text-cpn-white">{userScore}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cpn-gray">Average ({demographicGroup}):</span>
          <span className="font-semibold text-cpn-white">{averageScore}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cpn-gray">Total Users:</span>
          <span className="font-semibold text-cpn-white">{totalUsers.toLocaleString()}</span>
        </div>
        
        <motion.div
          className={`mt-3 p-3 rounded-md ${isAboveAverage ? 'bg-cpn-yellow/20 text-cpn-yellow' : 'bg-orange-500/20 text-orange-500'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center space-x-2">
            <TrendingUp size={16} />
            <span className="font-medium">
              You're {Math.abs(difference)} points {isAboveAverage ? 'above' : 'below'} average
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Share Button Component
const ShareButton: React.FC<{ onShare: () => void; isSharing: boolean }> = ({ onShare, isSharing }) => {
  return (
    <Button
      onClick={onShare}
      disabled={isSharing}
      className="w-full min-h-[44px] bg-cpn-yellow hover:bg-cpn-yellow/80 text-cpn-dark font-medium py-3 px-6 rounded-full shadow-lg transition-colors duration-200 focus:ring-2 focus:ring-cpn-yellow focus:ring-offset-2 focus:ring-offset-cpn-dark"
    >
      <div className="flex items-center justify-center space-x-2">
        <Share size={20} />
        <span>{isSharing ? 'Generating...' : 'Share Results'}</span>
      </div>
    </Button>
  );
};

// Main Component
export const CpnResultsDisplay: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Fetch CPN results data
  const { data, error, isLoading, mutate } = useSWR<CpnResultsData>(
    isSignedIn && user ? `/api/cpn/results/${user.id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  );

  const handleShare = async () => {
    if (!user || !data) return;

    setIsSharing(true);
    try {
      const result = await generateShareGraphic({
        userId: parseInt(user.id),
        format: '1:1',
        includeReferral: true
      });

      if (result.success && result.imageDataUrl) {
        // Use Web Share API if available, otherwise fallback to download
        if (navigator.share && typeof navigator.canShare === 'function') {
          try {
            // Convert data URL to blob
            const response = await fetch(result.imageDataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'cpn-results.png', { type: 'image/png' });
            
            await navigator.share({
              title: `My CPN Score: ${data.score}`,
              text: `I scored ${data.score} on my CPN assessment! ${result.referralCode ? `Join me: ${window.location.origin}?ref=${result.referralCode}` : ''}`,
              files: [file]
            });
          } catch (shareError) {
            console.error('Share failed:', shareError);
            // Fallback to download
            downloadImage(result.imageDataUrl);
          }
        } else {
          // Fallback to download
          downloadImage(result.imageDataUrl);
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.download = 'cpn-results.png';
    link.href = dataUrl;
    link.click();
  };

  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-cpn-dark" data-testid="cpn-loading">
        <LoadingSpinner />
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-cpn-dark">
        <Card className="max-w-md w-full p-6 text-center bg-cpn-dark border-cpn-gray/20">
          <h2 className="text-xl font-semibold mb-2 text-cpn-white">Sign In Required</h2>
          <p className="text-cpn-gray">Please sign in to view your CPN results.</p>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-cpn-dark">
        <Card className="max-w-md w-full p-6 text-center bg-cpn-dark border-cpn-gray/20">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error Loading Results</h2>
          <p className="text-cpn-gray mb-4">{error.message}</p>
          <Button onClick={() => mutate()} className="w-full bg-cpn-yellow text-cpn-dark hover:bg-cpn-yellow/80 rounded-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-cpn-dark">
        <Card className="max-w-md w-full p-6 text-center bg-cpn-dark border-cpn-gray/20">
          <h2 className="text-xl font-semibold mb-2 text-cpn-white">No CPN Score Found</h2>
          <p className="text-cpn-gray mb-4">Complete your CPN assessment to see your results.</p>
          <Button onClick={() => window.location.href = '/add-girl'} className="w-full bg-cpn-yellow text-cpn-dark hover:bg-cpn-yellow/80 rounded-full">
            Start Assessment
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cpn-dark p-4">
      <motion.div
        className="max-w-md mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-cpn-white mb-2">Your CPN Results</h1>
          <p className="text-cpn-gray">Here's how you performed</p>
        </motion.div>

        {/* Main Score Display */}
        <Card className="p-6 bg-cpn-dark border-cpn-gray/20">
          <ScoreDisplay score={data.score} percentile={data.peerPercentile} />
        </Card>

        {/* Category Scores */}
        <Card className="p-6 bg-cpn-dark border-cpn-gray/20">
          <motion.h2
            variants={itemVariants}
            className="text-lg font-semibold text-cpn-white mb-4"
          >
            Category Breakdown
          </motion.h2>
          
          <div className="space-y-4">
            {Object.entries(data.categoryScores).map(([category, score], index) => (
              <CategoryScoreBar
                key={category}
                label={category}
                score={score}
                delay={index * 0.2}
              />
            ))}
          </div>
        </Card>

        {/* Achievements */}
        {data.achievements.length > 0 && (
          <Card className="p-6 bg-cpn-dark border-cpn-gray/20">
            <motion.h2
              variants={itemVariants}
              className="text-lg font-semibold text-cpn-white mb-4"
            >
              Achievements Unlocked
            </motion.h2>
            
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-3 justify-center"
            >
              {data.achievements.map((achievement, index) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  delay={index * 0.1}
                  onClick={() => setSelectedAchievement(achievement)}
                />
              ))}
            </motion.div>
          </Card>
        )}

        {/* Peer Comparison */}
        <Card className="p-6 bg-cpn-dark border-cpn-gray/20">
          <motion.h2
            variants={itemVariants}
            className="text-lg font-semibold text-cpn-white mb-4"
          >
            How You Compare
          </motion.h2>
          
          <PeerComparison
            userScore={data.score}
            averageScore={data.peerComparison.averageScore}
            totalUsers={data.peerComparison.totalUsers}
            demographicGroup={data.peerComparison.demographicGroup}
          />
        </Card>

        {/* Share Button */}
        <motion.div variants={itemVariants}>
          <ShareButton onShare={handleShare} isSharing={isSharing} />
        </motion.div>

        {/* Next Steps */}
        <motion.div
          variants={itemVariants}
          className="text-center"
        >
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
            className="w-full min-h-[44px] border-cpn-gray/20 text-cpn-white hover:bg-cpn-gray/10 rounded-full"
          >
            Continue to Dashboard
          </Button>
        </motion.div>
      </motion.div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              className="bg-cpn-dark border border-cpn-gray/20 rounded-lg p-6 max-w-sm w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
                  style={{ backgroundColor: selectedAchievement.badgeColor }}
                >
                  <Trophy size={24} />
                </div>
                
                <h3 className="text-xl font-semibold text-cpn-white mb-2">
                  {selectedAchievement.name}
                </h3>
                
                <p className="text-cpn-gray mb-4">
                  {selectedAchievement.description}
                </p>
                
                <p className="text-sm text-cpn-gray/70 mb-4">
                  Earned: {new Date(selectedAchievement.earnedAt).toLocaleDateString()}
                </p>
                
                <Button
                  onClick={() => setSelectedAchievement(null)}
                  className="w-full bg-cpn-yellow text-cpn-dark hover:bg-cpn-yellow/80 rounded-full"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};