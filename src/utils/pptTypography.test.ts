import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PRESENTATION_FONT_FAMILY,
  DEFAULT_PRESENTATION_FONT_STACK,
  PRESENTATION_PREVIEW_FRAME_STYLE,
  PPT_LAYOUT_HEIGHT_PT,
  PRESENTATION_LINE_HEIGHT,
  PRESENTATION_TEXT_BOX,
  convertPptFontSizeToCqh,
} from './pptTypography';

test('uses the 16:9 powerpoint slide height for preview font scaling', () => {
  assert.equal(PPT_LAYOUT_HEIGHT_PT, 540);
  assert.equal(convertPptFontSizeToCqh(54), 10);
  assert.equal(convertPptFontSizeToCqh(44), Number(((44 / 540) * 100).toFixed(2)));
});

test('shares the same presentation theme constants between preview and ppt export', () => {
  assert.equal(DEFAULT_PRESENTATION_FONT_FAMILY, 'Pretendard');
  assert.match(DEFAULT_PRESENTATION_FONT_STACK, /^"Pretendard"/);
  assert.deepEqual(PRESENTATION_PREVIEW_FRAME_STYLE, {
    containerType: 'size',
  });
  assert.deepEqual(PRESENTATION_TEXT_BOX, {
    x: '5%',
    y: '5%',
    w: '90%',
    h: '90%',
  });
  assert.equal(PRESENTATION_LINE_HEIGHT, 1.2);
});
