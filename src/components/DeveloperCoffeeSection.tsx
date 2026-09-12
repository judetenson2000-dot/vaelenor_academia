import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Coffee,
  Heart,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldAlert,
  Zap,
  Info,
  Cloud,
} from 'lucide-react';
import { PaymentConfig } from '../types';
import { useFirebase } from '../lib/FirebaseContext';

interface DeveloperCoffeeSectionProps {
  className?: string;
  onOpenAdmin?: () => void;
  liveConfig?: PaymentConfig | null;
}

export const DeveloperCoffeeSection: React.FC<DeveloperCoffeeSectionProps> = ({
  className = '',
  onOpenAdmin,
  liveConfig,
}) => {
  const { cloudPaymentConfig } = useFirebase();
  const [config, setConfig] = useState<PaymentConfig>({
    upiId: 'judetenson2@okhdfcbank',
    payeeName: 'Vaelenor Developer',
    note: 'Voluntary Support for Vaelenor',
    fallbackUrl: 'https://buymeacoffee.com/studentdev',
  });

  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [paymentTriggered, setPaymentTriggered] = useState(false);

  // Sync with cloudPaymentConfig (Firestore) or liveConfig prop or fetch from server
  useEffect(() => {
    if (cloudPaymentConfig && cloudPaymentConfig.upiId) {
      setConfig(cloudPaymentConfig);
    } else if (liveConfig) {
      setConfig(liveConfig);
    } else {
      fetch('/api/payment-config')
        .then((res) => (res.ok ? res.json() : null))
        .then((data: PaymentConfig | null) => {
          if (data && data.upiId) {
            setConfig(data);
          }
        })
        .catch(() => {
          try {
            const saved = localStorage.getItem('vaelenor_payment_override');
            if (saved) setConfig(JSON.parse(saved));
          } catch {
            // ignore
          }
        });
    }
  }, [liveConfig, cloudPaymentConfig]);

  // Construct pure UPI URI with NO forced price amount (pay what you feel!)
  const getUpiUri = (): string => {
    const cleanId = config.upiId.trim();
    const cleanPayee = encodeURIComponent(config.payeeName.trim() || 'Vaelenor Developer');
    const cleanNote = encodeURIComponent(config.note.trim() || 'Voluntary Support for Vaelenor');
    // Notice: NO &am= parameter is added, allowing the student's UPI app to prompt for ANY voluntary amount!
    return `upi://pay?pa=${cleanId}&pn=${cleanPayee}&tn=${cleanNote}&cu=INR`;
  };

  // Generate sharp QR Code whenever config changes
  useEffect(() => {
    const upiUri = getUpiUri();
    QRCode.toDataURL(upiUri, {
      width: 340,
      margin: 1.5,
      color: {
        dark: '#0f172a', // deep slate
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR Code:', err);
      });
  }, [config]);

  // Action: Open UPI payment app on click
  const handleLaunchPayment = () => {
    const upiUri = getUpiUri();
    setPaymentTriggered(true);

    // Trigger UPI application scheme
    try {
      window.location.href = upiUri;
    } catch {
      // ignore
    }

    setTimeout(() => {
      setPaymentTriggered(false);
    }, 3500);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(config.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer
      id="developer-coffee-area"
      className={`w-full border-t border-slate-200/80 bg-gradient-to-b from-white via-amber-50/20 to-slate-100/70 py-12 px-4 sm:px-6 lg:px-8 mt-14 transition-all ${className}`}
    >
      <div className="max-w-6xl mx-auto space-y-10">

        {/* 1. REGION ABOVE STORY & MISSION: WHY VAELENOR IS BUILT DIFFERENTLY */}
        <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50/40 to-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-white font-bold text-xs shadow-xs">
                  ★
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-serif">
                  Why Vaelenor is Built Differently
                </h2>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-600 mt-1 font-sans">
                A non-commercial, student-first alternative to predatory academic formatting software.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Free Forever</span>
            </div>
          </div>

          {/* Comparison Matrix Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Commercial SaaS Platforms */}
            <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/70 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-800">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Typical Commercial Thesis Tools</span>
              </div>
              <ul className="space-y-2 text-xs text-rose-950/80 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Deadlines Traps:</strong> Locks PDF export behind $25/mo subscriptions 2 hours before university submission.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Disfiguring Watermarks:</strong> Stamps heavy commercial logos across student manuscripts unless paid.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Data Harvesting:</strong> Sells student thesis drafts and search queries to private AI training datasets.</span>
                </li>
              </ul>
            </div>

            {/* Vaelenor Ethical Protocol */}
            <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>The Vaelenor Academic Protocol</span>
              </div>
              <ul className="space-y-2 text-xs text-emerald-950/80 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Zero Paywalls:</strong> Complete IEEE A4 styling, LaTeX exporter, and calculation graphs are 100% unlocked.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Zero Commercial Marks:</strong> Clean, unadulterated academic manuscripts ready for your university committee.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Open & Private:</strong> Client-side rendering with no student telemetry tracking or advertising cookies.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Open Gratitude Policy (No Price Dictation) */}
          <div className="p-4 rounded-2xl bg-white border border-amber-200 text-xs sm:text-[13px] text-slate-700 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Voluntary Open Gratitude — No Prescribed Amount</span>
            </div>
            <p className="text-slate-600 leading-relaxed font-sans">
              We do not ask for any specific price, tier, or fixed amount. Whatever you feel in your heart
              to contribute—whether it's the spare change for a cup of tea or whatever your budget comfortably
              allows—is received with immense gratitude. Every single contribution goes directly to domain renewal,
              server uptime, and Gemini AI compute for the next student.
            </p>
          </div>
        </div>

        {/* 2. THE DEVELOPER STORY & INTERACTIVE QR CODE PRESENTATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Developer Story & Mission */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md shadow-amber-600/20">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    Buy a Coffee for the Developer
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Crafted with care by a fellow student engineer
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-[13px] text-slate-700 leading-relaxed font-sans">
                <p>
                  Hello! I built Vaelenor after watching friends and classmates scramble during their
                  final-semester capstone projects—struggling with LaTeX margins, citation formatting,
                  and extortionate paywalled tools.
                </p>
                <p>
                  Vaelenor was born out of the belief that <strong className="text-slate-900 font-semibold">essential research tools must belong to students</strong>, not corporate subscription monopolies.
                </p>
                <p className="text-slate-600">
                  If this app saved you hours of formatting, helped you pass your defense, or got your paper
                  ready for publication, buying a coffee keeps this project independent and ad-free.
                </p>
              </div>

              {/* Direct UPI details strip */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Developer UPI:
                  </span>
                  <code className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                    {config.upiId}
                  </code>
                </div>

                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span className="text-emerald-700">UPI Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy UPI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: High-Definition QR Code Card with Direct Click-to-Pay */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-200/60 flex flex-col items-center text-center space-y-4 relative overflow-hidden">
              {/* Premium top gradient accent */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700" />

              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700 font-mono">
                  Instant Voluntary Transfer
                </span>
                <h4 className="text-sm font-black text-slate-900">
                  Scan or Click to Send Support
                </h4>
              </div>

              {/* Interactive Clickable QR Code Presentation Area */}
              <div
                id="interactive-upi-qr-code"
                role="button"
                tabIndex={0}
                onClick={handleLaunchPayment}
                onKeyDown={(e) => e.key === 'Enter' && handleLaunchPayment()}
                title="Click here to open Google Pay, PhonePe, Paytm, or your UPI app directly"
                className="group relative p-4 rounded-2xl bg-slate-50 border-2 border-slate-200/90 hover:border-amber-500 transition-all cursor-pointer shadow-inner hover:scale-[1.02] active:scale-98"
              >
                {/* Camera target framing corners */}
                <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-amber-600 rounded-tl group-hover:scale-110 transition-transform" />
                <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-amber-600 rounded-tr group-hover:scale-110 transition-transform" />
                <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-amber-600 rounded-bl group-hover:scale-110 transition-transform" />
                <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-amber-600 rounded-br group-hover:scale-110 transition-transform" />

                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Clickable Developer Coffee UPI QR Code"
                    className="w-52 h-52 object-contain rounded-xl bg-white p-2"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400 font-mono">
                    Generating QR Code...
                  </div>
                )}

                {/* Subtle Click Hint Overlay on Hover */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 backdrop-blur-[1.5px] rounded-2xl flex flex-col items-center justify-center text-white transition-opacity p-3">
                  <Smartphone className="w-7 h-7 mb-1.5 text-amber-300 animate-pulse" />
                  <span className="text-xs font-extrabold tracking-wide">
                    Click to Open UPI App
                  </span>
                  <span className="text-[10px] text-amber-200 mt-0.5">
                    (GPay / PhonePe / Paytm)
                  </span>
                </div>
              </div>

              {/* Status Toast when clicked */}
              {paymentTriggered && (
                <div className="w-full py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Opening your UPI Payment Application...</span>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800">
                  Scan with any Banking / UPI App, or <strong className="text-amber-700 underline cursor-pointer" onClick={handleLaunchPayment}>click QR above</strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  Compatible with Google Pay, PhonePe, Paytm, BHIM & Camera
                </p>
              </div>

              {/* Direct Action Buttons */}
              <div className="w-full pt-1 space-y-2">
                <button
                  type="button"
                  onClick={handleLaunchPayment}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Open in UPI Payment App</span>
                </button>

                {config.fallbackUrl && (
                  <a
                    href={config.fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>International Card / PayPal Link</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Credits & Secret Admin Access Link */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-slate-700">VAELENOR</span>
            <span>•</span>
            <span>Unbound Academic Protocol</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Discreet Secret Admin Console Trigger */}
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-slate-400 hover:text-slate-600 p-1 rounded transition opacity-50 hover:opacity-100"
              title="Restricted Administrative Console (Shortcut: Ctrl+Shift+A)"
              aria-label="Secret Admin Access"
            >
              <Lock className="w-3 h-3" />
            </button>

            <span>•</span>

            <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              <span>Open Source for Students</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
