import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ChevronRight } from 'lucide-react';
import api from '../../api/client.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const StudentTimetable: React.FC = () => {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Default to today's day if weekday
  const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const todayName = currentDayIndex >= 1 && currentDayIndex <= 6 ? DAYS[currentDayIndex - 1] : 'Monday';
  const [selectedDay, setSelectedDay] = useState(todayName);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      const res = await api.get('/student/timetable');
      if (res.data.success) {
        setTimetable(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const daySlots = timetable
    .filter(t => t.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
          Class Schedule & Timetable
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Weekly schedule for Computer Science & Engineering · Semester 5
        </p>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DAYS.map(day => {
          const isSelected = selectedDay === day;
          const isToday = day === todayName;
          const count = timetable.filter(t => t.day === day).length;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${isSelected ? 'bg-indigo-700 text-white' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600'}`}>
                  Today
                </span>
              )}
              <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedule Timeline for Selected Day */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedDay}&apos;s Sessions
              </h2>
              <p className="text-xs text-slate-400">
                {daySlots.length} lecture blocks scheduled
              </p>
            </div>
          </div>
        </div>

        {daySlots.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No lectures scheduled on {selectedDay}. Ideal for library study & coursework projects!
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {daySlots.map((slot, index) => (
              <div
                key={slot._id || index}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 bg-slate-50/50 dark:bg-slate-850/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Time Badge */}
                  <div className="w-24 shrink-0 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-center">
                    <span className="block text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {slot.startTime}
                    </span>
                    <span className="block text-[10px] text-indigo-400 font-medium">
                      to {slot.endTime}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                        {slot.subjectCode}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {slot.subjectName}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.facultyName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{slot.room}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800">
                    60 Min Session
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
