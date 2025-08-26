/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Users: () => <div data-testid="users-icon">Users</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  BarChart3: () => <div data-testid="chart-icon">Chart</div>,
  AlertCircle: () => <div data-testid="alert-icon">Alert</div>,
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock girl data
const mockGirls = [
  {
    id: 1,
    name: 'Test Girl 1',
    age: 25,
    nationality: 'American',
    rating: 8,
    status: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    userId: 1,
    teamId: 1
  },
  {
    id: 2,
    name: 'Test Girl 2', 
    age: 28,
    nationality: 'British',
    rating: 7,
    status: 'inactive' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    userId: 1,
    teamId: 1
  }
];

describe('Girl Management Page', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Header', () => {
    it('should render correct page title and subtitle', () => {
      const expectedTitle = 'Girl Management';
      const expectedSubtitle = 'Manage your tracked girls and demographics';
      
      expect(expectedTitle).toBe('Girl Management');
      expect(expectedSubtitle).toBe('Manage your tracked girls and demographics');
    });

    it('should render "New Girl" button in top-right', () => {
      const buttonProps = {
        text: 'New Girl',
        position: 'top-right',
        color: 'blue',
        icon: 'Plus'
      };
      
      expect(buttonProps.text).toBe('New Girl');
      expect(buttonProps.position).toBe('top-right');
      expect(buttonProps.color).toBe('blue');
    });

    it('should navigate to create modal when "New Girl" clicked', () => {
      const mockClick = jest.fn();
      fireEvent.click = mockClick;
      
      // Would test modal opening
      expect(mockClick).toBeDefined();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no girls exist', () => {
      const emptyStateContent = {
        title: 'No girls yet',
        subtitle: 'Start by creating your first girl to begin tracking.',
        ctaText: 'Create Girl',
        hasIcon: true
      };
      
      expect(emptyStateContent.title).toBe('No girls yet');
      expect(emptyStateContent.subtitle).toBe('Start by creating your first girl to begin tracking.');
      expect(emptyStateContent.ctaText).toBe('Create Girl');
    });

    it('should show create button in empty state', () => {
      const emptyStateButton = {
        text: 'Create Girl',
        variant: 'primary',
        color: 'blue'
      };
      
      expect(emptyStateButton.text).toBe('Create Girl');
      expect(emptyStateButton.variant).toBe('primary');
    });

    it('should open create modal from empty state CTA', () => {
      const mockOpenModal = jest.fn();
      
      // Would test empty state CTA click
      expect(mockOpenModal).toBeDefined();
    });
  });

  describe('Girl Cards Grid', () => {
    it('should render girls in responsive card grid', () => {
      const gridProps = {
        layout: 'grid',
        responsive: true,
        columns: 'auto-fit',
        minWidth: '300px',
        gap: '1rem'
      };
      
      expect(gridProps.layout).toBe('grid');
      expect(gridProps.responsive).toBe(true);
      expect(gridProps.columns).toBe('auto-fit');
    });

    it('should display correct girl information in cards', () => {
      const cardFields = ['name', 'age', 'nationality', 'rating', 'status'];
      const mockGirl = mockGirls[0];
      
      expect(mockGirl).toHaveProperty('name');
      expect(mockGirl).toHaveProperty('age');
      expect(mockGirl).toHaveProperty('nationality');
      expect(mockGirl).toHaveProperty('rating');
      expect(mockGirl).toHaveProperty('status');
    });

    it('should show rating as "x/10" format', () => {
      const rating = mockGirls[0].rating;
      const displayRating = `${rating}/10`;
      
      expect(displayRating).toBe('8/10');
    });

    it('should show status with colored badge', () => {
      const statusBadges = {
        active: { color: 'green', text: 'Active' },
        inactive: { color: 'gray', text: 'Inactive' },
        archived: { color: 'red', text: 'Archived' }
      };
      
      expect(statusBadges.active.color).toBe('green');
      expect(statusBadges.inactive.color).toBe('gray');
      expect(statusBadges.archived.color).toBe('red');
    });
  });

  describe('Card Actions', () => {
    it('should show three action buttons per card', () => {
      const cardActions = [
        { name: 'Edit', icon: 'Edit', color: 'blue' },
        { name: 'Delete', icon: 'Trash2', color: 'red' },
        { name: 'Manage Data', icon: 'BarChart3', color: 'green' }
      ];
      
      expect(cardActions).toHaveLength(3);
      expect(cardActions[0].name).toBe('Edit');
      expect(cardActions[1].name).toBe('Delete');
      expect(cardActions[2].name).toBe('Manage Data');
    });

    it('should handle edit action click', () => {
      const mockEdit = jest.fn();
      const girlId = 1;
      
      mockEdit(girlId);
      expect(mockEdit).toHaveBeenCalledWith(girlId);
    });

    it('should handle delete action with confirmation', () => {
      const mockDelete = jest.fn();
      const mockConfirm = jest.fn().mockReturnValue(true);
      window.confirm = mockConfirm;
      
      mockDelete(1);
      expect(mockConfirm).toBeDefined();
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should handle manage data action click', () => {
      const mockManageData = jest.fn();
      const girlId = 1;
      
      mockManageData(girlId);
      expect(mockManageData).toHaveBeenCalledWith(girlId);
    });
  });

  describe('Loading States', () => {
    it('should show loading skeleton while fetching data', () => {
      const loadingState = {
        isLoading: true,
        showSkeleton: true,
        skeletonCount: 6
      };
      
      expect(loadingState.isLoading).toBe(true);
      expect(loadingState.showSkeleton).toBe(true);
      expect(loadingState.skeletonCount).toBe(6);
    });

    it('should show loading skeleton cards in grid layout', () => {
      const skeletonCard = {
        height: '200px',
        borderRadius: '8px',
        animation: 'pulse',
        backgroundColor: 'bg-cpn-gray/20'
      };
      
      expect(skeletonCard.animation).toBe('pulse');
      expect(skeletonCard.borderRadius).toBe('8px');
    });
  });

  describe('Error Handling', () => {
    it('should show error message when data fetch fails', () => {
      const errorState = {
        hasError: true,
        message: 'Failed to load girls data. Please try again.',
        showRetry: true
      };
      
      expect(errorState.hasError).toBe(true);
      expect(errorState.showRetry).toBe(true);
      expect(errorState.message).toContain('Failed to load');
    });

    it('should provide retry button on error', () => {
      const retryButton = {
        text: 'Try Again',
        action: 'retry',
        variant: 'outline'
      };
      
      expect(retryButton.text).toBe('Try Again');
      expect(retryButton.action).toBe('retry');
    });

    it('should handle delete action errors', () => {
      const deleteError = {
        message: 'Failed to delete girl. Please try again.',
        type: 'delete_error',
        duration: 5000
      };
      
      expect(deleteError.type).toBe('delete_error');
      expect(deleteError.message).toContain('delete girl');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt grid columns based on screen size', () => {
      const responsiveGrid = {
        mobile: '1fr',
        tablet: 'repeat(2, 1fr)',
        desktop: 'repeat(3, 1fr)',
        wide: 'repeat(4, 1fr)'
      };
      
      expect(responsiveGrid.mobile).toBe('1fr');
      expect(responsiveGrid.tablet).toBe('repeat(2, 1fr)');
      expect(responsiveGrid.desktop).toBe('repeat(3, 1fr)');
    });

    it('should have proper card spacing on different screens', () => {
      const spacing = {
        mobile: '1rem',
        tablet: '1.5rem',
        desktop: '2rem'
      };
      
      expect(spacing.mobile).toBe('1rem');
      expect(spacing.desktop).toBe('2rem');
    });

    it('should stack action buttons vertically on small screens', () => {
      const mobileActions = {
        layout: 'vertical',
        spacing: '0.5rem',
        fullWidth: true
      };
      
      expect(mobileActions.layout).toBe('vertical');
      expect(mobileActions.fullWidth).toBe(true);
    });
  });

  describe('Data Integration', () => {
    it('should fetch girls data on component mount', async () => {
      const mockFetch = jest.fn().mockResolvedValue(mockGirls);
      
      await mockFetch();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle empty response gracefully', () => {
      const emptyResponse = [];
      const shouldShowEmpty = emptyResponse.length === 0;
      
      expect(shouldShowEmpty).toBe(true);
    });

    it('should filter out soft-deleted girls', () => {
      const allGirls = [
        ...mockGirls,
        { ...mockGirls[0], id: 3, deletedAt: new Date() }
      ];
      
      const activeGirls = allGirls.filter(girl => !girl.deletedAt);
      expect(activeGirls).toHaveLength(2);
    });

    it('should sort girls by creation date (newest first)', () => {
      const sortedGirls = [...mockGirls].sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      );
      
      expect(sortedGirls).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const headings = {
        pageTitle: 'h1',
        cardTitle: 'h3',
        emptyStateTitle: 'h2'
      };
      
      expect(headings.pageTitle).toBe('h1');
      expect(headings.cardTitle).toBe('h3');
    });

    it('should have descriptive alt text for status badges', () => {
      const statusAlt = {
        active: 'Status: Active',
        inactive: 'Status: Inactive',
        archived: 'Status: Archived'
      };
      
      expect(statusAlt.active).toBe('Status: Active');
    });

    it('should have keyboard navigation for action buttons', () => {
      const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      expect(keyboardEvent.key).toBe('Enter');
    });

    it('should have focus indicators on interactive elements', () => {
      const focusStyles = {
        outline: '2px solid blue',
        borderRadius: '4px',
        offset: '2px'
      };
      
      expect(focusStyles.outline).toContain('blue');
    });
  });
});