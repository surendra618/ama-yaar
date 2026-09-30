import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, FileText } from 'lucide-react';

const SECTIONS = [
  { id: 'collection', number: '01', title: 'Information We Collect' },
  { id: 'usage', number: '02', title: 'How We Use Your Data' },
  { id: 'sharing', number: '03', title: 'Data Sharing & Third Parties' },
  { id: 'cookies', number: '04', title: 'Cookies & Tracking Tech' },
  { id: 'security', number: '05', title: 'Data Security & Storage' },
  { id: 'rights', number: '06', title: 'Your Privacy Rights' },
  { id: 'updates', number: '07', title: 'Policy Updates & Contact' },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('collection');

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
            <span className="text-black font-bold">Privacy Policy</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
                Privacy Policy
              </h1>
              <p className="mt-2 text-xs sm:text-sm font-medium text-neutral-600 max-w-2xl">
                This Privacy Policy describes how AMA YAAR collects, uses, and discloses your personal information when you visit or make a purchase from us.
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
                  to="/terms"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-500 hover:text-black transition"
                >
                  <FileText className="h-3.5 w-3.5" /> Read Terms & Conditions
                </Link>
              </div>
            </div>
          </aside>

          {/* Legal Document Content */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-12 leading-relaxed text-sm text-neutral-800">
            
            {/* Section 01 */}
            <section id="collection" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">01</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Information We Collect
                </h2>
              </div>
              <p>
                When you visit <strong>AMA YAAR</strong>, we collect information about your device, your interactions with the site, and information required to process your apparel orders and account activities.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="border border-neutral-200 bg-neutral-50/70 p-4 space-y-1.5">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-black">Account & Personal Info</h3>
                  <p className="text-xs text-neutral-600 font-medium">
                    Name, email address, shipping & billing address, phone number, and account credentials.
                  </p>
                </div>
                <div className="border border-neutral-200 bg-neutral-50/70 p-4 space-y-1.5">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-black">Transaction & Device Data</h3>
                  <p className="text-xs text-neutral-600 font-medium">
                    Order items, payment confirmations, IP address, browser type, and interaction logs.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 02 */}
            <section id="usage" className="scroll-mt-28 space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">02</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  How We Use Your Data
                </h2>
              </div>
              <p>
                We use your personal data to provide our services, process payments, ship packages, communicate updates, and optimize your shopping experience on AMA YAAR.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-neutral-600 font-medium text-xs sm:text-sm">
                <li>To fulfill orders, arrange delivery, and process payment transactions.</li>
                <li>To provide customer support and respond to inquiries or returns.</li>
                <li>To screen orders for potential risk or fraud.</li>
                <li>To send relevant product drops or promotional communications (when opted in).</li>
              </ul>
            </section>

            {/* Section 03 */}
            <section id="sharing" className="scroll-mt-28 space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">03</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Data Sharing & Third Parties
                </h2>
              </div>
              <p>
                We share your personal information with trusted service providers to help us fulfill our obligations to you (such as payment gateways, logistics partners, and security monitoring providers).
              </p>
              <p className="font-semibold text-black">
                We do NOT sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </section>

            {/* Section 04 */}
            <section id="cookies" className="scroll-mt-28 space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">04</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Cookies & Tracking Tech
                </h2>
              </div>
              <p>
                We use cookies and similar tracking technologies to remember your cart items, keep you logged in securely, analyze site traffic, and understand customer preferences.
              </p>
              <p>
                You can manage cookie settings directly in your browser. Disabling cookies may affect certain functionality such as cart persistence.
              </p>
            </section>

            {/* Section 05 */}
            <section id="security" className="scroll-mt-28 space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">05</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Data Security & Storage
                </h2>
              </div>
              <p>
                We maintain appropriate administrative, technical, and physical safeguards to protect your personal information against accidental, unlawful, or unauthorized destruction, loss, or access.
              </p>
            </section>

            {/* Section 06 */}
            <section id="rights" className="scroll-mt-28 space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">06</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Your Privacy Rights
                </h2>
              </div>
              <p>
                Depending on your location, you may have the right to access, correct, or delete the personal information we hold about you. You may also request data portability or object to certain processing activities.
              </p>
            </section>

            {/* Section 07 */}
            <section id="updates" className="scroll-mt-28 space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">07</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Policy Updates & Contact
                </h2>
              </div>
              <p>
                We may update this Privacy Policy from time to time in order to reflect changes to our practices or for operational, legal, or regulatory reasons.
              </p>
              <div className="bg-black text-white p-6 mt-4">
                <h3 className="text-sm font-black uppercase tracking-wider mb-1">Privacy Desk</h3>
                <p className="text-xs text-neutral-300 font-medium">
                  For any privacy questions or requests regarding your personal data, reach out to our privacy officer at{' '}
                  <a href="mailto:privacy@amayaar.com" className="text-amber-400 font-bold underline">
                    privacy@amayaar.com
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
