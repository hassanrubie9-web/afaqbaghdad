import test from 'node:test';
import assert from 'node:assert/strict';
import { chineseZodiacForYear, signLabelArabic } from '@/lib/astro/traditions';

test('chinese zodiac returns stable outputs', () => {
  const z = chineseZodiacForYear(2000);
  assert.ok(z.animal_ar.length > 0);
  assert.ok(z.element_ar.length > 0);
});

test('arabic sign label exists', () => {
  const s = signLabelArabic('Aries', 'western_tropical');
  assert.equal(s.glyph, '♈');
  assert.ok(s.name.length > 0);
});
