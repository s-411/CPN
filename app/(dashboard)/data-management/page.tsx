'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, Star, TrendingUp } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Girl {
  id: string; // Changed to string
  name: string;
  age: number;
  nationality: string;
  rating: number;
  status: string;
}

export default function DataManagementOverviewPage() {
  const router = useRouter();
  const { data: girlsData } = useSWR<Girl[]>('/api/girls', fetcher);
  const { data: cpnData } = useSWR('/api/cpn/results/me', fetcher);

  const stats = {
    totalSpent: cpnData?.metrics?.totalCost || 0,
    totalNuts: cpnData?.metrics?.totalNuts || 0,
    costPerNut: cpnData?.metrics?.averageCostPerNut || 0,
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
          Back
        </button>
        
        <h1 className="text-2xl font-bold text-cpn-white mb-2">
          Data Management
        </h1>
        <p className="text-cpn-gray">Select a girl to manage her data</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-cpn-dark border-cpn-gray/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cpn-gray text-sm">Total Spent</p>
                <p className="text-cpn-white text-2xl font-bold">
                  ${stats.totalSpent.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-cpn-yellow opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-cpn-dark border-cpn-gray/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cpn-gray text-sm">Total Nuts</p>
                <p className="text-cpn-white text-2xl font-bold">
                  {stats.totalNuts}
                </p>
              </div>
              <Star className="w-8 h-8 text-cpn-yellow opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-cpn-dark border-cpn-gray/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cpn-gray text-sm">Avg Cost/Nut</p>
                <p className="text-cpn-white text-2xl font-bold">
                  ${stats.costPerNut.toFixed(2)}
                </p>
              </div>
              <Database className="w-8 h-8 text-cpn-yellow opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Girls List */}
      <Card className="bg-cpn-dark border-cpn-gray/20">
        <CardHeader>
          <CardTitle className="text-cpn-white">Select Girl</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {girlsData?.map((girl) => (
              <Card 
                key={girl.id} 
                className="bg-cpn-dark/50 border-cpn-gray/20 hover:border-cpn-yellow/50 transition-all cursor-pointer"
                onClick={() => router.push(`/data-management/${girl.id}`)}
              >
                <CardContent className="p-4">
                  <h3 className="text-cpn-white font-semibold mb-2">
                    {girl.name}
                  </h3>
                  <div className="space-y-1 text-sm">
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
                      <span className="text-cpn-yellow">⭐ {girl.rating}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cpn-gray">Status:</span>
                      <span className="text-cpn-white capitalize">{girl.status}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-cpn-yellow/20 hover:bg-cpn-yellow/30 text-cpn-yellow border border-cpn-yellow/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/data-management/${girl.id}`);
                    }}
                  >
                    Manage Data
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {(!girlsData || girlsData.length === 0) && (
            <div className="text-center py-8">
              <p className="text-cpn-gray mb-4">No girls added yet</p>
              <Button 
                onClick={() => router.push('/profiles')}
                className="bg-cpn-yellow/20 hover:bg-cpn-yellow/30 text-cpn-yellow border border-cpn-yellow/50"
              >
                Go to Girl Management
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}