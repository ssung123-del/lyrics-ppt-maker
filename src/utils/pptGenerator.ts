import pptxgen from 'pptxgenjs';
import {
  DEFAULT_PRESENTATION_FONT_FAMILY,
  PRESENTATION_LINE_HEIGHT,
  PRESENTATION_PPT_CHAR_SPACING,
  PRESENTATION_TEXT_BOX,
} from './pptTypography';

export interface PptOptions {
  slides: string[];
  backgroundImageUrl?: string;
  fontColor: 'white' | 'black';
  hasShadow: boolean;
  fontSize: number;
}

export async function generatePPT(options: PptOptions): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  options.slides.forEach((slideText) => {
    const slide = pptx.addSlide();

    if (options.backgroundImageUrl) {
      slide.background = { data: options.backgroundImageUrl };
    } else {
      slide.background = { color: '1A1A1A' };
    }

    const textOptions: pptxgen.TextPropsOptions = {
      x: PRESENTATION_TEXT_BOX.x,
      y: PRESENTATION_TEXT_BOX.y,
      w: PRESENTATION_TEXT_BOX.w,
      h: PRESENTATION_TEXT_BOX.h,
      align: 'center',
      valign: 'middle',
      fontSize: options.fontSize,
      color: options.fontColor === 'white' ? 'FFFFFF' : '000000',
      fontFace: DEFAULT_PRESENTATION_FONT_FAMILY,
      bold: true,
      wrap: true,
      lineSpacing: options.fontSize * PRESENTATION_LINE_HEIGHT,
      charSpacing: PRESENTATION_PPT_CHAR_SPACING,
      breakLine: true,
    };

    if (options.hasShadow) {
      textOptions.shadow = {
        type: 'outer',
        color: options.fontColor === 'white' ? '000000' : 'FFFFFF',
        opacity: 0.8,
        offset: 3,
        blur: 4,
      };
    }

    slide.addText(slideText, textOptions);
  });

  await pptx.writeFile({ fileName: 'Lyrics_Presentation.pptx' });
}
