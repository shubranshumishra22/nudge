'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  Zap, 
  Building2, 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  Cpu, 
  FileJson, 
  Play, 
  ArrowUpRight, 
  Mic, 
  Terminal, 
  Globe,
  Plus,
  FileText,
  CreditCard,
  Truck
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import ContactForm from '@/components/ContactForm'

export default function LandingPage() {
  const [selectedEngine, setSelectedEngine] = useState<'akshar' | 'saaras' | 'mayura' | 'arya'>('akshar')
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'js' | 'curl'>('python')
  const [promptText, setPromptText] = useState('मुझे एक जैविक मसालों की दुकान बनानी है जिसका रंग हल्दी जैसा पीला हो और बहुत ही साफ़ सुथरा डिज़ाइन हो।')
  const [isGenerating, setIsGenerating] = useState(false)

  const phrases = [
    { q: "Want to build a website?" },
    { q: "वेबसाइट चाहिए?" },
    { q: "ওয়েবসাইট চান?" },
    { q: "வெப்சைட் வேண்டுமா?" },
    { q: "వెబ్‌సైట్ కావాలా?" },
    { q: "वेबसाईट हवी आहे?" },
    { q: "વેબસાઇટ જોઈએ છે?" },
    { q: "ವೆಬ್‌ಸೈಟ್ ಬೇಕೇ?" }
  ]

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 3800)
    return () => clearInterval(interval)
  }, [phrases.length])

  const engines = [
    { 
      id: 'akshar', 
      name: 'Akshar Layouts', 
      type: 'UI Generator', 
      desc: 'Generates custom Tailwind themes from vernacular text prompts', 
      color: '#3333CC',
      accent: '#DF9C2A', // Haldi Yellow
      bg: '#FFFDF9',
      products: ['Premium Haldi Powder', 'Organic Cumin Seed', 'Kashmiri Red Chilli'],
      prompt: 'मुझे एक जैविक मसालों की दुकान बनानी है जिसका रंग हल्दी जैसा पीला हो और बहुत ही साफ़ सुथरा डिज़ाइन हो।'
    },
    { 
      id: 'saaras', 
      name: 'Saaras Voice ASR', 
      type: 'Audio Inventory', 
      desc: 'Transcribes merchant audio files to list catalog products', 
      color: '#6EA335',
      accent: '#800020', // Banarasi Crimson
      bg: '#FCFAF7',
      products: ['Katan Silk Saree', 'Tanchoi Silk Brocade', 'Banarasi Georgette Saree'],
      prompt: 'मुझे बनारसी साड़ियों की दुकान बनानी है जिसका रंग गहरा लाल और सुनहरा हो।'
    },
    { 
      id: 'mayura', 
      name: 'Mayura Translate', 
      type: 'Indic Localization', 
      desc: 'Auto-translates catalogs and templates across 23 languages', 
      color: '#B81514',
      accent: '#8A4F35', // Clay Brown
      bg: '#FAF9F6',
      products: ['Terracotta Tea Set', 'Minimalist Clay Vase', 'Glazed Mitti Bowl'],
      prompt: 'एक मिट्टी के बर्तनों का स्टोर बनाओ, रंग अर्दी ब्राउन हो।'
    },
    { 
      id: 'arya', 
      name: 'Arya Logistics Agent', 
      type: 'Logistics Orchestrator', 
      desc: 'Dispatches parcel details and schedules Shadowfax/Dunzo routes', 
      color: '#DF9C2A',
      accent: '#212191', // Indigo Accent
      bg: '#F8F9FC',
      products: ['Kesar Face Elixir', 'Saffron kumkumadi Scrub', 'Ayurvedic Saffron Lip Butter'],
      prompt: 'organic cosmetics store with saffron orange gradients and premium sans fonts.'
    }
  ]

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
    }, 1500)
  }

  const handleEngineChange = (id: 'akshar' | 'saaras' | 'mayura' | 'arya') => {
    setSelectedEngine(id)
    const engine = engines.find(e => e.id === id)
    if (engine) {
      setPromptText(engine.prompt)
    }
  }

  const currentEngine = engines.find(e => e.id === selectedEngine) || engines[0]

  const plans = [
    { name: 'Free', price: '₹0', icon: Zap, features: ['1 active store', '5 products', 'Karoji subdomain', 'Basic payment options', 'Karoji footer branding', 'Community support'], cta: 'Get started', href: '/login' },
    { name: 'Pro', price: '₹499', icon: Zap, features: ['Up to 5 active stores', 'Unlimited products', 'Custom domain mapping', 'Zero Karoji branding', 'WhatsApp order notifications', '24/7 Priority support'], cta: 'Start free trial', href: '/login', accent: true, badge: 'Most Popular' },
    { name: 'Enterprise', price: '₹2,499', icon: Building2, features: ['Unlimited stores', 'Unlimited products', 'Custom domain mapping', 'White-labeled dashboard', 'Custom API & webhook access', 'Dedicated localization advisor'], cta: 'Contact sales', href: '/login' },
  ]

  return (
    <div className="relative flex min-h-screen flex-col bg-white dark:bg-[#0C0D16] text-[#141414] dark:text-white antialiased font-sans transition-colors duration-300">
      {/* Floating Indian Tricolor Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="sutra-blob-saffron -top-[10%] -left-[10%] opacity-85" />
        <div className="sutra-blob-white top-[20%] left-[15%] opacity-95" />
        <div className="sutra-blob-green -bottom-[10%] -right-[10%] opacity-85" />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10">
        {/* HERO SECTION */}
        <section className="relative flex min-h-[92vh] flex-col items-center justify-center px-4 pt-36 sm:pt-40 lg:pt-44 pb-16 overflow-hidden">

          <div className="relative mx-auto max-w-4xl w-full text-center z-10 flex flex-col items-center">
            {/* Title / Animating Multi-lingual Question Stack */}
            <div className="h-[140px] sm:h-[240px] lg:h-[300px] flex items-center justify-center overflow-hidden w-full relative mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhraseIndex}
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -25, opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 font-serif text-4xl sm:text-[4.2rem] lg:text-[5.2rem] font-normal tracking-tight text-[#141414] dark:text-white leading-[1.25] text-center w-full px-4"
                >
                  {phrases[currentPhraseIndex].q}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Fixed Answer below the question */}
            <div className="font-sora text-2xl sm:text-4xl lg:text-[3rem] font-extrabold tracking-tight text-[#E6651B] dark:text-[#F38858] mt-10 mb-8 select-none leading-none">
              karoji.ai
            </div>

            <p className="mt-4 text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
              Describe your brand in your native language. Our custom layout and localization engines generate a high-performing digital storefront in 5 minutes. Powered by karoji.ai.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/login" className="rounded-full px-8 py-3.5 text-xs font-semibold bg-[#1E2245] text-white hover:bg-[#151833] dark:bg-white dark:text-[#1E2245] dark:hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-md shadow-indigo-900/5 hover:shadow-lg hover:shadow-indigo-900/10">
                Go to Dashboard
              </Link>
              <Link href="#contact" className="rounded-full px-8 py-3.5 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/10 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 backdrop-blur-sm transition-all active:scale-[0.98]">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Grayscale partner logo strip */}
          <div className="relative w-full max-w-7xl mx-auto mt-24 z-10 px-4 border-t border-zinc-100/80 pt-8">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] block text-center mb-6">Sovereign merchants build with Karoji</span>
            <div className="flex items-center justify-between gap-8 flex-wrap opacity-40 hover:opacity-75 transition-opacity max-w-5xl mx-auto">
              <span className="text-sm font-semibold tracking-wider font-mono">BANARAS WEAVERS</span>
              <span className="text-sm font-bold tracking-tight">MITTI STUDIO</span>
              <span className="text-sm font-extrabold tracking-tighter">KESAR ORGANICS</span>
              <span className="text-sm font-semibold font-mono">BharatAgri</span>
              <span className="text-sm font-bold tracking-tight">DECENTRO</span>
              <span className="text-sm font-bold tracking-tight">KAPI ROASTERS</span>
              <span className="text-sm font-semibold">Bengal Handlooms</span>
            </div>
          </div>
        </section>

        {/* INTERACTIVE STOREFRONT BUILDER PLAYGROUND (Replicating Screenshot 3 Layout) */}
        <section id="playground" className="px-4 py-20 bg-white/20 dark:bg-zinc-950/15 backdrop-blur-[2px]">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="font-serif text-3xl sm:text-4.5xl font-normal tracking-tight text-[#141414] dark:text-white mb-4">
              The Storefront Engine India Builds On
            </h2>
            <p className="text-sm text-zinc-500 mb-12">Click each engine module to see how prompts translate to active merchant storefront interfaces</p>

            {/* Sandbox Container */}
            <div className="rounded-[36px] md:rounded-[40px] border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-[#0E0F19]/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 md:p-10 text-left">
              
              {/* Tab Header list */}
              <div className="flex items-center flex-wrap gap-2 border-b border-zinc-100 pb-5 mb-8">
                <button
                  onClick={() => handleEngineChange('akshar')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                    selectedEngine === 'akshar'
                      ? 'bg-indigo-50/50 text-[#3333CC] border border-indigo-100/50 shadow-sm'
                      : 'bg-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  <Cpu size={13} />
                  Akshar UI Layout
                </button>
                <button
                  onClick={() => handleEngineChange('saaras')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                    selectedEngine === 'saaras'
                      ? 'bg-indigo-50/50 text-[#3333CC] border border-indigo-100/50 shadow-sm'
                      : 'bg-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  <Mic size={13} />
                  Saaras Voice Cataloger
                </button>
                <button
                  onClick={() => handleEngineChange('mayura')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                    selectedEngine === 'mayura'
                      ? 'bg-indigo-50/50 text-[#3333CC] border border-indigo-100/50 shadow-sm'
                      : 'bg-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  <Globe size={13} />
                  Mayura Translation
                </button>
                <button
                  onClick={() => handleEngineChange('arya')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                    selectedEngine === 'arya'
                      ? 'bg-indigo-50/50 text-[#3333CC] border border-indigo-100/50 shadow-sm'
                      : 'bg-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  <Truck size={13} />
                  Arya Logistics Agent
                </button>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Left Side: Dynamic Textarea / Prompt Input */}
                <div className="lg:col-span-7 flex flex-col justify-between border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 min-h-[340px] bg-white/60 dark:bg-[#0E0F19]/60 backdrop-blur-sm relative">
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center gap-3 z-15">
                      <div className="h-6 w-6 rounded-full border-2 border-[var(--indigo)] border-t-transparent animate-spin" />
                      <span className="text-xs font-bold text-[var(--indigo)] font-mono">RENDERING DESIGN SYSTEMS...</span>
                    </div>
                  )}

                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="w-full text-zinc-700 text-base font-medium resize-none border-none focus:outline-none focus:ring-0 bg-transparent flex-1 leading-relaxed min-h-[160px]"
                    placeholder="Describe your storefront idea here..."
                  />

                  <div className="border-t border-zinc-100 pt-5 mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Language dropdown */}
                      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100">
                        <span>Language</span>
                        <span className="text-[10px] text-zinc-400">▼</span>
                      </div>
                      <span className="text-xs text-zinc-400 font-mono">Indic Translation Active</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-400 font-mono">Karoji v3</span>
                      {/* Generate / Build Action button */}
                      <button 
                        onClick={handleGenerate}
                        className="h-12 w-12 rounded-full bg-[#1E2245] text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-sm"
                        title="Generate Store"
                      >
                        <Play size={16} fill="white" className="ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Mock Phone Storefront Simulator */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  
                  {/* Phone Mock Container */}
                  <div 
                    className="rounded-3xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col min-h-[260px] transition-all duration-500 text-left"
                    style={{ backgroundColor: currentEngine.bg }}
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                      <span className="text-[10px] font-bold uppercase tracking-wider font-sora" style={{ color: currentEngine.color }}>
                        {currentEngine.name}
                      </span>
                      <span className="text-[8px] bg-zinc-100 text-zinc-500 font-bold px-1.5 py-0.5 rounded font-mono">SIMULATOR</span>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        {/* Mini Hero layout */}
                        <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.03)' }}>
                          <span className="text-[7px] uppercase tracking-wider block font-bold font-mono" style={{ color: currentEngine.accent }}>AI Rendered</span>
                          <h3 className="text-[11px] font-bold font-serif mt-1 leading-snug" style={{ color: currentEngine.color }}>
                            {currentEngine.desc}
                          </h3>
                        </div>

                        {/* Product list preview */}
                        <div className="mt-3 flex flex-col gap-1.5">
                          <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">Preview Products</span>
                          {currentEngine.products.map((p) => (
                            <div key={p} className="flex items-center justify-between p-2 rounded bg-white border border-black/[0.03] shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                              <span className="text-[9px] font-medium text-zinc-800">{p}</span>
                              <span className="text-[8px] font-bold font-mono" style={{ color: currentEngine.color }}>₹450</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Checkout payment simulation */}
                      <button className="w-full py-2.5 text-[9px] font-bold rounded-lg text-white text-center transition-all active:scale-95 shadow-sm" style={{ backgroundColor: currentEngine.color }}>
                        Go to Checkout (UPI Linked)
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 pt-4 mt-4 flex items-center justify-between text-xs text-zinc-500">
                    <span>Try with other engines</span>
                    <div className="flex gap-2">
                      {engines.map((e) => (
                        <button 
                          key={e.id}
                          onClick={() => handleEngineChange(e.id as any)}
                          className={`h-6 w-6 rounded font-mono text-[9px] font-bold border transition-all ${
                            selectedEngine === e.id ? 'border-[var(--indigo)] bg-indigo-50 text-[var(--indigo)]' : 'border-zinc-200 text-zinc-400'
                          }`}
                        >
                          {e.id[0].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* KAROJI VALUE STORY — Replicating Screenshot 5 Layout for SMB Digitisation */}
        <section className="px-4 py-20 bg-zinc-50/20 dark:bg-zinc-900/10 border-t border-zinc-100/80 dark:border-zinc-900/80 backdrop-blur-[1px]">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left narrative */}
              <div className="lg:col-span-5 text-left flex flex-col gap-6">
                <h2 className="font-serif text-4.5xl font-normal tracking-tight text-zinc-800 dark:text-zinc-100 leading-tight">
                  India Sells Online
                </h2>
                <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
                  From handloom silk weavers in Banaras to organic spice growers in Wayanad, Karoji is empowering India&apos;s 100 million merchants to launch digital storefronts and capture customers globally.
                </p>
                <Link href="/login" className="w-fit rounded-full px-8 py-3.5 text-xs font-semibold bg-[#1E2245] text-white hover:bg-[#151833] transition-colors shadow-sm">
                  Go to Dashboard
                </Link>
              </div>

              {/* Right Media Card (Visualizing local craft going digital) */}
              <div className="lg:col-span-7 w-full">
                <div className="relative rounded-[32px] overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 aspect-[16/10] shadow-md group cursor-pointer">
                  {/* Visual representing Indian weavers/craft scroll */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E9C4A6]/20 to-[#A6C5E9]/10" />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-full h-full rounded-2xl bg-zinc-100 border border-zinc-200/50 overflow-hidden relative flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=1200&auto=format&fit=crop" 
                        alt="Local Indian Handcrafts" 
                        className="object-cover w-full h-full opacity-70 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                      
                      {/* Floating play indicator */}
                      <div className="h-16 w-16 rounded-full bg-[#1E2245]/90 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg z-10">
                        <Play size={20} fill="white" className="ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* KAROJI DEVELOPER SDK GRID — Replicating Screenshot 1 Layout */}
        <section id="developers" className="px-4 py-24 bg-white/20 dark:bg-zinc-950/10 border-t border-zinc-100/80 dark:border-zinc-900/80 backdrop-blur-[1px]">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="font-serif text-3xl sm:text-4.5xl font-normal tracking-tight text-[#141414] dark:text-white mb-4">
              Build anything with Karoji APIs
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-16">Simple layout, localization, and payment endpoints for e-commerce.</p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Developer Card */}
              <div className="lg:col-span-6 rounded-[32px] border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-[#0E0F19]/80 backdrop-blur-md p-8 flex flex-col justify-between shadow-sm min-h-[500px]">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                    Add <span className="text-[#3333CC] dark:text-indigo-400">AI Catalog Scanner</span> <br />
                    to your app in minutes
                  </h3>

                  {/* Tabs code block */}
                  <div className="rounded-2xl border border-zinc-100/85 dark:border-zinc-800/80 bg-[#FCFCFD] dark:bg-zinc-900/50 p-4 mt-8 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setActiveCodeTab('python')}
                          className={`text-xs font-bold pb-1 transition-all ${
                            activeCodeTab === 'python' ? 'border-b-2 border-amber-500 text-zinc-800' : 'text-zinc-400'
                          }`}
                        >
                          🐍 Python
                        </button>
                        <button 
                          onClick={() => setActiveCodeTab('js')}
                          className={`text-xs font-bold pb-1 transition-all ${
                            activeCodeTab === 'js' ? 'border-b-2 border-amber-500 text-zinc-800' : 'text-zinc-400'
                          }`}
                        >
                          ☕ JavaScript
                        </button>
                        <button 
                          onClick={() => setActiveCodeTab('curl')}
                          className={`text-xs font-bold pb-1 transition-all ${
                            activeCodeTab === 'curl' ? 'border-b-2 border-amber-500 text-zinc-800' : 'text-zinc-400'
                          }`}
                        >
                          🌐 cURL
                        </button>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono cursor-pointer hover:text-zinc-600">Copy</span>
                    </div>

                    {/* Pre */}
                    <div className="font-mono text-[10px] leading-relaxed text-zinc-600 select-all overflow-x-auto min-h-[140px]">
                      {activeCodeTab === 'python' && (
                        <pre><code>{`from karojiai import KarojiClient
from karojiai.catalog import scan

client = KarojiClient(api_subscription_key="YOUR_KEY")

# Scan raw invoice photo to product list
catalog = client.catalog.scan(
    file_path="supplier_bill.jpg",
    language="hi-IN",
    extract_prices=True
)
print("Products:", catalog.products)`}</code></pre>
                      )}
                      {activeCodeTab === 'js' && (
                        <pre><code>{`import { KarojiClient } from 'karojiai';

const client = new KarojiClient({ apiKey: 'YOUR_KEY' });

const catalog = await client.catalog.scan({
  filePath: "supplier_bill.jpg",
  languageCode: "hi-IN"
});`}</code></pre>
                      )}
                      {activeCodeTab === 'curl' && (
                        <pre><code>{`curl -X POST https://api.karoji.ai/v1/catalog/scan \\
  -H "api-subscription-key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"image_url": "https://host/bill.jpg"}'`}</code></pre>
                      )}
                    </div>
                  </div>
                </div>

                <button className="w-full py-3.5 rounded-full bg-[#1E2245] text-white font-semibold text-xs mt-8 hover:opacity-90 transition-opacity">
                  Get your API key & get started
                </button>
              </div>

              {/* Right Cards Stack */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                
                {/* 2x2 Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                  
                  {/* Card 1 */}
                  <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-[#0E0F19]/80 backdrop-blur-sm p-6 text-left flex flex-col justify-between relative overflow-hidden group hover:border-[#3333CC] dark:hover:border-indigo-400 transition-all duration-300">
                    <div className="absolute top-0 right-0 h-10 w-10 bg-amber-100/50 rounded-bl-full pointer-events-none" />
                    <div>
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-[#3333CC] mb-6">
                        <Cpu size={14} />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1">Akshar UI Layout</h4>
                      <p className="text-xs text-zinc-400 dark:text-zinc-400 leading-normal">Translates prompts into structured digital storefront themes</p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-[#0E0F19]/80 backdrop-blur-sm p-6 text-left flex flex-col justify-between hover:border-[#3333CC] dark:hover:border-indigo-400 transition-colors">
                    <div>
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-[#6EA335] mb-6">
                        <Mic size={14} />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1">Saaras Voice ASR</h4>
                      <p className="text-xs text-zinc-400 dark:text-zinc-400 leading-normal">Transcribes merchant vocal product listings to catalog</p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-[#0E0F19]/80 backdrop-blur-sm p-6 text-left flex flex-col justify-between hover:border-[#3333CC] dark:hover:border-indigo-400 transition-colors">
                    <div>
                      <div className="h-8 w-8 rounded-lg bg-red-50 border border-red-100/50 flex items-center justify-center text-[#B81514] mb-6">
                        <Globe size={14} />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1">Mayura Translate</h4>
                      <p className="text-xs text-zinc-400 dark:text-zinc-400 leading-normal">Localizes shop copies and catalogs across 23 languages</p>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-[#0E0F19]/80 backdrop-blur-sm p-6 text-left flex flex-col justify-between hover:border-[#3333CC] dark:hover:border-indigo-400 transition-colors">
                    <div>
                      <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-100/50 flex items-center justify-center text-amber-600 mb-6">
                        <FileText size={14} />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1">Akshar OCR</h4>
                      <p className="text-xs text-zinc-400 dark:text-zinc-400 leading-normal">Digitizes handwritten merchant bills into catalog lists</p>
                    </div>
                  </div>

                </div>

                {/* Bottom row of 3 SDK stats cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-zinc-100/80 dark:border-zinc-800 rounded-2xl p-4 text-left bg-zinc-50/20 dark:bg-zinc-900/10">
                    <h5 className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">REST API</h5>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1">Clean endpoints</p>
                  </div>
                  <div className="border border-zinc-100/80 dark:border-zinc-800 rounded-2xl p-4 text-left bg-zinc-50/20 dark:bg-zinc-900/10">
                    <h5 className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Python SDK</h5>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1">pip install karojiai</p>
                  </div>
                  <div className="border border-zinc-100/80 dark:border-zinc-800 rounded-2xl p-4 text-left bg-zinc-50/20 dark:bg-zinc-900/10">
                    <h5 className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Playground</h5>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1">Test in browser</p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* NUDGE SOVEREIGN VALUE CARDS (Replicating Screenshot 2 Layout) */}
        <section className="px-4 py-24 bg-transparent border-t border-zinc-100/80 dark:border-zinc-900/80">
          <div className="mx-auto max-w-6xl">
            {/* Outline Card matching Container style */}
            <div className="rounded-[36px] md:rounded-[40px] border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-[#0E0F19]/80 backdrop-blur-md p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Visual Mandala Card */}
                <div className="lg:col-span-5 w-full">
                  <div className="rounded-3xl bg-[radial-gradient(circle_at_center,rgba(51,51,204,0.18)_0%,rgba(12,13,22,0.95)_100%)] aspect-square border border-zinc-800 flex items-center justify-center relative overflow-hidden group shadow-md">
                    {/* Clouds styling backdrop */}
                    <div className="absolute -bottom-10 inset-x-0 h-40 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.05),transparent_80%)] border-t border-white/5 pointer-events-none" />
                    
                    {/* Slow Rotating Mandala Floral emblem */}
                    <svg className="h-32 w-32 text-indigo-200/90 animate-[spin_35s_linear_infinite]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3"/>
                      <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="1"/>
                      {/* Leaf loops */}
                      {Array.from({ length: 12 }).map((_, idx) => {
                        const rot = idx * 30;
                        return (
                          <g key={idx} transform={`rotate(${rot} 50 50)`}>
                            <path d="M50 28 C45 38, 55 38, 50 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M50 14 C40 32, 60 32, 50 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                </div>

                {/* Right narrative & icons list */}
                <div className="lg:col-span-7 text-left flex flex-col justify-between min-h-[360px]">
                  <div className="flex flex-col gap-8">
                    
                    {/* Feature 1 */}
                    <div className="flex items-start gap-5">
                      <div className="h-6 w-6 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-[#3333CC] dark:text-indigo-400 shrink-0 mt-1">
                        <Plus size={12} className="rotate-45" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Sovereign Store Templates</h4>
                        <p className="text-sm text-zinc-400 dark:text-zinc-400 mt-2 leading-relaxed">
                          Visual theme layouts inspired by historical Indian styles, claywares, silk weaves, and handcraft aesthetics.
                        </p>
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex items-start gap-5">
                      <div className="h-6 w-6 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-[#3333CC] dark:text-indigo-400 shrink-0 mt-1">
                        <Plus size={12} className="rotate-45" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Frictionless UPI Checkout</h4>
                        <p className="text-sm text-zinc-400 dark:text-zinc-400 mt-2 leading-relaxed">
                          Integrated mobile UPI deep-linking (PhonePe, GPay, Paytm) with zero merchant setups or sign-up friction.
                        </p>
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex items-start gap-5">
                      <div className="h-6 w-6 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-[#3333CC] dark:text-indigo-400 shrink-0 mt-1">
                        <Plus size={12} className="rotate-45" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">WhatsApp Confirmation Agent</h4>
                        <p className="text-sm text-zinc-400 dark:text-zinc-400 mt-2 leading-relaxed">
                          Automates customer shipping confirmations and verification routes directly inside local WhatsApp threads.
                        </p>
                      </div>
                    </div>

                  </div>

                  <Link href="/login" className="w-fit rounded-full px-8 py-3.5 text-xs font-semibold bg-[#1E2245] text-white hover:bg-[#151833] dark:bg-white dark:text-[#1E2245] dark:hover:bg-zinc-100 mt-8 shadow-sm transition-colors">
                    Get Started
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="px-4 py-24 bg-white/20 dark:bg-zinc-950/10 border-t border-zinc-100/80 dark:border-zinc-900/80 backdrop-blur-[1px]">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="font-serif text-4xl font-bold tracking-tight text-[var(--ink)]">Simple pricing</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Start free, upgrade as your business expands</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 items-stretch">
              {plans.map((plan) => (
                <div 
                  key={plan.name} 
                  className={`relative rounded-[32px] p-8 transition-all border flex flex-col justify-between ${
                    plan.accent 
                      ? 'border-2 border-[var(--indigo)] bg-white/90 dark:bg-[#0E0F19]/90 backdrop-blur-md shadow-lg scale-[1.03]' 
                      : 'border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-[#0E0F19]/80 backdrop-blur-sm shadow-sm'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider bg-[var(--indigo)] text-white shadow-sm">
                      {plan.badge}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-2.5">
                      <plan.icon size={20} className={plan.accent ? 'text-[var(--indigo)]' : 'text-[var(--muted)]'} />
                      <h3 className="text-xl font-bold text-[var(--ink)] font-sora">{plan.name}</h3>
                    </div>
                    <div className="mt-6 border-b pb-5 border-zinc-100 text-left">
                      <span className="font-mono text-4xl font-semibold text-[var(--ink)]">{plan.price}</span>
                      <span className="text-sm text-[var(--muted)] font-mono">/mo</span>
                    </div>
                    <ul className="mt-6 space-y-4 text-left">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--muted)]">
                          <Check size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link 
                    href={plan.href} 
                    className={`mt-8 flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition-all ${
                      plan.accent 
                        ? 'bg-[var(--indigo)] text-white shadow-sm hover:bg-[#212191] active:scale-[0.97]' 
                        : 'border border-zinc-300 bg-transparent text-zinc-800 hover:bg-zinc-50'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* CONTACT SECTION */}
        <section id="contact" className="px-4 py-24 bg-transparent border-t border-zinc-100/80 dark:border-zinc-900/80 jali-bg">
          <ContactForm />
        </section>
      </main>

      <footer className="border-t border-zinc-100 dark:border-zinc-900 bg-white/90 dark:bg-[#0C0D16]/90 backdrop-blur-md relative">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Column 1 */}
            <div className="md:col-span-5 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2">
                <img src="https://i.ibb.co/r2t1yhLF/Chat-GPT-Image-Jun-24-2026-10-53-04-PM.png" alt="Karoji" className="h-7 w-7 rounded-[8px] object-cover dark:hidden" />
                <img src="https://i.ibb.co/qLLzB0PX/Chat-GPT-Image-Jun-24-2026-10-52-58-PM.png" alt="Karoji" className="h-7 w-7 rounded-[8px] object-cover hidden dark:block" />
                <span className="text-base font-bold font-sora tracking-tight text-zinc-800 dark:text-zinc-100">Karoji</span>
              </div>
              <p className="text-sm text-[var(--muted)] leading-relaxed max-w-sm">
                AI-powered sovereign e-commerce for Indian small businesses. Designed, engineered, and operated locally.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-[var(--muted)] font-mono">Built by</span>
                <a href="https://shubranshu.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold underline underline-offset-2 text-zinc-800 dark:text-zinc-200 hover:text-[var(--indigo)] transition-colors">Shubranshu</a>
              </div>
            </div>

            {/* Column 2 */}
            <div className="md:col-span-3 flex flex-col gap-3 text-left">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">Products</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li><a href="#" className="hover:text-[var(--indigo)] transition-colors">Karoji Akshar Layouts</a></li>
                <li><a href="#" className="hover:text-[var(--indigo)] transition-colors">Karoji Saaras Voice</a></li>
                <li><a href="#" className="hover:text-[var(--indigo)] transition-colors">Karoji Arya Logistics</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="md:col-span-2 flex flex-col gap-3 text-left">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li><a href="#" className="hover:text-[var(--indigo)] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[var(--indigo)] transition-colors">Trust Center</a></li>
                <li><a href="#" className="hover:text-[var(--indigo)] transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div className="md:col-span-2 flex flex-col gap-3 text-left">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li><a href="#" className="hover:text-[var(--indigo)] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[var(--indigo)] transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-100 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted)] font-mono">
            <span>© {new Date().getFullYear()} karoji.ai. All rights reserved.</span>
            <span className="mt-2 sm:mt-0 flex items-center gap-1">Made with taste in Bengaluru <span className="text-[var(--indigo)]">✦</span></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
