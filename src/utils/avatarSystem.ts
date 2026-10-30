export interface AvatarTier {
  minLevel: number;
  tierName: string;
  imagePath: string;
  description: string;
  auraColor: string;
  titleBadge: string;
}

export const AVATAR_TIERS: AvatarTier[] = [
  {
    minLevel: 1,
    tierName: 'Novice Scholar',
    imagePath: '/src/assets/images/avatar_novice_scholar_1792559259769.jpg',
    description: 'Eager secondary apprentice wearing the traditional Mpatamatu green & gold blazer.',
    auraColor: 'from-emerald-500/30 to-teal-600/30 ring-emerald-500',
    titleBadge: 'Apprentice',
  },
  {
    minLevel: 3,
    tierName: 'STEM & Robotics Explorer',
    imagePath: '/src/assets/images/avatar_stem_explorer_1792559259012.jpg',
    description: 'Equipped with JETS innovation goggles and microprocessor breadboard circuits.',
    auraColor: 'from-blue-500/40 to-cyan-500/40 ring-cyan-400',
    titleBadge: 'Tech Innovator',
  },
  {
    minLevel: 5,
    tierName: 'Senior Academic Luminary',
    imagePath: '/src/assets/images/avatar_senior_luminary_1792559260493.jpg',
    description: 'Distinguished honor student surrounded by a radiant golden intellectual aura.',
    auraColor: 'from-amber-400/50 to-yellow-500/50 ring-amber-400',
    titleBadge: 'Honor Luminary',
  },
  {
    minLevel: 7,
    tierName: 'Master Academic Champion',
    imagePath: '/src/assets/images/avatar_master_achiever_1792559260844.jpg',
    description: 'Triumphant scholar with ceremonial excellence sash, golden trophy and ECZ distinction scroll.',
    auraColor: 'from-amber-500/60 to-emerald-500/60 ring-amber-300',
    titleBadge: 'National Champion',
  },
  {
    minLevel: 9,
    tierName: 'Grand Academic Legend',
    imagePath: '/src/assets/images/avatar_grand_legend_1792559261193.jpg',
    description: 'Supreme scholastic master draped in ornate gold-trimmed regalia and crystalline distinction talisman.',
    auraColor: 'from-purple-500/60 via-amber-400/60 to-rose-500/60 ring-purple-400',
    titleBadge: 'Grand Legend',
  },
];

/**
 * Returns the highest unlocked avatar tier for a student's gamification level.
 */
export function getAvatarTierForLevel(level: number): AvatarTier {
  const safeLevel = Math.max(1, level);
  for (let i = AVATAR_TIERS.length - 1; i >= 0; i--) {
    if (safeLevel >= AVATAR_TIERS[i].minLevel) {
      return AVATAR_TIERS[i];
    }
  }
  return AVATAR_TIERS[0];
}

/**
 * Returns the automatic avatar image path for a given gamification level.
 */
export function getAvatarImageForLevel(level: number): string {
  return getAvatarTierForLevel(level).imagePath;
}

/**
 * Determines whether a tier is unlocked for a given level.
 */
export function isTierUnlocked(level: number, tierMinLevel: number): boolean {
  return level >= tierMinLevel;
}
