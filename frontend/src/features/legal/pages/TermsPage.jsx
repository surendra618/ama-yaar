import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Shield, FileText } from 'lucide-react';

const SECTIONS = [
  { id: 'introduction', number: '01', title: 'Introduction & Scope' },
  { id: 'eligibility', number: '02', title: 'Account Registration & Conduct' },
  { id: 'orders', number: '03', title: 'Product Availability & Pricing' },
  { id: 'payments', number: '04', title: 'Payments & Transactions' },
  { id: 'returns', number: '05', title: 'Shipping, Returns & Exchanges' },
  { id: 'intellectual-property', number: '06', title: 'Intellectual Property Rights' },
  { id: 'liability', number: '07', title: 'Limitation of Liability' },
  { id: 'contact', number: '08', title: 'Governing Law & Support' },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('introduction');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Top Banner Header */}
      <div className="border-b border-black/10 bg-neutral-50/60 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
            <Link to="/" className="hover:text-black transition">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-black font-bold">Terms & Conditions</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
                Terms of Service
              </h1>
              <p className="mt-2 text-xs sm:text-sm font-medium text-neutral-600 max-w-2xl">
                Please review these Terms of Service carefully before exploring or completing a purchase on AMA YAAR. By accessing our site, you agree to these terms.
              </p>
            </div>
            <div className="text-xs font-mono text-neutral-500 bg-white border border-neutral-200 px-3.5 py-2 inline-block rounded-none self-start md:self-auto">
              EFFECTIVE DATE: SEP 30, 2026
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sticky Sidebar Navigation */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 border border-black/10 bg-white p-5 space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-3 px-2">
                Table of Contents
              </h3>
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full flex items-center justify-between text-left px-3 py-2.5 text-xs font-bold transition-all ${
                    activeSection === sec.id
                      ? 'bg-black text-white'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-black'
                  }`}
                >
                  <span className="truncate">{sec.number}. {sec.title}</span>
                  <ArrowRight className={`h-3.5 w-3.5 transition-transform ${activeSection === sec.id ? 'translate-x-0.5 text-amber-400' : 'opacity-0'}`} />
                </button>
              ))}

              <div className="mt-6 pt-4 border-t border-neutral-100 space-y-2">
                <Link
                  to="/privacy-policy"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-500 hover:text-black transition"
                >
                  <Shield className="h-3.5 w-3.5" /> Read Privacy Policy
                </Link>
              </div>
            </div>
          </aside>

          {/* Legal Document Content */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-12 leading-relaxed text-sm text-neutral-800">
            
            {/* Section 01 */}
            <section id="introduction" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">01</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Introduction & Scope
                </h2>
              </div>
              <p>
                Welcome to <strong>AMA YAAR</strong>. These Terms of Service govern your use of our website located at amayaar.com and all associated services, features, content, and mobile applications owned or operated by AMA YAAR.
              </p>
              <p>
                Throughout the site, the terms "we", "us", and "our" refer to AMA YAAR. By visiting our site or purchasing something from us, you engage in our "Service" and agree to be bound by these terms. If you do not agree to all terms and conditions of this agreement, you may not access the website or use any services.
              </p>
            </section>

            {/* Section 02 */}
            <section id="eligibility" className="scroll-mt-28 space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">02</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Account Registration & Conduct
                </h2>
              </div>
              <p>
                When creating an account on AMA YAAR, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
              </p>
              <div className="bg-neutral-50 p-4 border-l-2 border-black space-y-2">
                <p className="font-bold text-xs uppercase tracking-wider text-black">Account Safety Guidelines:</p>
                <ul className="list-disc pl-4 text-xs space-y-1.5 text-neutral-600 font-medium">
                  <li>You are responsible for safeguarding your password and account credentials.</li>
                  <li>You must immediately notify us of any unauthorized use of your account.</li>
                  <li>You may not use as a username the name of another person or entity that is not lawfully available for use.</li>
                </ul>
              </div>
            </section>

            {/* Section 03 */}
            <section id="orders" className="scroll-mt-28 space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">03</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Product Availability & Pricing
                </h2>
              </div>
              <p>
                Prices for our streetwear items and accessories are subject to change without prior notice. We reserve the right at any time to modify or discontinue any product or service without liability to you.
              </p>
              <p>
                We have made every effort to display as accurately as possible the colors, textures, and details of our apparel catalog. However, we cannot guarantee that your monitor's display of any color will be 100% accurate.
              </p>
            </section>

            {/* Section 04 */}
            <section id="payments" className="scroll-mt-28 space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">04</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Payments & Transactions
                </h2>
              </div>
              <p>
                We accept major credit cards, debit cards, UPI, net banking, and verified wallet methods. You represent and warrant that you have the legal right to use any payment method utilized in connection with any purchase.
              </p>
              <p>
                By submitting payment details, you grant us the right to provide information to third-party payment processors to facilitate the completion of your order.
              </p>
            </section>

            {/* Section 05 */}
            <section id="returns" className="scroll-mt-28 space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">05</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Shipping, Returns & Exchanges
                </h2>
              </div>
              <p>
                All orders are processed and shipped according to our fulfillment schedules. Delivery estimates provided at checkout are estimates and cannot be guaranteed.
              </p>
              <p>
                Items eligible for return or exchange must be requested within the designated window from date of delivery. Items must be unworn, unwashed, and in original condition with all tags attached.
              </p>
            </section>

            {/* Section 06 */}
            <section id="intellectual-property" className="scroll-mt-28 space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">06</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Intellectual Property Rights
                </h2>
              </div>
              <p>
                The Service and its original content, features, designs, artwork, graphics, logos, and functionality are and will remain the exclusive property of AMA YAAR and its licensors.
              </p>
              <p>
                Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of AMA YAAR.
              </p>
            </section>

            {/* Section 07 */}
            <section id="liability" className="scroll-mt-28 space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">07</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Limitation of Liability
                </h2>
              </div>
              <p>
                In no event shall AMA YAAR, nor its directors, employees, partners, agents, or suppliers, be liable for any indirect, incidental, special, consequential or punitive damages resulting from your access to or use of the Service.
              </p>
            </section>

            {/* Section 08 */}
            <section id="contact" className="scroll-mt-28 space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">08</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Governing Law & Support
                </h2>
              </div>
              <p>
                These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
              </p>
              <div className="bg-black text-white p-6 mt-4">
                <h3 className="text-sm font-black uppercase tracking-wider mb-1">Need Clarification?</h3>
                <p className="text-xs text-neutral-300 font-medium">
                  If you have any questions regarding our Terms of Service, reach out directly to our support desk at{' '}
                  <a href="mailto:support@amayaar.com" className="text-amber-400 font-bold underline">
                    support@amayaar.com
                  </a>.
                </p>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
