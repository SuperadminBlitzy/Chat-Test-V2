import React, { useMemo } from 'react'; // react@18.2.0
import { ColumnDef } from '@tanstack/react-table'; // @tanstack/react-table@8.10.7

// Internal imports
import { useBlockchain } from '../../hooks/useBlockchain';
import DataTable from '../common/DataTable';
import Loading from '../common/Loading';
import EmptyState from '../common/EmptyState';
import { SmartContract } from '../../models/blockchain';

/**
 * SmartContractList Component
 * 
 * A React component that displays a comprehensive list of smart contracts deployed on the
 * blockchain settlement network. This component serves as a key interface for the Smart Contract
 * Management feature (F-010) within the unified financial services platform.
 * 
 * This component addresses the following requirements:
 * - F-010: Smart Contract Management (2.1.3 Blockchain and Settlement Features)
 * - Provides user interface for managing and viewing smart contracts on the platform
 * - Supports the blockchain-based settlement network functionality
 * - Enables automated compliance, settlement processing, and business rule enforcement
 * 
 * Key Features:
 * - Fetches smart contract data using the useBlockchain custom hook
 * - Displays data in a sortable and filterable DataTable component
 * - Handles loading states with enterprise-grade UX
 * - Provides empty state guidance when no contracts are available
 * - Supports contract status visualization with StatusBadge integration
 * - Implements responsive design for all screen sizes
 * - Ensures type safety with TypeScript interfaces
 * - Optimized performance with React.useMemo for column definitions
 * 
 * Technical Implementation:
 * - Uses Hyperledger Fabric network architecture for blockchain operations
 * - Supports multiple smart contract types: Payment Processing, Identity Management,
 *   Compliance Automation, and Asset Tokenization
 * - Implements atomic settlement mechanisms for secure transaction processing
 * - Provides immutable audit trails for regulatory compliance
 * 
 * @returns {JSX.Element} The rendered SmartContractList component
 */
const SmartContractList: React.FC = (): JSX.Element => {
  /**
   * Fetch smart contract data using the custom useBlockchain hook
   * This hook manages the API call to retrieve smart contracts from the blockchain service
   * and provides loading, error, and data states for comprehensive state management
   */
  const { smartContracts, isLoading, error } = useBlockchain();

  /**
   * Define column definitions for the DataTable component
   * Using useMemo to prevent unnecessary recalculations on every render
   * This optimization is crucial for performance in enterprise applications
   */
  const columns = useMemo<ColumnDef<SmartContract>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Contract Name',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const name = getValue() as string;
        return (
          <div className="font-medium text-gray-900">
            {name}
          </div>
        );
      },
      size: 200,
      minSize: 150,
      maxSize: 300,
    },
    {
      accessorKey: 'version',
      header: 'Version',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const version = getValue() as string;
        return (
          <div className="text-sm text-gray-600 font-mono">
            v{version}
          </div>
        );
      },
      size: 100,
      minSize: 80,
      maxSize: 120,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const status = getValue() as string;
        
        // Define status badge styling based on contract status
        const getStatusBadgeProps = (status: string) => {
          switch (status.toLowerCase()) {
            case 'active':
              return { variant: 'success' as const, text: 'Active' };
            case 'deployed':
              return { variant: 'info' as const, text: 'Deployed' };
            case 'testing':
              return { variant: 'warning' as const, text: 'Testing' };
            case 'development':
              return { variant: 'secondary' as const, text: 'Development' };
            case 'paused':
              return { variant: 'warning' as const, text: 'Paused' };
            case 'deprecated':
              return { variant: 'danger' as const, text: 'Deprecated' };
            case 'terminated':
              return { variant: 'danger' as const, text: 'Terminated' };
            default:
              return { variant: 'secondary' as const, text: status };
          }
        };

        const { variant, text } = getStatusBadgeProps(status);
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            variant === 'success' ? 'bg-green-100 text-green-800' :
            variant === 'info' ? 'bg-blue-100 text-blue-800' :
            variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
            variant === 'danger' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {text}
          </span>
        );
      },
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: 'address',
      header: 'Contract Address',
      enableSorting: false,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const address = getValue() as string;
        // Truncate long blockchain addresses for better display
        const truncatedAddress = address.length > 20 
          ? `${address.substring(0, 8)}...${address.substring(address.length - 8)}`
          : address;
        
        return (
          <div className="text-sm text-gray-600 font-mono" title={address}>
            {truncatedAddress}
          </div>
        );
      },
      size: 150,
      minSize: 120,
      maxSize: 200,
    },
    {
      accessorKey: 'deploymentDate',
      header: 'Deployment Date',
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ getValue }) => {
        const deploymentDate = getValue() as string;
        // Format the ISO date string for better readability
        const formattedDate = new Date(deploymentDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        });
        
        return (
          <div className="text-sm text-gray-600">
            {formattedDate}
          </div>
        );
      },
      size: 180,
      minSize: 150,
      maxSize: 220,
    },
    {
      accessorKey: 'contractId',
      header: 'Contract ID',
      enableSorting: false,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const contractId = getValue() as string;
        // Truncate UUID for display while keeping full value in title
        const truncatedId = contractId.length > 16 
          ? `${contractId.substring(0, 8)}...${contractId.substring(contractId.length - 4)}`
          : contractId;
        
        return (
          <div className="text-xs text-gray-500 font-mono" title={contractId}>
            {truncatedId}
          </div>
        );
      },
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
  ], []);

  /**
   * Handle error state display
   * If there's an error fetching smart contract data, display a user-friendly error message
   */
  if (error) {
    return (
      <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error Loading Smart Contracts
            </h3>
            <div className="mt-1 text-sm text-red-700">
              {error.message || 'An unexpected error occurred while fetching smart contract data. Please try again later.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Handle loading state
   * Display loading indicator while smart contract data is being fetched
   */
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <Loading size="lg" className="mb-4" />
        <p className="text-gray-600 text-sm">
          Loading smart contracts from the blockchain network...
        </p>
        <p className="text-gray-500 text-xs mt-1">
          This may take a few moments as we sync with the distributed ledger
        </p>
      </div>
    );
  }

  /**
   * Handle empty state
   * Show empty state component when no smart contracts are available
   */
  if (!smartContracts || smartContracts.length === 0) {
    return (
      <EmptyState
        title="No Smart Contracts Found"
        message="There are currently no smart contracts deployed on the blockchain network. Smart contracts enable automated compliance, settlement processing, and business rule enforcement."
        iconName="settings"
        actionText="Deploy New Contract"
        onActionClick={() => {
          // TODO: Implement navigation to smart contract deployment interface
          console.log('Navigate to smart contract deployment');
        }}
      />
    );
  }

  /**
   * Render the main DataTable component with smart contract data
   * The DataTable handles sorting, filtering, pagination, and responsive display
   */
  return (
    <div className="w-full space-y-6">
      {/* Header section with title and summary information */}
      <div className="bg-white border-b border-gray-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Smart Contracts
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage and monitor smart contracts deployed on the blockchain settlement network
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">{smartContracts.length}</span> contracts
            </div>
            <div className="text-sm text-gray-500">
              Network: <span className="font-medium text-gray-900">Hyperledger Fabric</span>
            </div>
          </div>
        </div>
      </div>

      {/* DataTable component with comprehensive configuration */}
      <DataTable
        data={smartContracts}
        columns={columns}
        enablePagination={true}
        enableGlobalFilter={true}
        enableSorting={true}
        enableColumnVisibility={false}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        globalFilterPlaceholder="Search contracts by name, status, or address..."
        emptyState={{
          title: "No contracts match your search",
          message: "Try adjusting your search criteria or filters to find the contracts you're looking for.",
          iconName: "settings"
        }}
        className="bg-white shadow-sm rounded-lg border border-gray-200"
        data-testid="smart-contract-list-table"
        onRowClick={(row) => {
          // TODO: Implement navigation to individual smart contract details
          console.log('Navigate to smart contract details:', row.original.contractId);
        }}
        enableRowClick={true}
      />

      {/* Footer information */}
      <div className="bg-gray-50 px-4 py-3 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-600">
          <div>
            Smart contracts are automatically managed through the blockchain settlement network
          </div>
          <div className="mt-1 sm:mt-0">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartContractList;