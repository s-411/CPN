'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Edit, Trash2, BarChart3, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { Girl } from '@/lib/db/schema';
import { CreateGirlModal } from '@/components/forms/create-girl-modal';

// Loading skeleton component
const GirlCardSkeleton = () => (
  <Card className="bg-cpn-dark border-cpn-gray/20">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="h-6 bg-cpn-gray/20 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-cpn-gray/20 rounded animate-pulse w-2/3" />
          <div className="h-4 bg-cpn-gray/20 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-cpn-gray/20 rounded animate-pulse w-3/4" />
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-cpn-gray/20 rounded animate-pulse flex-1" />
          <div className="h-8 bg-cpn-gray/20 rounded animate-pulse flex-1" />
          <div className="h-8 bg-cpn-gray/20 rounded animate-pulse flex-1" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Empty state component
const EmptyState = ({ onCreateGirl }: { onCreateGirl: () => void }) => (
  <div className="text-center py-12">
    <Users className="mx-auto h-12 w-12 text-cpn-gray mb-4" />
    <h2 className="text-xl font-semibold text-cpn-white mb-2">
      No girls yet
    </h2>
    <p className="text-cpn-gray mb-6">
      Start by creating your first girl to begin tracking.
    </p>
    <Button 
      onClick={onCreateGirl}
    >
      Create Girl
    </Button>
  </div>
);

// Girl card component
interface GirlCardProps {
  girl: Girl;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onManageData: (id: number) => void;
}

const GirlCard = ({ girl, onEdit, onDelete, onManageData }: GirlCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'inactive': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'archived': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <Card className="bg-cpn-dark border-cpn-gray/20 hover:border-cpn-gray/40 transition-colors">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Girl Name */}
          <h3 className="text-lg font-semibold text-cpn-white">{girl.name}</h3>
          
          {/* Girl Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-cpn-gray">Age:</span>
              <span className="text-cpn-white">{girl.age}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cpn-gray">Nationality:</span>
              <span className="text-cpn-white">{girl.nationality}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cpn-gray">Rating:</span>
              <span className="text-cpn-white">{girl.rating}/10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cpn-gray">Status:</span>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium border',
                getStatusColor(girl.status)
              )}>
                {girl.status.charAt(0).toUpperCase() + girl.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(girl.id)}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(girl.id)}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onManageData(girl.id)}
              className="flex-1"
            >
              Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function GirlManagementPage() {
  const [girls, setGirls] = useState<Girl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGirl, setEditingGirl] = useState<Girl | null>(null);

  useEffect(() => {
    loadGirls();
  }, []);

  const loadGirls = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/girls');
      if (!response.ok) {
        throw new Error('Failed to fetch girls');
      }
      const data = await response.json();
      setGirls(data); // Already filtered for soft-deletes in the query
    } catch (err) {
      console.error('Error fetching girls:', err);
      setError('Failed to load girls data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGirl = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditGirl = (id: number) => {
    const girl = girls.find(g => g.id === id);
    if (girl) {
      setEditingGirl(girl);
    }
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingGirl(null);
  };

  const handleModalSuccess = () => {
    loadGirls(); // Reload the data after successful create/edit
  };

  const handleDeleteGirl = async (id: number) => {
    if (!confirm('Are you sure you want to delete this girl?')) return;
    
    try {
      const response = await fetch(`/api/girls/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete girl');
      }
      
      await loadGirls(); // Reload the data after deletion
    } catch (err) {
      console.error('Error deleting girl:', err);
      setError('Failed to delete girl. Please try again.');
    }
  };

  const handleManageData = (id: number) => {
    // TODO: Navigate to data management page
    console.log('Managing data for girl:', id);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-cpn-white">
            Girl Management
          </h1>
          <p className="text-cpn-gray mt-1">
            Manage your tracked girls and demographics
          </p>
        </div>
        <Button 
          onClick={handleCreateGirl}
        >
          New Girl
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">
            {error}
            <button 
              onClick={loadGirls}
              className="ml-2 underline hover:no-underline"
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <GirlCardSkeleton key={i} />
          ))}
        </div>
      ) : girls.length === 0 ? (
        <EmptyState onCreateGirl={handleCreateGirl} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {girls.map((girl) => (
            <GirlCard
              key={girl.id}
              girl={girl}
              onEdit={handleEditGirl}
              onDelete={handleDeleteGirl}
              onManageData={handleManageData}
            />
          ))}
        </div>
      )}

      {/* Create Girl Modal */}
      <CreateGirlModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        mode="create"
      />

      {/* Edit Girl Modal */}
      <CreateGirlModal
        isOpen={!!editingGirl}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        mode="edit"
        girl={editingGirl || undefined}
      />
    </div>
  );
}