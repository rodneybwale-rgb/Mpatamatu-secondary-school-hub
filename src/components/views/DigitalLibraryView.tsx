import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Search,
  Filter,
  PlusCircle,
  CheckCircle2,
  BookmarkCheck,
  FileText,
  Star,
  Sparkles,
  Eye,
  X,
  WifiOff,
  UserCheck
} from 'lucide-react';
import { LibraryResource, User, StudentLevel } from '../../types';
import { LIBRARY_RESOURCES } from '../../data/seedData';

interface DigitalLibraryViewProps {
  currentUser: User | null;
  onDownloadResource: (resourceId: string) => void;
  isOfflineMode: boolean;
}

export const DigitalLibraryView: React.FC<DigitalLibraryViewProps> = ({
  currentUser,
  onDownloadResource,
  isOfflineMode,
}) => {
  const [resources, setResources] = useState<LibraryResource[]>(LIBRARY_RESOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'junior' | 'senior'>('all');
  const [activePreview, setActivePreview] = useState<LibraryResource | null>(null);

  // Upload Modal State (for Teachers & Admin)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<LibraryResource['category']>('ECZ Past Paper');
  const [newLevel, setNewLevel] = useState<StudentLevel>('senior');
  const [newGrade, setNewGrade] = useState(12);
  const [newDesc, setNewDesc] = useState('');
  const [newClassRec, setNewClassRec] = useState('Grade 12 Science A');

  const filteredResources = resources.filter((item) => {
    if (isOfflineMode && !item.isCachedOffline) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (levelFilter !== 'all' && item.level !== levelFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleOfflineCache = (id: string) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isCachedOffline: !r.isCachedOffline } : r
      )
    );
    onDownloadResource(id);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const createdItem: LibraryResource = {
      id: `lib_${Date.now()}`,
      title: newTitle.trim() || 'New Course Material',
      subject: newSubject.trim() || 'General Science',
      level: newLevel,
      grade: newGrade,
      category: newCategory,
      fileFormat: 'PDF',
      fileSize: '5.2 MB',
      uploaderName: currentUser?.name || 'Mpatamatu Faculty',
      uploaderRole: currentUser?.designation || 'Subject Teacher',
      uploadDate: new Date().toISOString().split('T')[0],
      downloadsCount: 1,
      isCachedOffline: true,
      description: newDesc.trim() || 'Curated study materials uploaded for secondary student revision.',
      recommendedByClass: newClassRec.trim() || undefined,
      recommendedTeacherName: currentUser?.name || 'Mpatamatu Faculty',
      previewSnippet: 'Official syllabus guidelines and study exercises compiled for Term 3 examinations.',
    };

    setResources([createdItem, ...resources]);
    setShowUploadModal(false);
    setNewTitle('');
    setNewSubject('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            <span>Mpatamatu Digital Library &amp; Resource Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-50">
            Textbooks, Past Papers &amp; Teacher Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80 mt-1 max-w-2xl">
            Save course materials offline to revise at home without requiring an internet data connection. Teachers can publish and recommend high-yield past papers to specific classes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-md flex items-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-amber-300" />
          <span>Upload Course Material</span>
        </button>
      </div>

      {/* Offline Mode Alert banner if active */}
      {isOfflineMode && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-bold">
              Offline Mode Active: Showing {filteredResources.length} documents stored in your device cache.
            </span>
          </div>
          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100">
            No Data Required
          </span>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search textbooks, ECZ papers, physics, chemistry, mathematics..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-900/30 text-emerald-950 dark:text-emerald-100 placeholder:text-emerald-700/50 dark:placeholder:text-emerald-400/50"
          />
        </div>

        {/* Level filter tabs */}
        <div className="flex items-center p-1 bg-emerald-100/70 dark:bg-emerald-900/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold w-full md:w-auto justify-center">
          <button
            type="button"
            onClick={() => setLevelFilter('all')}
            className={`px-3 py-1.5 rounded-lg ${
              levelFilter === 'all'
                ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-sm'
                : 'text-emerald-800 dark:text-emerald-300'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setLevelFilter('junior')}
            className={`px-3 py-1.5 rounded-lg ${
              levelFilter === 'junior'
                ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-sm'
                : 'text-emerald-800 dark:text-emerald-300'
            }`}
          >
            Junior (8-9)
          </button>
          <button
            type="button"
            onClick={() => setLevelFilter('senior')}
            className={`px-3 py-1.5 rounded-lg ${
              levelFilter === 'senior'
                ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-sm'
                : 'text-emerald-800 dark:text-emerald-300'
            }`}
          >
            Senior (10-12)
          </button>
        </div>

        {/* Category filter dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-900/30 text-emerald-950 dark:text-emerald-100 font-semibold w-full md:w-auto"
        >
          <option value="all">All Categories</option>
          <option value="ECZ Past Paper">ECZ Past Papers</option>
          <option value="Textbook">Textbooks</option>
          <option value="Revision Guide">Revision Guides</option>
          <option value="Lab Manual">Lab Manuals</option>
          <option value="Supplementary Reading">Supplementary Reading</option>
        </select>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Category & Level Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300">
                  {item.category}
                </span>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.level === 'senior'
                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200'
                    : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                }`}>
                  Grade {item.grade} ({item.level})
                </span>
              </div>

              {/* Title & Subject */}
              <h4 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50 mt-2.5 leading-snug">
                {item.title}
              </h4>

              {/* Class Recommendation Highlight */}
              {item.recommendedByClass && (
                <div className="mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-950 dark:text-amber-200 font-semibold flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                  <span>Recommended for: {item.recommendedByClass}</span>
                </div>
              )}

              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-2 line-clamp-3">
                {item.description}
              </p>
            </div>

            {/* Bottom Meta & Offline Download Toggle */}
            <div className="pt-3 border-t border-emerald-100 dark:border-emerald-800/80">
              <div className="flex items-center justify-between text-[11px] text-emerald-700/80 dark:text-emerald-400 mb-3">
                <span className="flex items-center gap-1.5">
                  {item.uploaderName.includes('Rodney Bwale') && (
                    <img
                      src="/assets/aistudio/Facebook_creation_AE93975F-52CB-4968-9BE3-83580C365A42_c565d725.jpeg"
                      alt="Mr. Rodney Bwale"
                      className="w-4 h-4 rounded-full object-cover ring-1 ring-amber-400"
                    />
                  )}
                  <span>By: {item.uploaderName}</span>
                </span>
                <span>{item.fileSize} &bull; {item.fileFormat}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActivePreview(item)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Quick Read</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleOfflineCache(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    item.isCachedOffline
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-800 dark:text-white border border-emerald-400'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{item.isCachedOffline ? 'Saved Offline' : 'Save Offline'}</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* In-App Document Quick Reader Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 max-w-2xl w-full p-5 sm:p-6 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
                    {activePreview.title}
                  </h3>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    {activePreview.subject} &bull; {activePreview.category} &bull; {activePreview.fileSize}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-emerald-900 dark:text-emerald-100">
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold block text-xs uppercase text-emerald-700 dark:text-emerald-300 mb-1">
                  Document Excerpt &amp; Key Study Formulas:
                </span>
                <p className="leading-relaxed font-mono text-xs">
                  {activePreview.previewSnippet}
                </p>
              </div>

              <div>
                <h5 className="font-bold mb-1">Curriculum Alignment:</h5>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                  Strictly aligned with the official Examinations Council of Zambia (ECZ) senior secondary syllabus. Recommended for term continuous assessment, mock trials, and national certificate preparation.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-900 dark:text-amber-200">
                💡 <span className="font-bold">Offline Study Tip:</span> You can access this text without mobile data once marked as "Saved Offline".
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
              <span className="text-xs text-emerald-700/80 dark:text-emerald-400">
                Uploaded by {activePreview.uploaderName}
              </span>
              <button
                type="button"
                onClick={() => handleToggleOfflineCache(activePreview.id)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{activePreview.isCachedOffline ? 'In Offline Cache' : 'Download for Offline'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Course Material Modal (Teachers & Admins) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 max-w-md w-full p-5 sm:p-6 overflow-hidden">
            <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-teal-600" />
              <span>Upload New Learning Material</span>
            </h3>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Resource Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ECZ Mathematics Paper 2 Solved 2024"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Physics (5054)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 font-medium"
                  >
                    <option value="ECZ Past Paper">ECZ Past Paper</option>
                    <option value="Textbook">Textbook</option>
                    <option value="Revision Guide">Revision Guide</option>
                    <option value="Lab Manual">Lab Manual</option>
                    <option value="Supplementary Reading">Supplementary Reading</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    Level
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 font-medium"
                  >
                    <option value="junior">Junior (8 - 9)</option>
                    <option value="senior">Senior (10 - 12)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    Grade
                  </label>
                  <input
                    type="number"
                    min={8}
                    max={12}
                    value={newGrade}
                    onChange={(e) => setNewGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Recommend to Class (Optional)
                </label>
                <input
                  type="text"
                  value={newClassRec}
                  onChange={(e) => setNewClassRec(e.target.value)}
                  placeholder="e.g. Grade 12 Science A or Grade 9B"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Document Description &amp; Study Notes
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Summary of topics covered, exam tips, and instructions..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Upload &amp; Recommend</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
