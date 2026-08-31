'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faSpinner } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

interface CustomExportButtonProps {
  /** Async function that returns the data to export (array of objects) */
  fetchData: () => Promise<any[]>;
  /** Filename for the downloaded CSV (default: 'export.csv') */
  filename?: string;
  /** Column headers mapping: if provided, uses these as headers in the CSV.
   * If not provided, uses the keys from the first object. */
  columnHeaders?: string[];
  /** Array of keys to include in the export (in order). Default: all keys. */
  columns?: string[];
  /** Button text (default: 'Export CSV') */
  buttonText?: string;
  /** Additional CSS classes for the button */
  className?: string;
  /** Whether to show the button as an icon-only button (default: false) */
  iconOnly?: boolean;
}

const CustomExportButton: React.FC<CustomExportButtonProps> = ({
  fetchData,
  filename = 'export.csv',
  columnHeaders,
  columns,
  buttonText = 'Export CSV',
  className = '',
  iconOnly = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Helper: convert array of objects to CSV string
  const convertToCSV = (data: any[], headers?: string[], cols?: string[]): string => {
    if (!data || data.length === 0) return '';

    // Determine columns: if cols provided, use them; otherwise, use keys from first row
    const keys = cols || Object.keys(data[0]);
    const headerRow = headers || keys;

    // Escape a value for CSV (wrap in quotes if contains comma, quote, or newline)
    const escape = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV rows
    const rows = data.map((item) =>
      keys.map((key) => escape(item[key])).join(',')
    );

    // Combine header and rows
    return [headerRow.join(','), ...rows].join('\n');
  };

  const handleExport = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // 1. Fetch data
      const data = await fetchData();

      if (!data || data.length === 0) {
        toast.error('No data available to export.');
        setIsLoading(false);
        return;
      }

      // 2. Convert to CSV
      const csv = convertToCSV(data, columnHeaders, columns);

      // 3. Create a Blob and trigger download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${data.length} records successfully.`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg 
        bg-green-500 text-white cursor-pointer hover:bg-green-400 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faFileExport} />
          {!iconOnly && <span>{buttonText}</span>}
        </>
      )}
    </button>
  );
};

export default CustomExportButton;