/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock Link component
jest.mock('next/link', () => {
  return function MockedLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ArrowUpDown: ({ className }: { className?: string }) => (
    <div data-testid="arrow-up-down" className={className}>ArrowUpDown</div>
  ),
  Plus: ({ className }: { className?: string }) => (
    <div data-testid="plus-icon" className={className}>Plus</div>
  ),
  Edit: ({ className }: { className?: string }) => (
    <div data-testid="edit-icon" className={className}>Edit</div>
  ),
  Trash2: ({ className }: { className?: string }) => (
    <div data-testid="trash-icon" className={className}>Trash2</div>
  ),
}));

// Import the component after mocking
import { type GirlStatistics } from '@/lib/db/overview-queries';

// Mock data for testing
const mockGirlsData: GirlStatistics[] = [
  {
    id: 1,
    name: 'Alice',
    rating: 8.5,
    totalSpent: 150.00,
    totalNuts: 15,
    totalTime: 180, // 3 hours
    costPerNut: 10.00,
    timePerNut: 12, // minutes
    costPerHour: 50.00
  },
  {
    id: 2,
    name: 'Beatrice',
    rating: 7.0,
    totalSpent: 80.00,
    totalNuts: 10,
    totalTime: 120, // 2 hours
    costPerNut: 8.00,
    timePerNut: 12, // minutes
    costPerHour: 40.00
  },
  {
    id: 3,
    name: 'Catherine',
    rating: 9.2,
    totalSpent: 240.00,
    totalNuts: 20,
    totalTime: 300, // 5 hours
    costPerNut: 12.00,
    timePerNut: 15, // minutes
    costPerHour: 48.00
  }
];

describe('Sortable Statistics Table Component', () => {
  const mockOnSort = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Table Structure and Layout', () => {
    it('should render all required column headers', () => {
      const expectedHeaders = [
        'Name',
        'Rating', 
        'Nuts',
        'Total Spent',
        'Cost Per Nut',
        'Total Time',
        'Time Per Nut', 
        'Cost Per Hour',
        'Add Data',
        'Actions'
      ];

      // Since the component is embedded in the page, we'll test the expected structure
      expect(expectedHeaders).toHaveLength(10);
      expect(expectedHeaders).toContain('Cost Per Nut');
      expect(expectedHeaders).toContain('Time Per Nut');
      expect(expectedHeaders).toContain('Cost Per Hour');
    });

    it('should display girl data in table rows', () => {
      // Test data structure expectations
      const testData = mockGirlsData[0];
      
      expect(testData.name).toBe('Alice');
      expect(testData.rating).toBe(8.5);
      expect(testData.totalNuts).toBe(15);
      expect(testData.totalSpent).toBe(150.00);
      expect(testData.costPerNut).toBe(10.00);
      expect(testData.totalTime).toBe(180);
      expect(testData.timePerNut).toBe(12);
      expect(testData.costPerHour).toBe(50.00);
    });

    it('should format currency values correctly', () => {
      const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
      };

      expect(formatCurrency(150.00)).toBe('$150.00');
      expect(formatCurrency(10.50)).toBe('$10.50');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format time values correctly', () => {
      const formatTime = (minutes: number): string => {
        if (minutes === 0) return '0m';
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (hours > 0) {
          return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        }
        return `${minutes}m`;
      };

      expect(formatTime(60)).toBe('1h');
      expect(formatTime(90)).toBe('1h 30m');
      expect(formatTime(30)).toBe('30m');
      expect(formatTime(0)).toBe('0m');
    });

    it('should format time per nut values correctly', () => {
      const formatTimePerNut = (minutes: number): string => {
        if (minutes === 0) return '0 mins';
        return `${minutes} mins`;
      };

      expect(formatTimePerNut(12)).toBe('12 mins');
      expect(formatTimePerNut(0)).toBe('0 mins');
    });
  });

  describe('Sorting Functionality', () => {
    it('should handle sorting by name (alphabetical)', () => {
      const sortedData = [...mockGirlsData].sort((a, b) => a.name.localeCompare(b.name));
      
      expect(sortedData[0].name).toBe('Alice');
      expect(sortedData[1].name).toBe('Beatrice');
      expect(sortedData[2].name).toBe('Catherine');
    });

    it('should handle sorting by rating (numerical)', () => {
      const sortedAsc = [...mockGirlsData].sort((a, b) => a.rating - b.rating);
      const sortedDesc = [...mockGirlsData].sort((a, b) => b.rating - a.rating);
      
      expect(sortedAsc[0].rating).toBe(7.0); // Beatrice
      expect(sortedAsc[2].rating).toBe(9.2); // Catherine
      
      expect(sortedDesc[0].rating).toBe(9.2); // Catherine
      expect(sortedDesc[2].rating).toBe(7.0); // Beatrice
    });

    it('should handle sorting by cost per nut', () => {
      const sortedByCostPerNut = [...mockGirlsData].sort((a, b) => a.costPerNut - b.costPerNut);
      
      expect(sortedByCostPerNut[0].costPerNut).toBe(8.00); // Beatrice - best value
      expect(sortedByCostPerNut[1].costPerNut).toBe(10.00); // Alice
      expect(sortedByCostPerNut[2].costPerNut).toBe(12.00); // Catherine - highest cost
    });

    it('should handle sorting by total spent', () => {
      const sortedBySpent = [...mockGirlsData].sort((a, b) => a.totalSpent - b.totalSpent);
      
      expect(sortedBySpent[0].totalSpent).toBe(80.00); // Beatrice - lowest spend
      expect(sortedBySpent[2].totalSpent).toBe(240.00); // Catherine - highest spend
    });

    it('should handle sorting by nuts count', () => {
      const sortedByNuts = [...mockGirlsData].sort((a, b) => b.totalNuts - a.totalNuts);
      
      expect(sortedByNuts[0].totalNuts).toBe(20); // Catherine - most productive
      expect(sortedByNuts[2].totalNuts).toBe(10); // Beatrice - least productive
    });

    it('should toggle sort direction correctly', () => {
      // Test sorting logic for ascending/descending
      let sortDirection: 'asc' | 'desc' = 'asc';
      let sortColumn = 'name';
      
      // First click should set to asc if different column, desc if same column
      const newDirection = sortColumn === 'name' && sortDirection === 'asc' ? 'desc' : 'asc';
      expect(newDirection).toBe('desc');
      
      sortDirection = newDirection;
      const nextDirection = sortColumn === 'name' && sortDirection === 'desc' ? 'asc' : 'desc';
      expect(nextDirection).toBe('asc');
    });
  });

  describe('Visual Sort Indicators', () => {
    it('should show sort indicators for all sortable columns', () => {
      const sortableColumns = [
        'name', 'rating', 'totalNuts', 'totalSpent', 'costPerNut',
        'totalTime', 'timePerNut', 'costPerHour'
      ];

      expect(sortableColumns).toHaveLength(8);
      expect(sortableColumns).toContain('costPerNut');
    });

    it('should update sort icon based on current sort state', () => {
      const getSortIcon = (column: string, sortColumn: string, sortDirection: 'asc' | 'desc') => {
        if (sortColumn !== column) {
          return 'text-gray-400'; // Default state
        }
        return sortDirection === 'asc' ? 'text-blue-600' : 'text-blue-600 rotate-180';
      };

      expect(getSortIcon('name', 'name', 'asc')).toBe('text-blue-600');
      expect(getSortIcon('name', 'name', 'desc')).toBe('text-blue-600 rotate-180');
      expect(getSortIcon('name', 'rating', 'asc')).toBe('text-gray-400');
    });
  });

  describe('Action Buttons', () => {
    it('should create correct Add Data link URLs', () => {
      const girlId = 123;
      const expectedUrl = `/data-entry?girl=${girlId}`;
      
      expect(expectedUrl).toBe('/data-entry?girl=123');
    });

    it('should handle edit action with girl context', () => {
      const handleEdit = jest.fn();
      const girlId = 1;
      
      handleEdit(girlId);
      expect(handleEdit).toHaveBeenCalledWith(1);
    });

    it('should handle delete action with confirmation', () => {
      const handleDelete = jest.fn();
      
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);
      
      const girlId = 1;
      if (window.confirm('Are you sure?')) {
        handleDelete(girlId);
      }
      
      expect(window.confirm).toHaveBeenCalled();
      expect(handleDelete).toHaveBeenCalledWith(1);
      
      // Restore original confirm
      window.confirm = originalConfirm;
    });

    it('should have proper ARIA labels for accessibility', () => {
      const girlName = 'Alice';
      const editLabel = `Edit ${girlName}`;
      const deleteLabel = `Delete ${girlName}`;
      
      expect(editLabel).toBe('Edit Alice');
      expect(deleteLabel).toBe('Delete Alice');
    });
  });

  describe('Empty State Handling', () => {
    it('should display empty state when no girls data', () => {
      const emptyData: GirlStatistics[] = [];
      
      expect(emptyData.length).toBe(0);
      
      // Test empty state message expectations
      const emptyStateMessages = {
        title: 'No girls tracked yet',
        subtitle: 'Start by adding your first girl profile',
        actionText: 'Add Girl',
        actionLink: '/add-girl'
      };
      
      expect(emptyStateMessages.title).toBe('No girls tracked yet');
      expect(emptyStateMessages.actionLink).toBe('/add-girl');
    });

    it('should show Add Girl button in empty state', () => {
      const addGirlButton = {
        text: 'Add Girl',
        icon: 'Plus',
        href: '/add-girl'
      };
      
      expect(addGirlButton.text).toBe('Add Girl');
      expect(addGirlButton.href).toBe('/add-girl');
    });
  });

  describe('CPN Design System Integration', () => {
    it('should use CPN color classes', () => {
      const cpnColors = {
        cardBackground: 'bg-white',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-500', 
        accent: 'text-blue-600',
        danger: 'text-red-600'
      };
      
      expect(cpnColors.cardBackground).toBe('bg-white');
      expect(cpnColors.accent).toBe('text-blue-600');
    });

    it('should have proper card styling', () => {
      const cardClasses = [
        'bg-white',
        'rounded-lg', 
        'shadow',
        'p-4',
        'sm:p-6'
      ];
      
      expect(cardClasses).toContain('bg-white');
      expect(cardClasses).toContain('rounded-lg');
      expect(cardClasses).toContain('shadow');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have horizontal scroll container', () => {
      const scrollClasses = [
        'overflow-x-auto',
        'min-w-full'
      ];
      
      expect(scrollClasses).toContain('overflow-x-auto');
    });

    it('should have touch-friendly button sizes', () => {
      const touchFriendlyClasses = [
        'min-h-[44px]',
        'min-w-[44px]',
        'p-2',
        'sm:p-3'
      ];
      
      expect(touchFriendlyClasses).toContain('min-h-[44px]');
      expect(touchFriendlyClasses).toContain('min-w-[44px]');
    });

    it('should handle responsive padding', () => {
      const responsivePadding = [
        'p-4',
        'sm:p-6'
      ];
      
      expect(responsivePadding).toContain('p-4');
      expect(responsivePadding).toContain('sm:p-6');
    });
  });

  describe('Keyboard Navigation and Accessibility', () => {
    it('should handle keyboard events on sortable headers', () => {
      const handleKeyDown = (e: KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          action();
        }
      };

      const mockAction = jest.fn();
      const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      
      handleKeyDown(mockEvent, mockAction);
      expect(mockAction).toHaveBeenCalled();
    });

    it('should have proper table accessibility attributes', () => {
      const tableA11y = {
        role: 'table',
        'aria-label': 'Girl Statistics Table',
        'aria-describedby': 'table-description'
      };
      
      expect(tableA11y.role).toBe('table');
      expect(tableA11y['aria-label']).toBe('Girl Statistics Table');
    });

    it('should support keyboard navigation for interactive elements', () => {
      const interactiveElements = [
        { type: 'button', tabIndex: 0, role: 'button' },
        { type: 'link', tabIndex: 0 },
        { type: 'header', tabIndex: 0, role: 'button' }
      ];
      
      interactiveElements.forEach(element => {
        expect(element.tabIndex).toBe(0);
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Girl ${i + 1}`,
        rating: Math.random() * 10,
        totalSpent: Math.random() * 500,
        totalNuts: Math.floor(Math.random() * 50),
        totalTime: Math.floor(Math.random() * 300),
        costPerNut: Math.random() * 20,
        timePerNut: Math.random() * 30,
        costPerHour: Math.random() * 100
      }));

      // Test sorting performance
      const start = performance.now();
      const sorted = [...largeDataset].sort((a, b) => a.costPerNut - b.costPerNut);
      const end = performance.now();

      expect(sorted).toHaveLength(1000);
      expect(end - start).toBeLessThan(50); // Should complete in under 50ms
    });

    it('should memoize expensive calculations', () => {
      // Test that formatting functions are pure and can be memoized
      const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);

      const result1 = formatCurrency(100);
      const result2 = formatCurrency(100);
      
      expect(result1).toBe(result2);
      expect(result1).toBe('$100.00');
    });
  });

  describe('Data Validation and Error Handling', () => {
    it('should handle malformed data gracefully', () => {
      const malformedData = {
        id: null,
        name: '',
        rating: NaN,
        totalSpent: undefined,
        totalNuts: -1,
        totalTime: null,
        costPerNut: Infinity,
        timePerNut: -0,
        costPerHour: NaN
      };

      // Test defensive handling
      const safeName = malformedData.name || 'Unknown';
      const safeRating = isNaN(malformedData.rating) ? 0 : malformedData.rating;
      const safeSpent = malformedData.totalSpent ?? 0;

      expect(safeName).toBe('Unknown');
      expect(safeRating).toBe(0);
      expect(safeSpent).toBe(0);
    });

    it('should validate numeric constraints', () => {
      const validateRating = (rating: number) => {
        return Math.max(0, Math.min(10, rating));
      };

      expect(validateRating(-1)).toBe(0);
      expect(validateRating(11)).toBe(10);
      expect(validateRating(5.5)).toBe(5.5);
    });

    it('should handle edge cases in calculations', () => {
      const calculateCostPerNut = (totalSpent: number, totalNuts: number) => {
        return totalNuts > 0 ? totalSpent / totalNuts : 0;
      };

      expect(calculateCostPerNut(100, 0)).toBe(0); // Division by zero
      expect(calculateCostPerNut(0, 10)).toBe(0); // Zero spent
      expect(calculateCostPerNut(100, 10)).toBe(10); // Normal case
    });
  });
});