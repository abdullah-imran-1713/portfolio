type ChatMessage = { role: "user" | "assistant"; content: string };

const GROQ_MODEL = "openai/gpt-oss-20b";

export async function generateReply(
  systemPrompt: string,
  history: ChatMessage[],
  message: string,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Chat is not configured. Add GROQ_API_KEY from console.groq.com/keys",
    );
  }

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map((turn) => ({
      role: turn.role as "user" | "assistant",
      content: turn.content,
    })),
    { role: "user" as const, content: message },
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.2,
      // gpt-oss is a reasoning model: reasoning tokens count toward this limit,
      // so keep effort low and leave headroom for the final answer.
      max_completion_tokens: 700,
      reasoning_effort: "low",
      include_reasoning: false,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Groq API error:", response.status, detail);
    throw new Error(
      response.status === 401
        ? "Invalid GROQ_API_KEY. Create one at console.groq.com/keys"
        : response.status === 429
          ? "I'm getting a lot of questions right now — please try again in a minute."
          : "AI service temporarily unavailable.",
    );
  }

  const data = await response.json();
  if (process.env.NODE_ENV === "development") {
    console.info("Groq usage:", JSON.stringify(data?.usage), "finish:", data?.choices?.[0]?.finish_reason);
  }
  return (
    data?.choices?.[0]?.message?.content?.trim() ||
    "I couldn't generate a response. Please try again or email abdullah.dev1713@gmail.com."
  );
}
