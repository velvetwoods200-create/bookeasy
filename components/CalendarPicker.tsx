'use client';

import React, { useState } from 'react';

interface WorkingHour {
  day_of_week: number;
  is_active: number;
}

interface CalendarPickerProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  workingHours: WorkingHour[];
  minDate?: Date;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarPicker({
  selectedDate,
  onDateSelect,
  workingHours,
  minDate,
}: CalendarPickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const activeDays = new Set(
    workingHours.filter((wh) => wh.is_active).map((wh) => wh.day_of_week)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  function formatDateStr(y: number, m: number, d: number): string {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  const canGoPrev = new Date(year, month - 1, 1) >= new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-semibold text-gray-900">
          {MONTHS[month]} {year}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateObj = new Date(year, month, dayNum);
          const dateStr = formatDateStr(year, month, dayNum);
          const isPast = dateObj < (minDate || today);
          const isUnavailable = !activeDays.has(dateObj.getDay());
          const isSelected = selectedDate === dateStr;
          const isToday =
            dateObj.getDate() === today.getDate() &&
            dateObj.getMonth() === today.getMonth() &&
            dateObj.getFullYear() === today.getFullYear();

          const disabled = isPast || isUnavailable;

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => !disabled && onDateSelect(dateStr)}
              disabled={disabled}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                ${isSelected
                  ? 'bg-indigo-600 text-white shadow-md'
                  : disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : isToday
                  ? 'text-indigo-600 border-2 border-indigo-300 hover:bg-indigo-50'
                  : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer'
                }
              `}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {workingHours.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          Greyed out days are unavailable
        </p>
      )}
    </div>
  );
}
