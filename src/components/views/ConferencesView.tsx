import React, { useState } from 'react';
import {
  CalendarCheck,
  Calendar,
  Clock,
  UserCheck,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Send,
  Bell,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { ConferenceSlot, ConferenceBooking, User, StudentRecord } from '../../types';
import { CONFERENCE_SLOTS, INITIAL_BOOKINGS } from '../../data/seedData';

interface ConferencesViewProps {
  currentUser: User | null;
  activeStudent: StudentRecord;
  onBookConference: (booking: ConferenceBooking) => void;
  onTriggerReminder: (bookingId: string) => void;
}

export const ConferencesView: React.FC<ConferencesViewProps> = ({
  currentUser,
  activeStudent,
  onBookConference,
  onTriggerReminder,
}) => {
  const [slots, setSlots] = useState<ConferenceSlot[]>(CONFERENCE_SLOTS);
  const [bookings, setBookings] = useState<ConferenceBooking[]>(INITIAL_BOOKINGS);
  const [selectedSlot, setSelectedSlot] = useState<ConferenceSlot | null>(null);

  // Booking Modal Form State
  const [meetingMode, setMeetingMode] = useState<'In-Person (School)' | 'WhatsApp Video Call'>('In-Person (School)');
  const [discussionTopic, setDiscussionTopic] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('all');

  const isParent = currentUser?.role === 'parent';
  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  const filteredSlots = slots.filter((slot) => {
    if (teacherFilter !== 'all' && slot.teacherId !== teacherFilter) return false;
    return true;
  });

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const newBooking: ConferenceBooking = {
      id: `book_${Date.now()}`,
      slotId: selectedSlot.id,
      teacherId: selectedSlot.teacherId,
      teacherName: selectedSlot.teacherName,
      parentId: currentUser?.id || 'parent_user',
      parentName: currentUser?.name || 'Mr. Joseph Musonda',
      studentId: activeStudent.id,
      studentName: activeStudent.fullName,
      studentGrade: `Grade ${activeStudent.stream}`,
      date: selectedSlot.date,
      timeSlot: selectedSlot.timeSlot,
      meetingMode,
      discussionTopic: discussionTopic.trim() || 'Academic performance and Term 3 ECZ examination preparation.',
      status: 'Confirmed',
      reminderSent: true,
    };

    // Mark slot as booked
    setSlots((prev) =>
      prev.map((s) => (s.id === selectedSlot.id ? { ...s, isBooked: true } : s))
    );
    setBookings((prev) => [newBooking, ...prev]);

    onBookConference(newBooking);
    setSelectedSlot(null);
    setDiscussionTopic('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs font-bold mb-2">
            <CalendarCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Official Parent-Teacher Conferences (PTC)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-50">
            Book a Meeting with {activeStudent.fullName}’s Faculty
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80 mt-1 max-w-2xl">
            Schedule dedicated 20-minute sessions to discuss continuous assessment marks, ECZ mock readiness, and student discipline. Both in-person and WhatsApp video options available.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
            Student: {activeStudent.fullName} ({activeStudent.stream})
          </span>
        </div>
      </div>

      {/* Booked Appointments Section */}
      {bookings.length > 0 && (
        <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Upcoming Confirmed Appointments ({bookings.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/30 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-emerald-950 dark:text-emerald-100">
                      {booking.teacherName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200">
                      {booking.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTriggerReminder(booking.id)}
                    title="Send automated push notification reminder"
                    className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-200 flex items-center gap-1"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    <span>Send Reminder</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-emerald-800/90 dark:text-emerald-300/90 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{booking.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    {booking.meetingMode === 'In-Person (School)' ? (
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    ) : (
                      <Video className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>{booking.meetingMode} &bull; For {booking.studentName} ({booking.studentGrade})</span>
                  </div>
                </div>

                <p className="text-xs text-emerald-950 dark:text-emerald-100 bg-white dark:bg-emerald-950 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <span className="font-bold">Topic:</span> "{booking.discussionTopic}"
                </p>

                {booking.teacherNotes && (
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 italic">
                    Faculty note: {booking.teacherNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Time Slots Directory */}
      <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100 dark:border-emerald-800">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
              Available Teacher Consultation Slots
            </h3>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
              Click any open slot to reserve an appointment
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Filter Teacher:</span>
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/30 text-emerald-950 dark:text-emerald-100 font-semibold"
            >
              <option value="all">All Faculty</option>
              <option value="user_teacher_tembo">Mr. Kenneth Tembo (Science HOD)</option>
              <option value="user_deputy_head">Mrs. Christine Mwansa (Deputy Head)</option>
              <option value="user_teacher_chibwe">Mrs. Gertrude Chibwe (English)</option>
              <option value="user_teacher_simukonda">Mr. Patrick Simukonda (Mathematics)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlots.map((slot) => (
            <div
              key={slot.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                slot.isBooked
                  ? 'bg-gray-50 dark:bg-emerald-950/20 border-gray-200 dark:border-emerald-900/60 opacity-60'
                  : 'bg-white dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={slot.avatar}
                    alt={slot.teacherName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                      {slot.teacherName}
                    </h4>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                      {slot.subject}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-emerald-800/80 dark:text-emerald-300/80 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Date: {slot.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Time: {slot.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    <span>{slot.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
                {slot.isBooked ? (
                  <span className="text-xs font-bold text-gray-500">Reserved</span>
                ) : (
                  <>
                    <span className="text-[11px] font-bold text-emerald-600">Available</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1"
                    >
                      <span>Book Slot</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 max-w-md w-full p-5 sm:p-6 overflow-hidden">
            <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-purple-600" />
              <span>Confirm Conference with {selectedSlot.teacherName}</span>
            </h3>

            <div className="mt-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200">
              <div className="font-bold">{selectedSlot.date} &bull; {selectedSlot.timeSlot}</div>
              <div className="text-[11px] opacity-80">{selectedSlot.teacherDesignation}</div>
            </div>

            <form onSubmit={handleConfirmBooking} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Preferred Meeting Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMeetingMode('In-Person (School)')}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      meetingMode === 'In-Person (School)'
                        ? 'border-emerald-600 bg-emerald-100 dark:bg-emerald-800 text-emerald-950 dark:text-white'
                        : 'border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    <span>In-Person</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMeetingMode('WhatsApp Video Call')}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      meetingMode === 'WhatsApp Video Call'
                        ? 'border-emerald-600 bg-emerald-100 dark:bg-emerald-800 text-emerald-950 dark:text-white'
                        : 'border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-blue-600" />
                    <span>WhatsApp Video</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Main Topic of Discussion
                </label>
                <textarea
                  rows={3}
                  required
                  value={discussionTopic}
                  onChange={(e) => setDiscussionTopic(e.target.value)}
                  placeholder="e.g. Inquiring about Natasha’s laboratory practical marks and ECZ exam syllabus coverage..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Booking &amp; Set Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
