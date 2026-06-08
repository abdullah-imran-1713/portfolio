"use client";

import { SUGGESTED_PROMPTS } from "@/data/knowledge-base";
import { useCallback, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

function typingDelay(char: string, nextChar: string | undefined): number {
  if (char === "\n") return 70;
  if (char === "." || char === "!" || char === "?") return 120;
  if (char === "," || char === ":" || char === ";") return 60;
  if (char === " " && nextChar && /[A-Z]/.test(nextChar)) return 35;
  if (char === " ") return 18;
  return 28;
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "Hi — I'm Abdullah's recruiter assistant. Ask about his experience, tech stack, projects, or availability. I only answer from his profile data.",
};

const INPUT_MIN_HEIGHT = 42;
const INPUT_MAX_HEIGHT = 120;

const CONTACT = {
  email: "abdullah.dev1713@gmail.com",
  linkedin: "https://www.linkedin.com/in/ll-abdullah-imran-ll/",
  github: "https://github.com/abdullah-imran-1713",
  githubUsername: "abdullah-imran-1713",
  resume: "/Abdullah-Imran-CV.pdf",
} as const;

type CtaFlags = {
  email: boolean;
  linkedin: boolean;
  github: boolean;
  resume: boolean;
};

const LINK_PATTERN =
  /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]}'"]|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

function trimTrailingPunctuation(value: string): string {
  return value.replace(/[.,;:!?)]+$/, "");
}

function MessageContent({ content }: { content: string }) {
  if (!content) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of content.matchAll(LINK_PATTERN)) {
    const value = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(content.slice(lastIndex, index));
    }

    const isEmail = value.includes("@") && !value.startsWith("http");
    const href = isEmail
      ? `mailto:${trimTrailingPunctuation(value)}`
      : trimTrailingPunctuation(value);

    parts.push(
      <a
        key={key++}
        href={href}
        className="assistant-link"
        {...(isEmail
          ? {}
          : { target: "_blank", rel: "noopener noreferrer" })}
      >
        {value}
      </a>,
    );

    lastIndex = index + value.length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <>{parts}</>;
}

function hasContactCue(content: string): boolean {
  const lower = content.toLowerCase();
  return (
    lower.includes(CONTACT.email) ||
    lower.includes("linkedin.com") ||
    lower.includes("vercel.app") ||
    /contact icons|icons below|icon(s)? (below|neeche)|neeche (?:wale |diye gaye )?(?:contact )?icons|rabta karein|reach out via|use the icons|through the icons|get in touch|reach out directly|contact abdullah|discuss directly|direct conversation|connect further|barah-e-karam/i.test(
      content,
    )
  );
}

function hasGithubCue(content: string): boolean {
  const lower = content.toLowerCase();
  return (
    lower.includes("github.com") ||
    lower.includes(CONTACT.githubUsername) ||
    /github (?:profile|activity|icon|icons)|open source|contribution(?:s)? graph|(?:his|view|see) (?:on )?github|repositor(?:y|ies)|code on github|github ke neeche|github icon/i.test(
      content,
    )
  );
}

function hasResumeCue(content: string): boolean {
  const lower = content.toLowerCase();
  return (
    lower.includes("abdullah-imran-cv") ||
    lower.includes(".pdf") ||
    /(?:\bcv\b|\bresume\b)|download (?:his )?(?:cv|resume)|(?:cv|resume) (?:download|icon)|resume icon|download icon|download karein|download karo|download krna|cv download|resume download/i.test(
      content,
    )
  );
}

function getCtaFlags(content: string): CtaFlags {
  const resume = hasResumeCue(content);
  const contact = hasContactCue(content) && !resume;
  const github = hasGithubCue(content) && !resume;
  return {
    email: contact,
    linkedin: contact,
    github,
    resume,
  };
}

function hasAnyCta(flags: CtaFlags): boolean {
  return flags.email || flags.linkedin || flags.github || flags.resume;
}

function stripContactDetails(content: string): string {
  return content
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim().toLowerCase();
      if (!trimmed) return true;
      if (trimmed.includes(CONTACT.email)) return false;
      if (trimmed.includes("linkedin.com")) return false;
      if (trimmed.includes("github.com")) return false;
      if (trimmed.includes(CONTACT.githubUsername)) return false;
      if (trimmed.includes("vercel.app")) return false;
      if (trimmed.includes("abdullah-imran-cv")) return false;
      if (trimmed.endsWith(".pdf")) return false;
      if (/^(email|linkedin|github|portfolio|resume|cv)\s*:/i.test(trimmed))
        return false;
      if (/^https?:\/\//i.test(trimmed)) return false;
      return true;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function ctaFallback(flags: CtaFlags): string {
  if (flags.resume) {
    return "Download Abdullah's resume using the button below.";
  }
  if (flags.email || flags.linkedin) {
    if (flags.github) {
      return "Use the icons below for email, LinkedIn, or GitHub.";
    }
    return "For more details, use the contact icons below.";
  }
  if (flags.github) {
    return "You'll find his GitHub profile via the icon below.";
  }
  return "Use the icons below.";
}

function AssistantCtas({ email, linkedin, github, resume }: CtaFlags) {
  return (
    <div className="assistant-cta" role="group" aria-label="Contact Abdullah">
      {email && (
        <a
          href={`mailto:${CONTACT.email}`}
          className="assistant-cta-btn assistant-cta-btn--labeled"
          aria-label={`Email ${CONTACT.email}`}
          title={CONTACT.email}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"
            />
          </svg>
          <span>Email</span>
        </a>
      )}
      {linkedin && (
        <a
          href={CONTACT.linkedin}
          className="assistant-cta-btn assistant-cta-btn--labeled"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn profile"
          title="LinkedIn"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M20.45 20.45h-3.55v-5.55c0-1.32-.03-3.02-1.84-3.02-1.84 0-2.12 1.44-2.12 2.93v5.64H9.39V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"
            />
          </svg>
          <span>LinkedIn</span>
        </a>
      )}
      {github && (
        <a
          href={CONTACT.github}
          className="assistant-cta-btn assistant-cta-btn--labeled"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub ${CONTACT.githubUsername}`}
          title="GitHub"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
            />
          </svg>
          <span>GitHub</span>
        </a>
      )}
      {resume && (
        <a
          href={CONTACT.resume}
          className="assistant-cta-btn assistant-cta-btn--labeled"
          download="Abdullah-Imran-CV.pdf"
          aria-label="Download Abdullah's resume"
          title="Download Resume"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 3a1 1 0 0 1 1 1v9.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z"
            />
          </svg>
          <span>Download Resume</span>
        </a>
      )}
    </div>
  );
}

export function RecruiterAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const streamTimeoutRef = useRef<number | null>(null);
  const streamIndexRef = useRef(0);

  const busy = loading || streaming;

  const adjustInputHeight = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;

    if (!el.value.trim()) {
      el.style.height = `${INPUT_MIN_HEIGHT}px`;
      el.classList.remove("assistant-input--scrollable");
      return;
    }

    el.style.height = "auto";
    const nextHeight = Math.min(
      Math.max(el.scrollHeight, INPUT_MIN_HEIGHT),
      INPUT_MAX_HEIGHT,
    );
    el.style.height = `${nextHeight}px`;
    el.classList.toggle(
      "assistant-input--scrollable",
      el.scrollHeight > INPUT_MAX_HEIGHT,
    );
  }, []);

  const startTypingReply = useCallback((fullReply: string) => {
    if (streamTimeoutRef.current !== null) {
      window.clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = null;
    }

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !fullReply) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fullReply },
      ]);
      return;
    }

    streamIndexRef.current = 0;
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const tick = () => {
      const index = streamIndexRef.current;
      const nextIndex = index + 1;
      const slice = fullReply.slice(0, nextIndex);

      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (!last || last.role !== "assistant") return prev;
        next[next.length - 1] = { ...last, content: slice };
        return next;
      });

      if (nextIndex >= fullReply.length) {
        streamIndexRef.current = 0;
        setStreaming(false);
        streamTimeoutRef.current = null;
        return;
      }

      streamIndexRef.current = nextIndex;
      const delay = typingDelay(fullReply[index] ?? "", fullReply[nextIndex]);
      streamTimeoutRef.current = window.setTimeout(tick, delay);
    };

    streamTimeoutRef.current = window.setTimeout(tick, 40);
  }, []);

  useEffect(() => {
    return () => {
      if (streamTimeoutRef.current !== null) {
        window.clearTimeout(streamTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    adjustInputHeight();
  }, [open, adjustInputHeight]);

  useEffect(() => {
    adjustInputHeight();
  }, [input, adjustInputHeight]);

  useEffect(() => {
    if (!open) return;

    const onResize = () => adjustInputHeight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, adjustInputHeight]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages, loading, streaming, open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setError(null);
    setInput("");
    const userMessage: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);

    const history = nextMessages
      .filter((m) => m !== WELCOME)
      .slice(0, -1)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      startTypingReply(data.reply);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  return (
    <div className="assistant-root">
      {open && (
        <div
          className="assistant-backdrop"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        ref={panelRef}
        className={`assistant-panel${open ? " assistant-panel--open" : ""}`}
        role="dialog"
        aria-label="Recruiter assistant"
        aria-hidden={!open}
      >
        <header className="assistant-header">
          <div>
            <p className="assistant-kicker">Recruiter assistant</p>
            <h3 className="assistant-title">Ask about Abdullah</h3>
          </div>
          <button
            type="button"
            className="assistant-close"
            aria-label="Close assistant"
            data-hover
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </header>

        <div className="assistant-messages" ref={listRef}>
          {messages.map((message, index) => {
            const isStreamingBubble =
              streaming &&
              index === messages.length - 1 &&
              message.role === "assistant";
            const isWelcome = message === WELCOME;
            const ctaFlags =
              message.role === "assistant" &&
              !isWelcome &&
              !isStreamingBubble &&
              message.content.length > 0
                ? getCtaFlags(message.content)
                : { email: false, linkedin: false, github: false, resume: false };
            const showCtas = hasAnyCta(ctaFlags);
            const shouldStripLinks =
              hasContactCue(message.content) ||
              hasGithubCue(message.content) ||
              hasResumeCue(message.content);
            const displayContent = showCtas && shouldStripLinks
              ? stripContactDetails(message.content) || ctaFallback(ctaFlags)
              : message.content;

            if (message.role === "user") {
              return (
                <div key={index} className="assistant-turn assistant-turn--user">
                  <div className="assistant-bubble assistant-bubble--user">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={index}
                className="assistant-turn assistant-turn--assistant"
              >
                <div
                  className={`assistant-bubble assistant-bubble--assistant${
                    isStreamingBubble ? " assistant-bubble--streaming" : ""
                  }`}
                >
                  <MessageContent
                    content={
                      isStreamingBubble ? message.content : displayContent
                    }
                  />
                  {isStreamingBubble && (
                    <span
                      className="assistant-stream-cursor"
                      aria-hidden="true"
                    />
                  )}
                </div>
                {showCtas && <AssistantCtas {...ctaFlags} />}
              </div>
            );
          })}
          {loading && (
            <div className="assistant-bubble assistant-bubble--assistant assistant-typing">
              <span />
              <span />
              <span />
            </div>
          )}
          {messages.length <= 1 && !busy && (
            <div className="assistant-prompts">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="assistant-prompt"
                  data-hover
                  onClick={() => void sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="assistant-error">{error}</p>}

        <form className="assistant-form" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            className="assistant-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Abdullah…"
            rows={1}
            maxLength={500}
            disabled={busy}
            aria-label="Message"
          />
          <button
            type="submit"
            className="assistant-send"
            disabled={busy || !input.trim()}
            data-hover
            aria-label="Send message"
          >
            ↑
          </button>
        </form>

        <p className="assistant-footnote">
          Answers from Abdullah&apos;s profile only ·{" "}
          <a href="mailto:abdullah.dev1713@gmail.com">Contact directly</a>
        </p>
      </div>

      <button
        type="button"
        className={`assistant-fab${open ? " assistant-fab--open" : ""}`}
        aria-expanded={open}
        aria-controls="recruiter-assistant-panel"
        data-hover
        onClick={() => setOpen((value) => !value)}
      >
        <span className="assistant-fab__icon" aria-hidden="true">
          {open ? "×" : "✦"}
        </span>
        <span className="assistant-fab__label">
          {open ? "Close" : "Ask about me"}
        </span>
      </button>
    </div>
  );
}
