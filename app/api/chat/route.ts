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

  const history = Array.isArray(body.history)
    ? body.history.filter(
        (turn): turn is ChatMessage =>
          !!turn &&
          (turn.role === "user" || turn.role === "assistant") &&
          typeof turn.content === "string" &&
          turn.content.length > 0 &&
          turn.content.length <= MAX_MESSAGE_LENGTH,
      )
    : [];

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
