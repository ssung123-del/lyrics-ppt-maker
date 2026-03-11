import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBackgroundPrompt,
  extractPromptKeywords,
} from './backgroundPrompt';

test('extracts stable worship keywords from lyrics', () => {
  const keywords = extractPromptKeywords(
    '새벽의 빛으로 오신 주\n평안의 강물로 내 맘을 채우네',
  );

  assert.deepEqual(keywords.slice(0, 4), ['새벽', '빛', '평안', '강물']);
});

test('builds a single korean presentation prompt for bright reflective lyrics', () => {
  const prompt = buildBackgroundPrompt(
    '새벽의 빛으로 오신 주\n평안의 강물로 내 맘을 채우네',
  );

  assert.equal(prompt.moodLabel, '평안한 새벽 예배');
  assert.match(prompt.koreanPrompt, /16:9/);
  assert.match(prompt.koreanPrompt, /중앙 여백/);
  assert.match(prompt.koreanPrompt, /추상적|형이상학적/);
  assert.equal(prompt.recommendations.length >= 3, true);
  assert.equal('englishPrompt' in prompt, false);
  assert.equal('negativePrompt' in prompt, false);
});

test('keeps victorious lyrics presentation-safe instead of overly dramatic', () => {
  const prompt = buildBackgroundPrompt(
    '주의 영광 선포하리\n승리의 깃발 들리라\n불꽃 같은 성령의 바람',
  );

  assert.equal(prompt.moodLabel, '강렬한 승리 찬양');
  assert.match(prompt.koreanPrompt, /승리/);
  assert.match(prompt.koreanPrompt, /낮은 디테일|가독성 우선/);
  assert.equal('englishPrompt' in prompt, false);
  assert.equal('negativePrompt' in prompt, false);
});

test('returns a safe fallback prompt for empty lyrics', () => {
  const prompt = buildBackgroundPrompt('');

  assert.equal(prompt.keywords.length > 0, true);
  assert.equal(prompt.moodLabel, '차분한 예배 배경');
  assert.match(prompt.koreanPrompt, /가사 가독성 우선/);
  assert.equal(prompt.styleLabel.length > 0, true);
  assert.equal('englishPrompt' in prompt, false);
  assert.equal('negativePrompt' in prompt, false);
});
