"use client";
import React from 'react';
import { Calendar, Whisper, Popover, Badge } from 'rsuite';
import { FaUmbrellaBeach } from 'react-icons/fa'; // Example: Icon for weekends
import JournalRecordModal from './JournalRecordModal';

function getTodoList(date) {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Check if the day is between Monday (1) and Friday (5)
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    return [
      { label: <JournalRecordModal />, action: 'record' },
      // { label: 'View', action: 'view' }
    ];
  } else {
    return []; // No buttons for weekends
  }
}

export default function CalendarComponent() {
  function renderCell(date) {
    const today = new Date(); // Get today's date
    const isToday = date.toDateString() === today.toDateString(); // Compare date with today

    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Check if it's Saturday or Sunday

    const list = getTodoList(date);

    if (isToday && list.length) {
      return (
        <div className="calendar-cell-content">
          <div className="flex space-x-6 py-2 items-center justify-center">
            {list.map((item, index) => (
              <div key={index} className="button-container">
                {item.label}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (isWeekend) {
      return (
        <div className="calendar-cell-content flex justify-center items-center py-2">
          <FaUmbrellaBeach className="text-blue-500 text-xl" />
        </div>
      );
    }

    return null; // Empty cell for non-today dates on weekdays
  }

  return <Calendar bordered renderCell={renderCell} />;
}
