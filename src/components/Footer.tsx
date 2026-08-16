import Link from "next/link";
import { businesses } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-[#05080f] border-t border-white/5">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div><Link href="/" className="text-sm font-semibold text-white">AURION Global Holdings PLC</Link><p className="mt-4 text-sm text-white/50">Building integrated value chains from Africa to the world.</p></div>
          <div><h4 className="text-xs font-semibold tracking-wider text-[#c9a227] uppercase mb-4">Businesses</h4><ul className="space-y-2.5">{businesses.map((b) => <li key={b.id}><Link href={b.href} className="text-sm text-white/50 hover:text-white transition-colors">{b.short}</Link></li>)}</ul></div>
          <div><h4 className="text-xs font-semibold tracking-wider text-[#c9a227] uppercase mb-4">Company</h4><ul className="space-y-2.5"><li><Link href="/about" className="text-sm text-white/50 hover:text-white">About AURION</Link></li><li><Link href="/contact" className="text-sm text-white/50 hover:text-white">Contact</Link></li></ul></div>
          <div><h4 className="text-xs font-semibold tracking-wider text-[#c9a227] uppercase mb-4">Global Trade Center</h4><p className="text-sm text-white/50">Addis Ababa, Ethiopia</p><a href="mailto:trade@aurionglobal.com" className="text-sm text-white/50 hover:text-white">trade@aurionglobal.com</a></div>
        </div>
        <p className="mt-14 pt-8 border-t border-white/5 text-xs text-white/40">© {new Date().getFullYear()} AURION Global Holdings PLC. All rights reserved.</p>
      </div>
    </footer>
  );
}
