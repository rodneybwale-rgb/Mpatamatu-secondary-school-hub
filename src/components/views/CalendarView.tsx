import React, { useState } from 'react';
import {
  CalendarDays,
  Calendar,
  Clock,
  MapPin,
  Bell,
  CheckCircle2,
  Filter,
  PlusCircle,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { CalendarEvent, User } from '../../types';
import { CALENDAR_EVENTS } from '../../data/seedData';

interface CalendarViewProps {
  currentUser: User | null;
  onSetReminder: (eventId: string, title: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentUser,
  onSetReminder,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Add Event Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('2026-11-15');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [location, setLocation] = useState('Assembly Hall');
  const [category, setCategory] = useState<CalendarEvent['category']>('academic');
  const [targetAudience, setTargetAudience] = useState<CalendarEvent['targetAudience']>('All');

  const canAddEvents =
    currentUser?.role === 'admin' ||
    currentUser?.email === 'rodneybwale@gmail.com' ||
    currentUser?.name === 'Rodney Bwale';

  const filteredEvents = events.filter((evt) => {
    if (categoryFilter !== 'all' && evt.category !== categoryFilter) return false;
    if (audienceFilter !== 'all' && evt.targetAudience !== audienceFilter && evt.targetAudience !== 'All') return false;
    return true;
  });

  const handleToggleReminder = (id: string, eventTitle: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, reminderSet: !e.reminderSet } : e))
    );
    onSetReminder(id, eventTitle);
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvt: CalendarEvent = {
      id: `evt_${Date.now()}`,
      title: title.trim() || 'New School Event',
      description: desc.trim() || 'Official school calendar activity.',
      category,
      date,
      startTime,
      endTime,
      location: location.trim() || 'School Grounds',
      targetAudience,
      reminderSet: true,
    };

    setEvents([...events, newEvt]);
    setShowAddEventModal(false);
    setTitle('');
    setDesc('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-bold mb-2">
            <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
            <span>Academic Term 3 &amp; ECZ Examination Timetable</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-50">
            Interactive School Calendar &amp; Alerts
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80 mt-1 max-w-2xl">
            Never miss an ECZ examination practical, PTA meeting, JETS innovation expo, or sports showdown. Set automated push reminders with a single tap.
          </p>
        </div>

        {canAddEvents ? (
          <button
            type="button"
            onClick={() => setShowAddEventModal(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-md flex items-center gap-2 self-start md:self-auto transition-all"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Add School Event</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700 text-[11px] font-bold text-emerald-800 dark:text-emerald-200">
            <span>Official Schedule (Admin Locked)</span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/30 text-emerald-950 dark:text-emerald-100 font-semibold"
          >
            <option value="all">All Categories</option>
            <option value="exam">ECZ Examinations</option>
            <option value="academic">Academic / Reports</option>
            <option value="pta">PTA Meetings</option>
            <option value="sports">Sports &amp; Athletics</option>
            <option value="club">Club Science Fairs</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Target Audience:</span>
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/30 text-emerald-950 dark:text-emerald-100 font-semibold"
          >
            <option value="all">All Audiences</option>
            <option value="Junior">Junior Students (8-9)</option>
            <option value="Senior">Senior Students (10-12)</option>
            <option value="Parents">Parents &amp; Guardians</option>
            <option value="Teachers">Faculty &amp; Staff</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3.5">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              {/* Date Block */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex flex-col items-center justify-center font-black flex-shrink-0 shadow-sm ring-1 ring-amber-400">
                <span className="text-[10px] uppercase font-bold text-amber-300">
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-xl leading-none">
                  {new Date(event.date).getDate()}
                </span>
                <span className="text-[9px] text-emerald-200">2026</span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    event.category === 'exam'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200'
                      : event.category === 'pta'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200'
                      : event.category === 'sports'
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                  }`}>
                    {event.category.toUpperCase()}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                    Audience: {event.targetAudience}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 dark:text-emerald-50 mt-1">
                  {event.title}
                </h3>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1">
                  {event.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-700 dark:text-emerald-400 mt-2 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reminder Alert Toggle */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => handleToggleReminder(event.id, event.title)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  event.reminderSet
                    ? 'bg-amber-500 text-emerald-950 shadow-md font-extrabold'
                    : 'border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
                }`}
              >
                <Bell className={`w-4 h-4 ${event.reminderSet ? 'fill-emerald-950' : ''}`} />
                <span>{event.reminderSet ? 'Reminder Set' : 'Set Push Reminder'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 max-w-md w-full p-5 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800">
              <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                <span>Publish New Calendar Event</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddEventModal(false)}
                className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grade 12 ECZ Science Practical Mock"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 font-medium"
                  >
                    <option value="academic">Academic</option>
                    <option value="exam">ECZ Examination</option>
                    <option value="pta">PTA Meeting</option>
                    <option value="sports">Sports</option>
                    <option value="club">Club Event</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Location &amp; Venue
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Science Laboratory 2 or Kafubu Stadium"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Event instructions, target attendees, and requirements..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish to Calendar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
