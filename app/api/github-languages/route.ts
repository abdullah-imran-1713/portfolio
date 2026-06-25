import { NextResponse } from "next/server";

const USERNAME = "abdullah-imran-1713";

const QUERY = `
  query {
    user(login: "${USERNAME}") {
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
        nodes {
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

const FALLBACK_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  PHP: "#4F5D95",
  CSS: "#663399",
  HTML: "#e34c26",
  Vue: "#41b883",
  Shell: "#89e051",
  Go: "#00ADD8",
  Rust: "#dea584",
};

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN is not configured" }, { status: 503 });
  }

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: QUERY }),
      cache: "no-store",
    });

    const payload = await response.json();
    if (!response.ok || payload.errors?.length) {
      return NextResponse.json(
        { error: payload.errors?.[0]?.message ?? "Failed to fetch languages" },
        { status: 502 },
      );
    }

    const repos = payload.data?.user?.repositories?.nodes ?? [];
    const totals = new Map<string, { size: number; color: string }>();

    for (const repo of repos) {
      for (const edge of repo.languages?.edges ?? []) {
        const name = edge.node?.name;
        if (!name) continue;
        const existing = totals.get(name) ?? {
          size: 0,
          color: edge.node.color || FALLBACK_COLORS[name] || "#888f9c",
        };
        existing.size += edge.size ?? 0;
        totals.set(name, existing);
      }
    }

    const grandTotal = [...totals.values()].reduce((sum, item) => sum + item.size, 0);
    const languages = [...totals.entries()]
      .map(([name, data]) => ({
        name,
        color: data.color,
        size: data.size,
        percent: grandTotal > 0 ? (data.size / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 8);

    return NextResponse.json({ languages, totalBytes: grandTotal });
  } catch {
    return NextResponse.json({ error: "Unable to reach GitHub API" }, { status: 502 });
  }
}
