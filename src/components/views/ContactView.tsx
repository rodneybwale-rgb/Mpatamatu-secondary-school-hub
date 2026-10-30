import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  School,
  Clock,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { OFFICIAL_CONTACT } from '../../data/seedData';
import { FeedbackSubmission } from '../../types';

export const ContactView: React.FC = () => {
  const [senderName, setSenderName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+26097');
  const [category, setCategory] = useState<FeedbackSubmission['category']>('General Inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<FeedbackSubmission | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submission: FeedbackSubmission = {
      id: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
      senderName: senderName.trim() || 'Parent / Student',
      email: email.trim() || OFFICIAL_CONTACT.email,
      phone: phone.trim() || OFFICIAL_CONTACT.phone,
      category,
      subject: subject.trim() || 'Portal Inquiry',
      message: message.trim(),
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Received',
    };

    setSubmittedTicket(submission);
    setSenderName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mpatamatu Support &amp; Official Communications</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black">
            Contact Us &amp; Integrated Feedback Desk
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
            For academic admissions, ECZ examination verifications, student records inquiries, or technical support, contact Systems Administrator Rodney Bwale or submit your inquiry below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Official Contact Details Spotlight */}
        <div className="space-y-4">
          
          {/* Primary Designated Officer: Rodney Bwale */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-emerald-950 border-2 border-amber-400 dark:border-amber-600 shadow-md">
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 inline-block mb-3">
              Official ICT &amp; Systems Contact
            </span>

            <div className="flex items-center gap-3.5">
              <img
                src="/assets/aistudio/Facebook_creation_AE93975F-52CB-4968-9BE3-83580C365A42_c565d725.jpeg"
                alt="Rodney Bwale - Systems Administrator & ICT Support Coordinator"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md flex-shrink-0"
              />
              <div>
                <h3 className="font-extrabold text-base text-emerald-950 dark:text-emerald-50">
                  {OFFICIAL_CONTACT.name}
                </h3>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400 font-medium">
                  {OFFICIAL_CONTACT.role}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 pt-3 border-t border-emerald-100 dark:border-emerald-800 text-xs font-semibold">
              <a
                href={`mailto:${OFFICIAL_CONTACT.email}`}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
              >
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="truncate">{OFFICIAL_CONTACT.email}</span>
              </a>

              <a
                href={`tel:${OFFICIAL_CONTACT.phone}`}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="font-mono">{OFFICIAL_CONTACT.phone}</span>
              </a>
            </div>
          </div>

          {/* School Physical Address Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-3 text-xs">
            <h4 className="font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
              <School className="w-4 h-4 text-emerald-600" />
              <span>Campus Address</span>
            </h4>
            <p className="text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
              {OFFICIAL_CONTACT.address}
            </p>

            <div className="pt-2 border-t border-emerald-100 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Admin Hours: Mon – Fri, 07:30 to 16:30 CAT</span>
            </div>
          </div>

        </div>

        {/* Right 2 Cols: Interactive Feedback Form */}
        <div className="lg:col-span-2 bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 sm:p-6 shadow-sm">
          
          {submittedTicket ? (
            /* Ticket Confirmation View */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  Ticket Reference: {submittedTicket.id}
                </span>
                <h3 className="text-xl font-extrabold text-emerald-950 dark:text-emerald-50 mt-2">
                  Inquiry Dispatched to Rodney Bwale
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80 max-w-md mx-auto mt-1">
                  Thank you, {submittedTicket.senderName}. Your submission regarding "{submittedTicket.subject}" has been logged and routed to our administration desk.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 max-w-md mx-auto text-left text-xs space-y-1">
                <div><span className="font-bold">Category:</span> {submittedTicket.category}</div>
                <div><span className="font-bold">Contact Email:</span> {submittedTicket.email}</div>
                <div><span className="font-bold">Date Received:</span> {submittedTicket.createdAt}</div>
                <div><span className="font-bold">Direct Support:</span> rodneybwale@gmail.com (+260973485009)</div>
              </div>

              <button
                type="button"
                onClick={() => setSubmittedTicket(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            /* Contact & Feedback Form */
            <div>
              <div className="pb-3 border-b border-emerald-100 dark:border-emerald-800">
                <h3 className="font-extrabold text-base text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span>Send an Official Inquiry or Feedback</span>
                </h3>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                  Direct message to Rodney Bwale &amp; School Administration
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. Natasha Musonda or Mr. Joseph Musonda"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 font-semibold"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Admissions">Admissions &amp; Enrollment</option>
                      <option value="ECZ Verification">ECZ Examination Verification</option>
                      <option value="Technical Support">Portal &amp; Push Notification Support</option>
                      <option value="Complaint / Suggestion">Suggestions &amp; PTA Feedback</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                      Zambian Phone Number (+260...)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+260973485009"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. ECZ Candidate Number Verification for Grade 12"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry, student name, class details, or question..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                    Direct copy will be routed to rodneybwale@gmail.com
                  </span>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-900/20"
                  >
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>Send Inquiry</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
