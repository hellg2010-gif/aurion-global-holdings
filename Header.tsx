"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { businesses } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [bizOpen, setBizOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-[#070b14]/85 backdrop-blur-xl border-b border-white/5" />
      <div className="relative container-wide flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 md:w-11 md:h-11">
            <Image
              src="/images/logos/aurion-global-globe.png"
              alt="AURION Global"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold tracking-wide text-white leading-tight">
              AURION
            </div>
            <div className="text-[10px] tracking-[0.2em] text-[#c9a227] uppercase">
              Global Holdings PLC
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link href="/" className="px-3 py-2 text-sm text-white/70 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/about" className="px-3 py-2 text-sm text-white/70 hover:text-white transition-colors">
            About
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setBizOpen(true)}
            onMouseLeave={() => setBizOpen(false)}
          >
            <button className="px-3 py-2 text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1">
              Businesses
              <svg className={cn("w-3.5 h-3.5 transition-transform", bizOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {bizOpen && (
              <div className="absolute top-full left-0 pt-2 w-72">
                <div className="rounded-xl bg-[#111827] border border-white/10 shadow-2xl overflow-hidden py-2">
                  {businesses.map((b) => (
                    <Link
                      key={b.id}
                      href={b.href}
                      className="block px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-[#e8d48b] transition-colors"
                    >
                      {b.short}
                    </Link>
                  ))}
                  <div className="border-t border-white/10 mt-1 pt-1">
                    <Link href="/businesses" className="block px-4 py-2.5 text-sm text-[#c9a227] hover:bg-white/5 transition-colors">
                      View all divisions →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/ecosystem" className="px-3 py-2 text-sm text-white/70 hover:text-white transition-colors">
            Ecosystem
          </Link>
          <Link href="/investors" className="px-3 py-2 text-sm text-white/70 hover:text-white transition-colors">
            Investors
          </Link>
          <Link href="/sustainability" className="px-3 py-2 text-sm text-white/70 hover:text-white transition-colors">
            Sustainability
          </Link>
          <Link href="/contact" className="px-3 py-2 text-sm text-white/70 hover:text-white transition-colors">
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/businesses/global-commerce" className="text-sm text-white/80 hover:text-white transition-colors">
            Marketplace
          </Link>
          <Link href="/contact" className="btn-gold px-5 py-2.5 rounded-full text-sm">
            Partner With Us
          </Link>
        </div>

        <button className="lg:hidden p-2 text-white/80" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="lg:hidden relative bg-[#0c1220] border-t border-white/5 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            <Link href="/" className="block py-3 text-white/90" onClick={() => setOpen(false)}>Home</Link>
            <Link href="/about" className="block py-3 text-white/90" onClick={() => setOpen(false)}>About</Link>
            <div className="py-2">
              <div className="text-xs uppercase tracking-wider text-[#c9a227] mb-2">Businesses</div>
              {businesses.map((b) => (
                <Link key={b.id} href={b.href} className="block py-2.5 pl-3 text-white/80 text-sm" onClick={() => setOpen(false)}>
                  {b.short}
                </Link>
              ))}
            </div>
            <Link href="/ecosystem" className="block py-3 text-white/90" onClick={() => setOpen(false)}>Ecosystem</Link>
            <Link href="/investors" className="block py-3 text-white/90" onClick={() => setOpen(false)}>Investors</Link>
            <Link href="/sustainability" className="block py-3 text-white/90" onClick={() => setOpen(false)}>Sustainability</Link>
            <Link href="/contact" className="block py-3 text-white/90" onClick={() => setOpen(false)}>Contact</Link>
            <div className="pt-4">
              <Link href="/contact" className="btn-gold block text-center py-3 rounded-full" onClick={() => setOpen(false)}>
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
