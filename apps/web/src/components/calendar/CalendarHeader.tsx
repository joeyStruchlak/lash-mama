'use client';

import { useState } from 'react';

type CalendarView = 'month' | 'week' | 'day' | 'list';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewAppointment?: () => void;
  showNewAppointment?: boolean;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  onNewAppointment,
  showNewAppointment = true,
}: CalendarHeaderProps) {
  
  const formatDisplayDate = (): string => {
    const options: Intl.DateTimeFormatOptions = 
      view === 'month' 
        ? { month: 'long', year: 'numeric' }
        : view === 'week'
        ? { month: 'short', day: 'numeric', year: 'numeric' }
        : { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    
    return currentDate.toLocaleDateString('en-US', options);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-gold-100 p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Left: Date Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToday}
            className="px-4 py-2 border-2 border-gold-300 text-dark rounded-lg hover:bg-gold-50 transition-colors font-medium"
          >
            Today
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevious}
              className="p-2 hover:bg-gold-50 rounded-lg transition-colors"
              aria-label="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-serif font-bold text-dark min-w-[200px] text-center">
              {formatDisplayDate()}
            </h2>
            
            <button
              onClick={onNext}
              className="p-2 hover:bg-gold-50 rounded-lg transition-colors"
              aria-label="Next"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right: View Toggles & New Button */}
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-gold-50 rounded-lg p-1">
            {(['month', 'week', 'day', 'list'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={`
                  px-4 py-2 rounded-md font-medium capitalize transition-colors
                  ${view === v 
                    ? 'bg-white text-gold-700 shadow-sm' 
                    : 'text-dark-secondary hover:text-dark'
                  }
                `}
              >
                {v}
              </button>
            ))}
          </div>

          {/* New Appointment Button */}
          {showNewAppointment && onNewAppointment && (
            <button
              onClick={onNewAppointment}
              className="px-6 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors font-semibold"
            >
              + New Appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}