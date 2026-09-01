import Link from "next/link";
import { ReactNode } from "react";

interface BusinessLayoutProps {
  title: string;
  tagline: string;
  description: string;
  children: ReactNode;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
}

export default function BusinessLayout({
  title,
  tagline,
  description,
  children,
  ctaPrimary,
  ctaSecondary,
}: BusinessLayoutProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c1220] to-[#070b14]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.08)_0%,transparent_70%)] blur-3xl" />

        <div className="relative container-wide">
          <div className="max-w-3xl">
            <Link
              href="/businesses"
              className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-6"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Businesses
            </Link>

            <div className="text-xs tracking-[0.2em] text-[#c9a227] uppercase mb-4">
              AURION Division
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4">
              {title}
            </h1>
            <p className="text-xl text-[#e8d48b]/90 mb-5">{tagline}</p>
            <p className="text-lg text-white/55 leading-relaxed max-w-2xl mb-8">
              {description}
            </p>

            {(ctaPrimary || ctaSecondary) && (
              <div className="flex flex-wrap gap-3">
                {ctaPrimary && (
                  <Link href={ctaPrimary.href} className="btn-gold px-7 py-3 rounded-full text-sm">
                    {ctaPrimary.label}
                  </Link>
                )}
                {ctaSecondary && (
                  <Link
                    href={ctaSecondary.href}
                    className="btn-outline-gold px-7 py-3 rounded-full text-sm"
                  >
                    {ctaSecondary.label}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {children}
    </>
  );
}
