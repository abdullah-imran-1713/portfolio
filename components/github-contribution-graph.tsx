"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const USERNAME = "abdullah-imran-1713";
const API_BASE = "https://github-contributions-api.jogruber.de/v4";
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DEFAULT_WEEK_COUNT = 53;
const LEVEL_COLORS = [
  "var(--gh-empty)",
  "var(--gh-l1)",
  "var(--gh-l2)",
  "var(--gh-l3)",
  "var(--gh-l4)",
];

type Contribution = {
  date: string;
  count: number;
  level: number;
};

type ApiResponse = {
  total: Record<string, number>;
  contributions: Contribution[];
};

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

function buildWeeks(contributions: Contribution[], year: number): Contribution[][] {
  const byDate = new Map(contributions.map((entry) => [entry.date, entry]));

  const start = new Date(year, 0, 1);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(year, 11, 31);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const weeks: Contribution[][] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const week: Contribution[] = [];
    for (let i = 0; i < 7; i += 1) {
      const key = formatDateKey(cursor);
      week.push(
        byDate.get(key) ?? {
          date: key,
          count: 0,
          level: 0,
        },
      );
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

function getMonthLabels(
  weeks: Contribution[][],
  year: number,
): { label: string; weekIndex: number }[] {
  const labels: { label: string; weekIndex: number }[] = [];

  for (let month = 0; month < 12; month += 1) {
    const firstDay = formatDateKey(new Date(year, month, 1));
    const weekIndex = weeks.findIndex((week) =>
      week.some((day) => day.date === firstDay),
    );

    if (weekIndex >= 0) {
      labels.push({ label: MONTHS[month], weekIndex });
    }
  }

  return labels;
}

function formatTooltip(date: string, count: number): string {
  const parsed = parseDate(date);
  const month = MONTHS[parsed.getMonth()];
  const day = parsed.getDate();
  const year = parsed.getFullYear();
  const noun = count === 1 ? "contribution" : "contributions";
  return `${count} ${noun} on ${month} ${day}, ${year}`;
}

function graphWidth(weekCount: number, cellSize: number, gap: number): number {
  return weekCount * cellSize + Math.max(0, weekCount - 1) * gap;
}

function getHalfYearRanges(
  weeks: Contribution[][],
  year: number,
): [{ start: number; end: number }, { start: number; end: number }] {
  const labels = getMonthLabels(weeks, year);
  const janIndex = labels.find((item) => item.label === "Jan")?.weekIndex ?? 0;
  const julIndex =
    labels.find((item) => item.label === "Jul")?.weekIndex ??
    Math.ceil(weeks.length / 2);

  return [
    { start: janIndex, end: julIndex },
    { start: julIndex, end: weeks.length },
  ];
}

function sliceHalfYearView(
  weeks: Contribution[][],
  year: number,
  halfIndex: 0 | 1,
) {
  const [first, second] = getHalfYearRanges(weeks, year);
  const range = halfIndex === 0 ? first : second;
  const slicedWeeks = weeks.slice(range.start, range.end);
  const monthLabels = getMonthLabels(weeks, year)
    .filter(
      (item) => item.weekIndex >= range.start && item.weekIndex < range.end,
    )
    .map((item) => ({
      label: item.label,
      weekIndex: item.weekIndex - range.start,
    }));

  return {
    weeks: slicedWeeks,
    monthLabels,
    startWeekIndex: range.start,
    periodLabel: halfIndex === 0 ? "Jan – Jun" : "Jul – Dec",
  };
}

function getVisibleMonthLabels(
  labels: { label: string; weekIndex: number }[],
  cellSize: number,
  gap: number,
  graphWidth: number,
) {
  if (graphWidth >= 560) return labels;

  const compact = graphWidth < 400;
  const abbreviated = graphWidth < 520;
  const minSpacing = compact ? 16 : 24;
  const charWidth = compact ? 8 : abbreviated ? 9 : 10;

  const visible: { label: string; weekIndex: number }[] = [];
  let lastEnd = -Infinity;

  for (const item of labels) {
    const x = item.weekIndex * (cellSize + gap);
    const text = compact
      ? item.label.charAt(0)
      : abbreviated
        ? item.label.slice(0, 3)
        : item.label;
    const labelWidth = text.length * charWidth;

    if (visible.length === 0 || x >= lastEnd + minSpacing) {
      visible.push({ label: text, weekIndex: item.weekIndex });
      lastEnd = x + labelWidth;
    }
  }

  const last = labels[labels.length - 1];
  if (last && visible[visible.length - 1]?.weekIndex !== last.weekIndex) {
    const x = last.weekIndex * (cellSize + gap);
    const text = compact
      ? last.label.charAt(0)
      : abbreviated
        ? last.label.slice(0, 3)
        : last.label;

    if (x >= lastEnd + minSpacing * 0.6) {
      visible.push({ label: text, weekIndex: last.weekIndex });
    }
  }

  return visible;
}

const DESKTOP_CELL = 10;
const DESKTOP_GAP = 3;
const MOBILE_BREAKPOINT = 768;

function computeMetrics(
  containerWidth: number,
  weekCount: number,
  mobile: boolean,
) {
  if (!mobile) {
    return {
      cellSize: DESKTOP_CELL,
      gap: DESKTOP_GAP,
      width: graphWidth(weekCount, DESKTOP_CELL, DESKTOP_GAP),
      compact: false,
    };
  }

  const isHalfYear = weekCount <= 28;
  const gap = isHalfYear ? DESKTOP_GAP : 1;
  const available = Math.max(containerWidth, (isHalfYear ? 4 : 3) * weekCount);
  const rawCell = Math.floor((available - (weekCount - 1) * gap) / weekCount);
  const cellSize = isHalfYear
    ? Math.max(4, rawCell)
    : Math.min(DESKTOP_CELL, Math.max(3, rawCell));

  return {
    cellSize,
    gap,
    width: graphWidth(weekCount, cellSize, gap),
    compact: true,
  };
}

type GitHubContributionGraphProps = {
  year: number;
  years: number[];
  onYearChange: (year: number) => void;
};

export function GitHubContributionGraph({
  year,
  years,
  onYearChange,
}: GitHubContributionGraphProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [total, setTotal] = useState(0);
  const [weeks, setWeeks] = useState<Contribution[][]>([]);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const [metrics, setMetrics] = useState(() =>
    computeMetrics(320, DEFAULT_WEEK_COUNT, false),
  );
  const [halfYearIndex, setHalfYearIndex] = useState<0 | 1>(0);
  const touchStartX = useRef<number | null>(null);

  const { compact } = metrics;
  const halfYearView = useMemo(() => {
    if (!compact || weeks.length === 0) return null;
    return sliceHalfYearView(weeks, year, halfYearIndex);
  }, [compact, weeks, year, halfYearIndex]);

  const fullMonthLabels = useMemo(() => getMonthLabels(weeks, year), [weeks, year]);
  const displayWeeks = halfYearView?.weeks ?? weeks;
  const displayStartWeekIndex = halfYearView?.startWeekIndex ?? 0;
  const weekCount =
    displayWeeks.length ||
    (compact ? Math.ceil(DEFAULT_WEEK_COUNT / 2) : DEFAULT_WEEK_COUNT);
  const monthLabels = halfYearView?.monthLabels ?? fullMonthLabels;
  const { cellSize, gap, width } = metrics;
  const visibleMonthLabels = useMemo(
    () =>
      halfYearView
        ? monthLabels
        : compact
          ? getVisibleMonthLabels(monthLabels, cellSize, gap, width)
          : monthLabels,
    [monthLabels, cellSize, gap, width, compact, halfYearView],
  );
  const cellRound = cellSize <= 6;

  const popIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    let order = 0;

    weeks.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        const inYear = parseDate(day.date).getFullYear() === year;
        const level = inYear ? day.level : 0;
        if (level > 0) {
          map.set(`${weekIndex}-${dayIndex}`, order);
          order += 1;
        }
      });
    });

    return map;
  }, [weeks, year]);

  const loadYear = useCallback(async (selectedYear: number) => {
    setLoading(true);
    setAnimate(false);
    try {
      const response = await fetch(`${API_BASE}/${USERNAME}?y=${selectedYear}`);
      if (!response.ok) throw new Error("Failed to fetch contributions");

      const data = (await response.json()) as ApiResponse;
      setTotal(data.total[String(selectedYear)] ?? 0);
      setWeeks(buildWeeks(data.contributions, selectedYear));
      setAnimKey((key) => key + 1);
    } catch {
      setWeeks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadYear(year);
  }, [year, loadYear]);

  useEffect(() => {
    setHalfYearIndex(0);
  }, [year]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX === undefined) return;

    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 48) return;
    if (delta < 0 && halfYearIndex === 0) setHalfYearIndex(1);
    if (delta > 0 && halfYearIndex === 1) setHalfYearIndex(0);
  };

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const update = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      const containerWidth = node.clientWidth;
      if (containerWidth <= 0 && mobile) return;
      setMetrics(
        computeMetrics(
          mobile ? containerWidth : graphWidth(weekCount, DESKTOP_CELL, DESKTOP_GAP),
          weekCount,
          mobile,
        ),
      );
    };

    update();
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(node);
    window.addEventListener("resize", update);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [weekCount, halfYearIndex]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || loading) return;

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
      { threshold: 0.2 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [loading, animKey]);

  return (
    <div
      className={`gh-graph${compact ? " gh-graph--compact" : ""}${halfYearView ? " gh-graph--half" : ""}`}
      ref={rootRef}
    >
      <div className="gh-graph-header">
        <span className="gh-graph-caption">
          <strong>{loading ? "…" : total.toLocaleString()}</strong> contributions
          in {year}
        </span>
      </div>

      <div className="gh-graph-body-slot">
        <div
          className="gh-graph-body"
          onTouchStart={compact ? handleTouchStart : undefined}
          onTouchEnd={compact ? handleTouchEnd : undefined}
          aria-label={
            halfYearView
              ? `Contributions ${halfYearView.periodLabel}. Swipe to see the other half of the year.`
              : undefined
          }
        >
        <div className="gh-graph-inner">
          {halfYearView ? (
            <div className="gh-graph-content">
              <div
                className="gh-month-row"
                style={{
                  width,
                  height: compact ? 14 : 16,
                  marginBottom: compact ? 8 : 6,
                }}
              >
                {visibleMonthLabels.map(({ label, weekIndex }) => (
                  <span
                    key={`${label}-${weekIndex}`}
                    className="gh-month-label"
                    style={{ left: weekIndex * (cellSize + gap) }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {loading ? (
                <div
                  className="gh-grid gh-grid--loading"
                  style={{
                    width,
                    gridTemplateColumns: `repeat(${weekCount}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(7, ${cellSize}px)`,
                    gap: `${gap}px`,
                  }}
                >
                  {Array.from({ length: weekCount * 7 }).map((_, index) => (
                    <span
                      key={index}
                      className={`gh-cell gh-cell--loading${cellRound ? " gh-cell--round" : ""}`}
                      style={{ width: cellSize, height: cellSize }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  key={animKey}
                  className={`gh-grid${animate ? " gh-grid--animate" : ""}`}
                  style={{
                    width,
                    gridTemplateColumns: `repeat(${weekCount}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(7, ${cellSize}px)`,
                    gap: `${gap}px`,
                  }}
                >
                  {displayWeeks.map((week, weekIndex) =>
                    week.map((day, dayIndex) => {
                      const inYear = parseDate(day.date).getFullYear() === year;
                      const level = inYear ? day.level : 0;
                      const color = LEVEL_COLORS[level] ?? LEVEL_COLORS[0];
                      const sourceWeekIndex = displayStartWeekIndex + weekIndex;
                      const popIndex = popIndexMap.get(`${sourceWeekIndex}-${dayIndex}`);

                      return (
                        <span
                          key={`${day.date}-${weekIndex}-${dayIndex}`}
                          className={`gh-cell${level > 0 ? " gh-cell--active" : ""}${cellRound ? " gh-cell--round" : ""}`}
                          style={{
                            width: cellSize,
                            height: cellSize,
                            ["--cell-bg" as string]: color,
                            ...(popIndex !== undefined
                              ? { ["--pop-i" as string]: popIndex }
                              : {}),
                          }}
                          onMouseEnter={(event) => {
                            if (!inYear) return;
                            const rect = event.currentTarget.getBoundingClientRect();
                            setTooltip({
                              text: formatTooltip(day.date, day.count),
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      );
                    }),
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <div
                className="gh-month-row"
                style={{
                  width,
                  height: compact ? 14 : 16,
                  marginBottom: compact ? 8 : 6,
                }}
              >
                {visibleMonthLabels.map(({ label, weekIndex }) => (
                  <span
                    key={`${label}-${weekIndex}`}
                    className="gh-month-label"
                    style={{ left: weekIndex * (cellSize + gap) }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="gh-graph-row">
                {loading ? (
                  <div
                    className="gh-grid gh-grid--loading"
                    style={{
                      width,
                      gridTemplateColumns: `repeat(${weekCount}, ${cellSize}px)`,
                      gridTemplateRows: `repeat(7, ${cellSize}px)`,
                      gap: `${gap}px`,
                    }}
                  >
                    {Array.from({ length: weekCount * 7 }).map((_, index) => (
                      <span
                        key={index}
                        className={`gh-cell gh-cell--loading${cellRound ? " gh-cell--round" : ""}`}
                        style={{ width: cellSize, height: cellSize }}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    key={animKey}
                    className={`gh-grid${animate ? " gh-grid--animate" : ""}`}
                    style={{
                      width,
                      gridTemplateColumns: `repeat(${weekCount}, ${cellSize}px)`,
                      gridTemplateRows: `repeat(7, ${cellSize}px)`,
                      gap: `${gap}px`,
                    }}
                  >
                    {displayWeeks.map((week, weekIndex) =>
                      week.map((day, dayIndex) => {
                        const inYear = parseDate(day.date).getFullYear() === year;
                        const level = inYear ? day.level : 0;
                        const color = LEVEL_COLORS[level] ?? LEVEL_COLORS[0];
                        const sourceWeekIndex = displayStartWeekIndex + weekIndex;
                        const popIndex = popIndexMap.get(`${sourceWeekIndex}-${dayIndex}`);

                        return (
                          <span
                            key={`${day.date}-${weekIndex}-${dayIndex}`}
                            className={`gh-cell${level > 0 ? " gh-cell--active" : ""}${cellRound ? " gh-cell--round" : ""}`}
                            style={{
                              width: cellSize,
                              height: cellSize,
                              ["--cell-bg" as string]: color,
                              ...(popIndex !== undefined
                                ? { ["--pop-i" as string]: popIndex }
                                : {}),
                            }}
                            onMouseEnter={(event) => {
                              if (!inYear) return;
                              const rect = event.currentTarget.getBoundingClientRect();
                              setTooltip({
                                text: formatTooltip(day.date, day.count),
                                x: rect.left + rect.width / 2,
                                y: rect.top - 8,
                              });
                            }}
                            onMouseLeave={() => setTooltip(null)}
                          />
                        );
                      }),
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        </div>

        {halfYearView && !loading && halfYearIndex === 1 && (
          <span
            className="gh-swipe-hint gh-swipe-hint--left gh-graph-arrow gh-graph-arrow--left"
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
        {halfYearView && !loading && halfYearIndex === 0 && (
          <span
            className="gh-swipe-hint gh-swipe-hint--right gh-graph-arrow gh-graph-arrow--right"
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>

      <div className="gh-graph-footer">
        <div className="gh-years" role="tablist" aria-label="Contribution years">
          {years.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={item === year}
              className={`gh-year${item === year ? " is-active" : ""}`}
              onClick={() => onYearChange(item)}
              data-hover
            >
              {item}
            </button>
          ))}
        </div>

        <div className="gh-legend" aria-hidden="true">
          <span>Less</span>
          {LEVEL_COLORS.map((color) => (
            <span
              key={color}
              className="gh-cell gh-cell--legend"
              style={{ backgroundColor: color }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {tooltip && (
        <div
          className="gh-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
          role="tooltip"
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
