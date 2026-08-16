import Link from "next/link";

export const metadata = {
  title: "Sustainability",
  description:
    "Environmental, social and governance pillars of AURION Global Holdings PLC — renewable energy, responsible mining, rural development and transparent governance.",
};

export default function SustainabilityPage() {
  return (
    <>
      <section className="section-padding border-b border-white/5">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="text-xs tracking-[0.2em] text-[#c9a227] uppercase mb-4">
              Sustainability
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Responsible growth
              <br />
              <span className="text-white/50">across every division</span>
            </h1>
            <p className="text-lg text-white/55 leading-relaxed">
              ESG is not a separate report — it is embedded in how AURION designs projects,
              selects partners and measures success.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Environmental */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">
              <div className="text-xs tracking-wider text-emerald-400 uppercase mb-4">
                Environmental
              </div>
              <ul className="space-y-3 text-sm text-white/70">
                <li>• Renewable energy integration</li>
                <li>• Responsible mining practices</li>
                <li>• Resource efficiency</li>
                <li>• Waste reduction & circular economy</li>
                <li>• GHG measurement and reduction</li>
              </ul>
            </div>

            {/* Social */}
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-8">
              <div className="text-xs tracking-wider text-sky-400 uppercase mb-4">
                Social
              </div>
              <ul className="space-y-3 text-sm text-white/70">
                <li>• Quality employment creation</li>
                <li>• Skills development & training</li>
                <li>• Rural economic development</li>
                <li>• Community investment</li>
                <li>• Supplier development programs</li>
              </ul>
            </div>

            {/* Governance */}
            <div className="rounded-2xl border border-[#c9a227]/25 bg-[#c9a227]/5 p-8">
              <div className="text-xs tracking-wider text-[#c9a227] uppercase mb-4">
                Governance
              </div>
              <ul className="space-y-3 text-sm text-white/70">
                <li>• Transparency & disclosure</li>
                <li>• Regulatory compliance</li>
                <li>• Anti-corruption frameworks</li>
                <li>• Risk management systems</li>
                <li>• Responsible sourcing standards</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container-wide text-center">
          <Link href="/investors" className="btn-outline-gold inline-flex px-7 py-3 rounded-full text-sm">
            View Investor ESG Materials
          </Link>
        </div>
      </section>
    </>
  );
}
