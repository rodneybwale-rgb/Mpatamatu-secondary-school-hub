import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Lock,
  CheckCircle2,
  Trophy,
  ShieldCheck,
  Palette,
  RotateCw,
  Zap,
  Star,
  Award
} from 'lucide-react';
import { StudentRecord } from '../types';
import { AVATAR_TIERS, isTierUnlocked, AvatarTier } from '../utils/avatarSystem';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentRecord;
  onSaveAvatar: (updatedAvatar: string, aura: string, accessory: string, tierName: string) => void;
}

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  isOpen,
  onClose,
  student,
  onSaveAvatar,
}) => {
  const currentLevel = student.gamification?.level || 1;

  const [selectedTier, setSelectedTier] = useState<AvatarTier>(() => {
    const currentTier = AVATAR_TIERS.find((t) => t.imagePath === student.avatar);
    return currentTier || AVATAR_TIERS[Math.min(AVATAR_TIERS.length - 1, Math.floor((currentLevel - 1) / 2))];
  });

  const [selectedAura, setSelectedAura] = useState<string>(student.avatarAura || 'gold');
  const [selectedAccessory, setSelectedAccessory] = useState<string>(student.avatarBadgeAccessory || 'ECZ Distinction');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const auras = [
    { id: 'gold', name: 'Golden Intellect', ringClass: 'ring-amber-400 shadow-amber-400/50 shadow-lg' },
    { id: 'emerald', name: 'Mpatamatu Emerald', ringClass: 'ring-emerald-500 shadow-emerald-500/50 shadow-lg' },
    { id: 'cyan', name: 'JETS Cyber Cyan', ringClass: 'ring-cyan-400 shadow-cyan-400/50 shadow-lg' },
    { id: 'purple', name: 'Cosmic Luminary', ringClass: 'ring-purple-400 shadow-purple-400/50 shadow-lg' },
    { id: 'copper', name: 'Copperbelt Bronze', ringClass: 'ring-amber-700 shadow-amber-700/50 shadow-lg' },
  ];

  const accessories = [
    { id: 'ECZ Distinction', label: '🏆 ECZ Distinction Seal', desc: 'Awarded for academic brilliance' },
    { id: 'JETS Robotics', label: '🔬 JETS Science Pioneer', desc: 'Provincial Science Fair finalist' },
    { id: 'Prefect Crest', label: '🛡️ Head Prefect Crest', desc: 'Exemplary leadership & conduct' },
    { id: 'Copper Star', label: '⭐ Copperbelt Merit Star', desc: '100% attendance & dedication' },
  ];

  const handleSimulateRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 700);
  };

  const handleSave = () => {
    onSaveAvatar(selectedTier.imagePath, selectedAura, selectedAccessory, selectedTier.tierName);
    onClose();
  };

  const activeAuraClass = auras.find((a) => a.id === selectedAura)?.ringClass || 'ring-amber-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-emerald-950 rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-amber-400 to-purple-600" />

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 shadow-sm">
              <Sparkles className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 dark:text-emerald-50">
                AI Avatar Studio &amp; Level Evolution
              </h3>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                Avatars unlock and evolve automatically as your gamification level increases
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900"
            aria-label="Close avatar studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Avatar Preview Display Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white flex flex-col sm:flex-row items-center gap-5 shadow-lg">
            <div className="relative flex-shrink-0">
              <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ${activeAuraClass} transition-all duration-300`}>
                <img
                  src={selectedTier.imagePath}
                  alt={selectedTier.tierName}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-all ${isGenerating ? 'scale-110 blur-xs' : 'scale-100'}`}
                />
              </div>

              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-xs ring-2 ring-emerald-950">
                Lv. {currentLevel}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-emerald-950">
                  {selectedTier.tierName}
                </span>
                <span className="text-[11px] font-bold text-emerald-200">
                  Student: {student.fullName}
                </span>
              </div>

              <p className="text-xs text-emerald-100/90 leading-relaxed">
                {selectedTier.description}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] font-semibold text-amber-200">
                <span>Accessory: {selectedAccessory}</span>
                <span>&bull;</span>
                <span>Aura: {auras.find((a) => a.id === selectedAura)?.name}</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSimulateRegenerate}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Synthesizing...' : 'Re-roll AI Variant'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Progressive Tier Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Level-Progression Avatar Tiers</span>
              </h4>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                Your Level: <span className="font-bold text-amber-600 dark:text-amber-400">{currentLevel}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {AVATAR_TIERS.map((tier) => {
                const unlocked = isTierUnlocked(currentLevel, tier.minLevel);
                const isSelected = selectedTier.minLevel === tier.minLevel;

                return (
                  <button
                    key={tier.minLevel}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => setSelectedTier(tier)}
                    className={`relative p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      !unlocked
                        ? 'opacity-40 bg-gray-100 dark:bg-emerald-950/40 border-gray-300 dark:border-emerald-900 cursor-not-allowed'
                        : isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-400 shadow-md'
                        : 'bg-white dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'
                    }`}
                  >
                    <div>
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                        <img
                          src={tier.imagePath}
                          alt={tier.tierName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {!unlocked && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                            <Lock className="w-5 h-5 text-amber-400" />
                          </div>
                        )}
                        {isSelected && unlocked && (
                          <div className="absolute top-1 right-1 p-1 rounded-full bg-amber-400 text-emerald-950 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] font-extrabold text-emerald-950 dark:text-emerald-100 truncate">
                        {tier.tierName}
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] font-bold">
                      {unlocked ? (
                        <span className="text-emerald-600 dark:text-emerald-400">Unlocked</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">Unlocks Lv {tier.minLevel}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aura / Frame Customization */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600" />
              <span>Customize Halo &amp; Glow Aura</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {auras.map((aura) => (
                <button
                  key={aura.id}
                  type="button"
                  onClick={() => setSelectedAura(aura.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    selectedAura === aura.id
                      ? 'bg-emerald-100 dark:bg-emerald-800/80 border-emerald-600 text-emerald-950 dark:text-white shadow-sm ring-1 ring-emerald-500'
                      : 'border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full ${
                      aura.id === 'gold'
                        ? 'bg-amber-400'
                        : aura.id === 'emerald'
                        ? 'bg-emerald-500'
                        : aura.id === 'cyan'
                        ? 'bg-cyan-400'
                        : aura.id === 'purple'
                        ? 'bg-purple-500'
                        : 'bg-amber-700'
                    }`} />
                    <span className="truncate">{aura.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Accessory & Badge Pin */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Academic Pin &amp; Insignia</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {accessories.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setSelectedAccessory(acc.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedAccessory === acc.id
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-emerald-950 dark:text-emerald-100 ring-1 ring-amber-400'
                      : 'border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  <div className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                    {acc.label}
                  </div>
                  <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">
                    {acc.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-emerald-100 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/20 flex items-center justify-between">
          <div className="text-xs text-emerald-700/90 dark:text-emerald-400">
            <Zap className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
            <span>Complete assignments to unlock Level {Math.min(10, Math.floor(currentLevel / 2) * 2 + 3)} tier!</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>Equip Custom Avatar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
