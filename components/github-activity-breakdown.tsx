"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ActivityData = {
  commits: number;
  issues: number;
  pullRequests: number;
  codeReview: number;
  total?: number;
  percentages: {
    commits: number;
    issues: number;
    pullRequests: number;
    codeReview: number;
  };
};

const AXES = [
  { key: "codeReview" as const, label: "Code review", angle: -90 },
  { key: "commits" as const, label: "Commits", angle: 180 },
  { key: "pullRequests" as const, label: "Pull requests", angle: 90 },
  { key: "issues" as const, label: "Issues", angle: 0 },
];

const CX = 120;
const CY = 120;
const MAX_R = 72;
const CENTER = `${CX},${CY}`;

const NODE_DURATION = 1.15;
const NODE_STAGGER = 0.22;
const NODE_DELAY = 0.3;
const POLYGON_DURATION = 1.1;
const PERCENT_DURATION = 1000;

function axisPoint(angleDeg: number, percent: number) {
  const rad = (angleDeg * Math.PI) / 180;
  const radius = Math.max(4, (percent / 100) * MAX_R);
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

function labelPoint(angleDeg: number, distance: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + distance * Math.cos(rad),
    y: CY + distance * Math.sin(rad),
  };
}

function nodeBegin(index: number): string {
  return `${NODE_DELAY + index * NODE_STAGGER}s`;
}

type AxisLabelProps = {
  targetPercent: number;
  label: string;
  x: number;
  y: number;
  index: number;
  animate: boolean;
};

function AxisLabel({ targetPercent, label, x, y, index, animate }: AxisLabelProps) {
  const [display, setDisplay] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!animate) {
      setDisplay(0);
      setVisible(false);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(targetPercent);
      setVisible(true);
      return;
    }

    const startDelay = (NODE_DELAY + index * NODE_STAGGER + 0.15) * 1000;
    let frameId = 0;

    const timer = window.setTimeout(() => {
      setVisible(true);

      if (targetPercent === 0) return;

      let startTime = 0;
      const tick = (now: number) => {
        if (!startTime) startTime = now;
        const progress = Math.min(1, (now - startTime) / PERCENT_DURATION);
        const eased = 1 - (1 - progress) ** 3;
        setDisplay(Math.round(targetPercent * eased));
        if (progress < 1) {
          frameId = requestAnimationFrame(tick);
        }
      };
      frameId = requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [animate, targetPercent, index]);

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      className={`gh-breakdown-text${visible ? " gh-breakdown-text--in" : ""}`}
    >
      {targetPercent > 0 ? `${display}% ` : ""}
      {label}
    </text>
  );
}

function BreakdownLoadingChart() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="gh-breakdown-chart gh-breakdown-chart--loading"
      aria-hidden="true"
    >
      {AXES.map((axis) => {
        const end = axisPoint(axis.angle, 100);
        return (
          <line
            key={axis.key}
            x1={CX}
            y1={CY}
            x2={end.x}
            y2={end.y}
            className="gh-breakdown-axis gh-breakdown-axis--ghost"
          />
        );
      })}
      <g className="gh-breakdown-loading-plus">
        <line x1={CX} y1={CY - 14} x2={CX} y2={CY + 14} />
        <line x1={CX - 14} y1={CY} x2={CX + 14} y2={CY} />
      </g>
    </svg>
  );
}

type Props = {
  year: number;
};

export function GitHubActivityBreakdown({ year }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setAnimate(false);

    fetch(`/api/github-activity?year=${year}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        return response.json() as Promise<ActivityData>;
      })
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
          setAnimKey((key) => key + 1);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || loading || !data || (data.total ?? 0) === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setAnimate(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [loading, data, animKey]);

  const points = useMemo(() => {
    if (!data || (data.total ?? 0) === 0) return null;

    return AXES.map((axis, index) => ({
      ...axis,
      index,
      percent: data.percentages[axis.key],
      point: axisPoint(axis.angle, data.percentages[axis.key]),
      labelPos: labelPoint(axis.angle, MAX_R + 34),
    }));
  }, [data]);

  const polygon = points
    ? points.map((item) => `${item.point.x},${item.point.y}`).join(" ")
    : "";

  const polygonCenter = points
    ? points.map(() => CENTER).join(" ")
    : CENTER;

  return (
    <div className="gh-breakdown" ref={rootRef}>
      <p className="gh-breakdown-label">ACTIVITY BREAKDOWN</p>

      {loading ? (
        <BreakdownLoadingChart />
      ) : error || !data ? (
        <div className="gh-breakdown-empty">
          Activity data unavailable.
          <span className="gh-breakdown-hint">
            Check GITHUB_TOKEN in .env.local and restart the dev server.
          </span>
        </div>
      ) : (data.total ?? 0) === 0 ? (
        <div className="gh-breakdown-empty">No activity recorded for {year}.</div>
      ) : !points ? (
        <div className="gh-breakdown-empty">Unable to render activity chart.</div>
      ) : (
        <svg
          key={animKey}
          viewBox="0 0 240 240"
          className="gh-breakdown-chart"
          role="img"
          aria-label={`GitHub activity breakdown for ${year}`}
        >
          {AXES.map((axis) => {
            const end = axisPoint(axis.angle, 100);
            return (
              <line
                key={axis.key}
                x1={CX}
                y1={CY}
                x2={end.x}
                y2={end.y}
                className="gh-breakdown-axis"
              />
            );
          })}

          <polygon
            points={animate ? polygon : polygonCenter}
            className="gh-breakdown-fill"
          >
            {animate && (
              <animate
                attributeName="points"
                dur={`${POLYGON_DURATION}s`}
                begin={`${NODE_DELAY}s`}
                fill="freeze"
                calcMode="spline"
                keySplines="0.22 1 0.36 1"
                keyTimes="0;1"
                from={polygonCenter}
                to={polygon}
              />
            )}
          </polygon>

          {points.map((item) => (
            <g key={item.key}>
              <circle
                cx={animate ? item.point.x : CX}
                cy={animate ? item.point.y : CY}
                r={4}
                className="gh-breakdown-dot"
              >
                {animate && (
                  <>
                    <animate
                      attributeName="cx"
                      from={CX}
                      to={item.point.x}
                      dur={`${NODE_DURATION}s`}
                      begin={nodeBegin(item.index)}
                      fill="freeze"
                      calcMode="spline"
                      keySplines="0.22 1 0.36 1"
                      keyTimes="0;1"
                    />
                    <animate
                      attributeName="cy"
                      from={CY}
                      to={item.point.y}
                      dur={`${NODE_DURATION}s`}
                      begin={nodeBegin(item.index)}
                      fill="freeze"
                      calcMode="spline"
                      keySplines="0.22 1 0.36 1"
                      keyTimes="0;1"
                    />
                    <animate
                      attributeName="opacity"
                      from="0"
                      to="1"
                      dur="0.5s"
                      begin={nodeBegin(item.index)}
                      fill="freeze"
                    />
                  </>
                )}
              </circle>
              <AxisLabel
                targetPercent={item.percent}
                label={item.label}
                x={item.labelPos.x}
                y={item.labelPos.y}
                index={item.index}
                animate={animate}
              />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
