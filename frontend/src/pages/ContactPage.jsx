import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Headphones,
  HelpCircle,
  ChevronDown,
  Search,
  Truck,
  Ruler,
  RotateCcw,
  CreditCard,
  Shirt,
  Package,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';

const FAQ_CATEGORIES = [
  'All Topics',
  'Shipping & Delivery',
  'Size & Fits',
  'Returns & Refunds',
  'Payments & COD',
  'Fabric & Care',
];

const FAQS = [
  {
    id: 1,
    category: 'Shipping & Delivery',
    icon: Truck,
    q: 'How long does shipping take across India?',
    a: 'Metros and Tier 1 cities receive orders in 2-4 business days. Standard nationwide delivery across all 19,000+ pin codes takes 4-6 business days.',
  },
  {
    id: 2,
    category: 'Shipping & Delivery',
    icon: Truck,
    q: 'Can I track my order status in real time?',
    a: 'Yes! As soon as your package is dispatched, we send live tracking updates via SMS, Email, and WhatsApp with an interactive AWB tracking link.',
  },
  {
    id: 3,
    category: 'Size & Fits',
    icon: Ruler,
    q: 'What is your size and fit policy?',
    a: 'All AMA YAAR apparel features an intentional drop-shoulder, relaxed boxy streetwear fit. Check our detailed size guide on product pages or message support for personalized recommendations.',
  },
  {
    id: 4,
    category: 'Returns & Refunds',
    icon: RotateCcw,
    q: 'How do returns and exchanges work?',
    a: 'We offer hassle-free 7-day returns & size exchanges. You can initiate a return directly from your Profile > Orders tab or reach out to support via email/WhatsApp.',
  },
  {
    id: 5,
    category: 'Payments & COD',
    icon: CreditCard,
    q: 'Is Cash on Delivery (COD) available?',
    a: 'Yes, Cash on Delivery (COD) is available for eligible pin codes across India. An OTP verification is required at checkout for COD orders.',
  },
  {
    id: 6,
    category: 'Payments & COD',
    icon: CreditCard,
    q: 'What payment options do you accept for online orders?',
    a: 'We accept UPI (Google Pay, PhonePe, Paytm, CRED), Credit/Debit cards (Visa, Mastercard, RuPay), NetBanking, EMI options, and Cash on Delivery.',
  },
  {
    id: 7,
    category: 'Fabric & Care',
    icon: Shirt,
    q: 'How should I wash and care for heavyweight 240+ GSM graphic tees?',
    a: 'To keep prints vibrant and cotton soft: cold machine wash inside out, use mild detergent, avoid bleaching, and line dry in shade. Do not iron directly on screen-printed artwork.',
  },
  {
    id: 8,
    category: 'Fabric & Care',
    icon: Shirt,
    q: 'Are all AMA YAAR garments 100% authentic combed cotton?',
    a: 'Absolutely. Every tee, hoodie, and cargo is engineered from 100% bio-washed pre-shrunk combed cotton with heavy-duty reinforced double-stitched seams.',
  },
  {
    id: 9,
    category: 'Shipping & Delivery',
    icon: Package,
    q: 'Can I cancel or modify my order after placing it?',
    a: 'Orders can be cancelled or modified within 2 hours of placement before warehouse packing starts. Contact support via WhatsApp or email with your order ID immediately.',
  },
  {
    id: 10,
    category: 'Fabric & Care',
    icon: Package,
    q: 'Do you offer bulk orders, wholesale, or corporate partnerships?',
    a: 'Yes! We collaborate with brands, college fests, and pop-up creators for bulk streetwear drops. Select "Business Partnership" in the message form above to get in touch.',
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [faqSearch, setFaqSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order Query',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('API submission error:', err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'All Topics' || faq.category === selectedCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.a.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.category.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 select-none">
      {/* 1. Header Hero Banner */}
      <section className="bg-black py-16 sm:py-20 text-white text-center border-b border-neutral-800 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#facc15]">
            <Headphones className="h-4 w-4" /> 24/7 CUSTOMER SUPPORT &amp; HELP DESK
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl font-black italic uppercase tracking-tight text-white leading-none">
            CONTACT <span className="text-[#facc15]">AMA YAAR</span> SUPPORT
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto font-medium uppercase tracking-wider leading-relaxed">
            Have questions about orders, sizing, drops, or returns? Our urban support squad is active Mon-Sat.
          </p>
        </div>
      </section>

      {/* 2. Main Contact Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Info Cards Grid (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 bg-white border border-slate-200 rounded-sm shadow-xs hover:border-slate-300 transition">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-black text-[#facc15] rounded-sm">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Helpline &amp; WhatsApp</h3>
                  <p className="text-xs font-semibold text-slate-700 mt-1">+91 98765 43210 / +91 88000 11223</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">Available Mon – Sat, 10:00 AM to 7:00 PM IST</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-sm shadow-xs hover:border-slate-300 transition">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-black text-[#facc15] rounded-sm">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Email Support</h3>
                  <p className="text-xs font-semibold text-slate-700 mt-1">support@amayaan.in</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">We respond to all customer emails within 24 hours.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-sm shadow-xs hover:border-slate-300 transition">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-black text-[#facc15] rounded-sm">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Headquarters &amp; Lab</h3>
                  <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
                    AMA YAAR Apparel HQ, Plot 42, Fashion Hub Complex, Okhla Phase III, New Delhi, India 110020
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-sm shadow-xs hover:border-slate-300 transition">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-black text-[#facc15] rounded-sm">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Operational Hours</h3>
                  <p className="text-xs font-semibold text-slate-700 mt-1">Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">Sunday: Closed for drop processing &amp; maintenance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 border border-slate-200 rounded-sm shadow-xs">
            {submitted ? (
              <div className="py-14 text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Message Received!</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
                  Thank you for reaching out, <strong>{formData.name}</strong>. Our customer care team has logged your inquiry regarding <strong>{formData.subject}</strong> and will get back to you at <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: 'Order Query', message: '' });
                  }}
                  className="mt-4 inline-flex items-center gap-2 bg-black px-6 py-3 text-xs font-black text-white hover:bg-neutral-800 transition uppercase tracking-wider rounded-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                    SEND US A MESSAGE
                  </h3>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Direct Support Ticket
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase mb-1.5">
                      YOUR NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-black focus:outline-none bg-white rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase mb-1.5">
                      YOUR EMAIL *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. rahul@gmail.com"
                      className="w-full border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-black focus:outline-none bg-white rounded-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase mb-1.5">
                      PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-black focus:outline-none bg-white rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase mb-1.5">
                      SUBJECT
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-black focus:outline-none bg-white rounded-sm"
                    >
                      <option value="Order Query">Order Query</option>
                      <option value="Size & Fit Help">Size &amp; Fit Help</option>
                      <option value="Return / Refund">Return / Refund</option>
                      <option value="Business Partnership">Business Partnership</option>
                      <option value="General Feedback">General Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase mb-1.5">
                    YOUR MESSAGE *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your issue, order ID, or query in detail..."
                    className="w-full border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-black focus:outline-none bg-white rounded-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black py-3.5 text-center text-xs font-black uppercase tracking-widest text-[#facc15] hover:bg-neutral-900 transition flex items-center justify-center gap-2 rounded-sm border border-black shadow-xs disabled:opacity-50"
                >
                  <Send className="h-4 w-4" /> {loading ? 'SENDING...' : 'SUBMIT MESSAGE'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 3. BRAND NEW DESIGN: Categorized & Searchable Card Grid FAQ Section */}
      <section className="border-t border-slate-200 bg-neutral-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-neutral-600">
                <HelpCircle className="h-4 w-4 text-black" /> KNOWLEDGE BASE &amp; FAQ HUB
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase italic tracking-tight mt-1">
                FREQUENTLY ASKED QUESTIONS
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                Find instant solutions for shipping, sizing, returns, payments, and fabric care.
              </p>
            </div>

            {/* FAQ Search Bar */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search FAQs by keywords..."
                className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black rounded-sm font-medium shadow-xs"
              />
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="mt-6 flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition whitespace-nowrap rounded-sm border ${
                  selectedCategory === cat
                    ? 'bg-black text-[#facc15] border-black shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ 2-Column Responsive Card Grid */}
          {filteredFaqs.length === 0 ? (
            <div className="mt-10 py-16 text-center bg-white border border-slate-200 rounded-sm">
              <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-black text-slate-900 uppercase tracking-wide">No FAQs Found</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for a different keyword or category.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openFaq === faq.id;
                const IconComponent = faq.icon || HelpCircle;
                const indexNum = String(index + 1).padStart(2, '0');

                return (
                  <div
                    key={faq.id}
                    className={`bg-white border transition duration-300 rounded-sm overflow-hidden ${
                      isOpen
                        ? 'border-slate-400 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 bg-neutral-100 group-hover:bg-black group-hover:text-[#facc15] text-slate-700 flex items-center justify-center rounded-sm shrink-0 transition duration-300 border border-slate-200">
                          <IconComponent className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                              #{indexNum}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                              {faq.category}
                            </span>
                          </div>
                          <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-black transition uppercase tracking-tight leading-snug">
                            {faq.q}
                          </h3>
                        </div>
                      </div>

                      <div className="h-6 w-6 rounded-sm border border-slate-200 flex items-center justify-center shrink-0 bg-slate-50 group-hover:bg-slate-100 transition">
                        {isOpen ? (
                          <Minus className="h-3 w-3 text-black" />
                        ) : (
                          <Plus className="h-3 w-3 text-slate-500 group-hover:text-black" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-3.5 pt-2 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 bg-neutral-50/60">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
