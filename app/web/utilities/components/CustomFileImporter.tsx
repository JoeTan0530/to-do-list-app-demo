'use client';

import React, { useRef, useState, useId } from 'react';
import { read, utils } from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFileCsv, faTimes } from '@fortawesome/free-solid-svg-icons';

interface CustomFileImporterProps {
  /** Unique ID for the component (optional) */
  id?: string;
  /** Callback when a file is successfully parsed */
  onFileParsed: (data: any[]) => void;
  /** Callback when an error occurs (e.g., invalid format) */
  onError?: (error: string) => void;
  /** Accepted file types (default: '.csv') */
  accept?: string;
  /** Text for the upload button (default: 'Upload CSV') */
  buttonText?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the button */
  buttonClassName?: string;
  /** Whether to show the file name after selection (default: true) */
  showFileName?: boolean;
  /** Whether the CSV has a header row (default: true). If false, the first row is data. */
  hasHeaderRow?: boolean;
  /** Optional column mapping: array of keys in order. Defaults to the specified order. */
  columnMapping?: string[];
  /** Fields that should be treated as dates and converted to ISO strings (default: ['due_date', 'completed_date']) */
  dateFields?: string[];
}

const CustomFileImporter: React.FC<CustomFileImporterProps> = ({
  id,
  onFileParsed,
  onError,
  accept = '.csv',
  buttonText = 'Upload CSV',
  className = '',
  buttonClassName = '',
  showFileName = true,
  hasHeaderRow = true,
  columnMapping = [
    'task_name',
    'task_description',
    'task_category',
    'status',
    'due_date',
    'completed_date',
    'order',
  ],
  dateFields = ['due_date', 'completed_date'],
}) => {
  const fallbackId = useId();
  const componentId = id || `file-importer-${fallbackId}`;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Helper: convert a date string to ISO 8601 (UTC)
  const convertToISO = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      let date: Date;
      // If it's a plain YYYY-MM-DD, treat as UTC midnight
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        date = new Date(dateStr + 'T00:00:00Z');
      } else {
        // Otherwise let the native parser handle it (with timezone)
        date = new Date(dateStr);
      }
      if (isNaN(date.getTime())) {
        return dateStr; // return original if invalid
      }
      return date.toISOString();
    } catch {
      return dateStr;
    }
  };

  // Trigger the hidden file input
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array', raw: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        // Get rows as array of arrays (each row is an array of cell values)
        const rows: any[][] = utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

        // Determine where data starts
        let startRow = 0;
        if (hasHeaderRow && rows.length > 0) {
          startRow = 1; // skip header row
        }

        // Map each row to an object using the columnMapping
        const parsedData: any[] = [];
        for (let i = startRow; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue; // skip empty rows

          const obj: any = {};
          for (let colIndex = 0; colIndex < columnMapping.length; colIndex++) {
            const key = columnMapping[colIndex];
            let value = row[colIndex] !== undefined ? row[colIndex] : '';
            // If this field is a date and value is not empty, convert to ISO
            if (dateFields.includes(key) && value) {
              value = convertToISO(value);
            }
            obj[key] = value;
          }
          parsedData.push(obj);
        }

        // Call the parent callback with the parsed data
        onFileParsed(parsedData);

        // Clear the file input (so the same file can be re-uploaded)
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        setIsUploading(false);
      } catch (error: any) {
        setIsUploading(false);
        const errorMsg = `Failed to parse CSV: ${error.message || 'Unknown error'}`;
        if (onError) {
          onError(errorMsg);
        } else {
          console.error(errorMsg);
        }
        setFileName('');
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      const errorMsg = 'Failed to read file.';
      if (onError) onError(errorMsg);
    };

    reader.readAsArrayBuffer(file);
  };

  // Clear the selected file
  const handleClear = () => {
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div id={componentId} className={`custom-file-importer ${className}`}>
      <div className="flex flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isUploading}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg 
            bg-blue-500 text-white cursor-pointer hover:bg-blue-400 
            disabled:opacity-50 disabled:cursor-not-allowed
            ${buttonClassName}
          `}
        >
          <FontAwesomeIcon icon={faUpload} />
          {buttonText}
        </button>

        {showFileName && fileName && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FontAwesomeIcon icon={faFileCsv} />
            <span>{fileName}</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-red-400 hover:text-red-600"
              title="Clear file"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id={`${componentId}-input`}
      />
    </div>
  );
};

export default CustomFileImporter;