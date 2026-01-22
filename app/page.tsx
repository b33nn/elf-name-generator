'use client';

import { useEffect, useRef, useState } from 'react';
import { featuredCharacters } from '@/lib/featured-characters';
import { AuthButton } from '@/components/AuthButton';

type Race = {
  id: string;
  displayName: string;
  description: string;
};

type Character = {
  name: string;
  meaning: string;
  raceId: string;
  parts: Array<{ text: string; meaning: string }>;
  oc?: {
    class: string;
    personality: string[];
    background: string;
  };
  imageUrl?: string;
};

type Gender = 'feminine' | 'masculine' | 'neutral';
type Locale = 'en' | 'zh';

const copy = {
  en: {
    nav: {
      generator: 'Generator',
      features: 'Featured',
      pricing: 'Pricing',
    },
    hero: {
      kicker: 'Elf Name Generator',
      title: 'Elf Name Generator',
      subtitle: '& OC Creator',
      description:
        'Forge unique Elven identities with AI. Generate names, detailed backstories, and visualize your character in seconds.',
    },
    form: {
      subrace: 'Elf Sub-race',
      gender: 'Gender',
      quantity: 'Quantity',
      racesLoading: 'Loading races...',
      submit: 'Summon Elf Character',
      submitLoading: 'Summoning...',
    },
    ocLoading: {
      class: 'Summoning...',
      personality: 'Gathering traits...',
      background: 'Weaving a new story from starlight.',
    },
    results: {
      title: 'Generated Results',
      countSingle: 'character',
      countPlural: 'characters',
      countSuffix: 'found',
      portraitPending: 'Portrait Pending',
      classRole: 'Class / Role',
      classPlaceholder: 'Awaiting insight',
      traits: 'Traits',
      traitsPlaceholder: 'Generate an OC to reveal traits.',
      background: 'Background Story',
      backgroundPlaceholder: 'Summon an OC profile to reveal their lore and destiny.',
      nameParts: 'Name Parts',
      generateOc: 'Generate OC',
      generatePortrait: 'Generate Portrait',
      copy: 'Copy',
      awaitingSummoning: 'Awaiting Summoning',
      noCharactersTitle: 'No characters yet',
      noCharactersDescription: 'Choose a sub-race and call forth your first elf.',
      roster: 'Character Roster',
    },
    stats: {
      creators: 'creators used today',
    },
    features: {
      kicker: 'Featured',
      title: 'Featured Elf Characters',
      description:
        'Explore our collection of unique elf names and characters. Each profile is crafted with rich backstories and meanings for fantasy worlds and RPG campaigns.',
      note: 'Curated weekly from community summons and lorekeepers.',
      badge: 'Archive',
    },
    about: {
      title: 'About Elf Name Generator',
      p1: 'Our Elf Name Generator is a powerful tool designed for fantasy writers, RPG players, and worldbuilders. Generate authentic elf names inspired by High Elves, Wood Elves, Dark Elves, Night Elves, and Blood Elves.',
      p2: 'Each generated name comes with its meaning and etymology, helping you create believable characters for novels, campaigns, and original universes.',
      racesTitle: 'Elf Race Types',
      races: [
        'High Elves: Noble and wise, masters of magic and ancient lore',
        'Wood Elves: Swift and graceful, guardians of the ancient forests',
        'Dark Elves: Cunning and ruthless, masters of shadow and deception',
        'Night Elves: Mysterious and ancient, blessed by the moon and stars',
        'Blood Elves: Elegant and proud, wielders of arcane power',
      ],
    },
    gender: {
      feminine: 'Female',
      masculine: 'Male',
      neutral: 'Neutral',
    },
    languageToggle: {
      toZh: '中文',
      toEn: 'EN',
      ariaEn: 'Switch to English',
      ariaZh: '切换到中文',
    },
    alerts: {
      generateFailed: 'Failed to generate character',
      unknown: 'Unknown error',
    },
  },
  zh: {
    nav: {
      generator: '生成器',
      features: '精选',
      pricing: '定价',
    },
    hero: {
      kicker: '精灵姓名生成器',
      title: '精灵姓名生成器',
      subtitle: '& OC 角色创作',
      description: '用 AI 铸造独一无二的精灵身份。生成姓名、完整背景，并在数秒内可视化角色。',
    },
    form: {
      subrace: '精灵亚种',
      gender: '性别',
      quantity: '数量',
      racesLoading: '正在加载种族...',
      submit: '召唤精灵角色',
      submitLoading: '正在召唤...',
    },
    ocLoading: {
      class: '召唤中...',
      personality: '正在收集特质...',
      background: '正在编织星光故事。',
    },
    results: {
      title: '生成结果',
      countSingle: '角色',
      countPlural: '角色',
      countSuffix: '已生成',
      portraitPending: '画像待生成',
      classRole: '职业 / 角色',
      classPlaceholder: '等待启示',
      traits: '性格特质',
      traitsPlaceholder: '生成 OC 以解锁特质。',
      background: '背景故事',
      backgroundPlaceholder: '召唤 OC 档案以揭示其传说与命运。',
      nameParts: '姓名构成',
      generateOc: '生成 OC',
      generatePortrait: '生成画像',
      copy: '复制',
      awaitingSummoning: '等待召唤',
      noCharactersTitle: '暂无角色',
      noCharactersDescription: '选择一个亚种并召唤你的第一位精灵。',
      roster: '角色名单',
    },
    stats: {
      creators: '今日已有创作者使用',
    },
    features: {
      kicker: '精选',
      title: '精选精灵角色',
      description: '探索我们精选的精灵姓名与角色档案。每个档案都带有完整背景与含义，适用于幻想世界与 RPG 战役。',
      note: '每周从社区召唤与典籍守护者中甄选。',
      badge: '档案库',
    },
    about: {
      title: '关于精灵姓名生成器',
      p1: '精灵姓名生成器专为奇幻作者、RPG 玩家与世界观构建者打造。可生成受高等精灵、木精灵、黑暗精灵、暗夜精灵与血精灵启发的真实姓名。',
      p2: '每个生成的名字都附带含义与词源，帮助你塑造可信的角色，用于小说、战役或原创宇宙。',
      racesTitle: '精灵种族类型',
      races: [
        '高等精灵：高贵睿智，精通魔法与古老学识',
        '木精灵：敏捷优雅，守护远古森林',
        '黑暗精灵：狡黠残酷，掌控阴影与诡计',
        '暗夜精灵：神秘古老，受月光与星辰祝福',
        '血精灵：优雅自豪，驾驭奥术力量',
      ],
    },
    gender: {
      feminine: '女性',
      masculine: '男性',
      neutral: '中性',
    },
    languageToggle: {
      toZh: '中文',
      toEn: 'EN',
      ariaEn: 'Switch to English',
      ariaZh: '切换到中文',
    },
    alerts: {
      generateFailed: '生成角色失败',
      unknown: '未知错误',
    },
  },
} as const;

const genderOptions: Gender[] = ['feminine', 'masculine', 'neutral'];

const countOptions = [1, 5, 10];

export default function Home() {
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [gender, setGender] = useState<Gender>('neutral');
  const [count, setCount] = useState<number>(1);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [locale, setLocale] = useState<Locale>('en');
  const [error, setError] = useState<string>('');
  const [loadingOC, setLoadingOC] = useState<Set<number>>(new Set());
  const [loadingImage, setLoadingImage] = useState<Set<number>>(new Set());
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem('elfforge-locale');
    if (savedLocale === 'en' || savedLocale === 'zh') {
      setLocale(savedLocale);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('elfforge-locale', locale);
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  }, [locale]);

  useEffect(() => {
    fetch('/api/generate/name')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load races');
        return res.json();
      })
      .then((data) => {
        setRaces(data.races);
        if (data.races.length > 0) {
          setSelectedRace(data.races[0].id);
        }
      })
      .catch((error) => {
        console.error('Failed to load races:', error);
        setError('Failed to load elf races. Please refresh the page.');
      });
  }, []);

  useEffect(() => {
    if (characters.length === 0) return;
    if (activeIndex >= characters.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, characters.length]);

  const handleGenerate = async () => {
    if (!selectedRace || loading) return;
    setLoading(true);
    setError('');

    // Mobile UX: Scroll to results immediately when starting generation
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    try {
      const res = await fetch('/api/generate/name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raceId: selectedRace, gender, count }),
      });

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await res.json();
      setCharacters(data.characters);
      setActiveIndex(0);
    } catch (error) {
      console.error('Failed to generate names:', error);
      setError(t.alerts.generateFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOC = async (index: number) => {
    const char = characters[index];
    if (!char || loadingOC.has(index)) return;

    setLoadingOC((prev) => new Set(prev).add(index));

    const updated = [...characters];
    updated[index] = {
      ...updated[index],
      oc: {
        class: copy[locale].ocLoading.class,
        personality: [copy[locale].ocLoading.personality],
        background: copy[locale].ocLoading.background,
      },
    };
    setCharacters(updated);

    try {
      const res = await fetch('/api/generate/oc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: char.name, race: char.raceId, gender }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const finalUpdated = [...characters];
      finalUpdated[index] = { ...finalUpdated[index], oc: data.oc };
      setCharacters(finalUpdated);
    } catch (error) {
      console.error('Failed to generate OC:', error);
      setError(
        `${copy[locale].alerts.generateFailed}: ${
          error instanceof Error ? error.message : copy[locale].alerts.unknown
        }`
      );

      const revertUpdated = [...characters];
      delete revertUpdated[index].oc;
      setCharacters(revertUpdated);
    } finally {
      setLoadingOC((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const handleGenerateImage = async (index: number) => {
    const char = characters[index];
    if (!char || loadingImage.has(index)) return;

    setLoadingImage((prev) => new Set(prev).add(index));

    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: char.name, race: char.raceId, oc: char.oc }),
      });
      const data = await res.json();
      const updated = [...characters];
      updated[index] = { ...updated[index], imageUrl: data.imageUrl };
      setCharacters(updated);
    } catch (error) {
      console.error('Failed to generate image:', error);
      setError('Failed to generate portrait');
    } finally {
      setLoadingImage((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const activeCharacter = characters[activeIndex];
  const t = copy[locale];
  const genderLabel = t.gender[gender];
  const labelTracking = locale === 'en' ? 'uppercase tracking-[0.08em]' : 'tracking-normal';
  const actionTracking = locale === 'en' ? 'uppercase tracking-[0.1em]' : 'tracking-normal';
  const resultsCountLabel =
    locale === 'en'
      ? `${characters.length} ${
          characters.length === 1 ? t.results.countSingle : t.results.countPlural
        } ${t.results.countSuffix}`
      : `已生成 ${characters.length} 个角色`;
  const languageLabel = locale === 'en' ? t.languageToggle.toZh : t.languageToggle.toEn;
  const languageAriaLabel = locale === 'en' ? t.languageToggle.ariaZh : t.languageToggle.ariaEn;
  const getRaceLabel = (raceId: string) =>
    races.find((race) => race.id === raceId)?.displayName ?? raceId;
  const hasRoster = characters.length > 1;
  const featuredPrimary = featuredCharacters[0];
  const featuredSecondary = featuredCharacters.slice(1);

  return (
    <main className="min-h-screen text-emerald-950 font-body">
      {/* Error Alerts */}
      {error && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-rise">
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 shadow-[0_20px_50px_-20px_rgba(220,38,38,0.4)]">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5 text-red-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            <span className="text-sm font-medium text-red-900">{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              className="ml-2 rounded-full p-1 text-red-600 transition hover:bg-red-100"
              aria-label="Close error"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-emerald-200/40 blur-[110px]" />
          <div className="absolute -right-32 -top-20 h-96 w-96 rounded-full bg-amber-200/50 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-100/60 blur-[120px]" />
        </div>

        <header className="relative bg-[#0b3d2e] text-emerald-50 shadow-[0_8px_30px_-20px_rgba(7,24,18,0.9)]">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/70 ring-1 ring-emerald-400/40">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5 text-amber-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 8l4-4h8l4 4-8 12-8-12z" />
                  <path d="M4 8h16" />
                  <path d="M9 8l3 12" />
                  <path d="M15 8l-3 12" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg tracking-[0.35em]">ELFFORGE</span>
              </div>
            </div>
            <div className={`hidden items-center gap-8 text-[12px] text-emerald-100/70 md:flex ${labelTracking}`}>
              <a href="#generator" className="transition hover:text-amber-200">
                {t.nav.generator}
              </a>
              <a href="#features" className="transition hover:text-amber-200">
                {t.nav.features}
              </a>
              <a href="#pricing" className="font-bold text-amber-300 transition hover:text-amber-200">
                {t.nav.pricing}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
                aria-label={languageAriaLabel}
                className={`inline-flex items-center gap-2 rounded-full border border-emerald-700/60 bg-emerald-900/60 px-3 py-1 text-[10px] text-emerald-100/80 transition hover:bg-emerald-800/80 ${labelTracking}`}
              >
                <svg
                  viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
                <path d="M3 12h18" />
                <path d="M5 8h14" />
                <path d="M5 16h14" />
                <path d="M12 3a15 15 0 010 18" />
                <path d="M12 3a15 15 0 000 18" />
              </svg>
              {languageLabel}
            </button>
              <AuthButton locale={locale} />
            </div>
          </nav>
        </header>

        <section
          id="generator"
          className="relative mx-auto max-w-6xl px-6 pb-16 pt-10 lg:pb-20 lg:pt-14"
        >
          {/* Main Grid: Left side for Intro & Form, Right side for Results */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            {/* Left Column: Hero + Form */}
            <div className="space-y-8">
              <div className="space-y-6 animate-rise">
                <div>
                  <p className={`text-xs text-emerald-700 ${labelTracking}`}>{t.hero.kicker}</p>
                  <h1 className="font-display mt-4 text-4xl font-extrabold leading-tight text-emerald-950 sm:text-5xl lg:text-6xl">
                    {t.hero.title}
                    <span className="block text-emerald-700">{t.hero.subtitle}</span>
                  </h1>
                  <p className="mt-4 max-w-md text-lg text-emerald-700">
                    {t.hero.description}
                  </p>
                </div>
              </div>

              <div className="animate-rise">
                <div className="rounded-[24px] border border-emerald-100/80 bg-white/80 p-6 shadow-[0_24px_60px_-40px_rgba(15,45,34,0.6)] backdrop-blur">
                  <div className="space-y-6">
                    <div>
                      <label className={`text-xs font-semibold text-emerald-700 ${labelTracking}`}>
                        {t.form.subrace}
                      </label>
                      <div className="relative mt-2">
                        <select
                          value={selectedRace}
                          onChange={(e) => setSelectedRace(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-emerald-100 bg-white/90 px-4 py-3 text-sm font-semibold text-emerald-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                          {races.length === 0 && (
                            <option value="" disabled>
                              {t.form.racesLoading}
                            </option>
                          )}
                          {races.map((race) => (
                            <option key={race.id} value={race.id}>
                              {race.displayName}
                            </option>
                          ))}
                        </select>
                        <svg
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        >
                          <path d="M6 8l4 4 4-4" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label className={`text-xs font-semibold text-emerald-700 ${labelTracking}`}>
                        {t.form.gender}
                      </label>
                      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-emerald-100 bg-white/90 p-2">
                        {genderOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setGender(option)}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                              gender === option
                                ? 'bg-emerald-900 text-amber-100 shadow-[0_10px_30px_-20px_rgba(10,40,30,0.8)]'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                            aria-pressed={gender === option}
                          >
                            {t.gender[option]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`text-xs font-semibold text-emerald-700 ${labelTracking}`}>
                        {t.form.quantity}
                      </label>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {countOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setCount(option)}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                              count === option
                                ? 'border-emerald-800 bg-emerald-900 text-amber-100'
                                : 'border-emerald-100 bg-white/90 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full border border-emerald-700 ${
                                count === option ? 'bg-emerald-200' : 'bg-transparent'
                              }`}
                            />
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleGenerate}
                      disabled={loading || !selectedRace}
                      className={`w-full rounded-xl bg-emerald-900 px-6 py-4 text-sm font-semibold text-amber-100 shadow-[0_20px_40px_-28px_rgba(10,40,30,0.9)] transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 ${actionTracking}`}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <span aria-hidden="true" className="text-base">✨</span>
                        <span>{loading ? t.form.submitLoading : t.form.submit}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="animate-rise hidden lg:block">
                <div className="flex items-center gap-4 text-sm text-emerald-700">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full border border-white bg-emerald-200" />
                    <div className="h-8 w-8 rounded-full border border-white bg-amber-200" />
                    <div className="h-8 w-8 rounded-full border border-white bg-emerald-100" />
                  </div>
                  <span>
                    <span className="font-semibold text-emerald-950">10,000+</span> {t.stats.creators}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Active Results */}
            <div ref={resultsRef} className="space-y-6 lg:min-h-[600px]">
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 lg:px-0">
                <h2 className="font-display text-2xl text-emerald-950">{t.results.title}</h2>
                <span className={`text-xs text-emerald-600 ${labelTracking}`}>
                  {resultsCountLabel}
                </span>
              </div>

              <div className="animate-rise-delay-1">
                {activeCharacter ? (
                  <div className="rounded-[28px] border border-emerald-100/80 bg-white/80 p-6 shadow-[0_24px_60px_-40px_rgba(15,45,34,0.6)] backdrop-blur">
                    <div className="grid gap-6">
                      {/* Portrait & Core Info Header */}
                      <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
                        <div className="relative overflow-hidden rounded-2xl bg-emerald-900/90 aspect-square sm:aspect-auto sm:h-auto">
                          {activeCharacter.imageUrl ? (
                            <img
                              src={activeCharacter.imageUrl}
                              alt={`${activeCharacter.name} portrait`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 text-center text-amber-100/80 p-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/50 bg-emerald-800/80">
                                <svg
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                  className="h-6 w-6 text-amber-200"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                >
                                  <path d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.2l5-.7L12 3z" />
                                </svg>
                              </div>
                              <span className={`text-[10px] ${labelTracking}`}>
                                {t.results.portraitPending}
                              </span>
                            </div>
                          )}
                          <div
                            className={`absolute bottom-2 left-2 right-2 rounded-full bg-emerald-950/70 px-3 py-1 text-[9px] text-amber-100 text-center ${labelTracking}`}
                          >
                            {getRaceLabel(activeCharacter.raceId)}
                          </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span
                              className={`rounded-full bg-amber-100/80 px-3 py-1 text-[10px] font-semibold text-amber-800 ${labelTracking}`}
                            >
                              {genderLabel}
                            </span>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(activeCharacter.name)}
                              className={`inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-3 py-1 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-50 ${labelTracking}`}
                            >
                              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 8h10v12H8z" />
                                <path d="M6 4h10v4H6z" />
                              </svg>
                              {t.results.copy}
                            </button>
                          </div>

                          <div>
                            <h3 className="font-display text-4xl text-emerald-950">
                              {activeCharacter.name}
                            </h3>
                            <p className="mt-1 text-sm italic text-emerald-700 leading-relaxed">
                              "{activeCharacter.meaning}"
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Content Grid */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                          <p className={`text-[10px] font-semibold text-emerald-600 ${labelTracking}`}>
                            {t.results.classRole}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-emerald-900">
                            {activeCharacter.oc?.class ?? t.results.classPlaceholder}
                          </p>
                        </div>
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                          <p className={`text-[10px] font-semibold text-emerald-600 ${labelTracking}`}>
                            {t.results.traits}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {activeCharacter.oc?.personality?.length ? (
                              activeCharacter.oc.personality.map((trait) => (
                                <span
                                  key={trait}
                                  className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-sm"
                                >
                                  {trait}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-emerald-700">
                                {t.results.traitsPlaceholder}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-emerald-100 bg-amber-50/70 p-4">
                        <p className={`flex items-center gap-2 text-[10px] font-semibold text-amber-700 ${labelTracking}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          {t.results.background}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-emerald-900">
                          {activeCharacter.oc?.background ?? t.results.backgroundPlaceholder}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2">
                        {!activeCharacter.oc && (
                          <button
                            type="button"
                            onClick={() => handleGenerateOC(activeIndex)}
                            disabled={loadingOC.has(activeIndex)}
                            className={`flex-1 rounded-full border border-emerald-800 bg-emerald-900 px-5 py-2.5 text-xs font-semibold text-amber-100 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 ${actionTracking}`}
                          >
                            {loadingOC.has(activeIndex) ? 'Generating...' : t.results.generateOc}
                          </button>
                        )}
                        {activeCharacter.oc && !activeCharacter.imageUrl && (
                          <button
                            type="button"
                            onClick={() => handleGenerateImage(activeIndex)}
                            disabled={loadingImage.has(activeIndex)}
                            className={`flex-1 rounded-full border border-amber-300 bg-amber-200/30 px-5 py-2.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-200/50 disabled:cursor-not-allowed disabled:opacity-50 ${actionTracking}`}
                          >
                            {loadingImage.has(activeIndex) ? 'Generating...' : t.results.generatePortrait}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-emerald-100/80 bg-white/80 p-8 text-center shadow-[0_24px_60px_-40px_rgba(15,45,34,0.6)] backdrop-blur lg:p-12 lg:min-h-[520px] lg:flex lg:flex-col lg:justify-center">
                    <div className="mx-auto flex h-44 w-full items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 text-center relative overflow-hidden sm:h-52 lg:h-60">
                      <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[22px] border border-emerald-200/70 bg-emerald-100/60 sm:h-36 sm:w-36" />
                      <span className={`relative z-10 text-xs text-emerald-600 ${labelTracking}`}>
                        {t.results.awaitingSummoning}
                      </span>
                    </div>
                    <h3 className="font-display mt-6 text-xl text-emerald-950">
                      {t.results.noCharactersTitle}
                    </h3>
                    <p className="mt-2 text-xs text-emerald-700">
                      {t.results.noCharactersDescription}
                    </p>
                  </div>
                )}
              </div>

              {hasRoster && (
                <div className="animate-rise-delay-2 pt-2">
                  <div className="rounded-[24px] border border-emerald-100/80 bg-white/80 p-4 shadow-[0_20px_50px_-40px_rgba(15,45,34,0.6)] backdrop-blur">
                    <p className={`text-[10px] font-semibold text-emerald-600 px-1 mb-3 ${labelTracking}`}>
                      {t.results.roster}
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {characters.map((char, idx) => {
                        const isActive = idx === activeIndex;
                        return (
                          <button
                            key={`${char.name}-${idx}`}
                            type="button"
                            onClick={() => setActiveIndex(idx)}
                            className={`flex min-w-[140px] flex-col gap-2 rounded-xl border p-2 transition text-left ${
                              isActive
                                ? 'border-emerald-900 bg-emerald-900 text-amber-100 shadow-md'
                                : 'border-emerald-100 bg-white/90 text-emerald-800 hover:bg-emerald-50'
                            }`}
                          >
                            <div className={`h-16 w-full rounded-lg overflow-hidden ${isActive ? 'bg-emerald-800' : 'bg-emerald-100'}`}>
                              {char.imageUrl ? (
                                <img src={char.imageUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-sm font-bold opacity-40">
                                  {char.name[0]}
                                </div>
                              )}
                            </div>
                            <div className="px-1 overflow-hidden">
                              <p className="text-[11px] font-bold truncate">{char.name}</p>
                              <p className={`text-[9px] truncate opacity-70`}>{char.meaning}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section: Centered Top-Down Layout */}
        <section id="features" className="relative mx-auto max-w-6xl px-6 pb-20 pt-10">
          <div className="space-y-12">
            <div className="mx-auto max-w-3xl space-y-4 text-center animate-rise-delay-1">
              <p className={`text-xs text-emerald-600 ${labelTracking}`}>{t.features.kicker}</p>
              <h2 className="font-display text-3xl font-bold text-emerald-950 sm:text-4xl">
                {t.features.title}
              </h2>
              <p className="text-emerald-700 max-w-2xl mx-auto leading-relaxed">
                {t.features.description}
              </p>
              <div className="mx-auto inline-block rounded-2xl border border-emerald-100/80 bg-white/80 px-5 py-3 text-xs text-emerald-700 shadow-sm">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {t.features.note}
                </span>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr animate-rise-delay-2">
              {featuredPrimary && (
                <article className="group flex h-full flex-col rounded-2xl border border-emerald-100/80 bg-white/85 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-950">
                    <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" />
                    <div
                      className={`absolute bottom-3 left-3 rounded-full bg-emerald-950/70 px-3 py-1 text-[9px] text-amber-100 ${labelTracking}`}
                    >
                      {t.features.badge}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl text-emerald-950">{featuredPrimary.name}</h3>
                    <span
                      className={`rounded-full bg-amber-100/80 px-2 py-1 text-[9px] font-semibold text-amber-800 ${labelTracking}`}
                    >
                      {featuredPrimary.race}
                    </span>
                  </div>
                  <p className="mt-1 text-xs italic text-emerald-600">{featuredPrimary.meaning}</p>
                  <p className="mt-3 text-xs leading-relaxed text-emerald-700 line-clamp-3">{featuredPrimary.description}</p>
                </article>
              )}

              {featuredSecondary.map((char) => (
                <article
                  key={char.id}
                  className="group flex h-full flex-col rounded-2xl border border-emerald-100/80 bg-white/85 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950">
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_55%)]" />
                    <div
                      className={`absolute bottom-3 left-3 rounded-full bg-emerald-950/70 px-3 py-1 text-[9px] text-amber-100 ${labelTracking}`}
                    >
                      {t.features.badge}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl text-emerald-950">{char.name}</h3>
                    <span
                      className={`rounded-full bg-amber-100/80 px-2 py-1 text-[9px] font-semibold text-amber-800 ${labelTracking}`}
                    >
                      {char.race}
                    </span>
                  </div>
                  <p className="mt-1 text-xs italic text-emerald-600">{char.meaning}</p>
                  <p className="mt-3 text-xs leading-relaxed text-emerald-700 line-clamp-3">
                    {char.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="relative mx-auto max-w-6xl px-6 pb-24">
          <div className="rounded-[28px] border border-emerald-100/80 bg-white/80 p-8 shadow-[0_24px_60px_-40px_rgba(15,45,34,0.6)] backdrop-blur">
            <h2 className="font-display text-3xl text-emerald-950">{t.about.title}</h2>
            <div className="mt-4 space-y-4 text-emerald-700">
              <p className="leading-relaxed">{t.about.p1}</p>
              <p className="leading-relaxed">{t.about.p2}</p>
              <h3 className="font-display text-2xl text-emerald-950 pt-4">{t.about.racesTitle}</h3>
              <ul className="grid gap-3 text-sm text-emerald-800 sm:grid-cols-2">
                {t.about.races.map((race) => (
                  <li key={race} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {race}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
