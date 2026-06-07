"use client";

import { useEffect, useState } from "react";
import { GitHubActivityBreakdown } from "./github-activity-breakdown";
import { GitHubContributionGraph } from "./github-contribution-graph";

const API_BASE = "https://github-contributions-api.jogruber.de/v4";
const USERNAME = "abdullah-imran-1713";

export function GitHubActivityPanel() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [years, setYears] = useState<number[]>([currentYear]);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/${USERNAME}`)
      .then((response) => response.json())
      .then((data: { total: Record<string, number> }) => {
        if (cancelled) return;
        const availableYears = Object.keys(data.total)
          .map(Number)
          .sort((a, b) => b - a);
        if (availableYears.length) setYears(availableYears);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="gh-activity-panel">
      <div className="gh-panel-card gh-panel-card--graph">
        <p className="gh-panel-card__label">CONTRIBUTION GRAPH</p>
        <GitHubContributionGraph
          year={year}
          years={years}
          onYearChange={setYear}
        />
      </div>

      <div className="gh-panel-card gh-panel-card--breakdown">
        <GitHubActivityBreakdown year={year} />
      </div>
    </div>
  );
}
