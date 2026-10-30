import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AVATAR_TIERS,
  getAvatarTierForLevel,
  getAvatarImageForLevel,
  isTierUnlocked
} from './avatarSystem';

test('Level 1 returns Novice Scholar tier', () => {
  const tier = getAvatarTierForLevel(1);
  assert.equal(tier.tierName, 'Novice Scholar');
  assert.equal(tier.minLevel, 1);
  assert.equal(tier.imagePath.includes('avatar_novice_scholar'), true);
});

test('Level 4 returns STEM & Robotics Explorer tier', () => {
  const tier = getAvatarTierForLevel(4);
  assert.equal(tier.tierName, 'STEM & Robotics Explorer');
  assert.equal(tier.minLevel, 3);
  assert.equal(tier.imagePath.includes('avatar_stem_explorer'), true);
});

test('Level 6 returns Senior Academic Luminary tier', () => {
  const tier = getAvatarTierForLevel(6);
  assert.equal(tier.tierName, 'Senior Academic Luminary');
  assert.equal(tier.minLevel, 5);
  assert.equal(tier.imagePath.includes('avatar_senior_luminary'), true);
});

test('Level 7 returns Master Academic Champion tier', () => {
  const tier = getAvatarTierForLevel(7);
  assert.equal(tier.tierName, 'Master Academic Champion');
  assert.equal(tier.minLevel, 7);
  assert.equal(tier.imagePath.includes('avatar_master_achiever'), true);
});

test('Level 10 returns Grand Academic Legend tier', () => {
  const tier = getAvatarTierForLevel(10);
  assert.equal(tier.tierName, 'Grand Academic Legend');
  assert.equal(tier.minLevel, 9);
  assert.equal(tier.imagePath.includes('avatar_grand_legend'), true);
});

test('isTierUnlocked checks level boundary accurately', () => {
  assert.equal(isTierUnlocked(4, 3), true);
  assert.equal(isTierUnlocked(2, 3), false);
  assert.equal(isTierUnlocked(7, 7), true);
  assert.equal(isTierUnlocked(6, 7), false);
});
