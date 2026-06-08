type ChatMessage = { role: "user" | "assistant"; content: string };

const GROQ_MODEL = "llama-3.1-8b-instant";

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
      max_tokens: 600,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Groq API error:", response.status, detail);
    throw new Error(
      response.status === 401
        ? "Invalid GROQ_API_KEY. Create one at console.groq.com/keys"
        : "AI service temporarily unavailable.",
    );
  }

  const data = await response.json();
  return (
    data?.choices?.[0]?.message?.content?.trim() ||
    "I couldn't generate a response. Please try again or email abdullah.dev1713@gmail.com."
  );
}
