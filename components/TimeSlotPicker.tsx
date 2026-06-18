'use client';

import React from 'react';

interface TimeSlotPickerProps {
  slots: string[];
  selectedSlot: string | null;
  onSlotSelect: (slot: string) => void;
  loading?: boolean;
}

function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${ampm}`;
}

export default function TimeSlotPicker({
  slots,
  selectedSlot,
  onSlotSelect,
  loading = false,
}: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        <span className="ml-3 text-gray-500 text-sm">Checking availability...</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="w-10 h-10 mx-auto mb-2 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm font-medium">No available slots</p>
        <p className="text-xs text-gray-400 mt-1">Please select a different date</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSlotSelect(slot)}
          className={`
            py-2 px-3 rounded-lg text-sm font-medium transition-all border
            ${selectedSlot === slot
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'
            }
          `}
        >
          {formatTime(slot)}
        </button>
      ))}
    </div>
  );
}
