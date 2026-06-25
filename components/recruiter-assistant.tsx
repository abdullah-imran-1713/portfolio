"use client";

import { SUGGESTED_PROMPTS } from "@/data/knowledge-base";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DownloadIcon,
  EmailIcon,
  GitHubIcon,
  LinkedInIcon,
} from "./social-icons";

type Message = { role: "user" | "assistant"; content: string };

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const CORNERS: Corner[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

const FAB_CORNER_KEY = "assistant-fab-corner";
const FAB_DRAG_THRESHOLD = 8;
const FAB_EDGE_INSET = 24;
const FAB_EDGE_INSET_MOBILE = 16;
const PANEL_CLOSE_MS = 420;

type FabCursorMode = "none" | "pressing" | "dragging";

function setFabCursor(mode: FabCursorMode) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.remove("assistant-fab-pressing", "assistant-fab-dragging");

  if (mode === "pressing") {
    root.classList.add("assistant-fab-pressing");
  }

  if (mode === "dragging") {
    root.classList.add("assistant-fab-dragging");
  }
}

function isCorner(value: string): value is Corner {
  return CORNERS.includes(value as Corner);
}

function getEdgeInset(): number {
  if (typeof window === "undefined") return FAB_EDGE_INSET;
  return window.matchMedia("(max-width: 600px)").matches
    ? FAB_EDGE_INSET_MOBILE
    : FAB_EDGE_INSET;
}

function getNearestCorner(clientX: number, clientY: number): Corner {
  const isLeft = clientX < window.innerWidth / 2;
  const isTop = clientY < window.innerHeight / 2;
  if (isTop && isLeft) return "top-left";
  if (isTop && !isLeft) return "top-right";
  if (!isTop && isLeft) return "bottom-left";
  return "bottom-right";
}

function getNavClearance(): number {
  const base = getEdgeInset();
  if (typeof window === "undefined") return base + 64;

  const header = document.getElementById("nav");
  if (!header) {
    return base + (window.matchMedia("(max-width: 900px)").matches ? 64 : 70);
  }

  const headerBottom = header.getBoundingClientRect().bottom;
  return Math.max(base, Math.ceil(headerBottom) + 12);
}

function getTopInset(corner: Corner): number {
  if (!corner.startsWith("top")) return getEdgeInset();
  if (typeof window === "undefined") return FAB_EDGE_INSET + 64;
  return getNavClearance();
}

function getCornerPosition(
  corner: Corner,
  width: number,
  height: number,
): { left: number; top: number } {
  const inset = getEdgeInset();
  const topInset = getTopInset(corner);
  const maxLeft = window.innerWidth - width - inset;
  const maxTop = window.innerHeight - height - inset;

  switch (corner) {
    case "top-left":
      return { left: inset, top: topInset };
    case "top-right":
      return { left: maxLeft, top: topInset };
    case "bottom-left":
      return { left: inset, top: maxTop };
    case "bottom-right":
      return { left: maxLeft, top: maxTop };
  }
}

function clampDragPosition(
  left: number,
  top: number,
  width: number,
  height: number,
  corner: Corner,
): { left: number; top: number } {
  const inset = getEdgeInset();
  const topInset = getTopInset(corner);
  const maxLeft = window.innerWidth - width - inset;
  const maxTop = window.innerHeight - height - inset;
  return {
    left: Math.min(Math.max(left, inset), Math.max(inset, maxLeft)),
    top: Math.min(Math.max(top, topInset), Math.max(topInset, maxTop)),
  };
}

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
          <EmailIcon />
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
          <LinkedInIcon />
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
          <GitHubIcon />
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
          <DownloadIcon />
          <span>Download Resume</span>
        </a>
      )}
    </div>
  );
}

export function RecruiterAssistant() {
  const [open, setOpen] = useState(false);
  const [panelMounted, setPanelMounted] = useState(false);
  const [corner, setCorner] = useState<Corner>("bottom-right");
  const [position, setPosition] = useState<{ left: number; top: number } | null>(
    null,
  );
  const [hydrated, setHydrated] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const streamTimeoutRef = useRef<number | null>(null);
  const streamIndexRef = useRef(0);
  const closeTimerRef = useRef<number | null>(null);
  const openRef = useRef(open);
  const panelMountedRef = useRef(panelMounted);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    originLeft: 0,
    originTop: 0,
  });

  const syncPositionToCorner = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const { width, height } = root.getBoundingClientRect();
    setPosition(getCornerPosition(corner, width, height));
  }, [corner]);

  const busy = loading || streaming;

  openRef.current = open;
  panelMountedRef.current = panelMounted;

  const openAssistant = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setPanelMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpen(true));
    });
  }, []);

  const closeAssistant = useCallback(() => {
    setOpen(false);

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setPanelMounted(false);
      closeTimerRef.current = null;
    }, PANEL_CLOSE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(FAB_CORNER_KEY);
    if (stored && isCorner(stored)) {
      setCorner(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(FAB_CORNER_KEY, corner);
  }, [corner, hydrated]);

  useLayoutEffect(() => {
    if (!hydrated || position !== null) return;

    const root = rootRef.current;
    if (!root) return;

    const { width, height } = root.getBoundingClientRect();
    setPosition(getCornerPosition(corner, width, height));
  }, [hydrated, position, corner]);

  useLayoutEffect(() => {
    if (!panelMounted || !position) return;

    const root = rootRef.current;
    if (!root) return;

    if (corner.startsWith("top")) {
      const inset = getEdgeInset();
      const maxH = Math.min(
        620,
        Math.max(280, window.innerHeight - position.top - inset),
      );
      root.style.setProperty("--assistant-panel-max-h", `${maxH}px`);
      return;
    }

    root.style.removeProperty("--assistant-panel-max-h");
  }, [panelMounted, position, corner]);

  useEffect(() => {
    if (!hydrated) return;

    const onResize = () => {
      if (dragging) return;
      syncPositionToCorner();
    };

    const onScroll = () => {
      if (dragging || panelMounted || !corner.startsWith("top")) return;
      syncPositionToCorner();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [corner, dragging, hydrated, panelMounted, syncPositionToCorner]);

  useEffect(() => {
    return () => {
      setFabCursor("none");
    };
  }, []);

  const handleFabPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (panelMountedRef.current) return;

    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startY: event.clientY,
      originLeft: rect.left,
      originTop: rect.top,
    };
    setPressing(true);
    setFabCursor("pressing");
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleFabPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.active) return;

    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;

    if (
      !dragRef.current.moved &&
      Math.hypot(dx, dy) < FAB_DRAG_THRESHOLD
    ) {
      return;
    }

    dragRef.current.moved = true;
    setDragging(true);
    setFabCursor("dragging");
    rootRef.current?.classList.add("assistant-root--dragging");

    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const next = clampDragPosition(
      dragRef.current.originLeft + dx,
      dragRef.current.originTop + dy,
      rect.width,
      rect.height,
      corner,
    );
    setPosition(next);
  };

  const snapToCorner = (nextCorner: Corner) => {
    const root = rootRef.current;
    if (!root) {
      setDragging(false);
      return;
    }

    const { width, height } = root.getBoundingClientRect();
    const target = getCornerPosition(nextCorner, width, height);

    setCorner(nextCorner);
    root.classList.remove("assistant-root--dragging");
    setDragging(false);

    requestAnimationFrame(() => {
      setPosition(target);
    });
  };

  const finishFabPointer = (
    event: React.PointerEvent<HTMLButtonElement>,
    toggleOnTap: boolean,
  ) => {
    if (!dragRef.current.active) return;

    const wasDrag = dragRef.current.moved;
    dragRef.current.active = false;
    dragRef.current.moved = false;
    setPressing(false);
    setFabCursor("none");

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (wasDrag) {
      snapToCorner(getNearestCorner(event.clientX, event.clientY));
      return;
    }

    setDragging(false);

    if (toggleOnTap) {
      if (openRef.current || panelMountedRef.current) closeAssistant();
      else openAssistant();
    }
  };

  const handleFabPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    finishFabPointer(event, true);
  };

  const handleFabPointerCancel = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    finishFabPointer(event, false);
  };

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
      if (event.key === "Escape") closeAssistant();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeAssistant]);

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
    <>
      {panelMounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`assistant-backdrop${
              open ? " assistant-backdrop--visible" : ""
            }`}
            aria-hidden="true"
            onClick={closeAssistant}
          />,
          document.body,
        )}

    <div
      ref={rootRef}
      className={`assistant-root assistant-root--${corner}${
        dragging ? " assistant-root--dragging" : ""
      }${panelMounted ? " assistant-root--expanded" : ""}`}
      style={
        position
          ? {
              left: position.left,
              top: position.top,
            }
          : undefined
      }
    >
      <div
        className={`assistant-fab-shell${
          panelMounted ? " assistant-fab-shell--hidden" : ""
        }${dragging ? " assistant-fab-shell--dragging" : ""}`}
      >
        <button
          type="button"
          className={`assistant-fab${
            pressing ? " assistant-fab--pressing" : ""
          }${dragging ? " assistant-fab--dragging" : ""}`}
          aria-expanded={open}
          aria-controls="recruiter-assistant-panel"
          aria-grabbed={dragging}
          data-hover={dragging || panelMounted ? undefined : true}
          onPointerDown={handleFabPointerDown}
          onPointerMove={handleFabPointerMove}
          onPointerUp={handleFabPointerUp}
          onPointerCancel={handleFabPointerCancel}
        >
          <span className="assistant-fab__icon" aria-hidden="true">
            ✦
          </span>
          <span className="assistant-fab__label">Ask about me</span>
        </button>
      </div>

      {panelMounted && (
        <div
          ref={panelRef}
          id="recruiter-assistant-panel"
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
            onClick={closeAssistant}
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
      )}
    </div>
    </>
  );
}
