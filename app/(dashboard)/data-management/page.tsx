'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Clock, DollarSign } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { saveUserInteraction, recalculateCPNScore } from '@/app/actions/onboarding-actions';
import { toast } from 'sonner';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface InteractionFormData {
  date: string;
  amount: string;
  hours: string;
  minutes: string;
  nuts: string;
}

export default function DataManagementPage() {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState<InteractionFormData>({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    hours: '0',
    minutes: '0',
    nuts: '0'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user's profile and stats
  const { data: cpnData, mutate: mutateCpnData } = useSWR('/api/cpn/results/me', fetcher);
  const { data: profileData } = useSWR('/api/user/profile', fetcher);

  const handleInputChange = (field: keyof InteractionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Validate form data
      const amount = parseFloat(formData.amount);
      const hours = parseInt(formData.hours);
      const minutes = parseInt(formData.minutes);
      const nuts = parseInt(formData.nuts);
      
      if (isNaN(amount) || amount < 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      
      if (isNaN(hours) || hours < 0 || isNaN(minutes) || minutes < 0) {
        toast.error('Please enter valid time values');
        return;
      }
      
      if (isNaN(nuts) || nuts < 0) {
        toast.error('Please enter a valid number of nuts');
        return;
      }
      
      const totalMinutes = (hours * 60) + minutes;
      
      if (totalMinutes === 0) {
        toast.error('Total time must be greater than 0');
        return;
      }
      
      // Create form data for server action
      const serverFormData = new FormData();
      serverFormData.append('date', formData.date);
      serverFormData.append('cost', amount.toString());
      serverFormData.append('timeMinutes', totalMinutes.toString());
      serverFormData.append('nuts', nuts.toString());
      serverFormData.append('notes', ''); // Optional notes field can be added later
      
      // Save interaction
      const result = await saveUserInteraction(serverFormData);
      
      if (!result.success) {
        toast.error(result.error || 'Failed to save entry');
        return;
      }
      
      // Recalculate CPN score
      await recalculateCPNScore();
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        hours: '0',
        minutes: '0',
        nuts: '0'
      });
      
      // Refresh data
      await mutateCpnData();
      
      toast.success('Entry added successfully!');
      
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate statistics from CPN data
  const stats = {
    totalSpent: cpnData?.metrics?.totalCost || 0,
    totalNuts: cpnData?.metrics?.totalNuts || 0,
    totalTimeMinutes: cpnData?.metrics?.totalTimeMinutes || 0,
    timePerNut: cpnData?.metrics?.averageTimePerNut || 0,
    costPerNut: cpnData?.metrics?.averageCostPerNut || 0,
    costPerHour: cpnData?.metrics?.totalTimeMinutes > 0 
      ? (cpnData?.metrics?.totalCost || 0) / ((cpnData?.metrics?.totalTimeMinutes || 0) / 60)
      : 0
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="min-h-screen bg-cpn-dark p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-cpn-gray hover:text-cpn-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profiles
        </button>
        
        <h1 className="text-2xl font-bold text-cpn-white">
          Manage Data for {profileData?.firstName || 'User'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Left Side - Add New Entry Form */}
        <Card className="bg-cpn-dark border-cpn-gray/20">
          <CardHeader>
            <CardTitle className="text-cpn-white flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-cpn-gray mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full p-3 rounded-lg border border-cpn-gray/30 bg-cpn-dark text-cpn-white focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none"
                  required
                />
              </div>

              {/* Amount Spent */}
              <div>
                <label className="block text-sm font-medium text-cpn-gray mb-2">
                  Amount Spent ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  className="w-full p-3 rounded-lg border border-cpn-gray/30 bg-cpn-dark text-cpn-white focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none"
                  required
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cpn-gray mb-2">
                    Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={formData.hours}
                    onChange={(e) => handleInputChange('hours', e.target.value)}
                    className="w-full p-3 rounded-lg border border-cpn-gray/30 bg-cpn-dark text-cpn-white focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cpn-gray mb-2">
                    Minutes (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={formData.minutes}
                    onChange={(e) => handleInputChange('minutes', e.target.value)}
                    className="w-full p-3 rounded-lg border border-cpn-gray/30 bg-cpn-dark text-cpn-white focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none"
                  />
                </div>
              </div>
              
              <p className="text-xs text-cpn-gray">
                Leave empty for 0 minutes
              </p>

              {/* Nuts */}
              <div>
                <label className="block text-sm font-medium text-cpn-gray mb-2">
                  Nuts
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.nuts}
                  onChange={(e) => handleInputChange('nuts', e.target.value)}
                  className="w-full p-3 rounded-lg border border-cpn-gray/30 bg-cpn-dark text-cpn-white focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding Entry...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Side - Statistics */}
        <div className="space-y-6">
          {/* Statistics Card */}
          <Card className="bg-cpn-dark border-cpn-gray/20">
            <CardHeader>
              <CardTitle className="text-cpn-white">Statistics for {profileData?.firstName || 'User'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-cpn-gray text-sm">Total Spent</p>
                  <p className="text-cpn-white text-2xl font-bold">
                    ${stats.totalSpent.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-cpn-gray text-sm">Total Nuts</p>
                  <p className="text-cpn-white text-2xl font-bold">
                    {stats.totalNuts}
                  </p>
                </div>
                <div>
                  <p className="text-cpn-gray text-sm">Total Time</p>
                  <p className="text-cpn-white text-2xl font-bold">
                    {formatTime(stats.totalTimeMinutes)}
                  </p>
                </div>
                <div>
                  <p className="text-cpn-gray text-sm">Time Per Nut</p>
                  <p className="text-cpn-white text-2xl font-bold">
                    {Math.round(stats.timePerNut)} mins
                  </p>
                </div>
                <div>
                  <p className="text-cpn-gray text-sm">Cost Per Nut</p>
                  <p className="text-cpn-white text-2xl font-bold">
                    ${stats.costPerNut.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-cpn-gray text-sm">Cost Per Hour</p>
                  <p className="text-cpn-white text-2xl font-bold">
                    ${stats.costPerHour.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Info Card */}
          <Card className="bg-cpn-dark border-cpn-gray/20">
            <CardHeader>
              <CardTitle className="text-cpn-white">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-cpn-gray">Age:</span>
                <span className="text-cpn-white">
                  {profileData?.age || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cpn-gray">Ethnic Background:</span>
                <span className="text-cpn-white">
                  {profileData?.ethnicity || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cpn-gray">Rating:</span>
                <span className="text-cpn-white">
                  {profileData?.rating || 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}