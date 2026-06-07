import { NextRequest, NextResponse } from "next/server";

const USERNAME = "abdullah-imran-1713";

const GRAPHQL_QUERY = `
  query ($from: DateTime!, $to: DateTime!) {
    viewer {
      login
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
        }
      }
    }
  }
`;

type Breakdown = {
  commits: number;
  issues: number;
  pullRequests: number;
  codeReview: number;
};

async function githubFetch(url: string, token: string, accept?: string) {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept ?? "application/vnd.github+json",
    },
    cache: "no-store",
  });
}

async function searchCount(
  token: string,
  path: string,
  accept?: string,
): Promise<number> {
  const response = await githubFetch(
    `https://api.github.com${path}`,
    token,
    accept,
  );
  const payload = await response.json();
  return payload.total_count ?? 0;
}

async function fetchBreakdownFromActivity(
  token: string,
  year: number,
): Promise<Breakdown> {
  const from = new Date(`${year}-01-01T00:00:00Z`);
  const to = new Date(`${year}-12-31T23:59:59Z`);

  const [commits, pullRequests] = await Promise.all([
    searchCount(
      token,
      `/search/commits?q=${encodeURIComponent(
        `author:${USERNAME} committer-date:${year}-01-01..${year}-12-31`,
      )}&per_page=1`,
      "application/vnd.github.cloak-preview+json",
    ),
    searchCount(
      token,
      `/search/issues?q=${encodeURIComponent(
        `author:${USERNAME} is:pr created:${year}-01-01..${year}-12-31`,
      )}&per_page=1`,
    ),
  ]);

  let issues = 0;
  let codeReview = 0;

  for (let page = 1; page <= 15; page += 1) {
    const response = await githubFetch(
      `https://api.github.com/users/${USERNAME}/events?per_page=100&page=${page}`,
      token,
    );
    const events = await response.json();

    if (!Array.isArray(events) || events.length === 0) break;

    let reachedStart = false;

    for (const event of events) {
      const createdAt = new Date(event.created_at);
      if (createdAt < from) {
        reachedStart = true;
        break;
      }
      if (createdAt > to) continue;

      if (event.type === "IssuesEvent") issues += 1;
      if (event.type === "PullRequestReviewEvent") codeReview += 1;
    }

    if (reachedStart) break;
  }

  return { commits, issues, pullRequests, codeReview };
}

function withPercentages(breakdown: Breakdown, year: number) {
  const { commits, issues, pullRequests, codeReview } = breakdown;
  const total = commits + issues + pullRequests + codeReview;
  const pct = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

  return {
    year,
    commits,
    issues,
    pullRequests,
    codeReview,
    total,
    source: total > 0 ? "activity" : "none",
    percentages: {
      commits: pct(commits),
      issues: pct(issues),
      pullRequests: pct(pullRequests),
      codeReview: pct(codeReview),
    },
  };
}

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get("year");
  const year = yearParam ? Number(yearParam) : new Date().getFullYear();

  if (!Number.isFinite(year)) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN is not configured" },
      { status: 503 },
    );
  }

  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY,
        variables: { from, to },
      }),
      cache: "no-store",
    });

    const payload = await response.json();

    if (!response.ok || payload.errors?.length) {
      const message =
        payload.errors?.[0]?.message ??
        payload.message ??
        "Failed to fetch GitHub activity";
      return NextResponse.json({ error: message }, { status: response.status || 502 });
    }

    const viewer = payload.data?.viewer;
    const collection = viewer?.contributionsCollection;

    if (!collection) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (viewer.login?.toLowerCase() !== USERNAME.toLowerCase()) {
      return NextResponse.json(
        {
          error: "Token belongs to a different GitHub account than this portfolio.",
        },
        { status: 403 },
      );
    }

    const graphqlBreakdown: Breakdown = {
      commits: collection.totalCommitContributions ?? 0,
      issues: collection.totalIssueContributions ?? 0,
      pullRequests: collection.totalPullRequestContributions ?? 0,
      codeReview: collection.totalPullRequestReviewContributions ?? 0,
    };

    const graphqlTotal =
      graphqlBreakdown.commits +
      graphqlBreakdown.issues +
      graphqlBreakdown.pullRequests +
      graphqlBreakdown.codeReview;

    if (graphqlTotal > 0) {
      return NextResponse.json({
        ...withPercentages(graphqlBreakdown, year),
        source: "graphql",
        calendarTotal: collection.contributionCalendar?.totalContributions ?? 0,
      });
    }

    const activityBreakdown = await fetchBreakdownFromActivity(token, year);

    return NextResponse.json({
      ...withPercentages(activityBreakdown, year),
      calendarTotal: collection.contributionCalendar?.totalContributions ?? 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach GitHub API" },
      { status: 502 },
    );
  }
}
