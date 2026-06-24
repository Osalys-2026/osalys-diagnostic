"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: "96px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(24px, 5vw, 56px)",
        background: scrolled ? "rgba(0,0,0,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        transition: "background 320ms cubic-bezier(0.65,0,0.35,1), backdrop-filter 320ms",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{ display: "block", textDecoration: "none", userSelect: "none", transform: "translateY(-28px)" }}
        aria-label="Osalys — accueil"
      >
        <img
          src="/logo-osalys.svg"
          alt="Osalys"
          width={124}
          height={66}
          style={{ display: "block" }}
        />
      </Link>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", gap: "36px" }}>
        {[
          { label: "Nos offres", href: "https://osalys.fr/#offres" },
          { label: "À propos", href: "https://osalys.fr/#apropos" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "Sora, sans-serif",
              fontWeight: 700,
              fontSize: "16px",
              color: "#fff",
              textDecoration: "none",
              letterSpacing: "0",
              transition: "color 200ms cubic-bezier(0.2,0.7,0.2,1)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#C9F1DF")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#fff")
            }
          >
            {link.label}
          </a>
        ))}

        <a
          href="https://osalys.fr/#contact"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
          style={{ padding: "12px 24px", fontSize: "13px" }}
        >
          Contact
        </a>
      </nav>
    </header>
  );
}
