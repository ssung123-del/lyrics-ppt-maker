import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import App from './App';

test('does not render prompt recommendation section or prompt badges', () => {
  const markup = renderToStaticMarkup(React.createElement(App));

  assert.equal(markup.includes('추천 배경 방향'), false);
  assert.equal(markup.includes('차분한 예배 배경'), false);
  assert.equal(markup.includes('가독성 우선 · 미니멀 예배 배경'), false);
});
