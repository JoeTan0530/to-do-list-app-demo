'use client';

import React, { useState, useId, useEffect } from 'react';
import Datepicker from 'react-tailwindcss-datepicker';

// ============================================================
// Types
// ============================================================
type DateValue = { startDate: Date | null; endDate: Date | null } | null;

interface CustomDatePickerProps {
  dateID: string;
  // Parent can provide: 
  // - string (single date) when asSingle=true
  // - { startDate: string; endDate: string } when asSingle=false
  // - null or undefined
  value?: string | { startDate: string; endDate: string } | null;
  onChange?: (event: { target: { id: string; value: any } }) => void;
  asSingle?: boolean;
  showShortcuts?: boolean;
  placeholder?: string;
  containerClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
}

// Helper to check if value is a range object
function isRangeValue(val: any): val is { startDate: string; endDate: string } {
  return val && typeof val === 'object' && 'startDate' in val && 'endDate' in val;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = (props) => {
  const {
    dateID,
    value,
    onChange,
    asSingle = false,
    showShortcuts = false,
    placeholder = 'Select a date',
    containerClassName = '',
    inputClassName = '',
    disabled = false,
  } = props;

  const uniqueID = useId();
  const dateContainerID = dateID || `date-picker-${uniqueID}`;

  // Internal state: always holds { startDate, endDate } with Date objects or null
  const [internalValue, setInternalValue] = useState<DateValue>({
    startDate: null,
    endDate: null,
  });

  // Sync internal state with parent's value prop
  useEffect(() => {
    if (value === undefined || value === null) {
      // If no value, reset to null
      setInternalValue({ startDate: null, endDate: null });
      return;
    }

    if (asSingle) {
      // value should be a string (single date)
      const dateString = typeof value === 'string' ? value : '';
      const parsedDate = dateString ? new Date(dateString) : null;
      const validDate = parsedDate instanceof Date && !isNaN(parsedDate.getTime()) ? parsedDate : null;
      setInternalValue({
        startDate: validDate,
        endDate: validDate,
      });
    } else {
      // value should be an object with startDate and endDate strings
      if (isRangeValue(value)) {
        const start = value.startDate ? new Date(value.startDate) : null;
        const end = value.endDate ? new Date(value.endDate) : null;
        setInternalValue({
          startDate: start instanceof Date && !isNaN(start.getTime()) ? start : null,
          endDate: end instanceof Date && !isNaN(end.getTime()) ? end : null,
        });
      } else {
        // fallback: reset
        setInternalValue({ startDate: null, endDate: null });
      }
    }
  }, [value, asSingle]);

  // Format a Date to YYYY-MM-DD (for display)
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Convert Date to ISO string (for sending to parent)
  const getUTCDate = (dateObj: Date | null): string => {
    if (!dateObj) return '';
    return dateObj.toISOString(); // e.g., "2026-08-31T00:00:00.000Z"
  };

  const handleValueChange = (newValue: any) => {
    // newValue is expected to be { startDate: Date | null, endDate: Date | null }
    setInternalValue(newValue);

    if (onChange) {
      let formattedValue;
      if (asSingle) {
        // Only send the start date as a string
        formattedValue = newValue?.startDate ? getUTCDate(newValue.startDate) : '';
      } else {
        // Send both as strings
        formattedValue = {
          startDate: newValue?.startDate ? getUTCDate(newValue.startDate) : '',
          endDate: newValue?.endDate ? getUTCDate(newValue.endDate) : '',
        };
      }
      onChange({
        target: {
          id: dateID,
          value: formattedValue,
        },
      });
    }
  };

  return (
    <div key={dateContainerID} id={dateContainerID} className="relative datepicker-wrapper">
      <Datepicker
        value={internalValue}
        onChange={handleValueChange}
        asSingle={asSingle}
        useRange={!asSingle}
        showShortcuts={showShortcuts}
        placeholder={placeholder}
        disabled={disabled}
        containerClassName={`w-full ${containerClassName}`}
        inputClassName={`inline bg-gray-100 rounded-md border border-gray-300 h-10 w-full p-2 focus:outline-none ${inputClassName}`}
        displayFormat="YYYY-MM-DD"
      />
    </div>
  );
};

export default CustomDatePicker;