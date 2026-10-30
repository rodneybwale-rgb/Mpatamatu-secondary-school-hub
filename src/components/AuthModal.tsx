import React, { useState } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Users,
  Briefcase,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User, UserRole, StudentLevel } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('student');
  const [studentLevel, setStudentLevel] = useState<StudentLevel>('senior');
  const [grade, setGrade] = useState<number>(12);
  const [section, setSection] = useState<string>('12 Science A');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('+26097');
  const [password, setPassword] = useState<string>('');

  // MFA Flow
  const [step, setStep] = useState<'form' | 'mfa'>('form');
  const [mfaCode, setMfaCode] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('482910');
  const [mfaError, setMfaError] = useState<string>('');

  if (!isOpen) return null;

  const handleInitiateAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate 6 digit simulated OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setMfaCode('');
    setMfaError('');
    setStep('mfa');
  };

  const handleVerifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.trim() !== generatedOtp) {
      setMfaError('Invalid verification code. Please check your SMS or click Auto-fill.');
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: fullName.trim() || (role === 'student' ? 'Kondwani Banda' : role === 'teacher' ? 'Mr. C. Lungu' : role === 'parent' ? 'Mrs. M. Zulu' : 'Administrator'),
      email: email.trim() || 'user@mpatamatu.edu.zm',
      phone: phone.trim() || '+260971234567',
      role,
      studentLevel: role === 'student' ? studentLevel : undefined,
      grade: role === 'student' ? grade : undefined,
      section: role === 'student' ? section : undefined,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      mfaEnabled: true,
      mfaVerified: true,
      designation: role === 'admin' ? 'School Administrator' : role === 'teacher' ? 'Subject Teacher' : undefined,
    };

    onLoginSuccess(newUser);
    onClose();
    setStep('form');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-amber-500 to-red-600" />
        
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-emerald-950 dark:text-emerald-50">
                  {step === 'mfa' ? 'Multi-Factor Verification (MFA)' : authMode === 'login' ? 'Secure Portal Access' : 'Create School Account'}
                </h2>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  Mpatamatu Secondary School Encrypted Portal
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 'mfa' ? (
            /* MFA Step */
            <form onSubmit={handleVerifyMfa} className="mt-5 space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase">
                      Two-Step Verification Required
                    </h3>
                    <p className="text-xs text-amber-900/90 dark:text-amber-300/90 mt-0.5">
                      To protect sensitive student records and ECZ examination data, enter the 6-digit verification code sent to your registered mobile phone or email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center py-2">
                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-2">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-48 mx-auto text-center font-mono tracking-widest text-2xl font-black py-2.5 px-3 rounded-xl border-2 border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/30 text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => setMfaCode(generatedOtp)}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 underline inline-flex items-center gap-1"
                  >
                    <span>Auto-fill Demo Code ({generatedOtp})</span>
                  </button>
                </div>
              </div>

              {mfaError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{mfaError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  Back to credentials
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-900/20 transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify &amp; Enter Portal</span>
                </button>
              </div>
            </form>
          ) : (
            /* Login & Registration Form */
            <form onSubmit={handleInitiateAuth} className="mt-4 space-y-4">
              
              {/* Account Type Selector upon registration or login */}
              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1.5">
                  Select Account Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      role === 'student'
                        ? 'border-emerald-600 bg-emerald-100/80 dark:bg-emerald-800/80 font-bold text-emerald-950 dark:text-white shadow-sm'
                        : 'border-emerald-200 dark:border-emerald-800 text-emerald-800/80 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-300" />
                    <span className="text-[11px] block">Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('parent')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      role === 'parent'
                        ? 'border-emerald-600 bg-emerald-100/80 dark:bg-emerald-800/80 font-bold text-emerald-950 dark:text-white shadow-sm'
                        : 'border-emerald-200 dark:border-emerald-800 text-emerald-800/80 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                    }`}
                  >
                    <Users className="w-4 h-4 mx-auto mb-1 text-purple-600 dark:text-purple-300" />
                    <span className="text-[11px] block">Parent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      role === 'teacher'
                        ? 'border-emerald-600 bg-emerald-100/80 dark:bg-emerald-800/80 font-bold text-emerald-950 dark:text-white shadow-sm'
                        : 'border-emerald-200 dark:border-emerald-800 text-emerald-800/80 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mx-auto mb-1 text-blue-600 dark:text-blue-300" />
                    <span className="text-[11px] block">Teacher</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      role === 'admin'
                        ? 'border-emerald-600 bg-emerald-100/80 dark:bg-emerald-800/80 font-bold text-emerald-950 dark:text-white shadow-sm'
                        : 'border-emerald-200 dark:border-emerald-800 text-emerald-800/80 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-amber-600 dark:text-amber-300" />
                    <span className="text-[11px] block">Admin</span>
                  </button>
                </div>
              </div>

              {/* Junior vs Senior Level category selection for Student & Parent */}
              {(role === 'student' || role === 'parent') && (
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1.5">
                    Category: Junior vs Senior Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStudentLevel('junior');
                        setGrade(9);
                        setSection('9B');
                      }}
                      className={`p-2 rounded-lg text-xs font-bold border transition-all text-left ${
                        studentLevel === 'junior'
                          ? 'border-emerald-600 bg-emerald-700 text-white'
                          : 'border-emerald-200 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                      }`}
                    >
                      <div className="font-extrabold">Junior Level</div>
                      <div className="text-[10px] opacity-80">Grades 8 - 9 (JSLE)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStudentLevel('senior');
                        setGrade(12);
                        setSection('12 Science A');
                      }}
                      className={`p-2 rounded-lg text-xs font-bold border transition-all text-left ${
                        studentLevel === 'senior'
                          ? 'border-emerald-600 bg-emerald-700 text-white'
                          : 'border-emerald-200 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                      }`}
                    >
                      <div className="font-extrabold">Senior Level</div>
                      <div className="text-[10px] opacity-80">Grades 10 - 12 (ECZ School Cert)</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name (if registering) */}
              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Full Name / Student Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'student' ? 'e.g. Natasha Musonda' : role === 'teacher' ? 'e.g. Mr. Kenneth Tembo' : 'e.g. Mr. Joseph Musonda'}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Email / ID */}
              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  School Email or Student ID Number
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. n.musonda@student.mpatamatu.edu.zm"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Phone (for MFA SMS) */}
              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Zambian Phone Number (+260...) for 2FA SMS
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+260973485009"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Portal Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4 text-amber-300" />
                  <span>Proceed to Multi-Factor Verification</span>
                </button>
              </div>

              <div className="text-center pt-2 border-t border-emerald-100 dark:border-emerald-800/60">
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                  Protected by Mpatamatu ICT Security &bull; Contact Rodney Bwale (+260973485009) for credential resets.
                </p>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
