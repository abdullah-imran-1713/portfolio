"use client";

import { useEffect, useRef, useState } from "react";

type StatsData = {
  login: string;
  totalStars: number;
  totalForks: number;
  totalRepos: number;
  followers: number;
  following: number;
  contributions: number;
  topRepos: { name: string; stars: number }[];
};

const STAT_ITEMS = [
  { key: "totalStars" as const, label: "Total Stars", icon: "★" },
  { key: "totalForks" as const, label: "Total Forks", icon: "⑂" },
  { key: "totalRepos" as const, label: "Total Repos", icon: "◫" },
  { key: "contributions" as const, label: "Contributions", icon: "▣" },
];

const COUNT_DURATION = 900;

function formatCount(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return value.toLocaleString();
}

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

function AnimatedValue({
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
        setDisplay(Math.round(value * eased));
        if (progress < 1) frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [value, revealed, delay]);

  return <>{formatCount(display)}</>;
}

function StatsSkeleton() {
  return (
    <div className="gh-stats-card gh-stats-card--skeleton" aria-hidden="true">
      <div className="gh-stats-card__header">
        <div className="gh-skeleton gh-skeleton--title" />
        <div className="gh-skeleton gh-skeleton--meta" />
      </div>
      <div className="gh-stats-card__grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="gh-stats-card__stat gh-stats-card__stat--skeleton">
            <div className="gh-skeleton gh-skeleton--icon" />
            <div className="gh-skeleton gh-skeleton--value" />
            <div className="gh-skeleton gh-skeleton--label" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GitHubStatsCard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { ref, revealed } = useReveal(!loading && !!data);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/github-stats")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        return response.json() as Promise<StatsData>;
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

  if (loading) return <StatsSkeleton />;

  if (error || !data) {
    return <div className="gh-stats-card gh-stats-card--empty">Stats unavailable.</div>;
  }

  return (
    <div
      ref={ref}
      className={`gh-stats-card${revealed ? " gh-stats-card--revealed" : ""}`}
    >
      <div
        className="gh-stats-card__header gh-stats-card__anim"
        style={{ animationDelay: "0ms" }}
      >
        <span className="gh-stats-card__user">{data.login}</span>
        <span className="gh-stats-card__meta">
          <AnimatedValue value={data.followers} revealed={revealed} delay={80} /> followers
          {" · "}
          <AnimatedValue value={data.following} revealed={revealed} delay={120} /> following
        </span>
      </div>

      <div className="gh-stats-card__grid">
        {STAT_ITEMS.map((item, index) => (
          <div
            key={item.key}
            className="gh-stats-card__stat gh-stats-card__anim"
            style={{ animationDelay: `${120 + index * 90}ms` }}
          >
            <span className="gh-stats-card__icon">{item.icon}</span>
            <span className="gh-stats-card__value">
              <AnimatedValue
                value={data[item.key]}
                revealed={revealed}
                delay={180 + index * 90}
              />
            </span>
            <span className="gh-stats-card__label">{item.label}</span>
          </div>
        ))}
      </div>

      {data.topRepos.length > 0 && (
        <div className="gh-stats-card__repos">
          {data.topRepos.map((repo, index) => (
            <div
              key={repo.name}
              className="gh-stats-card__repo gh-stats-card__anim"
              style={{ animationDelay: `${520 + index * 80}ms` }}
            >
              <span>{repo.name}</span>
              <span>
                ★{" "}
                <AnimatedValue
                  value={repo.stars}
                  revealed={revealed}
                  delay={560 + index * 80}
                />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
