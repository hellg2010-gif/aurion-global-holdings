export const businesses = [
  { id: "ecommerce-export", name: "AURION E-Commerce Export", short: "E-Commerce Export", href: "/businesses/ecommerce-export", tagline: "Connecting African Products to Global Markets", description: "The international commercial gateway connecting Ethiopian and African products with buyers, distributors, retailers and strategic partners around the world.", color: "from-amber-500/20 to-yellow-600/10", icon: "globe" },
  { id: "jewelry", name: "AURION Jewelry Manufacturing", short: "Jewelry Manufacturing", href: "/businesses/jewelry", tagline: "From Precious Resources to Extraordinary Jewelry", description: "Transforming responsibly sourced precious and semi-precious materials into high-quality finished jewelry for domestic and international markets.", color: "from-yellow-400/20 to-amber-700/10", icon: "gem" },
  { id: "agro-industry", name: "AURION Agro-Industry", short: "Agro-Industry", href: "/businesses/agro-industry", tagline: "Growing Value From Farm to Global Market", description: "Connecting sustainable agricultural production with modern processing, food security and international markets.", color: "from-emerald-500/20 to-green-700/10", icon: "leaf" },
  { id: "mining", name: "AURION Mining & Minerals", short: "Mining & Minerals", href: "/businesses/mining", tagline: "Responsible Resources. Higher Value. Sustainable Development.", description: "Responsible mineral development, processing and value addition focused on creating greater value from resources.", color: "from-slate-400/20 to-zinc-600/10", icon: "mountain" },
  { id: "green-energy", name: "AURION Green Energy", short: "Green Energy", href: "/businesses/green-energy", tagline: "Powering AURION’s Future With Clean Energy", description: "Renewable-energy solutions designed to support industrial growth, communities and sustainable economic development.", color: "from-sky-400/20 to-blue-600/10", icon: "sun" },
  { id: "aviation-logistics", name: "AURION Aviation & Logistics", short: "Aviation & Logistics", href: "/businesses/aviation-logistics", tagline: "Moving People, Products and Opportunity", description: "Connecting AURION’s production and commercial network with domestic, regional and international markets.", color: "from-indigo-400/20 to-violet-600/10", icon: "plane" },
  { id: "global-commerce", name: "AURION Global E-Commerce", short: "Global E-Commerce", href: "/businesses/global-commerce", tagline: "One Digital Marketplace. Global Reach.", description: "The digital marketplace layer connecting AURION products, verified suppliers, international buyers and strategic partners.", color: "from-rose-400/20 to-pink-600/10", icon: "store" },
];

export const navLinks = [
  { name: "Home", href: "/" }, { name: "About", href: "/about" }, { name: "Businesses", href: "/businesses", children: businesses.map((b) => ({ name: b.short, href: b.href })) }, { name: "Ecosystem", href: "/ecosystem" }, { name: "Investors", href: "/investors" }, { name: "Sustainability", href: "/sustainability" }, { name: "News", href: "/news" }, { name: "Careers", href: "/careers" }, { name: "Contact", href: "/contact" },
];

export const valueChain = [
  { stage: "Resources", items: ["Mining & Minerals", "Agro-Industry", "Green Energy"], description: "Responsible extraction, cultivation and clean power generation" },
  { stage: "Value Creation", items: ["Jewelry Manufacturing", "Processing", "Manufacturing"], description: "Transforming raw resources into high-value finished products" },
  { stage: "Movement", items: ["Aviation & Logistics", "Warehousing", "Distribution"], description: "Efficient movement of goods from origin to destination" },
  { stage: "Markets", items: ["E-Commerce Export", "Global E-Commerce", "Wholesale"], description: "Connecting products with buyers worldwide through digital and physical channels" },
  { stage: "Revenue & Growth", items: ["Reinvestment", "Expansion", "New Markets"], description: "Profits fuel further development across the entire ecosystem" },
];
