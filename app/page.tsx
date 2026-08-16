'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  BarChart3,
  Box,
  ChevronDown,
  CircleUserRound,
  Heart,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from 'lucide-react'

const products = [
  { id: 1, name: 'Yirgacheffe Reserve Coffee', category: 'Coffee & Tea', price: 28, bulk: 'From $18 / kg', image: '/images/aurion-global.jpg', tag: 'Export favorite' },
  { id: 2, name: 'Handwoven Addis Textile', category: 'Craft & Home', price: 86, bulk: 'From $62 / piece', image: '/images/aurion-ecosystem.jpg', tag: 'Artisan made' },
  { id: 3, name: 'Ethiopian Opal Collection', category: 'Jewelry', price: 240, bulk: 'Wholesale inquiry', image: '/images/aurion-logo.jpg', tag: 'Verified origin' },
  { id: 4, name: 'Organic Teff Grain', category: 'Agro & Food', price: 19, bulk: 'From $9 / kg', image: '/images/aurion-workflow.jpg', tag: 'Traceable' },
]

const categories = ['All products', 'Coffee & Tea', 'Agro & Food', 'Jewelry', 'Craft & Home', 'Natural resources']

export default function Home() {
  const [mode, setMode] = useState<'express' | 'bulk'>('express')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All products')
  const [cart, setCart] = useState(0)
  const [wishlist, setWishlist] = useState<number[]>([])
  const [menuOpen, setMenuOpen] = useState(false)

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = category === 'All products' || product.category === category
    return matchesQuery && matchesCategory
  }), [query, category])

  const toggleWishlist = (id: number) => setWishlist((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="border-b border-border bg-secondary/70 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
        Exporting Ethiopia&apos;s finest to the world · Secure trade · Verified origin
      </div>

      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:px-8">
          <button className="rounded-lg p-2 lg:hidden" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <a href="#top" className="flex shrink-0 items-center gap-2">
            <Image src="/images/aurion-logo.jpg" alt="Aurion Global Holdings P.L.C." width={52} height={52} className="h-9 w-9 rounded-full object-cover ring-1 ring-primary/40" />
            <span className="hidden font-serif text-lg font-semibold tracking-[0.18em] sm:inline">AURION</span>
          </a>
          <nav className={`${menuOpen ? 'absolute left-4 right-4 top-16 flex' : 'hidden'} flex-col gap-4 rounded-xl border border-border bg-card p-4 text-sm shadow-xl lg:static lg:flex lg:flex-row lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
            <a className="text-foreground" href="#shop">Shop</a><a className="text-muted-foreground hover:text-foreground" href="#ecosystem">Ecosystem</a><a className="text-muted-foreground hover:text-foreground" href="#sellers">Sell with us</a><a className="text-muted-foreground hover:text-foreground" href="#impact">Our impact</a>
          </nav>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 md:flex"><Search size={16} className="text-muted-foreground" /><input aria-label="Search products" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Ethiopian products" className="w-44 bg-transparent text-xs outline-none placeholder:text-muted-foreground" /></div>
            <button aria-label="Account" className="rounded-full p-2 hover:bg-secondary"><CircleUserRound size={19} /></button>
            <button aria-label="Shopping bag" className="relative rounded-full p-2 hover:bg-secondary"><ShoppingBag size={19} /><span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">{cart}</span></button>
          </div>
        </div>
      </header>

      <section id="top" className="relative isolate border-b border-border bg-[#07111c]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(197,153,61,0.2),transparent_34%),linear-gradient(115deg,rgba(7,17,28,0.98),rgba(7,17,28,0.5))]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-primary"><Sparkles size={13} /> One holding. Endless possibilities.</div>
            <h1 className="max-w-2xl font-serif text-5xl leading-[0.98] tracking-tight text-white sm:text-7xl">From the source.<br /><span className="text-primary">To the world.</span></h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">A trusted gateway for Ethiopia&apos;s finest products, makers, and raw potential. Discover, source, and grow with one integrated global ecosystem.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#shop" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:scale-[1.02]">Explore the marketplace <ArrowRight size={15} /></a><a href="#sellers" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-white/10">Become a seller</a></div>
            <div className="mt-10 flex gap-8 border-t border-white/10 pt-5 text-xs text-slate-400"><span><strong className="block text-lg text-white">80+</strong>origin categories</span><span><strong className="block text-lg text-white">1.4k</strong>verified makers</span><span><strong className="block text-lg text-white">24/7</strong>trade support</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-2xl shadow-primary/10"><Image src="/images/aurion-ecosystem.jpg" alt="Aurion integrated value-chain ecosystem" width={1024} height={1536} className="h-[430px] w-full object-cover object-top opacity-90 sm:h-[520px]" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07111c] via-[#07111c]/70 to-transparent p-6 pt-24"><p className="text-xs uppercase tracking-[0.2em] text-primary">The Aurion loop</p><p className="mt-2 font-serif text-xl text-white">Every connection creates shared value.</p></div></div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/40"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 lg:px-8"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Choose your way to source</p><p className="mt-1 text-sm text-foreground">From one beautiful piece to a full container.</p></div><div className="flex rounded-full border border-border bg-background p-1"><button onClick={() => setMode('express')} className={`rounded-full px-5 py-2 text-xs font-semibold transition-colors ${mode === 'express' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>AURION Express</button><button onClick={() => setMode('bulk')} className={`rounded-full px-5 py-2 text-xs font-semibold transition-colors ${mode === 'bulk' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>AURION Bulk</button></div></div></section>

      <section id="shop" className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{mode === 'express' ? 'Curated for you' : 'Trade desk'}</p><h2 className="mt-2 font-serif text-3xl sm:text-4xl">{mode === 'express' ? 'Made in Ethiopia. Made to matter.' : 'Source at the scale of your ambition.'}</h2></div><button className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground">View all products <ArrowRight size={14} /></button></div>
        <div className="mt-8 flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-4 py-2 text-xs transition-colors ${category === item ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>{item}</button>)}</div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{filteredProducts.map((product) => <article key={product.id} className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"><div className="relative h-52 overflow-hidden bg-secondary"><Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-medium text-foreground backdrop-blur">{product.tag}</span><button onClick={() => toggleWishlist(product.id)} aria-label={`Save ${product.name}`} className="absolute right-3 top-3 rounded-full bg-background/85 p-2 backdrop-blur"> <Heart size={15} className={wishlist.includes(product.id) ? 'fill-primary text-primary' : ''} /></button></div><div className="p-4"><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{product.category}</p><h3 className="mt-2 min-h-10 text-sm font-semibold leading-5">{product.name}</h3><div className="mt-4 flex items-end justify-between gap-2"><div><p className="font-serif text-xl text-primary">${mode === 'bulk' ? product.price * 12 : product.price}</p><p className="text-[10px] text-muted-foreground">{mode === 'bulk' ? product.bulk : 'per unit · ready to ship'}</p></div><button onClick={() => setCart(cart + 1)} className="rounded-full bg-foreground px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-background">Add</button></div></div></article>)}</div>
      </section>

      <section id="ecosystem" className="border-y border-border bg-[#07111c] px-4 py-14 lg:px-8"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">More than a marketplace</p><h2 className="mt-3 font-serif text-4xl text-white">The operating system for Ethiopian value.</h2><p className="mt-5 text-sm leading-7 text-slate-300">Trade, logistics, finance, marketing, and talent move as one. Our flywheel turns every new customer into more opportunity for makers — and every maker into a better global experience.</p><div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 p-4"><Truck className="text-primary" size={20} /><p className="mt-3 text-sm font-semibold text-white">Export logistics</p><p className="mt-1 text-xs leading-5 text-slate-400">Freight, documentation, and delivery partners.</p></div><div className="rounded-xl border border-white/10 p-4"><ShieldCheck className="text-primary" size={20} /><p className="mt-3 text-sm font-semibold text-white">Verified origin</p><p className="mt-1 text-xs leading-5 text-slate-400">Traceable products from trusted suppliers.</p></div><div className="rounded-xl border border-white/10 p-4"><BarChart3 className="text-primary" size={20} /><p className="mt-3 text-sm font-semibold text-white">Growth intelligence</p><p className="mt-1 text-xs leading-5 text-slate-400">Data and AI that turn demand into action.</p></div><div className="rounded-xl border border-white/10 p-4"><Box className="text-primary" size={20} /><p className="mt-3 text-sm font-semibold text-white">Built to scale</p><p className="mt-1 text-xs leading-5 text-slate-400">From first order to full container.</p></div></div></div><div className="overflow-hidden rounded-2xl border border-primary/30"><Image src="/images/aurion-workflow.jpg" alt="Aurion trade and logistics workflow" width={1200} height={1200} className="h-auto w-full" /></div></div></section>

      <section id="sellers" className="mx-auto max-w-7xl px-4 py-14 lg:px-8"><div className="rounded-2xl border border-primary/30 bg-primary/10 p-6 sm:p-10"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">For producers, makers & exporters</p><h2 className="mt-3 max-w-2xl font-serif text-3xl sm:text-4xl">Your product has a world waiting for it.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">Join the next generation of Ethiopian commerce. Get storefront tools, export support, intelligent demand signals, and a partner network built around your growth.</p></div><button className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-background">Start selling <ArrowRight size={15} /></button></div><div className="mt-8 grid gap-3 border-t border-primary/20 pt-6 text-xs sm:grid-cols-3"><span className="flex items-center gap-2"><Package size={15} className="text-primary" /> Transparent seller fees</span><span className="flex items-center gap-2"><Sparkles size={15} className="text-primary" /> AI-powered merchandising</span><span className="flex items-center gap-2"><Truck size={15} className="text-primary" /> End-to-end export support</span></div></div></section>

      <footer id="impact" className="border-t border-border bg-secondary/40"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div className="flex items-center gap-3"><Image src="/images/aurion-logo.jpg" alt="Aurion logo" width={40} height={40} className="h-8 w-8 rounded-full object-cover" /><div><p className="font-serif tracking-[0.16em]">AURION</p><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Global Holdings P.L.C.</p></div></div><p className="max-w-sm text-xs leading-5 text-muted-foreground">Integrity · Excellence · Innovation · Value creation</p><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Prototype marketplace · 2026</p></div></footer>
    </main>
  )
}
