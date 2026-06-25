import { NextResponse } from "next/server";

const USERNAME = "abdullah-imran-1713";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN is not configured" }, { status: 503 });
  }

  const year = new Date().getFullYear();
  const query = `
    query {
      user(login: "${USERNAME}") {
        login
        repositories(
          first: 100
          ownerAffiliations: OWNER
          isFork: false
          orderBy: { field: STARGAZERS, direction: DESC }
        ) {
          totalCount
          nodes {
            name
            stargazerCount
            forkCount
            isPrivate
          }
        }
        followers { totalCount }
        following { totalCount }
      }
      viewer {
        contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${year}-12-31T23:59:59Z") {
          contributionCalendar { totalContributions }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });

    const payload = await response.json();
    if (!response.ok || payload.errors?.length) {
      return NextResponse.json(
        { error: payload.errors?.[0]?.message ?? "Failed to fetch stats" },
        { status: 502 },
      );
    }

    const user = payload.data?.user;
    const repos = user?.repositories?.nodes ?? [];
    const totalStars = repos.reduce(
      (sum: number, repo: { stargazerCount: number }) => sum + (repo.stargazerCount ?? 0),
      0,
    );
    const totalForks = repos.reduce(
      (sum: number, repo: { forkCount: number }) => sum + (repo.forkCount ?? 0),
      0,
    );

    const topRepos = repos
      .filter((repo: { stargazerCount: number }) => repo.stargazerCount > 0)
      .slice(0, 3)
      .map((repo: { name: string; stargazerCount: number }) => ({
        name: repo.name,
        stars: repo.stargazerCount,
      }));

    return NextResponse.json({
      login: user?.login ?? USERNAME,
      totalStars,
      totalForks,
      totalRepos: user?.repositories?.totalCount ?? repos.length,
      followers: user?.followers?.totalCount ?? 0,
      following: user?.following?.totalCount ?? 0,
      contributions:
        payload.data?.viewer?.contributionsCollection?.contributionCalendar
          ?.totalContributions ?? 0,
      topRepos,
    });
  } catch {
    return NextResponse.json({ error: "Unable to reach GitHub API" }, { status: 502 });
  }
}
