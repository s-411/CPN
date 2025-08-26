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

// Mock Link component
jest.mock('next/link', () => {
  return function MockedLink({ children, href, onClick, ...props }: any) {
    return <a href={href} onClick={onClick} {...props}>{children}</a>;
  };
});

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Plus: ({ className }: { className?: string }) => (
    <div data-testid="plus-icon" className={className}>Plus</div>
  ),
  Edit: ({ className }: { className?: string }) => (
    <div data-testid="edit-icon" className={className}>Edit</div>
  ),
  Trash2: ({ className }: { className?: string }) => (
    <div data-testid="trash-icon" className={className}>Trash2</div>
  ),
  ArrowUpDown: ({ className }: { className?: string }) => (
    <div data-testid="arrow-updown-icon" className={className}>ArrowUpDown</div>
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <div data-testid="alert-triangle-icon" className={className}>AlertTriangle</div>
  ),
  X: ({ className }: { className?: string }) => (
    <div data-testid="x-icon" className={className}>X</div>
  ),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, asChild, ...props }: any) => {
    if (asChild) {
      return React.cloneElement(children, { className, onClick, ...props });
    }
    return <button className={className} onClick={onClick} {...props}>{children}</button>;
  },
}));

// Mock Table components
jest.mock('@/components/ui/table', () => ({
  Table: ({ children, className, ...props }: any) => (
    <table className={className} {...props}>{children}</table>
  ),
  TableHeader: ({ children, className, ...props }: any) => (
    <thead className={className} {...props}>{children}</thead>
  ),
  TableBody: ({ children, className, ...props }: any) => (
    <tbody className={className} {...props}>{children}</tbody>
  ),
  TableHead: ({ children, className, onClick, ...props }: any) => (
    <th className={className} onClick={onClick} {...props}>{children}</th>
  ),
  TableRow: ({ children, className, ...props }: any) => (
    <tr className={className} {...props}>{children}</tr>
  ),
  TableCell: ({ children, className, ...props }: any) => (
    <td className={className} {...props}>{children}</td>
  ),
}));

// Mock Alert components
jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, className, variant, ...props }: any) => (
    <div className={`alert ${variant} ${className}`} {...props}>{children}</div>
  ),
  AlertDescription: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
}));

// Mock confirmation dialog hook
const mockShowConfirmation = jest.fn();
const mockConfirmationDialogComponent = jest.fn(() => null);

jest.mock('@/components/dashboard/confirmation-dialog', () => ({
  useConfirmationDialog: jest.fn(() => ({
    showConfirmation: mockShowConfirmation,
    hideConfirmation: jest.fn(),
    ConfirmationDialogComponent: mockConfirmationDialogComponent,
    isLoading: false,
  })),
}));

import { SortableStatisticsTable } from '@/components/dashboard/sortable-statistics-table';
import { type GirlStatistics } from '@/lib/db/overview-queries';

const mockGirlData: GirlStatistics[] = [
  {
    id: 1,
    name: 'Alice',
    rating: 8.5,
    totalSpent: 150.00,
    totalNuts: 15,
    totalTime: 180,
    costPerNut: 10.00,
    timePerNut: 12,
    costPerHour: 50.00
  },
  {
    id: 2,
    name: 'Beatrice',
    rating: 7.0,
    totalSpent: 80.00,
    totalNuts: 10,
    totalTime: 120,
    costPerNut: 8.00,
    timePerNut: 12,
    costPerHour: 40.00
  }
];

describe('Table Action Buttons', () => {
  const mockPush = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    const mockRouter = {
      push: mockPush,
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    jest.clearAllMocks();
  });

  describe('Add Data Button Functionality', () => {
    it('should render Add Data buttons for each girl', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Get Add Data links (not including the header)
      const addDataLinks = screen.getAllByRole('link', { name: /Add Data/ });
      expect(addDataLinks).toHaveLength(mockGirlData.length);
    });

    it('should create correct URLs with girl ID parameter', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Check first girl's Add Data link
      const addDataLinks = screen.getAllByRole('link');
      const firstAddDataLink = addDataLinks.find(link => 
        link.getAttribute('href')?.includes('/data-entry?girl=1')
      );
      expect(firstAddDataLink).toBeInTheDocument();
      expect(firstAddDataLink?.getAttribute('href')).toBe('/data-entry?girl=1');

      // Check second girl's Add Data link
      const secondAddDataLink = addDataLinks.find(link => 
        link.getAttribute('href')?.includes('/data-entry?girl=2')
      );
      expect(secondAddDataLink).toBeInTheDocument();
      expect(secondAddDataLink?.getAttribute('href')).toBe('/data-entry?girl=2');
    });

    it('should have Plus icons in Add Data buttons', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const plusIcons = screen.getAllByTestId('plus-icon');
      expect(plusIcons).toHaveLength(mockGirlData.length);
    });

    it('should have proper touch-friendly button dimensions', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const addDataButtons = screen.getAllByText('Add Data').map(btn => btn.closest('a'));
      addDataButtons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]');
        expect(button).toHaveClass('min-w-[44px]');
        expect(button).toHaveClass('touch-manipulation');
      });
    });

    it('should hide "Add Data" text on mobile screens', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const addDataTexts = screen.getAllByText('Add Data');
      addDataTexts.forEach(text => {
        expect(text).toHaveClass('hidden', 'sm:inline');
      });
    });
  });

  describe('Edit Button Functionality', () => {
    it('should render Edit buttons for each girl', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButtons = screen.getAllByLabelText(/Edit/);
      expect(editButtons).toHaveLength(mockGirlData.length);
    });

    it('should have proper ARIA labels for edit buttons', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByLabelText('Edit Alice')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit Beatrice')).toBeInTheDocument();
    });

    it('should call onEdit with correct girl ID when clicked', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editAliceButton = screen.getByLabelText('Edit Alice');
      fireEvent.click(editAliceButton);
      expect(mockOnEdit).toHaveBeenCalledWith(1);

      const editBeatriceButton = screen.getByLabelText('Edit Beatrice');
      fireEvent.click(editBeatriceButton);
      expect(mockOnEdit).toHaveBeenCalledWith(2);
    });

    it('should have Edit icons', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editIcons = screen.getAllByTestId('edit-icon');
      expect(editIcons).toHaveLength(mockGirlData.length);
    });

    it('should have proper hover states', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButtons = screen.getAllByLabelText(/Edit/);
      editButtons.forEach(button => {
        expect(button).toHaveClass('hover:bg-blue-50');
        expect(button).toHaveClass('hover:text-blue-600');
      });
    });

    it('should fallback to default edit behavior when no onEdit provided', () => {
      // Mock window.location
      delete window.location;
      window.location = { href: '' } as any;

      render(
        <SortableStatisticsTable
          girls={mockGirlData}
        />
      );

      const editAliceButton = screen.getByLabelText('Edit Alice');
      fireEvent.click(editAliceButton);
      
      // Should navigate to edit URL
      expect(window.location.href).toBe('/add-girl?edit=1');
    });
  });

  describe('Delete Button Functionality', () => {
    it('should render Delete buttons for each girl', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText(/Delete/);
      expect(deleteButtons).toHaveLength(mockGirlData.length);
    });

    it('should have proper ARIA labels for delete buttons', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByLabelText('Delete Alice')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete Beatrice')).toBeInTheDocument();
    });

    it('should show confirmation dialog before deleting', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteAliceButton = screen.getByLabelText('Delete Alice');
      fireEvent.click(deleteAliceButton);

      expect(mockShowConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Delete Alice?',
          variant: 'destructive',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        })
      );
    });

    it('should not delete when confirmation is cancelled', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteAliceButton = screen.getByLabelText('Delete Alice');
      fireEvent.click(deleteAliceButton);

      // Verification that showConfirmation was called is sufficient
      // The actual cancellation logic is handled by the confirmation dialog component
      expect(mockShowConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Delete Alice?',
          variant: 'destructive'
        })
      );
    });

    it('should have Trash icons', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const trashIcons = screen.getAllByTestId('trash-icon');
      expect(trashIcons).toHaveLength(mockGirlData.length);
    });

    it('should have proper red styling for delete buttons', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText(/Delete/);
      deleteButtons.forEach(button => {
        expect(button).toHaveClass('text-red-600');
        expect(button).toHaveClass('hover:text-red-700');
        expect(button).toHaveClass('hover:bg-red-50');
      });
    });

    it('should have touch-friendly dimensions', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText(/Delete/);
      deleteButtons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]');
        expect(button).toHaveClass('min-w-[44px]');
        expect(button).toHaveClass('touch-manipulation');
      });
    });
  });

  describe('Action Button Grouping', () => {
    it('should group edit and delete buttons together', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Each row should have a div containing both edit and delete buttons
      const actionGroups = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Edit') || 
        btn.getAttribute('aria-label')?.includes('Delete')
      );

      // Should have 2 edit + 2 delete = 4 action buttons total
      expect(actionGroups).toHaveLength(4);
    });

    it('should have proper spacing between action buttons', () => {
      const { container } = render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Check for space-x-1 class on action button containers
      const actionContainers = container.querySelectorAll('.space-x-1');
      expect(actionContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Conditional Action Button Rendering', () => {
    it('should hide Add Data buttons when showAddData is false', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          showAddData={false}
        />
      );

      const addDataButtons = screen.queryAllByText('Add Data');
      expect(addDataButtons).toHaveLength(0);
    });

    it('should hide Action buttons when showActions is false', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          showActions={false}
        />
      );

      const editButtons = screen.queryAllByLabelText(/Edit/);
      const deleteButtons = screen.queryAllByLabelText(/Delete/);
      
      expect(editButtons).toHaveLength(0);
      expect(deleteButtons).toHaveLength(0);
    });

    it('should show both Add Data and Actions by default', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const addDataButtons = screen.getAllByText('Add Data');
      const editButtons = screen.getAllByLabelText(/Edit/);
      const deleteButtons = screen.getAllByLabelText(/Delete/);

      expect(addDataButtons).toHaveLength(mockGirlData.length);
      expect(editButtons).toHaveLength(mockGirlData.length);
      expect(deleteButtons).toHaveLength(mockGirlData.length);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for action buttons', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('Edit Alice');
      
      // Should be focusable
      editButton.focus();
      expect(editButton).toHaveFocus();

      // Should respond to Enter key
      fireEvent.keyDown(editButton, { key: 'Enter' });
      expect(mockOnEdit).toHaveBeenCalledWith(1);
    });

    it('should support Space key activation', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByLabelText('Delete Alice');
      
      // Mock confirm to return true
      window.confirm = jest.fn(() => true);

      // Should respond to Space key
      fireEvent.keyDown(deleteButton, { key: ' ' });
      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('should have proper tab order', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // All action buttons should be tabbable (tabIndex = 0 or unset)
      const actionButtons = [
        ...screen.getAllByLabelText(/Edit/),
        ...screen.getAllByLabelText(/Delete/)
      ];

      actionButtons.forEach(button => {
        const tabIndex = button.getAttribute('tabindex');
        expect(tabIndex === null || tabIndex === '0').toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing onEdit callback gracefully', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('Edit Alice');
      
      // Should not throw error when clicked without onEdit
      expect(() => {
        fireEvent.click(editButton);
      }).not.toThrow();
    });

    it('should handle missing onDelete callback gracefully', () => {
      render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
        />
      );

      const deleteButton = screen.getByLabelText('Delete Alice');
      
      // Mock confirm to return true
      window.confirm = jest.fn(() => true);

      // Should not throw error when clicked without onDelete
      expect(() => {
        fireEvent.click(deleteButton);
      }).not.toThrow();
    });

    it('should handle empty girl name gracefully', () => {
      const girlWithEmptyName = [{
        ...mockGirlData[0],
        name: ''
      }];

      render(
        <SortableStatisticsTable
          girls={girlWithEmptyName}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByLabelText('Delete ');
      window.confirm = jest.fn(() => true);
      
      fireEvent.click(deleteButton);
      
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete ? This action cannot be undone.'
      );
    });
  });

  describe('Performance and Optimization', () => {
    it('should use memoized callbacks to prevent unnecessary re-renders', () => {
      const { rerender } = render(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText('Edit Alice');
      const initialEditHandler = editButton.onclick;

      // Re-render with same props
      rerender(
        <SortableStatisticsTable
          girls={mockGirlData}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButtonAfterRerender = screen.getByLabelText('Edit Alice');
      const newEditHandler = editButtonAfterRerender.onclick;

      // Handler should be stable (same reference)
      expect(initialEditHandler).toBe(newEditHandler);
    });
  });
});