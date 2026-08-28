'use client';

import React, { useState, useId, useEffect } from 'react';
import Datepicker from 'react-tailwindcss-datepicker';

interface CustomDatePickerProps {
  dateID: string;
  value?: string | { startDate: string; endDate: string } | null;
  onChange?: (event: { target: { id: string; value: any } }) => void;
  asSingle?: boolean;
  showShortcuts?: boolean;
  placeholder?: string;
  containerClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
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

  // Internal state holds the raw Date objects (or null)
  const [internalValue, setInternalValue] = useState<any>({
    startDate: null,
    endDate: null,
  });

  // Sync internal state with parent's value prop when it changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      if (asSingle) {
        const date = typeof value === 'string' ? new Date(value) : value;
        setInternalValue(date instanceof Date && !isNaN(date.getTime()) ? date : null);
      } else {
        const start = value?.startDate ? new Date(value.startDate) : null;
        const end = value?.endDate ? new Date(value.endDate) : null;
        setInternalValue({
          startDate: start instanceof Date && !isNaN(start.getTime()) ? start : null,
          endDate: end instanceof Date && !isNaN(end.getTime()) ? end : null,
        });
      }
    }
  }, [value, asSingle]);

  // Format a Date to YYYY-MM-DD
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleValueChange = (newValue: any) => {
    setInternalValue(newValue);
    if (onChange) {
      let formattedValue;
      if (asSingle) {
        formattedValue = newValue?.startDate ? formatDate(newValue.startDate) : '';
      } else {
        formattedValue = {
          startDate: newValue?.startDate ? formatDate(newValue.startDate) : '',
          endDate: newValue?.endDate ? formatDate(newValue.endDate) : '',
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
        value={internalValue} // passes Date objects (or null)
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