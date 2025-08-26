'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Clock, DollarSign, UserPlus, Star, Edit } from 'lucide-react';
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
  girlId: string;
}

interface Girl {
  id: string; // Changed to string
  name: string;
  age: number;
  nationality: string;
  rating: number;
  status: string;
}

interface Interaction {
  id: number;
  date: string;
  cost: string;
  timeMinutes: number;
  nuts: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface GirlInteractionsData {
  interactions: Interaction[];
  statistics: {
    totalInteractions: number;
    totalCost: number;
    totalNuts: number;
    totalTimeMinutes: number;
    averageCostPerNut: number;
    averageTimePerNut: number;
    averageCostPerHour: number;
  };
}

interface NewGirlFormData {
  name: string;
  age: string;
  nationality: string;
  rating: string;
}

interface DataManagementClientProps {
  girlId: string;
}

export function DataManagementClient({ girlId }: DataManagementClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<InteractionFormData>({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    hours: '0',
    minutes: '0',
    nuts: '0',
    girlId: girlId // Initialize with the provided girlId
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewGirlForm, setShowNewGirlForm] = useState(false);
  const [newGirlData, setNewGirlData] = useState<NewGirlFormData>({
    name: '',
    age: '',
    nationality: '',
    rating: '5'
  });
  const [selectedGirl, setSelectedGirl] = useState<Girl | null>(null);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);

  // Fetch user's stats, girls, and girl-specific interactions
  const { data: cpnData, mutate: mutateCpnData } = useSWR('/api/cpn/results/me', fetcher);
  const { data: girlsData, mutate: mutateGirls } = useSWR<Girl[]>('/api/girls', fetcher);
  const { data: girlInteractionsData, mutate: mutateInteractions } = useSWR<GirlInteractionsData>(
    girlId ? `/api/girls/${girlId}/interactions` : null,
    fetcher
  );

  // Set selected girl based on girlId from props
  useEffect(() => {
    if (girlId && girlsData) {
      const girl = girlsData.find(g => g.id === girlId); // No need to convert since both are strings
      setSelectedGirl(girl || null);
      // Update form data with the girl ID if not already set
      if (formData.girlId !== girlId) {
        setFormData(prev => ({ ...prev, girlId }));
      }
    }
  }, [girlId, girlsData]);

  const handleInputChange = (field: keyof InteractionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewGirlInputChange = (field: keyof NewGirlFormData, value: string) => {
    setNewGirlData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateGirl = async () => {
    try {
      const age = parseInt(newGirlData.age);
      const rating = parseInt(newGirlData.rating);

      if (!newGirlData.name || !newGirlData.nationality) {
        toast.error('Please fill in all fields');
        return;
      }

      if (isNaN(age) || age < 18 || age > 120) {
        toast.error('Please enter a valid age (18-120)');
        return;
      }

      if (isNaN(rating) || rating < 1 || rating > 10) {
        toast.error('Please enter a valid rating (1-10)');
        return;
      }

      const response = await fetch('/api/girls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGirlData.name,
          age,
          nationality: newGirlData.nationality,
          rating
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create girl');
      }

      const newGirl = await response.json();
      await mutateGirls();
      
      // Select the newly created girl
      setFormData(prev => ({ ...prev, girlId: newGirl.id }));
      setShowNewGirlForm(false);
      setNewGirlData({ name: '', age: '', nationality: '', rating: '5' });
      
      toast.success('Girl added successfully!');
    } catch (error) {
      console.error('Error creating girl:', error);
      toast.error('Failed to add girl');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // If we're editing, use the update handler instead
    if (editingInteraction) {
      await handleUpdateInteraction();
      return;
    }
    
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
      
      if (!formData.girlId) {
        toast.error('Please select a girl');
        return;
      }
      
      const totalMinutes = (hours * 60) + minutes;
      
      if (totalMinutes === 0) {
        toast.error('Total time must be greater than 0');
        return;
      }
      
      // Use the girl-specific API to save interaction
      const response = await fetch(`/api/girls/${formData.girlId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          cost: amount,
          timeMinutes: totalMinutes,
          nuts: nuts,
          notes: `Session with ${selectedGirl?.name || 'Girl'}`
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save entry');
        return;
      }
      
      // Reset form but keep the selected girl
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        hours: '0',
        minutes: '0',
        nuts: '0',
        girlId: formData.girlId
      });
      
      // Refresh girl-specific data and overall CPN data
      await mutateInteractions();
      await mutateCpnData();
      
      toast.success('Entry added successfully!');
      
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInteraction = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    // Pre-fill form with interaction data
    const hours = Math.floor(interaction.timeMinutes / 60);
    const minutes = interaction.timeMinutes % 60;
    setFormData({
      date: interaction.date,
      amount: interaction.cost,
      hours: hours.toString(),
      minutes: minutes.toString(),
      nuts: interaction.nuts.toString(),
      girlId: formData.girlId
    });
  };

  const handleDeleteInteraction = async (interactionId: number) => {
    if (!confirm('Are you sure you want to delete this interaction?')) {
      return;
    }

    try {
      const response = await fetch(`/api/interactions/${interactionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete interaction');
      }

      // Refresh data
      await mutateInteractions();
      await mutateCpnData();
      
      toast.success('Interaction deleted successfully!');
    } catch (error) {
      console.error('Error deleting interaction:', error);
      toast.error('Failed to delete interaction');
    }
  };

  const handleUpdateInteraction = async () => {
    if (!editingInteraction) return;

    try {
      const amount = parseFloat(formData.amount);
      const hours = parseInt(formData.hours);
      const minutes = parseInt(formData.minutes);
      const nuts = parseInt(formData.nuts);
      const totalMinutes = (hours * 60) + minutes;

      const response = await fetch(`/api/interactions/${editingInteraction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          cost: amount,
          timeMinutes: totalMinutes,
          nuts: nuts,
          notes: editingInteraction.notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update interaction');
      }

      // Reset editing state and form
      setEditingInteraction(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        hours: '0',
        minutes: '0',
        nuts: '0',
        girlId: formData.girlId
      });

      // Refresh data
      await mutateInteractions();
      await mutateCpnData();
      
      toast.success('Interaction updated successfully!');
    } catch (error) {
      console.error('Error updating interaction:', error);
      toast.error('Failed to update interaction');
    }
  };

  const handleCancelEdit = () => {
    setEditingInteraction(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      hours: '0',
      minutes: '0',
      nuts: '0',
      girlId: formData.girlId
    });
  };

  // Use girl-specific statistics instead of overall CPN data
  const stats = {
    totalSpent: girlInteractionsData?.statistics?.totalCost || 0,
    totalNuts: girlInteractionsData?.statistics?.totalNuts || 0,
    totalTimeMinutes: girlInteractionsData?.statistics?.totalTimeMinutes || 0,
    timePerNut: girlInteractionsData?.statistics?.averageTimePerNut || 0,
    costPerNut: girlInteractionsData?.statistics?.averageCostPerNut || 0,
    costPerHour: girlInteractionsData?.statistics?.averageCostPerHour || 0
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
          {selectedGirl ? `Data Management for ${selectedGirl.name}` : 'Data Management'}
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
              {/* Girl Selection */}
              <div>
                <label className="block text-sm font-medium text-cpn-gray mb-2">
                  Girl
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.girlId}
                    onChange={(e) => handleInputChange('girlId', e.target.value)}
                    className="flex-1 p-3 rounded-lg border border-cpn-gray/30 bg-cpn-dark text-cpn-white focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none"
                    required
                    disabled={!!girlId} // Disable dropdown when coming from a specific girl's profile
                  >
                    <option value="">Select a girl...</option>
                    {girlsData?.map((girl) => (
                      <option key={girl.id} value={girl.id}>
                        {girl.name} ({girl.age}y, {girl.nationality}) - ⭐{girl.rating}/10
                      </option>
                    ))}
                  </select>
                  {!girlId && ( // Only show add girl button if not on a specific girl's page
                    <Button
                      type="button"
                      onClick={() => setShowNewGirlForm(true)}
                      className="bg-cpn-yellow/20 hover:bg-cpn-yellow/30 text-cpn-yellow border border-cpn-yellow/50"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* New Girl Form Modal */}
              {showNewGirlForm && (
                <div className="p-4 bg-cpn-dark/50 border border-cpn-yellow/30 rounded-lg space-y-3">
                  <h3 className="text-cpn-yellow font-medium">Add New Girl</h3>
                  <input
                    type="text"
                    placeholder="Name"
                    value={newGirlData.name}
                    onChange={(e) => handleNewGirlInputChange('name', e.target.value)}
                    className="w-full p-2 rounded border border-cpn-gray/30 bg-cpn-dark text-cpn-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Age"
                      min="18"
                      max="120"
                      value={newGirlData.age}
                      onChange={(e) => handleNewGirlInputChange('age', e.target.value)}
                      className="p-2 rounded border border-cpn-gray/30 bg-cpn-dark text-cpn-white"
                    />
                    <input
                      type="text"
                      placeholder="Nationality"
                      value={newGirlData.nationality}
                      onChange={(e) => handleNewGirlInputChange('nationality', e.target.value)}
                      className="p-2 rounded border border-cpn-gray/30 bg-cpn-dark text-cpn-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-cpn-gray mb-1">Rating (1-10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newGirlData.rating}
                      onChange={(e) => handleNewGirlInputChange('rating', e.target.value)}
                      className="w-full"
                    />
                    <div className="text-center text-cpn-yellow">{newGirlData.rating}/10</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleCreateGirl}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Add Girl
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowNewGirlForm(false);
                        setNewGirlData({ name: '', age: '', nationality: '', rating: '5' });
                      }}
                      className="flex-1 bg-cpn-gray/20 hover:bg-cpn-gray/30 text-cpn-gray"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

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
              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    editingInteraction 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {editingInteraction ? 'Updating...' : 'Adding Entry...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {editingInteraction ? (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Update Entry
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Entry
                        </>
                      )}
                    </div>
                  )}
                </Button>
                
                {editingInteraction && (
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full bg-cpn-gray/20 hover:bg-cpn-gray/30 text-cpn-gray font-medium py-3 rounded-lg transition-colors"
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Side - Statistics */}
        <div className="space-y-6">
          {/* Current Girl Info Card */}
          {selectedGirl && (
            <Card className="bg-cpn-dark border-cpn-yellow/30">
              <CardHeader>
                <CardTitle className="text-cpn-yellow flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Current Girl: {selectedGirl.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-cpn-gray text-sm">Age</p>
                    <p className="text-cpn-white text-xl font-bold">{selectedGirl.age}</p>
                  </div>
                  <div>
                    <p className="text-cpn-gray text-sm">Nationality</p>
                    <p className="text-cpn-white text-xl font-bold">{selectedGirl.nationality}</p>
                  </div>
                  <div>
                    <p className="text-cpn-gray text-sm">Rating</p>
                    <p className="text-cpn-yellow text-xl font-bold">⭐ {selectedGirl.rating}/10</p>
                  </div>
                  <div>
                    <p className="text-cpn-gray text-sm">Status</p>
                    <p className="text-cpn-white text-xl font-bold capitalize">{selectedGirl.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overall Statistics Card */}
          <Card className="bg-cpn-dark border-cpn-gray/20">
            <CardHeader>
              <CardTitle className="text-cpn-white">Overall Statistics</CardTitle>
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

          {/* Girls Summary Card */}
          <Card className="bg-cpn-dark border-cpn-gray/20">
            <CardHeader>
              <CardTitle className="text-cpn-white">Girls Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-cpn-gray">Total Girls:</span>
                <span className="text-cpn-white">
                  {girlsData?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cpn-gray">Average Rating:</span>
                <span className="text-cpn-white">
                  {girlsData && girlsData.length > 0 
                    ? (girlsData.reduce((sum, g) => sum + g.rating, 0) / girlsData.length).toFixed(1)
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cpn-gray">Active Girls:</span>
                <span className="text-cpn-white">
                  {girlsData?.filter(g => g.status === 'active').length || 0}
                </span>
              </div>
              {girlsData && girlsData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-cpn-gray/20">
                  <p className="text-cpn-gray text-sm mb-2">Recent Girls:</p>
                  {girlsData.slice(0, 3).map((girl) => (
                    <div key={girl.id} className="text-cpn-white text-sm py-1">
                      {girl.name} - ⭐{girl.rating}/10
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* History Table - Show all interactions for this girl */}
      {girlInteractionsData?.interactions && girlInteractionsData.interactions.length > 0 && (
        <div className="mt-8">
          <Card className="bg-cpn-dark border-cpn-gray/20">
            <CardHeader>
              <CardTitle className="text-cpn-white flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Interaction History for {selectedGirl?.name || 'This Girl'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cpn-gray/20">
                      <th className="text-left py-3 px-4 text-cpn-gray font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-cpn-gray font-medium">Cost</th>
                      <th className="text-left py-3 px-4 text-cpn-gray font-medium">Time</th>
                      <th className="text-left py-3 px-4 text-cpn-gray font-medium">Nuts</th>
                      <th className="text-left py-3 px-4 text-cpn-gray font-medium">CPN</th>
                      <th className="text-left py-3 px-4 text-cpn-gray font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {girlInteractionsData.interactions.map((interaction) => {
                      const cost = parseFloat(interaction.cost);
                      const cpn = interaction.nuts > 0 ? (cost / interaction.nuts).toFixed(2) : 'N/A';
                      const isEditing = editingInteraction?.id === interaction.id;
                      
                      return (
                        <tr key={interaction.id} className="border-b border-cpn-gray/10 hover:bg-cpn-gray/5">
                          <td className="py-3 px-4 text-cpn-white">
                            {new Date(interaction.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-cpn-white">
                            ${cost.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-cpn-white">
                            {formatTime(interaction.timeMinutes)}
                          </td>
                          <td className="py-3 px-4 text-cpn-white">
                            {interaction.nuts}
                          </td>
                          <td className="py-3 px-4 text-cpn-yellow font-medium">
                            ${cpn}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {isEditing ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={handleUpdateInteraction}
                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    className="bg-cpn-gray/20 hover:bg-cpn-gray/30 text-cpn-gray px-2 py-1 text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleEditInteraction(interaction)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleDeleteInteraction(interaction.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs"
                                  >
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {girlInteractionsData.interactions.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-cpn-gray mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-cpn-white mb-2">
                    No interactions yet
                  </h3>
                  <p className="text-cpn-gray">
                    Add your first interaction using the form above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}