"use client";

import { useEffect, useRef, useState } from "react";
import { GitHubActivityPanel } from "./github-activity-panel";
import { GitHubLanguagesCard } from "./github-languages-card";
import { GitHubStatsCard } from "./github-stats-card";
import { HeroCanvas } from "./hero-canvas";
import { StarfieldCanvas } from "./starfield-canvas";
import { RecruiterAssistant } from "./recruiter-assistant";
import { DownloadIcon, GitHubIcon, LinkedInIcon } from "./social-icons";

const TYPED_PHRASES = [
  "I build scalable web platforms — end to end.",
  "React · Next.js · Vue · Node · TypeScript.",
  "Frontend UX, server actions & real-time flows.",
  "Turning hard problems into shipped products.",
];

const STACK_CATEGORIES = [
  {
    delay: "1",
    name: "Frontend",
    chips: [
      "Next.js",
      "React.js",
      "Vue.js",
      "Nuxt.js",
      "Three.js",
      "Tailwind",
      "Material-UI",
      "Zustand / Redux",
    ],
  },
  {
    delay: "2",
    name: "Backend",
    chips: [
      "Node.js",
      "Express.js",
      "Laravel (PHP)",
      "Server Actions",
      "REST APIs",
      "Stripe API",
    ],
  },
  {
    delay: "1",
    name: "Languages & Data",
    chips: [
      "TypeScript",
      "JavaScript",
      "MongoDB",
      "MySQL",
      "Firestore",
      "Redis",
    ],
  },
  {
    delay: "2",
    name: "Cloud & DevOps",
    chips: [
      "Firebase",
      "AWS S3",
      "Docker",
      "Firebase Emulators",
      "Git",
      "CI Workflows",
    ],
  },
];

const EXPERIENCE = [
  {
    dates: "May 2025 — Present",
    active: true,
    role: "Full-Stack Developer",
    company: "HealthShared",
    url: "https://health-shared.com",
    tagline: "Health community platform · production features across the stack",
    points: [
      <>
        Engineered a complete <b>season-based questionnaire system</b> with
        progress tracking, validation logic, and dynamic UI rendering.
      </>,
      <>
        Implemented a <b>gamification architecture</b> — badges, achievements
        and leaderboards — with optimized state + database sync.
      </>,
      <>
        Developed secure <b>server-side actions &amp; API logic</b> with strict
        TypeScript typing and data validation.
      </>,
      <>
        Solved complex <b>SSR hydration &amp; lifecycle issues</b>, improving
        performance and stability across pages.
      </>,
      <>
        Designed Firestore schema updates and{" "}
        <b>backward-compatible migrations</b> without breaking live data.
      </>,
    ],
    tags: [
      "Next.js",
      "React",
      "TypeScript",
      "Firebase",
      "Tailwind",
      "Zustand",
    ],
  },
  {
    dates: "Oct 2025 — Jul 2026",
    active: false,
    role: "Full-Stack Developer",
    company: "Lyfetymes",
    url: "https://www.lyfetymes.com",
    tagline:
      "Event-management platform · build, manage & monetize celebration templates",
    points: [
      <>
        Architected a <b>dynamic template engine</b> letting admins build
        reusable event templates with global + per-event styling overrides.
      </>,
      <>
        Built a full <b>RSVP management system</b> with validation, state
        handling and structured data flows.
      </>,
      <>
        Integrated a <b>secure payment system</b> for template sales with
        transaction handling and error states.
      </>,
      <>
        Implemented a scalable <b>media pipeline</b> using cloud storage for
        optimized upload and retrieval.
      </>,
      <>
        Resolved complex Vue reactivity edge cases and refactored permissions
        into <b>scalable RBAC</b>.
      </>,
    ],
    tags: [
      "Vue.js 2",
      "Laravel",
      "MySQL",
      "AWS S3",
      "Stripe API",
      "reCAPTCHA v3",
    ],
  },
  {
    dates: "Nov 2025 — Feb 2026",
    active: false,
    role: "Full-Stack Developer",
    company: "Quartrly",
    url: "https://www.quartrly.com",
    tagline: "Quarterly scheduling app · real-time availability at scale",
    points: [
      <>
        Designed a <b>time-slot engine</b> supporting 15-minute interval
        scheduling with validation and conflict-prevention logic.
      </>,
      <>
        Engineered a resilient <b>multi-step onboarding flow</b> with
        crash-recovery state persistence and route-level access control.
      </>,
      <>
        Implemented a <b>profile-completion tracking system</b> to improve
        onboarding completion rates.
      </>,
      <>
        Optimized the cloud image upload pipeline and{" "}
        <b>containerized the database</b> environment for consistent deploys.
      </>,
      <>
        Structured backend APIs for performance using{" "}
        <b>caching and optimized queries</b>.
      </>,
    ],
    tags: [
      "React",
      "Redux",
      "Node.js",
      "Express",
      "MongoDB",
      "Redis",
      "AWS S3",
      "Docker",
    ],
  },
];

export function PortfolioPage() {
  const heroRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [typedText, setTypedText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) {
      document.documentElement.classList.remove("menu-open");
      return;
    }

    const scrollY = window.scrollY;
    document.documentElement.classList.add("menu-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.classList.remove("menu-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const timer = window.setTimeout(() => hero?.classList.add("loaded"), 60);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTypedText(TYPED_PHRASES[0]);
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId = 0;

    const tick = () => {
      const phrase = TYPED_PHRASES[phraseIndex];
      charIndex += deleting ? -1 : 1;
      setTypedText(phrase.slice(0, charIndex));

      let delay = deleting ? 32 : 55;
      if (!deleting && charIndex === phrase.length) {
        delay = 1900;
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % TYPED_PHRASES.length;
        delay = 420;
      }

      timeoutId = window.setTimeout(tick, delay);
    };

    timeoutId = window.setTimeout(tick, 900);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const header = navRef.current;
    const onScroll = () =>
      header?.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    document.querySelectorAll(".reveal").forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring || !window.matchMedia("(hover: hover)").matches) return;

    let ringX = 0;
    let ringY = 0;
    let dotX = 0;
    let dotY = 0;
    let frameId = 0;

    const onMouseMove = (event: MouseEvent) => {
      dotX = event.clientX;
      dotY = event.clientY;
      dot.style.left = `${dotX}px`;
      dot.style.top = `${dotY}px`;
    };

    const loop = () => {
      ringX += (dotX - ringX) * 0.18;
      ringY += (dotY - ringY) * 0.18;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      frameId = requestAnimationFrame(loop);
    };

    const hover = () => ring.classList.add("hovering");
    const out = () => ring.classList.remove("hovering");

    window.addEventListener("mousemove", onMouseMove);
    frameId = requestAnimationFrame(loop);

    const hoverables = document.querySelectorAll("a, button, [data-hover]");
    hoverables.forEach((element) => {
      element.addEventListener("mouseenter", hover);
      element.addEventListener("mouseleave", out);
    });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      hoverables.forEach((element) => {
        element.removeEventListener("mouseenter", hover);
        element.removeEventListener("mouseleave", out);
      });
    };
  }, []);

  const handleStackGlow = (event: React.MouseEvent<HTMLDivElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty(
      "--mx",
      `${((event.clientX - rect.left) / rect.width) * 100}%`,
    );
    card.style.setProperty(
      "--my",
      `${((event.clientY - rect.top) / rect.height) * 100}%`,
    );
  };

  return (
    <>
      <StarfieldCanvas />
      <div className="grain" aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />

      <header
        className={`site-header${menuOpen ? " site-header--open" : ""}`}
        id="nav"
        ref={navRef}
      >
        <div className="nav-bar">
          <a href="#top" className="brand" data-hover onClick={closeMenu}>
            <span className="mono-mark">AI</span>
            <span className="brand-name">
              <b>Abdullah Imran</b> <span>/ dev</span>
            </span>
          </a>
          <button
            type="button"
            className="nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
        <div
          id="site-nav"
          className={`nav-links${menuOpen ? " nav-links--open" : ""}`}
        >
          <a href="#about" data-hover onClick={closeMenu}>
            About
          </a>
          <a href="#stack" data-hover onClick={closeMenu}>
            Stack
          </a>
          <a href="#work" data-hover onClick={closeMenu}>
            Work
          </a>
          <a href="#activity" data-hover onClick={closeMenu}>
            Activity
          </a>
          <a href="#contact" data-hover onClick={closeMenu}>
            Contact
          </a>
          <a
            href="/Abdullah-Imran-CV.pdf"
            download
            className="nav-cta"
            data-hover
            onClick={closeMenu}
          >
            <span>Resume</span>
            <DownloadIcon className="nav-cta__icon" />
          </a>
        </div>
      </header>

      <header className="hero" id="top" ref={heroRef}>
        <HeroCanvas />
        <div className="wrap hero-inner">
          <div className="hero-tag">
            <span className="dot" /> AVAILABLE FOR WORK · LAHORE, PK
          </div>
          <h1>
            <span className="ln">
              <span>Abdullah</span>
            </span>
            <span className="ln">
              <span className="accent">Imran.</span>
            </span>
          </h1>
          <p className="hero-sub">
            {typedText}
            <span className="cursor-blink">▋</span>
          </p>

          <div className="hero-meta">
            <div className="m">
              <span className="k">Role</span>
              <span className="v">Full-Stack Web Developer</span>
            </div>
            <div className="m">
              <span className="k">Focus</span>
              <span className="v">React · Next.js · Vue · Node</span>
            </div>
            <div className="m">
              <span className="k">Based in</span>
              <span className="v">Lahore, Pakistan</span>
            </div>
          </div>

          <div className="hero-actions">
            <a href="#work" className="btn btn-primary" data-hover>
              View my work <span className="arrow">↗</span>
            </a>
            <a href="#contact" className="btn btn-ghost" data-hover>
              Get in touch
            </a>
          </div>
        </div>
        <div className="scroll-cue">
          <span>SCROLL</span>
          <span className="line" />
        </div>
      </header>

      <section id="about">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="section-label">About</div>
            <h2 className="section-title">
              Engineer behind the <span className="muted">interface.</span>
            </h2>
          </div>
          <div className="about-grid">
            <div className="reveal" data-d="1">
              <p className="about-lead">
                I build{" "}
                <span className="hl">
                  scalable, production-grade web platforms
                </span>{" "}
                — from the pixel-level UX down to the server-side logic and
                infrastructure.
              </p>
              <p className="about-body">
                I&apos;m a full-stack developer with hands-on experience
                shipping features for large-scale platforms. My day-to-day
                spans designing complex frontend UX, writing strictly-typed
                server-side actions, wiring real-time flows, and integrating
                scalable backends.
              </p>
              <p className="about-body">
                I&apos;m comfortable across the stack — React/Next.js and
                Vue/Nuxt on the front, Node, Express and Laravel on the back,
                with modern cloud and storage systems holding it all together. I
                care about clean architecture, performance, and code that
                doesn&apos;t break when it scales.
              </p>
            </div>
            <div className="spec reveal" data-d="2">
              <div className="row">
                <span className="k">name</span>
                <span className="v">Abdullah Imran</span>
              </div>
              <div className="row">
                <span className="k">role</span>
                <span className="v">Full-Stack Web Developer</span>
              </div>
              <div className="row">
                <span className="k">location</span>
                <span className="v">Lahore, PK</span>
              </div>
              <div className="row">
                <span className="k">education</span>
                <span className="v">BS Computer Science</span>
              </div>
              <div className="row">
                <span className="k">specialty</span>
                <span className="v">Frontend UX + Systems</span>
              </div>
              <div className="row">
                <span className="k">availability</span>
                <span className="v">
                  <span className="dot-ok">●</span> Open to work
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stack">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="section-label">Tech Stack</div>
            <h2 className="section-title">
              Tools I build <span className="muted">with.</span>
            </h2>
          </div>
          <div className="stack-grid">
            {STACK_CATEGORIES.map((category) => (
              <div
                key={category.name}
                className="stack-cat reveal"
                data-d={category.delay}
                onMouseMove={handleStackGlow}
              >
                <div className="cat-head">
                  <span className="cat-name">{category.name}</span>
                </div>
                <div className="chips">
                  {category.chips.map((chip) => (
                    <span key={chip} className="chip">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="work">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="section-label">Experience</div>
            <h2 className="section-title">
              Where I&apos;ve <span className="muted">shipped.</span>
            </h2>
          </div>
          <div className="timeline">
            {EXPERIENCE.map((item) => (
              <article key={item.company} className="tl-item reveal">
                <div className="tl-meta">
                  <div className="tl-dates">{item.dates}</div>
                  <div className="tl-role">{item.role}</div>
                  {item.active && (
                    <div className="tl-status">
                      <span className="live" /> Active
                    </div>
                  )}
                </div>
                <div className="tl-body">
                  <div className="tl-heading">
                    <h3>{item.company}</h3>
                    {item.url && (
                      <a
                        href={item.url}
                        className="tl-site"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-hover
                        aria-label={`Visit ${item.company} live platform`}
                      >
                        <span className="tl-site__dot" aria-hidden="true" />
                        Live platform <span className="ext">↗</span>
                      </a>
                    )}
                  </div>
                  <p className="tl-tagline">{item.tagline}</p>
                  <ul className="tl-points">
                    {item.points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                  <div className="tl-tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="activity" className="activity-section">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="section-label">Activity</div>
            <h2 className="section-title">Code <span className="muted">activity.</span></h2>
          </div>
          <div className="activity-body reveal" data-d="1">
            <GitHubActivityPanel />

            <div className="activity-stats-grid">
              <div className="activity-card">
                <p className="activity-card__label">STATS</p>
                <GitHubStatsCard />
              </div>

              <div className="activity-card">
                <p className="activity-card__label">TOP LANGUAGES</p>
                <GitHubLanguagesCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="wrap">
          <div className="reveal">
            <div className="section-label" style={{ justifyContent: "center" }}>
              Contact
            </div>
            <h2 className="big">
              Let&apos;s build
              <br />
              <span className="accent">something.</span>
            </h2>
            <p className="sub">
              Got a product to ship or a hard problem to solve? I&apos;m open to
              full-stack roles and freelance work. Let&apos;s talk.
            </p>
            <a
              href="mailto:abdullah.dev1713@gmail.com"
              className="email-btn"
              data-hover
            >
              <span style={{ color: "var(--accent)" }}>✦</span>{" "}
              abdullah.dev1713@gmail.com
            </a>
            <div className="socials">
              <a
                href="https://github.com/abdullah-imran-1713"
                className="social"
                target="_blank"
                rel="noopener noreferrer"
                data-hover
              >
                <GitHubIcon className="social__icon" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/ll-abdullah-imran-ll/"
                className="social"
                target="_blank"
                rel="noopener noreferrer"
                data-hover
              >
                <LinkedInIcon className="social__icon" />
                <span>LinkedIn</span>
              </a>
              <a
                href="/Abdullah-Imran-CV.pdf"
                download
                className="social"
                data-hover
              >
                <DownloadIcon className="social__icon" />
                <span>Download Resume</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <span className="f-mono">© 2026 Abdullah Imran</span>
          <span className="f-mono">
            <span className="accent">●</span> Built with code, coffee &amp;
            Three.js
          </span>
          <span className="f-mono">Lahore, PK · 31.5°N</span>
        </div>
      </footer>

      <RecruiterAssistant />
    </>
  );
}
