"use client";

import { useEffect, useRef, useState } from "react";

type Language = {
  name: string;
  color: string;
  size: number;
  percent: number;
};

type LanguagesData = {
  languages: Language[];
};

const COUNT_DURATION = 900;

function useReveal(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!active) {
      setRevealed(false);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setRevealed(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  return { ref, revealed };
}

function AnimatedPercent({
  value,
  revealed,
  delay,
}: {
  value: number;
  revealed: boolean;
  delay: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!revealed) {
      setDisplay(0);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }

    let frameId = 0;
    const timer = window.setTimeout(() => {
      let startTime = 0;
      const tick = (now: number) => {
        if (!startTime) startTime = now;
        const progress = Math.min(1, (now - startTime) / COUNT_DURATION);
        const eased = 1 - (1 - progress) ** 3;
        setDisplay(value * eased);
        if (progress < 1) frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [value, revealed, delay]);

  return <>{display.toFixed(1)}%</>;
}

function LanguageRow({
  lang,
  index,
  revealed,
}: {
  lang: Language;
  index: number;
  revealed: boolean;
}) {
  const delay = 120 + index * 100;
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (!revealed) {
      setBarWidth(0);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = Math.max(lang.percent, 2);

    if (reduce) {
      setBarWidth(target);
      return;
    }

    let frameId = 0;
    const timer = window.setTimeout(() => {
      let startTime = 0;
      const tick = (now: number) => {
        if (!startTime) startTime = now;
        const progress = Math.min(1, (now - startTime) / COUNT_DURATION);
        const eased = 1 - (1 - progress) ** 3;
        setBarWidth(target * eased);
        if (progress < 1) frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [lang.percent, revealed, delay]);

  return (
    <div
      className="gh-langs-card__row gh-langs-card__anim"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="gh-langs-card__row-head">
        <span className="gh-langs-card__name">
          <span
            className="gh-langs-card__dot"
            style={{ backgroundColor: lang.color }}
          />
          {lang.name}
        </span>
        <span className="gh-langs-card__pct">
          <AnimatedPercent value={lang.percent} revealed={revealed} delay={delay + 60} />
        </span>
      </div>
      <div className="gh-langs-card__track">
        <span
          className="gh-langs-card__bar"
          style={{
            width: `${barWidth}%`,
            backgroundColor: lang.color,
          }}
        />
      </div>
    </div>
  );
}

function LanguagesSkeleton() {
  return (
    <div className="gh-langs-card gh-langs-card--skeleton" aria-hidden="true">
      <div className="gh-skeleton gh-skeleton--langs-title" />
      <div className="gh-langs-card__list">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="gh-langs-card__row gh-langs-card__row--skeleton">
            <div className="gh-langs-card__row-head">
              <div className="gh-skeleton gh-skeleton--lang-name" />
              <div className="gh-skeleton gh-skeleton--lang-pct" />
            </div>
            <div className="gh-skeleton gh-skeleton--lang-bar" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GitHubLanguagesCard() {
  const [data, setData] = useState<LanguagesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { ref, revealed } = useReveal(!loading && !!data?.languages.length);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/github-languages")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        return response.json() as Promise<LanguagesData>;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LanguagesSkeleton />;

  if (error || !data?.languages.length) {
    return <div className="gh-langs-card gh-langs-card--empty">Languages unavailable.</div>;
  }

  return (
    <div
      ref={ref}
      className={`gh-langs-card${revealed ? " gh-langs-card--revealed" : ""}`}
    >
      <p
        className="gh-langs-card__title gh-langs-card__anim"
        style={{ animationDelay: "0ms" }}
      >
        Most Used Languages
      </p>
      <div className="gh-langs-card__list">
        {data.languages.map((lang, index) => (
          <LanguageRow key={lang.name} lang={lang} index={index} revealed={revealed} />
        ))}
      </div>
    </div>
  );
}
