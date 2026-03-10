import React, { useDeferredValue, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AlignCenter, Download, Image as ImageIcon, Type } from 'lucide-react';
import { parseLyricsToSlides } from './utils/lyricsParser';
import { generatePPT } from './utils/pptGenerator';
import {
  convertPptFontSizeToCqh,
  DEFAULT_PRESENTATION_FONT_STACK,
  PRESENTATION_LETTER_SPACING_EM,
  PRESENTATION_LINE_HEIGHT,
  PRESENTATION_PREVIEW_FRAME_STYLE,
  PRESENTATION_TEXT_BOX,
} from './utils/pptTypography';

interface FormValues {
  lyrics: string;
  fontColor: 'white' | 'black';
  hasShadow: boolean;
  fontSize: number;
}

const IMAGE_SIZE_LIMIT = 8 * 1024 * 1024;

export default function App() {
  const { register, control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      lyrics: '여기에 가사를 입력하세요.\n\n엔터를 두 번 치면\n다음 슬라이드로 넘어갑니다.',
      fontColor: 'white',
      hasShadow: true,
      fontSize: 44,
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPreviewSlide, setCurrentPreviewSlide] = useState(0);

  const lyrics = useWatch({ control, name: 'lyrics' });
  const fontColor = useWatch({ control, name: 'fontColor' });
  const hasShadow = useWatch({ control, name: 'hasShadow' });
  const fontSize = useWatch({ control, name: 'fontSize' });
  const deferredLyrics = useDeferredValue(lyrics || '');
  const slides = parseLyricsToSlides(deferredLyrics);

  useEffect(() => {
    if (currentPreviewSlide >= slides.length && slides.length > 0) {
      setCurrentPreviewSlide(slides.length - 1);
    }
  }, [slides.length, currentPreviewSlide]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > IMAGE_SIZE_LIMIT) {
      alert('8MB 이하 이미지만 업로드해 주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return;
      }

      setUploadedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsGenerating(true);
      await generatePPT({
        slides: parseLyricsToSlides(data.lyrics),
        backgroundImageUrl: uploadedImage || undefined,
        fontColor: data.fontColor,
        hasShadow: data.hasShadow,
        fontSize: data.fontSize,
      });
    } catch (error) {
      console.error('Failed to generate PPT:', error);
      alert('PPT 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const previewBackgroundStyle = uploadedImage
    ? {
        backgroundImage: `url(${uploadedImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : { backgroundColor: '#1A1A1A' };
  const previewOverlayStyle =
    fontColor === 'white'
      ? { background: 'linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.18))' }
      : { background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08))' };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#29204d,_#101010_45%)] text-zinc-100 flex flex-col md:flex-row">
      <div className="w-full md:w-[430px] lg:w-[500px] p-6 md:p-8 border-r border-white/8 flex flex-col h-screen overflow-y-auto shrink-0 bg-black/30 backdrop-blur-xl">
        <div className="mb-8 space-y-2">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300">Lyrics Stage Builder</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">이미지로 만드는 가사 PPT</h1>
          <p className="text-sm text-zinc-400">
            배경 이미지를 올리고 미리본 뒤 그대로 PPT로 내보냅니다.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 flex-1">
          <div className="flex flex-col gap-2 flex-1 min-h-[220px]">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <AlignCenter size={16} />
              가사 입력
            </label>
            <textarea
              {...register('lyrics')}
              className="flex-1 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-100 outline-none transition focus:border-amber-300/60 focus:bg-white/[0.07] resize-none leading-relaxed"
              placeholder="가사를 입력하세요. 빈 줄(엔터 2번)을 기준으로 슬라이드가 나뉩니다."
            />
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>총 {slides.length}개의 슬라이드가 생성됩니다.</span>
              <span>{uploadedImage ? '이미지 배경 적용됨' : '기본 다크 배경 사용 중'}</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <ImageIcon size={16} />
                배경 이미지
              </label>
              <span className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">up to 8mb</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="sr-only"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/14 bg-black/20 transition hover:border-amber-300/40 hover:bg-white/[0.05]"
            >
              {uploadedImage ? (
                <div className="relative h-36 w-full">
                  <img
                    src={uploadedImage}
                    alt="업로드한 배경 미리보기"
                    className="h-full w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-sm font-medium text-white">
                    이미지 교체
                  </div>
                </div>
              ) : (
                <div className="flex h-36 flex-col items-center justify-center gap-3 text-zinc-500">
                  <ImageIcon size={24} />
                  <div className="space-y-1 text-center">
                    <p className="text-sm text-zinc-300">직접 촬영한 이미지나 포스터를 올릴 수 있습니다.</p>
                    <p className="text-xs">업로드하지 않으면 기본 다크 배경으로 생성됩니다.</p>
                  </div>
                </div>
              )}
            </button>

            {uploadedImage && (
              <div className="mt-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setUploadedImage(null)}
                  className="text-xs text-red-300 transition hover:text-red-200"
                >
                  이미지 제거
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <label className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <Type size={16} />
              텍스트 스타일
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-zinc-500">글자색</span>
                <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
                  <button
                    type="button"
                    onClick={() => setValue('fontColor', 'white')}
                    className={`flex-1 rounded-lg py-2 text-sm transition ${
                      fontColor === 'white'
                        ? 'bg-white text-black'
                        : 'text-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    White
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('fontColor', 'black')}
                    className={`flex-1 rounded-lg py-2 text-sm transition ${
                      fontColor === 'black'
                        ? 'bg-white text-black'
                        : 'text-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    Black
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs text-zinc-500">그림자 효과</span>
                <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
                  <button
                    type="button"
                    onClick={() => setValue('hasShadow', true)}
                    className={`flex-1 rounded-lg py-2 text-sm transition ${
                      hasShadow ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    On
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('hasShadow', false)}
                    className={`flex-1 rounded-lg py-2 text-sm transition ${
                      !hasShadow ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    Off
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">폰트 크기</span>
                <span className="text-xs text-zinc-300">{fontSize}pt</span>
              </div>
              <input
                type="range"
                {...register('fontSize', { valueAsNumber: true })}
                min="20"
                max="120"
                step="2"
                className="w-full cursor-pointer appearance-none rounded-full accent-amber-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || slides.length === 0}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#F5D0FE,#FDE68A,#FDBA74)] px-4 py-4 font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="animate-pulse">생성 중...</span>
            ) : (
              <>
                <Download size={18} />
                PPT 다운로드
              </>
            )}
          </button>
        </form>
      </div>

      <div className="flex-1 flex flex-col bg-black/20 relative overflow-hidden">
        <div className="absolute top-6 left-6 z-10">
          <span className="rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-zinc-300">
            Preview
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 md:p-12">
          {slides.length > 0 ? (
            <div
              className="w-full max-w-5xl aspect-video rounded-[28px] shadow-[0_30px_120px_rgba(0,0,0,0.35)] relative overflow-hidden ring-1 ring-white/10 flex flex-col"
              style={PRESENTATION_PREVIEW_FRAME_STYLE}
            >
              <div className="absolute inset-0" style={previewBackgroundStyle} />
              <div className="absolute inset-0" style={previewOverlayStyle} />

              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  paddingLeft: PRESENTATION_TEXT_BOX.x,
                  paddingRight: PRESENTATION_TEXT_BOX.x,
                  paddingTop: PRESENTATION_TEXT_BOX.y,
                  paddingBottom: PRESENTATION_TEXT_BOX.y,
                }}
              >
                <p
                  className="text-center whitespace-pre-wrap w-full"
                  style={{
                    color: fontColor === 'white' ? '#FFFFFF' : '#060606',
                    fontSize: `${convertPptFontSizeToCqh(fontSize)}cqh`,
                    fontWeight: 'bold',
                    fontFamily: DEFAULT_PRESENTATION_FONT_STACK,
                    wordBreak: 'keep-all',
                    overflowWrap: 'break-word',
                    textShadow: hasShadow
                      ? fontColor === 'white'
                        ? '0px 0.7cqh 1cqh rgba(0,0,0,0.82)'
                        : '0px 0.7cqh 1cqh rgba(255,255,255,0.55)'
                      : 'none',
                    lineHeight: PRESENTATION_LINE_HEIGHT,
                    maxHeight: '100%',
                    letterSpacing: `${PRESENTATION_LETTER_SPACING_EM}em`,
                  }}
                >
                  {slides[currentPreviewSlide]}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-zinc-600 flex flex-col items-center gap-4">
              <AlignCenter size={48} className="opacity-20" />
              <p>가사를 입력하면 미리보기가 표시됩니다.</p>
            </div>
          )}
        </div>

        {slides.length > 1 && (
          <div className="h-20 border-t border-white/6 bg-black/30 backdrop-blur-md flex items-center justify-center gap-4 px-6 absolute bottom-0 left-0 right-0">
            <button
              onClick={() => setCurrentPreviewSlide(Math.max(0, currentPreviewSlide - 1))}
              disabled={currentPreviewSlide === 0}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              이전
            </button>
            <span className="text-sm font-mono text-zinc-500">
              {currentPreviewSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() =>
                setCurrentPreviewSlide(Math.min(slides.length - 1, currentPreviewSlide + 1))
              }
              disabled={currentPreviewSlide === slides.length - 1}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
