export const DEFAULT_PRESENTATION_FONT_FAMILY = 'Pretendard';
export const DEFAULT_PRESENTATION_FONT_STACK =
  '"Pretendard", "Malgun Gothic", "맑은 고딕", sans-serif';
export const PRESENTATION_PREVIEW_FRAME_STYLE = {
  containerType: 'size',
} as const;
export const PPT_LAYOUT_HEIGHT_PT = 540;
export const PRESENTATION_TEXT_BOX = {
  x: '5%',
  y: '5%',
  w: '90%',
  h: '90%',
} as const;
export const PRESENTATION_LINE_HEIGHT = 1.2;
export const PRESENTATION_LETTER_SPACING_EM = -0.02;
export const PRESENTATION_PPT_CHAR_SPACING = -1;

export function convertPptFontSizeToCqh(fontSize: number): number {
  return Number(((fontSize / PPT_LAYOUT_HEIGHT_PT) * 100).toFixed(2));
}
