interface PromptKeyword {
  label: string;
  matches: string[];
  moodTags: Array<'calm' | 'dawn' | 'victory' | 'glory' | 'prayer' | 'hope' | 'fire'>;
}

export interface BackgroundPromptResult {
  keywords: string[];
  moodLabel: string;
  styleLabel: string;
  recommendations: string[];
  koreanPrompt: string;
}

const PROMPT_KEYWORDS: PromptKeyword[] = [
  {
    label: '새벽',
    matches: ['새벽', '아침', '동틀', '해뜰'],
    moodTags: ['dawn', 'calm', 'hope'],
  },
  {
    label: '빛',
    matches: ['빛', '광채', '햇살', '비추', '찬란'],
    moodTags: ['dawn', 'hope', 'glory'],
  },
  {
    label: '평안',
    matches: ['평안', '안식', '쉼', '고요'],
    moodTags: ['calm', 'hope'],
  },
  {
    label: '강물',
    matches: ['강물', '강', '물', '시냇가', '샘'],
    moodTags: ['calm', 'hope'],
  },
  {
    label: '기도',
    matches: ['기도', '간구', '부르짖', '무릎'],
    moodTags: ['prayer', 'calm'],
  },
  {
    label: '십자가',
    matches: ['십자가', '보혈', '구원', '희생'],
    moodTags: ['prayer', 'hope'],
  },
  {
    label: '영광',
    matches: ['영광', '거룩', '왕', '존귀'],
    moodTags: ['glory', 'victory'],
  },
  {
    label: '승리',
    matches: ['승리', '깃발', '정복', '이기'],
    moodTags: ['victory', 'glory'],
  },
  {
    label: '불꽃',
    matches: ['불꽃', '불', '타오르', '화염'],
    moodTags: ['fire', 'victory'],
  },
  {
    label: '성령의 바람',
    matches: ['성령', '바람', '호흡', '숨'],
    moodTags: ['fire', 'glory', 'victory'],
  },
  {
    label: '사랑',
    matches: ['사랑', '은혜', '자비', '품으'],
    moodTags: ['hope', 'calm'],
  },
  {
    label: '회복',
    matches: ['회복', '새롭게', '치유', '부활'],
    moodTags: ['hope', 'dawn'],
  },
];

const STOP_WORDS = [
  '여기에',
  '가사를',
  '입력하세요',
  '주',
  '하나님',
  '우리',
  '나의',
  '내',
  '그',
  '이',
  '저',
  'and',
  'the',
];

function normalizeText(text: string): string {
  return text.toLowerCase();
}

function sanitizeWord(word: string): string {
  return word.replace(/[^\p{L}\p{N}]/gu, '').trim();
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function detectMood(keywords: PromptKeyword[]): BackgroundPromptResult['moodLabel'] {
  const scores = {
    calmDawn: 0,
    victoryPraise: 0,
    prayerNight: 0,
    hopeRecovery: 0,
  };

  keywords.forEach((keyword) => {
    if (keyword.moodTags.includes('dawn') || keyword.moodTags.includes('calm')) {
      scores.calmDawn += 1;
    }
    if (
      keyword.moodTags.includes('victory') ||
      keyword.moodTags.includes('glory') ||
      keyword.moodTags.includes('fire')
    ) {
      scores.victoryPraise += 1;
    }
    if (keyword.moodTags.includes('prayer')) {
      scores.prayerNight += 1;
    }
    if (keyword.moodTags.includes('hope')) {
      scores.hopeRecovery += 1;
    }
  });

  const topScore = Math.max(
    scores.calmDawn,
    scores.victoryPraise,
    scores.prayerNight,
    scores.hopeRecovery,
  );

  if (topScore === 0) {
    return '차분한 예배 배경';
  }
  if (scores.victoryPraise === topScore) {
    return '강렬한 승리 찬양';
  }
  if (scores.prayerNight === topScore) {
    return '깊은 묵상과 기도';
  }
  if (scores.calmDawn === topScore) {
    return '평안한 새벽 예배';
  }
  if (scores.hopeRecovery === topScore) {
    return '회복과 소망의 예배';
  }

  return '차분한 예배 배경';
}

function getPromptStyle(moodLabel: BackgroundPromptResult['moodLabel']) {
  switch (moodLabel) {
    case '강렬한 승리 찬양':
      return {
        styleLabel: '가독성 우선 · 절제된 승리 광채',
        koreanScene: '승리의 정서를 담되 과하지 않은 추상 예배 배경',
        koreanAtmosphere:
          '깊은 남청 바탕, 절제된 금빛 광선, 번지는 에너지 결, 중심은 비워 둔 차분한 구성',
      };
    case '깊은 묵상과 기도':
      return {
        styleLabel: '가독성 우선 · 심연형 묵상 배경',
        koreanScene: '고요한 기도와 묵상에 맞는 추상적 예배 배경',
        koreanAtmosphere:
          '어두운 남색 그라데이션, 옅은 보랏빛 안개, 먼 수직광 하나, 정적인 공기감',
      };
    case '회복과 소망의 예배':
      return {
        styleLabel: '가독성 우선 · 회복형 안개 그라데이션',
        koreanScene: '회복과 소망을 담은 부드러운 추상 예배 배경',
        koreanAtmosphere: '청록과 금빛의 얇은 그라데이션, 희미한 안개층, 부드러운 수평 확산광',
      };
    case '평안한 새벽 예배':
      return {
        styleLabel: '가독성 우선 · 새벽 추상 레이어',
        koreanScene: '평안한 새벽 예배에 맞는 추상적 배경',
        koreanAtmosphere:
          '낮은 디테일의 새벽빛 그라데이션, 푸른 그림자, 얇은 안개층, 절제된 금빛 확산',
      };
    default:
      return {
        styleLabel: '가독성 우선 · 미니멀 예배 배경',
        koreanScene: '미니멀한 예배 배경',
        koreanAtmosphere: '차콜 톤 그라데이션, 부드러운 확산광, 절제된 안개, 과하지 않은 깊이감',
      };
  }
}

function getPromptRecommendations(
  moodLabel: BackgroundPromptResult['moodLabel'],
): BackgroundPromptResult['recommendations'] {
  const baseRecommendations = [
    '중앙 60%는 비워 두고 가사를 올릴 공간으로 유지',
    '배경 디테일은 가장자리 쪽에만 약하게 두고 중심은 흐리게 유지',
    '십자가, 사람, 건물보다 빛·안개·그라데이션 같은 추상 요소를 우선',
  ];

  switch (moodLabel) {
    case '강렬한 승리 찬양':
      return [
        ...baseRecommendations,
        '승리 분위기도 불꽃이나 깃발을 직접 그리지 말고 금빛 광채로만 상징화',
      ];
    case '깊은 묵상과 기도':
      return [
        ...baseRecommendations,
        '어두운 톤 안에서 작은 수직광 하나 정도만 두어 집중감을 유지',
      ];
    case '회복과 소망의 예배':
      return [
        ...baseRecommendations,
        '회복 이미지는 자연 풍경보다 청록-금빛 안개 레이어로 표현',
      ];
    case '평안한 새벽 예배':
      return [
        ...baseRecommendations,
        '색은 남청, 새벽빛, 은은한 금빛 정도의 2~3톤 안에서 제한',
      ];
    default:
      return [
        ...baseRecommendations,
        '명확한 피사체 대신 낮은 대비의 무대성과 공기감만 남기기',
      ];
  }
}

export function extractPromptKeywords(lyrics: string): string[] {
  const normalizedLyrics = normalizeText(lyrics);
  const foundKeywords = PROMPT_KEYWORDS
    .map((keyword, index) => {
      const matchIndexes = keyword.matches
        .map((match) => normalizedLyrics.indexOf(normalizeText(match)))
        .filter((matchIndex) => matchIndex >= 0);
      const firstMatchIndex = matchIndexes.length > 0 ? Math.min(...matchIndexes) : Number.POSITIVE_INFINITY;

      return {
        keyword,
        firstMatchIndex,
        index,
      };
    })
    .filter((entry) => Number.isFinite(entry.firstMatchIndex))
    .sort((left, right) => {
      if (left.firstMatchIndex !== right.firstMatchIndex) {
        return left.firstMatchIndex - right.firstMatchIndex;
      }

      return left.index - right.index;
    })
    .map((entry) => entry.keyword.label);

  if (foundKeywords.length >= 4) {
    return unique(foundKeywords).slice(0, 6);
  }

  const fallbackWords = unique(
    normalizedLyrics
      .split(/\s+/)
      .map(sanitizeWord)
      .filter((word) => word.length >= 2 && !STOP_WORDS.includes(word)),
  ).slice(0, 6);

  return unique([...foundKeywords, ...fallbackWords]).slice(0, 6);
}

export function buildBackgroundPrompt(lyrics: string): BackgroundPromptResult {
  const keywords = extractPromptKeywords(lyrics);
  const matchedKeywordEntries = keywords
    .map((label) => PROMPT_KEYWORDS.find((keyword) => keyword.label === label))
    .filter((keyword): keyword is PromptKeyword => Boolean(keyword));
  const moodLabel = detectMood(matchedKeywordEntries);
  const style = getPromptStyle(moodLabel);
  const recommendations = getPromptRecommendations(moodLabel);
  const keywordPhraseKo = keywords.length > 0 ? keywords.join(', ') : '예배, 찬양, 무대';

  return {
    keywords: keywords.length > 0 ? keywords : ['예배', '찬양', '무대'],
    moodLabel,
    styleLabel: style.styleLabel,
    recommendations,
    koreanPrompt: [
      '16:9 비율의 배경 이미지',
      style.koreanScene,
      style.koreanAtmosphere,
      '가사 가독성 우선, 중앙 여백 확보, 중심은 비워 두고 가장자리만 은은하게 디테일',
      '형이상학적이고 추상적인 표현, 핵심 키워드는 상징적으로만 반영하고 사물은 직접 묘사하지 않음',
      `핵심 키워드: ${keywordPhraseKo}`,
      '사람 없음, 글자 없음, 로고 없음, 과한 질감 없음, 고대비 없음, 예배 가사 자막을 올리기 좋은 배경용 이미지, 고해상도',
    ].join(', '),
  };
}
