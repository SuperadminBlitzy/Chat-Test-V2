import React from 'react'; // react@18.2+
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'; // @testing-library/react@14.1+
import { jest, describe, it, expect, beforeEach } from '@jest/globals'; // @jest/globals@29.7+
import DataTable, { DataTableColumnDef, BulkAction } from '../../../src/components/common/DataTable';

// Mock data interface for testing
interface MockUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  balance: number;
  lastLogin: string;
}

// Mock user data for comprehensive testing scenarios
const mockUsers: MockUser[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Customer',
    status: 'active',
    balance: 25000.50,
    lastLogin: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Advisor',
    status: 'active',
    balance: 45000.75,
    lastLogin: '2024-01-14T14:20:00Z'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Customer',
    status: 'inactive',
    balance: 15000.25,
    lastLogin: '2024-01-10T09:15:00Z'
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'ComplianceOfficer',
    status: 'pending',
    balance: 35000.00,
    lastLogin: '2024-01-12T16:45:00Z'
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    role: 'Customer',
    status: 'active',
    balance: 55000.80,
    lastLogin: '2024-01-16T08:30:00Z'
  }
];

// Column definitions for the mock DataTable
const mockColumns: DataTableColumnDef<MockUser>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
    cell: ({ row }) => (
      <div className="font-medium text-gray-900">
        {row.getValue('name')}
      </div>
    )
  },
  {
    accessorKey: 'email',
    header: 'Email Address',
    enableSorting: true,
    cell: ({ row }) => (
      <div className="text-gray-600">
        {row.getValue('email')}
      </div>
    )
  },
  {
    accessorKey: 'role',
    header: 'Role',
    enableSorting: true,
    cell: ({ row }) => (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
        {row.getValue('role')}
      </span>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800'
      };
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
          {status}
        </span>
      );
    }
  },
  {
    accessorKey: 'balance',
    header: 'Account Balance',
    enableSorting: true,
    cell: ({ row }) => {
      const balance = row.getValue('balance') as number;
      return (
        <div className="text-right font-mono">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      );
    }
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
    enableSorting: true,
    cell: ({ row }) => {
      const lastLogin = row.getValue('lastLogin') as string;
      const date = new Date(lastLogin);
      return (
        <div className="text-gray-600">
          {date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      );
    }
  }
];

// Mock bulk actions for testing bulk operations
const mockBulkActions: BulkAction<MockUser>[] = [
  {
    id: 'activate',
    label: 'Activate Users',
    icon: 'user',
    onAction: jest.fn(),
    destructive: false
  },
  {
    id: 'deactivate',
    label: 'Deactivate Users',
    icon: 'user',
    onAction: jest.fn(),
    destructive: true
  },
  {
    id: 'export',
    label: 'Export Selected',
    icon: 'download',
    onAction: jest.fn(),
    destructive: false
  }
];

// Mock callback functions for testing component interactions
const mockCallbacks = {
  onRowSelectionChange: jest.fn(),
  onSortingChange: jest.fn(),
  onPaginationChange: jest.fn(),
  onRowClick: jest.fn()
};

describe('DataTable Component', () => {
  // Reset all mocks before each test to ensure clean state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the table with headers and data', () => {
    // Render the DataTable component with mock data and columns
    render(
      <DataTable
        data={mockUsers}
        columns={mockColumns}
        data-testid="user-data-table"
      />
    );

    // Verify that all column headers are present in the document
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Account Balance')).toBeInTheDocument();
    expect(screen.getByText('Last Login')).toBeInTheDocument();

    // Verify that the correct number of data rows are rendered
    const dataRows = screen.getAllByTestId(/table-row-/);
    expect(dataRows).toHaveLength(mockUsers.length);

    // Verify that specific user data appears in the table
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();

    // Verify that formatted data appears correctly
    expect(screen.getByText('$25,000.50')).toBeInTheDocument();
    expect(screen.getByText('$45,000.75')).toBeInTheDocument();

    // Verify status badges are rendered with proper styling
    const activeStatuses = screen.getAllByText('active');
    expect(activeStatuses.length).toBeGreaterThan(0);
    
    const inactiveStatus = screen.getByText('inactive');
    expect(inactiveStatus).toBeInTheDocument();
    
    const pendingStatus = screen.getByText('pending');
    expect(pendingStatus).toBeInTheDocument();
  });

  it('should display an empty state when no data is provided', () => {
    // Render the DataTable component with an empty data array
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
        emptyState={{
          title: 'No users found',
          message: 'There are no user records to display at this time.',
          iconName: 'user'
        }}
        data-testid="empty-data-table"
      />
    );

    // Verify that the empty state is displayed instead of table data
    expect(screen.getByText('No users found')).toBeInTheDocument();
    expect(screen.getByText('There are no user records to display at this time.')).toBeInTheDocument();
    
    // Verify that the table headers are not present when data is empty
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(screen.queryByText('Email Address')).not.toBeInTheDocument();
    
    // Verify that the empty state container has the correct test ID
    expect(screen.getByTestId('empty-data-table-empty')).toBeInTheDocument();
  });

  it('should display a loading indicator when loading', () => {
    // Render the DataTable component with loading state enabled
    render(
      <DataTable
        data={mockUsers}
        columns={mockColumns}
        isLoading={true}
        loadingMessage="Loading user data..."
        data-testid="loading-data-table"
      />
    );

    // Verify that the loading spinner component is present
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading content, please wait')).toBeInTheDocument();
    
    // Verify that the custom loading message is displayed
    expect(screen.getByText('Loading user data...')).toBeInTheDocument();
    
    // Verify that table data is not rendered during loading state
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    
    // Verify that the loading container has the correct test ID
    expect(screen.getByTestId('loading-data-table-loading')).toBeInTheDocument();
  });

  it('should sort the data when a column header is clicked', async () => {
    // Render the DataTable component with sorting enabled
    render(
      <DataTable
        data={mockUsers}
        columns={mockColumns}
        enableSorting={true}
        onSortingChange={mockCallbacks.onSortingChange}
        data-testid="sortable-data-table"
      />
    );

    // Find the Name column header which should be sortable
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toBeInTheDocument();
    expect(nameHeader).toHaveAttribute('role', 'button');

    // Click the Name column header to trigger ascending sort
    fireEvent.click(nameHeader!);

    // Wait for sorting to complete and verify callback was called
    await waitFor(() => {
      expect(mockCallbacks.onSortingChange).toHaveBeenCalledWith([
        { id: 'name', desc: false }
      ]);
    });

    // Verify that sort icon appears after clicking
    const sortIcon = nameHeader!.querySelector('svg');
    expect(sortIcon).toBeInTheDocument();

    // Click the same header again to trigger descending sort
    fireEvent.click(nameHeader!);

    await waitFor(() => {
      expect(mockCallbacks.onSortingChange).toHaveBeenCalledWith([
        { id: 'name', desc: true }
      ]);
    });

    // Test sorting on a different column (Account Balance)
    const balanceHeader = screen.getByText('Account Balance').closest('th');
    expect(balanceHeader).toBeInTheDocument();
    
    fireEvent.click(balanceHeader!);

    await waitFor(() => {
      expect(mockCallbacks.onSortingChange).toHaveBeenCalledWith([
        { id: 'balance', desc: false }
      ]);
    });
  });

  it('should handle pagination correctly', async () => {
    // Create a larger dataset to test pagination
    const largeDataset = Array.from({ length: 25 }, (_, index) => ({
      id: index + 1,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      role: 'Customer',
      status: 'active' as const,
      balance: (index + 1) * 1000,
      lastLogin: '2024-01-15T10:30:00Z'
    }));

    // Render DataTable with pagination enabled and small page size
    render(
      <DataTable
        data={largeDataset}
        columns={mockColumns}
        enablePagination={true}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20]}
        onPaginationChange={mockCallbacks.onPaginationChange}
        data-testid="paginated-data-table"
      />
    );

    // Verify that pagination controls are visible
    expect(screen.getByTestId('pagination-container')).toBeInTheDocument();
    
    // Verify that only the first page of data is displayed (10 items)
    const visibleRows = screen.getAllByTestId(/table-row-/);
    expect(visibleRows).toHaveLength(10);
    
    // Verify that the first page shows users 1-10
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 10')).toBeInTheDocument();
    expect(screen.queryByText('User 11')).not.toBeInTheDocument();

    // Verify pagination info is displayed correctly
    expect(screen.getByText('Showing 1 to 10 of 25 results')).toBeInTheDocument();

    // Click the "Next" page button
    const nextButton = screen.getByTestId('pagination-next');
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).not.toBeDisabled();
    
    fireEvent.click(nextButton);

    // Wait for pagination to update
    await waitFor(() => {
      expect(mockCallbacks.onPaginationChange).toHaveBeenCalledWith({
        pageIndex: 1,
        pageSize: 10
      });
    });

    // Test clicking on a specific page number
    const pageButton = screen.getByTestId('pagination-page-3');
    fireEvent.click(pageButton);

    await waitFor(() => {
      expect(mockCallbacks.onPaginationChange).toHaveBeenCalledWith({
        pageIndex: 2,
        pageSize: 10
      });
    });

    // Test page size change
    const pageSizeSelect = screen.getByLabelText('Rows per page');
    fireEvent.change(pageSizeSelect, { target: { value: '20' } });

    await waitFor(() => {
      expect(mockCallbacks.onPaginationChange).toHaveBeenCalled();
    });
  });

  it('should handle row selection', async () => {
    // Render DataTable with bulk actions enabled
    render(
      <DataTable
        data={mockUsers}
        columns={mockColumns}
        enableBulkActions={true}
        bulkActions={mockBulkActions}
        onRowSelectionChange={mockCallbacks.onRowSelectionChange}
        data-testid="selectable-data-table"
      />
    );

    // Verify that selection checkboxes are present
    const selectAllCheckbox = screen.getByLabelText('Select all rows on this page');
    expect(selectAllCheckbox).toBeInTheDocument();
    expect(selectAllCheckbox).not.toBeChecked();

    // Find the checkbox for the first row
    const firstRowCheckbox = screen.getByLabelText('Select row 1');
    expect(firstRowCheckbox).toBeInTheDocument();
    expect(firstRowCheckbox).not.toBeChecked();

    // Click the checkbox for the first row
    fireEvent.click(firstRowCheckbox);

    // Verify that the row selection callback was called
    await waitFor(() => {
      expect(mockCallbacks.onRowSelectionChange).toHaveBeenCalled();
    });

    // Verify that the checkbox is now checked
    expect(firstRowCheckbox).toBeChecked();

    // Verify that bulk actions are now visible
    expect(screen.getByText('1 row selected')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-action-activate')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-action-deactivate')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-action-export')).toBeInTheDocument();

    // Select a second row
    const secondRowCheckbox = screen.getByLabelText('Select row 2');
    fireEvent.click(secondRowCheckbox);

    await waitFor(() => {
      expect(screen.getByText('2 rows selected')).toBeInTheDocument();
    });

    // Test "select all" functionality
    fireEvent.click(selectAllCheckbox);

    await waitFor(() => {
      expect(screen.getByText(`${mockUsers.length} rows selected`)).toBeInTheDocument();
    });

    // Verify that all individual checkboxes are now checked
    const individualCheckboxes = screen.getAllByLabelText(/Select row \d+/);
    individualCheckboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });

    // Test bulk action execution
    const activateButton = screen.getByTestId('bulk-action-activate');
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(mockBulkActions[0].onAction).toHaveBeenCalled();
    });
  });

  it('should handle global filtering', async () => {
    // Render DataTable with global filtering enabled
    render(
      <DataTable
        data={mockUsers}
        columns={mockColumns}
        enableGlobalFilter={true}
        globalFilterPlaceholder="Search users..."
        data-testid="filterable-data-table"
      />
    );

    // Find the global filter input
    const filterInput = screen.getByPlaceholderText('Search users...');
    expect(filterInput).toBeInTheDocument();

    // Initially, all users should be visible
    expect(screen.getAllByTestId(/table-row-/)).toHaveLength(mockUsers.length);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Type in the filter input to search for "John"
    fireEvent.change(filterInput, { target: { value: 'John' } });

    // Wait for filtering to apply
    await waitFor(() => {
      const visibleRows = screen.getAllByTestId(/table-row-/);
      // Should show both "John Doe" and "Bob Johnson" as they both contain "john"
      expect(visibleRows.length).toBeLessThan(mockUsers.length);
    });

    // Verify that John Doe is still visible
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Test more specific search
    fireEvent.change(filterInput, { target: { value: 'jane.smith@example.com' } });

    await waitFor(() => {
      const visibleRows = screen.getAllByTestId(/table-row-/);
      expect(visibleRows).toHaveLength(1);
    });

    // Verify that only Jane Smith is visible
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();

    // Clear the filter
    fireEvent.change(filterInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getAllByTestId(/table-row-/)).toHaveLength(mockUsers.length);
    });
  });

  it('should handle row click events', async () => {
    // Render DataTable with row click enabled
    render(
      <DataTable
        data={mockUsers}
        columns={mockColumns}
        enableRowClick={true}
        onRowClick={mockCallbacks.onRowClick}
        data-testid="clickable-data-table"
      />
    );

    // Find the first data row
    const firstRow = screen.getByTestId('table-row-0');
    expect(firstRow).toBeInTheDocument();
    expect(firstRow).toHaveClass('cursor-pointer');

    // Click on the first row
    fireEvent.click(firstRow);

    // Verify that the row click callback was called
    await waitFor(() => {
      expect(mockCallbacks.onRowClick).toHaveBeenCalled();
    });

    // Verify the callback was called with the correct row data
    const callArgs = mockCallbacks.onRowClick.mock.calls[0];
    expect(callArgs).toBeDefined();
    expect(callArgs[0]).toBeDefined();
    expect(callArgs[0].original).toEqual(mockUsers[0]);
  });

  it('should handle column visibility controls', () => {
    // Render DataTable with column visibility enabled
    render(
      <DataTable
        data={mockUsers}
        columns={mockColumns}
        enableColumnVisibility={true}
        data-testid="visibility-data-table"
      />
    );

    // All columns should be visible initially
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Account Balance')).toBeInTheDocument();
    expect(screen.getByText('Last Login')).toBeInTheDocument();

    // Verify that data from all columns is visible
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('$25,000.50')).toBeInTheDocument();
  });

  it('should handle custom empty state configuration', () => {
    // Test custom empty state with action button
    const mockActionClick = jest.fn();
    
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
        emptyState={{
          title: 'No Financial Data Available',
          message: 'Start by importing your financial records or creating new transactions.',
          actionText: 'Import Data',
          onActionClick: mockActionClick,
          iconName: 'transactions'
        }}
        data-testid="custom-empty-data-table"
      />
    );

    // Verify custom empty state content
    expect(screen.getByText('No Financial Data Available')).toBeInTheDocument();
    expect(screen.getByText('Start by importing your financial records or creating new transactions.')).toBeInTheDocument();
    
    // Verify action button is present and clickable
    const actionButton = screen.getByText('Import Data');
    expect(actionButton).toBeInTheDocument();
    
    fireEvent.click(actionButton);
    expect(mockActionClick).toHaveBeenCalledTimes(1);
  });

  it('should handle disabled bulk actions', () => {
    // Create bulk actions with one disabled
    const disabledBulkActions: BulkAction<MockUser>[] = [
      {
        id: 'activate',
        label: 'Activate Users',
        icon: 'user',
        onAction: jest.fn(),
        disabled: false
      },
      {
        id: 'delete',
        label: 'Delete Users',
        icon: 'trash',
        onAction: jest.fn(),
        disabled: true,
        destructive: true
      }
    ];

    render(
      <DataTable
        data={mockUsers}
        columns={mockColumns}
        enableBulkActions={true}
        bulkActions={disabledBulkActions}
        data-testid="disabled-bulk-actions-table"
      />
    );

    // Select a row to show bulk actions
    const firstRowCheckbox = screen.getByLabelText('Select row 1');
    fireEvent.click(firstRowCheckbox);

    // Verify that enabled action is clickable
    const activateButton = screen.getByTestId('bulk-action-activate');
    expect(activateButton).toBeInTheDocument();
    expect(activateButton).not.toBeDisabled();

    // Verify that disabled action is disabled
    const deleteButton = screen.getByTestId('bulk-action-delete');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();
  });

  it('should handle edge cases and error conditions', () => {
    // Test with malformed data
    const malformedData = [
      { id: 1, name: null, email: '', role: undefined },
      { id: 2, name: 'Valid User', email: 'valid@example.com', role: 'Customer' }
    ];

    // Should not crash with malformed data
    expect(() => {
      render(
        <DataTable
          data={malformedData as any}
          columns={mockColumns}
          data-testid="malformed-data-table"
        />
      );
    }).not.toThrow();

    // Test with no columns
    expect(() => {
      render(
        <DataTable
          data={mockUsers}
          columns={[]}
          data-testid="no-columns-table"
        />
      );
    }).not.toThrow();
  });

  it('should maintain accessibility standards', () => {
    render(
      <DataTable
        data={mockUsers}
        columns={mockColumns}
        enableBulkActions={true}
        enableSorting={true}
        data-testid="accessible-data-table"
      />
    );

    // Verify table structure for screen readers
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Verify that sortable columns have proper ARIA attributes
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveAttribute('role', 'button');
    expect(nameHeader).toHaveAttribute('aria-sort', 'none');
    expect(nameHeader).toHaveAttribute('tabindex', '0');

    // Verify that checkboxes have proper labels
    const selectAllCheckbox = screen.getByLabelText('Select all rows on this page');
    expect(selectAllCheckbox).toBeInTheDocument();

    const individualCheckboxes = screen.getAllByLabelText(/Select row \d+/);
    expect(individualCheckboxes.length).toBe(mockUsers.length);

    // Verify table navigation structure
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders.length).toBeGreaterThan(0);

    const rowHeaders = screen.getAllByRole('row');
    expect(rowHeaders.length).toBe(mockUsers.length + 1); // +1 for header row
  });

  it('should perform efficiently with large datasets', () => {
    // Create a large dataset to test performance
    const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
      id: index + 1,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      role: index % 3 === 0 ? 'Admin' : index % 2 === 0 ? 'User' : 'Guest',
      status: index % 2 === 0 ? 'active' as const : 'inactive' as const,
      balance: Math.random() * 100000,
      lastLogin: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
    }));

    const startTime = performance.now();

    render(
      <DataTable
        data={largeDataset}
        columns={mockColumns}
        enablePagination={true}
        initialPageSize={50}
        data-testid="large-dataset-table"
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Verify that rendering completes within reasonable time (less than 1 second)
    expect(renderTime).toBeLessThan(1000);

    // Verify that only paginated data is rendered (not all 1000 items)
    const visibleRows = screen.getAllByTestId(/table-row-/);
    expect(visibleRows).toHaveLength(50);

    // Verify that pagination info reflects the large dataset
    expect(screen.getByText('Showing 1 to 50 of 1000 results')).toBeInTheDocument();
  });
});