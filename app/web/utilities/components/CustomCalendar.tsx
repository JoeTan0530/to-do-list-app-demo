'use client';

import React, { useState, useMemo, useId, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  work: '#3b82f6', // blue
  personal: '#22c55e', // green
  urgent: '#ef4444', // red
};

interface Task {
  taskID: string;
  taskName: string;
  taskCategory: string;
  status: string;
  dueDate: string; // YYYY-MM-DD (UTC, but treated as a date without time)
}

interface CustomCalendarProps {
  calendarID: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  className?: string;
}

// Helper: format a Date object to local YYYY-MM-DD
const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  calendarID,
  tasks,
  onTaskClick,
  className = '',
}) => {
  const uniqueID = useId();
  const calendarContainerID = calendarID || `calendar-${uniqueID}`;

  // State: store selected date as local date string "YYYY-MM-DD"
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Group tasks by due date (already YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        const dateKey = task.dueDate;
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(task);
      }
    });
    return map;
  }, [tasks]);

  // Client‑only: set today's local date after mount
  useEffect(() => {
    const today = new Date();
    const todayStr = toLocalDateString(today);
    setSelectedDateStr(todayStr);
  }, []);

  // Handle date change from calendar
  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      const dateStr = toLocalDateString(value);
      setSelectedDateStr(dateStr);
    }
  };

  // Custom tile content: show colored dots for tasks due on that date
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    const dateKey = toLocalDateString(date);
    const dayTasks = tasksByDate[dateKey];
    if (!dayTasks || dayTasks.length === 0) return null;

    const dots = dayTasks.slice(0, 3).map((task, idx) => (
      <FontAwesomeIcon
        key={idx}
        icon={faCircle}
        className="text-[8px] ml-0.5"
        style={{ color: CATEGORY_COLORS[task.taskCategory] || '#6b7280' }}
      />
    ));
    return <div className="flex justify-center mt-1">{dots}</div>;
  };

  // Guard: don't render until we have a selected date (client only)
  if (!selectedDateStr) {
    return <div className="w-full h-64 bg-gray-100 rounded animate-pulse" />;
  }

  // Convert selectedDateStr to Date object for the Calendar component
  // Use local date to avoid timezone shift
  const [year, month, day] = selectedDateStr.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day); // local

  const tasksForSelectedDate = tasksByDate[selectedDateStr] || [];

  return (
    <div key={calendarContainerID} className={`calendar-container w-full ${className}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={tileContent}
          className="w-full border-none"
          prevLabel="‹"
          nextLabel="›"
          prev2Label="«"
          next2Label="»"
          locale="en-US"
        />
      </div>

      {/* Tasks for selected date */}
      <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">
          Tasks due on {selectedDateStr}
        </h3>
        {tasksForSelectedDate.length === 0 ? (
          <p className="text-gray-500">No tasks due on this date.</p>
        ) : (
          <ul className="space-y-2">
            {tasksForSelectedDate.map((task) => (
              <li
                key={task.taskID}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => onTaskClick && onTaskClick(task)}
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCircle}
                    className="text-xs"
                    style={{ color: CATEGORY_COLORS[task.taskCategory] || '#6b7280' }}
                  />
                  <span>{task.taskName}</span>
                </div>
                <span className="text-sm text-gray-500">{task.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CustomCalendar;