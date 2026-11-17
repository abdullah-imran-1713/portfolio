import { buildSystemPrompt } from "@/lib/chat-prompt";
import { generateReply } from "@/lib/llm";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatRequestBody = {
  message?: string;
  history?: ChatMessage[];
};

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_REPLY_LENGTH = 4000;
// Last 2 Q&A pairs — enough for follow-ups while keeping requests small.
const MAX_HISTORY_TURNS = 4;

/**
 * Keep only complete user → assistant pairs so the model always sees strictly
 * alternating roles. A user turn without a reply (e.g. a failed request) or an
 * oversized turn is dropped together with its partner, never on its own —
 * dropping only the reply leaves stacked user questions that the model then
 * re-answers.
 */
function normalizeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];

  const pairs: ChatMessage[] = [];
  for (let i = 0; i < raw.length - 1; i++) {
    const user = raw[i];
    const reply = raw[i + 1];
    if (
      user?.role === "user" &&
      reply?.role === "assistant" &&
      typeof user.content === "string" &&
      typeof reply.content === "string" &&
      user.content.trim() &&
      reply.content.trim() &&
      user.content.length <= MAX_MESSAGE_LENGTH &&
      reply.content.length <= MAX_HISTORY_REPLY_LENGTH
    ) {
      pairs.push(
        { role: "user", content: user.content },
        { role: "assistant", content: reply.content },
      );
      i++;
    }
  }
  return pairs.slice(-MAX_HISTORY_TURNS);
}

function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return ip;
}

export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error:
          "Chat is not configured. Add GROQ_API_KEY from console.groq.com/keys",
      },
      { status: 503 },
    );
  }

  const limit = rateLimit(getClientKey(request));
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${limit.retryAfterSec}s.` },
      { status: 429 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).` },
      { status: 400 },
    );
  }

  const history = normalizeHistory(body.history);

  const systemPrompt = buildSystemPrompt(message);

  try {
    const reply = await generateReply(systemPrompt, history, message);
    return NextResponse.json({ reply });
  } catch (error) {
    const errMessage =
      error instanceof Error ? error.message : "Something went wrong.";
    console.error("Chat route error:", error);
    return NextResponse.json({ error: errMessage }, { status: 502 });
  }
}
