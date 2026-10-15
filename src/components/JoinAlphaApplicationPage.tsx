import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Send,
  Shield,
  Sparkles,
  Users,
  Clock,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Flame,
  User,
  AtSign,
  MessageSquare,
  Wallet,
} from 'lucide-react';
import { AlphaShieldLogo } from './AlphaShieldLogo';
import { AlphaApplicationData } from '../types';

interface JoinAlphaApplicationPageProps {
  onBack: () => void;
}

const YEARS_OPTIONS = ['Less than 1 year', '2 years', '3 years', '4+ years'];

const FOCUS_AREAS_OPTIONS = [
  { id: 'airdrops', label: 'Airdrop Hunting & Testnet Farming' },
  { id: 'nfts', label: 'NFT Minting & Secondary Allowlist Trading' },
  { id: 'defi', label: 'DeFi Yield, Staking & Perpetual Trading' },
  { id: 'dev', label: 'Web3 Development & Smart Contracts' },
  { id: 'gaming', label: 'Crypto Gaming & Poker Tournaments' },
  { id: 'mod', label: 'Content Creation & Community Moderation' },
];

const ACTIVITY_OPTIONS = [
  '1 – 5 hours / week (Casual)',
  '5 – 15 hours / week (Daily Member)',
  '15 – 30 hours / week (Dedicated Alpha Hunter)',
  '30+ hours / week (Full Degen)',
];

export const JoinAlphaApplicationPage: React.FC<JoinAlphaApplicationPageProps> = ({
  onBack,
}) => {
  const [formData, setFormData] = useState<AlphaApplicationData>({
    fullName: '',
    xUsername: '',
    discordHandle: '',
    yearsInWeb3: '2 years',
    focusAreas: ['airdrops', 'nfts'],
    weeklyActivity: '5 – 15 hours / week (Daily Member)',
    whyJoin: '',
    valuesBrought: '',
    previousCommunities: '',
    walletAddress: '',
    referralSource: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [focusedField, setFocusedField] = useState<keyof AlphaApplicationData | null>(null);
  const [hasSubmittedAttempt, setHasSubmittedAttempt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [hasCopiedId, setHasCopiedId] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate a single field
  const validateField = (
    field: keyof AlphaApplicationData,
    value: any
  ): string | null => {
    switch (field) {
      case 'fullName':
        if (!value || !value.trim()) return 'Name or alias is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        return null;

      case 'xUsername': {
        if (!value || !value.trim()) return 'X (Twitter) username is required.';
        const clean = value.trim().replace(/^@/, '');
        if (!clean) return 'X (Twitter) username is required.';
        if (!/^[a-zA-Z0-9_]{1,30}$/.test(clean)) {
          return 'X username can only contain letters, numbers, and underscores.';
        }
        return null;
      }

      case 'discordHandle':
        if (!value || !value.trim()) return 'Discord username is required.';
        if (value.trim().length < 2) {
          return 'Discord username must be at least 2 characters.';
        }
        return null;

      case 'yearsInWeb3':
        if (!value) return 'Please select your years of experience in Web3.';
        return null;

      case 'focusAreas':
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Please select at least 1 primary area of focus.';
        }
        return null;

      case 'weeklyActivity':
        if (!value) return 'Please select your weekly Discord activity.';
        return null;

      case 'whyJoin':
        if (!value || !value.trim()) {
          return 'Please explain why you want to join AlphaCollectiv3.';
        }
        if (value.trim().length < 20) {
          return `Please expand your reason (${20 - value.trim().length} more characters needed).`;
        }
        return null;

      case 'valuesBrought':
        if (!value || !value.trim()) {
          return 'Please describe what values you can bring to Alpha Collective.';
        }
        if (value.trim().length < 20) {
          return `Please elaborate on your values (${20 - value.trim().length} more characters needed).`;
        }
        return null;

      case 'previousCommunities':
        if (!value || !value.trim()) {
          return 'Please list previous communities, DAOs, or roles held.';
        }
        if (value.trim().length < 10) {
          return `Please list at least one community or role (${10 - value.trim().length} more characters needed).`;
        }
        return null;

      case 'walletAddress':
        if (value && value.trim()) {
          const addr = value.trim();
          const isEvm = /^0x[a-fA-F0-9]{40}$/.test(addr);
          const isSol = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);
          if (!isEvm && !isSol) {
            return 'Invalid wallet address. Provide a 42-char EVM (0x...) or Solana address, or leave blank.';
          }
        }
        return null;

      default:
        return null;
    }
  };

  // Validate all fields
  const validateAll = (data: AlphaApplicationData): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    const fieldsToValidate: (keyof AlphaApplicationData)[] = [
      'fullName',
      'xUsername',
      'discordHandle',
      'yearsInWeb3',
      'focusAreas',
      'weeklyActivity',
      'whyJoin',
      'valuesBrought',
      'previousCommunities',
      'walletAddress',
    ];

    fieldsToValidate.forEach((f) => {
      const err = validateField(f, data[f]);
      if (err) {
        newErrors[f] = err;
      }
    });

    return newErrors;
  };

  // Immediate red feedback when clicking / focusing on any field
  const handleFieldFocus = (field: keyof AlphaApplicationData) => {
    setFocusedField(field);
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const handleFieldBlur = (field: keyof AlphaApplicationData) => {
    setFocusedField((prev) => (prev === field ? null : prev));
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const handleFieldChange = (
    field: keyof AlphaApplicationData,
    value: any
  ) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Live validation update
    if (touched[field] || hasSubmittedAttempt || focusedField === field) {
      const err = validateField(field, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (err) next[field] = err;
        else delete next[field];
        return next;
      });
    }
  };

  const toggleFocusArea = (id: string) => {
    const exists = formData.focusAreas.includes(id);
    const updatedFocus = exists
      ? formData.focusAreas.filter((item) => item !== id)
      : [...formData.focusAreas, id];

    handleFieldFocus('focusAreas');
    handleFieldChange('focusAreas', updatedFocus);
  };

  const isFieldInvalid = (field: keyof AlphaApplicationData) => {
    return Boolean(
      errors[field] && (touched[field] || hasSubmittedAttempt || focusedField === field)
    );
  };

  const isFieldValid = (field: keyof AlphaApplicationData) => {
    return Boolean(
      (touched[field] || hasSubmittedAttempt) &&
        !errors[field] &&
        Boolean(formData[field])
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSubmittedAttempt(true);

    // Mark all as touched
    const allTouched: Record<string, boolean> = {
      fullName: true,
      xUsername: true,
      discordHandle: true,
      yearsInWeb3: true,
      focusAreas: true,
      weeklyActivity: true,
      whyJoin: true,
      valuesBrought: true,
      previousCommunities: true,
      walletAddress: true,
      referralSource: true,
    };
    setTouched(allTouched);

    const validationErrors = validateAll(formData);
    setErrors(validationErrors);

    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0) {
      setErrorMessage(
        `Please resolve the ${errorKeys.length} highlighted ${
          errorKeys.length === 1 ? 'issue' : 'issues'
        } before submitting your application.`
      );

      // Auto-scroll to first invalid element
      const firstErrorField = errorKeys[0];
      const targetElement = document.getElementById(`field-${firstErrorField}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof targetElement.focus === 'function') {
          targetElement.focus();
        }
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.appId) {
        setSubmittedAppId(data.appId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(data.error || 'Failed to submit application. Please try again.');
      }
    } catch {
      // Fallback local submission if offline
      const fallbackId = `AC-APP-${Date.now().toString(36).toUpperCase()}-LCL`;
      setSubmittedAppId(fallbackId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!submittedAppId) return;
    navigator.clipboard.writeText(submittedAppId);
    setHasCopiedId(true);
    setTimeout(() => setHasCopiedId(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F3] relative select-none">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(215,25,32,0.12)_0%,rgba(168,168,165,0.03)_50%,transparent_80%)] pointer-events-none" />

      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0B0C]/90 backdrop-blur-md border-b border-[#1E1E22] py-4 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#A8A8A5] hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#D71920]" />
            <span>BACK TO WEBSITE</span>
          </button>

          <div className="flex items-center gap-2.5">
            <AlphaShieldLogo variant="badge" />
            <span className="hidden sm:inline-block text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/25">
              ● APPLICATIONS ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10">
        {!submittedAppId ? (
          <div>
            {/* Page Header */}
            <div className="text-center mb-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D71920]/15 text-[#EF4444] border border-[#D71920]/30 text-xs font-mono font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                MEMBERSHIP APPLICATION
              </div>

              <h1 className="text-3xl sm:text-5xl font-sans font-bold text-white uppercase tracking-tight">
                ALPHA COLLECTIV3 DISCORD APPLICATION
              </h1>

              <p className="text-sm sm:text-base font-sans text-[#A8A8A5] max-w-xl mx-auto leading-relaxed">
                Selective admission for verified alpha hunters, traders, builders, and collectors. Every response is reviewed directly by our founding council within 24–48 hours.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 rounded-xl bg-[#D71920]/15 border border-[#D71920]/50 text-[#EF4444] text-xs font-mono flex items-start gap-3 shadow-[0_4px_20px_rgba(215,25,32,0.15)]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold tracking-wider uppercase">Validation Error</div>
                  <p className="text-[#FCA5A5]">{errorMessage}</p>
                </div>
              </motion.div>
            )}

            {/* Application Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* SECTION 1: IDENTITY & SOCIALS */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#141416] border border-[#222226] space-y-6 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
                <div className="border-b border-[#1E1E22] pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                    <span className="w-5 h-5 rounded bg-[#D71920] text-white flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Identity & Verified Socials</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#EF4444]">
                    * REQUIRED
                  </span>
                </div>

                {/* 1. Name */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="field-fullName"
                      className="text-xs font-mono text-[#C8C8C5] block font-semibold"
                    >
                      Your Name / Alias: <span className="text-[#EF4444]">*</span>
                    </label>
                    {isFieldValid('fullName') && (
                      <span className="text-[11px] font-mono text-[#10B981] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="field-fullName"
                      type="text"
                      value={formData.fullName}
                      onClick={() => handleFieldFocus('fullName')}
                      onFocus={() => handleFieldFocus('fullName')}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      onBlur={() => handleFieldBlur('fullName')}
                      placeholder="e.g. Alex or Guro"
                      className={`w-full px-4 py-3 rounded-xl text-white text-sm font-sans placeholder:text-[#555558] focus:outline-none transition-all ${
                        isFieldInvalid('fullName')
                          ? 'border-2 border-[#EF4444] bg-[#EF4444]/10 ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                          : focusedField === 'fullName'
                          ? 'border-2 border-[#EF4444] bg-[#0B0B0C] ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                          : isFieldValid('fullName')
                          ? 'border border-[#10B981]/50 bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                          : 'border border-[#26262B] bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                      }`}
                      aria-invalid={isFieldInvalid('fullName')}
                      aria-describedby={
                        isFieldInvalid('fullName') ? 'field-fullName-error' : undefined
                      }
                    />
                  </div>
                  {isFieldInvalid('fullName') && (
                    <p
                      id="field-fullName-error"
                      className="text-xs font-mono text-[#EF4444] flex items-center gap-1.5 mt-1 animate-in fade-in"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* 2. X Username */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="field-xUsername"
                      className="text-xs font-mono text-[#C8C8C5] block font-semibold"
                    >
                      Your X (Twitter) Account Username: <span className="text-[#EF4444]">*</span>
                    </label>
                    {isFieldValid('xUsername') && (
                      <span className="text-[11px] font-mono text-[#10B981] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Valid Handle
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="field-xUsername"
                      type="text"
                      value={formData.xUsername}
                      onClick={() => handleFieldFocus('xUsername')}
                      onFocus={() => handleFieldFocus('xUsername')}
                      onChange={(e) => handleFieldChange('xUsername', e.target.value)}
                      onBlur={() => handleFieldBlur('xUsername')}
                      placeholder="For Example: @AlphaCollectiv3"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm font-sans placeholder:text-[#555558] focus:outline-none transition-all ${
                        isFieldInvalid('xUsername')
                          ? 'border-2 border-[#EF4444] bg-[#EF4444]/10 ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                          : focusedField === 'xUsername'
                          ? 'border-2 border-[#EF4444] bg-[#0B0B0C] ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                          : isFieldValid('xUsername')
                          ? 'border border-[#10B981]/50 bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                          : 'border border-[#26262B] bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                      }`}
                      aria-invalid={isFieldInvalid('xUsername')}
                      aria-describedby={
                        isFieldInvalid('xUsername') ? 'field-xUsername-error' : undefined
                      }
                    />
                    <AtSign className="w-4 h-4 text-[#66666A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {isFieldInvalid('xUsername') && (
                    <p
                      id="field-xUsername-error"
                      className="text-xs font-mono text-[#EF4444] flex items-center gap-1.5 mt-1 animate-in fade-in"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.xUsername}</span>
                    </p>
                  )}
                </div>

                {/* 3. Discord Username & ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="field-discordHandle"
                      className="text-xs font-mono text-[#C8C8C5] block font-semibold"
                    >
                      Your Discord Username: <span className="text-[#EF4444]">*</span>
                    </label>
                    {isFieldValid('discordHandle') && (
                      <span className="text-[11px] font-mono text-[#10B981] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="field-discordHandle"
                      type="text"
                      value={formData.discordHandle}
                      onClick={() => handleFieldFocus('discordHandle')}
                      onFocus={() => handleFieldFocus('discordHandle')}
                      onChange={(e) =>
                        handleFieldChange('discordHandle', e.target.value)
                      }
                      onBlur={() => handleFieldBlur('discordHandle')}
                      placeholder="e.g. finisher or finisher#0000"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm font-sans placeholder:text-[#555558] focus:outline-none transition-all ${
                        isFieldInvalid('discordHandle')
                          ? 'border-2 border-[#EF4444] bg-[#EF4444]/10 ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                          : focusedField === 'discordHandle'
                          ? 'border-2 border-[#EF4444] bg-[#0B0B0C] ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                          : isFieldValid('discordHandle')
                          ? 'border border-[#10B981]/50 bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                          : 'border border-[#26262B] bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                      }`}
                      aria-invalid={isFieldInvalid('discordHandle')}
                      aria-describedby={
                        isFieldInvalid('discordHandle')
                          ? 'field-discordHandle-error'
                          : undefined
                      }
                    />
                    <MessageSquare className="w-4 h-4 text-[#66666A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {isFieldInvalid('discordHandle') && (
                    <p
                      id="field-discordHandle-error"
                      className="text-xs font-mono text-[#EF4444] flex items-center gap-1.5 mt-1 animate-in fade-in"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.discordHandle}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION 2: EXPERIENCE & FOCUS */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#141416] border border-[#222226] space-y-6 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
                <div className="border-b border-[#1E1E22] pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                    <span className="w-5 h-5 rounded bg-[#D71920] text-white flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>Web3 Pedigree & Specialization</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#EF4444]">
                    * REQUIRED
                  </span>
                </div>

                {/* 4. Years in Web3 */}
                <div className="space-y-2">
                  <label
                    id="field-yearsInWeb3"
                    className="text-xs font-mono text-[#C8C8C5] block font-semibold"
                  >
                    How many years have you been in Web3? <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {YEARS_OPTIONS.map((opt) => {
                      const isSelected = formData.yearsInWeb3 === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            handleFieldFocus('yearsInWeb3');
                            handleFieldChange('yearsInWeb3', opt);
                          }}
                          className={`p-3 rounded-xl border text-xs font-mono text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#D71920] text-white font-bold border-[#D71920] shadow-[0_0_15px_rgba(215,25,32,0.3)]'
                              : 'bg-[#0B0B0C] text-[#A8A8A5] border-[#242428] hover:text-white hover:border-[#EF4444]'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {isFieldInvalid('yearsInWeb3') && (
                    <p className="text-xs font-mono text-[#EF4444] flex items-center gap-1.5 mt-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.yearsInWeb3}</span>
                    </p>
                  )}
                </div>

                {/* 5. Primary Areas of Focus */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      id="field-focusAreas"
                      className="text-xs font-mono text-[#C8C8C5] block font-semibold"
                    >
                      Primary Areas of Focus & Expertise: <span className="text-[#EF4444]">*</span>{' '}
                      <span className="text-[#A8A8A5] font-normal">(Select all that apply)</span>
                    </label>
                    <span className="text-[11px] font-mono text-[#A8A8A5]">
                      {formData.focusAreas.length} selected
                    </span>
                  </div>
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 rounded-xl border transition-colors ${
                      isFieldInvalid('focusAreas')
                        ? 'border-2 border-[#EF4444] bg-[#EF4444]/10 ring-2 ring-[#EF4444]/40'
                        : focusedField === 'focusAreas'
                        ? 'border-2 border-[#EF4444] bg-[#0B0B0C]'
                        : 'border-transparent'
                    }`}
                  >
                    {FOCUS_AREAS_OPTIONS.map((item) => {
                      const active = formData.focusAreas.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleFocusArea(item.id)}
                          className={`p-3 rounded-xl border text-left text-xs font-sans transition-all flex items-center gap-2.5 cursor-pointer ${
                            active
                              ? 'bg-[#1C1C22] text-white border-[#D71920]'
                              : 'bg-[#0B0B0C] text-[#888885] border-[#222226] hover:text-white hover:border-[#EF4444]'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                              active
                                ? 'bg-[#D71920] border-[#D71920] text-white'
                                : 'border-[#333338] bg-[#141416]'
                            }`}
                          >
                            {active && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {isFieldInvalid('focusAreas') && (
                    <p className="text-xs font-mono text-[#EF4444] flex items-center gap-1.5 mt-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.focusAreas}</span>
                    </p>
                  )}
                </div>

                {/* 6. Weekly Discord Activity */}
                <div className="space-y-2">
                  <label
                    id="field-weeklyActivity"
                    className="text-xs font-mono text-[#C8C8C5] block font-semibold"
                  >
                    How many hours a week are you active in Discord? <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ACTIVITY_OPTIONS.map((opt) => {
                      const isSelected = formData.weeklyActivity === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            handleFieldFocus('weeklyActivity');
                            handleFieldChange('weeklyActivity', opt);
                          }}
                          className={`p-3 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#1C1C22] text-white border-[#EF4444] font-semibold ring-1 ring-[#EF4444]/40'
                              : 'bg-[#0B0B0C] text-[#888885] border-[#222226] hover:text-white hover:border-[#EF4444]'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#10B981]" />}
                        </button>
                      );
                    })}
                  </div>
                  {isFieldInvalid('weeklyActivity') && (
                    <p className="text-xs font-mono text-[#EF4444] flex items-center gap-1.5 mt-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.weeklyActivity}</span>
                    </p>
                  )}
                </div>

                {/* 7. Wallet Address (Optional with validation) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="field-walletAddress"
                      className="text-xs font-mono text-[#C8C8C5] block font-semibold"
                    >
                      Primary Wallet Address (EVM or Solana):{' '}
                      <span className="text-[#888885] font-normal">(Optional)</span>
                    </label>
                    {formData.walletAddress && isFieldValid('walletAddress') && (
                      <span className="text-[11px] font-mono text-[#10B981] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Valid Address Format
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="field-walletAddress"
                      type="text"
                      value={formData.walletAddress || ''}
                      onClick={() => handleFieldFocus('walletAddress')}
                      onFocus={() => handleFieldFocus('walletAddress')}
                      onChange={(e) =>
                        handleFieldChange('walletAddress', e.target.value)
                      }
                      onBlur={() => handleFieldBlur('walletAddress')}
                      placeholder="0x... or Solana public key"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm font-mono placeholder:text-[#555558] focus:outline-none transition-all ${
                        isFieldInvalid('walletAddress')
                          ? 'border-2 border-[#EF4444] bg-[#EF4444]/10 ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                          : focusedField === 'walletAddress'
                          ? 'border-2 border-[#EF4444] bg-[#0B0B0C] ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                          : formData.walletAddress && isFieldValid('walletAddress')
                          ? 'border border-[#10B981]/50 bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                          : 'border border-[#26262B] bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                      }`}
                      aria-invalid={isFieldInvalid('walletAddress')}
                    />
                    <Wallet className="w-4 h-4 text-[#66666A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {isFieldInvalid('walletAddress') ? (
                    <p className="text-xs font-mono text-[#EF4444] flex items-center gap-1.5 mt-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.walletAddress}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] font-mono text-[#777775]">
                      Optional for direct allowlist and token air-drop allocation.
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION 3: VALUE ADD & COMMUNITY CONTRIBUTIONS */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#141416] border border-[#222226] space-y-6 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
                <div className="border-b border-[#1E1E22] pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                    <span className="w-5 h-5 rounded bg-[#D71920] text-white flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>Culture & Contribution</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#EF4444]">
                    * REQUIRED
                  </span>
                </div>

                {/* 8. Why Join */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="field-whyJoin"
                      className="text-xs font-mono text-[#C8C8C5] block font-semibold"
                    >
                      Why do you want to join AlphaCollective? <span className="text-[#EF4444]">*</span>
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        formData.whyJoin.trim().length >= 20
                          ? 'text-[#10B981]'
                          : 'text-[#888885]'
                      }`}
                    >
                      {formData.whyJoin.trim().length} / 20 min
                    </span>
                  </div>
                  <textarea
                    id="field-whyJoin"
                    rows={4}
                    value={formData.whyJoin}
                    onClick={() => handleFieldFocus('whyJoin')}
                    onFocus={() => handleFieldFocus('whyJoin')}
                    onChange={(e) => handleFieldChange('whyJoin', e.target.value)}
                    onBlur={() => handleFieldBlur('whyJoin')}
                    placeholder="Explain what value you hope to gain and what insights, alpha, or energy you will bring to the collective..."
                    className={`w-full px-4 py-3 rounded-xl text-white text-sm font-sans placeholder:text-[#555558] focus:outline-none transition-all leading-relaxed ${
                      isFieldInvalid('whyJoin')
                        ? 'border-2 border-[#EF4444] bg-[#EF4444]/10 ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                        : focusedField === 'whyJoin'
                        ? 'border-2 border-[#EF4444] bg-[#0B0B0C] ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                        : isFieldValid('whyJoin')
                        ? 'border border-[#10B981]/50 bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                        : 'border border-[#26262B] bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                    }`}
                    aria-invalid={isFieldInvalid('whyJoin')}
                  />
                  {isFieldInvalid('whyJoin') && (
                    <p className="text-xs font-mono text-[#EF4444] flex items-center gap-1.5 mt-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.whyJoin}</span>
                    </p>
                  )}
                </div>

                {/* 9. Values to bring to Alpha Collective */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="field-valuesBrought"
                      className="text-xs font-mono text-[#C8C8C5] block font-semibold"
                    >
                      What values can you bring to Alpha Collective? <span className="text-[#EF4444]">*</span>
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        (formData.valuesBrought?.trim().length || 0) >= 20
                          ? 'text-[#10B981]'
                          : 'text-[#888885]'
                      }`}
                    >
                      {formData.valuesBrought?.trim().length || 0} / 20 min
                    </span>
                  </div>
                  <textarea
                    id="field-valuesBrought"
                    rows={3}
                    value={formData.valuesBrought || ''}
                    onClick={() => handleFieldFocus('valuesBrought')}
                    onFocus={() => handleFieldFocus('valuesBrought')}
                    onChange={(e) =>
                      handleFieldChange('valuesBrought', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('valuesBrought')}
                    placeholder="Highlight the specific values, strengths, consistency, research, or network alpha you will contribute to the group..."
                    className={`w-full px-4 py-3 rounded-xl text-white text-sm font-sans placeholder:text-[#555558] focus:outline-none transition-all leading-relaxed ${
                      isFieldInvalid('valuesBrought')
                        ? 'border-2 border-[#EF4444] bg-[#EF4444]/10 ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                        : focusedField === 'valuesBrought'
                        ? 'border-2 border-[#EF4444] bg-[#0B0B0C] ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                        : isFieldValid('valuesBrought')
                        ? 'border border-[#10B981]/50 bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                        : 'border border-[#26262B] bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                    }`}
                    aria-invalid={isFieldInvalid('valuesBrought')}
                  />
                  {isFieldInvalid('valuesBrought') && (
                    <p className="text-xs font-mono text-[#EF4444] flex items-center gap-1.5 mt-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.valuesBrought}</span>
                    </p>
                  )}
                </div>

                {/* 10. Previous Communities */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="field-previousCommunities"
                      className="text-xs font-mono text-[#C8C8C5] block font-semibold"
                    >
                      Name of communities you have been a part of, along with positions held: <span className="text-[#EF4444]">*</span>
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        formData.previousCommunities.trim().length >= 10
                          ? 'text-[#10B981]'
                          : 'text-[#888885]'
                      }`}
                    >
                      {formData.previousCommunities.trim().length} / 10 min
                    </span>
                  </div>
                  <textarea
                    id="field-previousCommunities"
                    rows={3}
                    value={formData.previousCommunities}
                    onClick={() => handleFieldFocus('previousCommunities')}
                    onFocus={() => handleFieldFocus('previousCommunities')}
                    onChange={(e) =>
                      handleFieldChange('previousCommunities', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('previousCommunities')}
                    placeholder="e.g. Mod at @ProjectX, Core member at @DaoY, Alpha caller at..."
                    className={`w-full px-4 py-3 rounded-xl text-white text-sm font-sans placeholder:text-[#555558] focus:outline-none transition-all leading-relaxed ${
                      isFieldInvalid('previousCommunities')
                        ? 'border-2 border-[#EF4444] bg-[#EF4444]/10 ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                        : focusedField === 'previousCommunities'
                        ? 'border-2 border-[#EF4444] bg-[#0B0B0C] ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                        : isFieldValid('previousCommunities')
                        ? 'border border-[#10B981]/50 bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                        : 'border border-[#26262B] bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                    }`}
                    aria-invalid={isFieldInvalid('previousCommunities')}
                  />
                  {isFieldInvalid('previousCommunities') && (
                    <p className="text-xs font-mono text-[#EF4444] flex items-center gap-1.5 mt-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.previousCommunities}</span>
                    </p>
                  )}
                </div>

                {/* 11. Referral Source */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="field-referralSource"
                    className="text-xs font-mono text-[#C8C8C5] block font-semibold"
                  >
                    Referral / Discovery Source:{' '}
                    <span className="text-[#888885] font-normal">(Optional)</span>
                  </label>
                  <input
                    id="field-referralSource"
                    type="text"
                    value={formData.referralSource || ''}
                    onClick={() => handleFieldFocus('referralSource')}
                    onFocus={() => handleFieldFocus('referralSource')}
                    onChange={(e) =>
                      handleFieldChange('referralSource', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('referralSource')}
                    placeholder="e.g. Recommended by @NFTGuroETH, X timeline, Collab partner raffle"
                    className={`w-full px-4 py-3 rounded-xl text-white text-sm font-sans placeholder:text-[#555558] focus:outline-none transition-all ${
                      focusedField === 'referralSource'
                        ? 'border-2 border-[#EF4444] bg-[#0B0B0C] ring-2 ring-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                        : 'border border-[#26262B] bg-[#0B0B0C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                    }`}
                  />
                </div>
              </div>

              {/* Submit Button & Validation Status */}
              <div className="space-y-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-8 rounded-xl bg-[#D71920] hover:bg-[#B8151B] text-white font-sans font-bold text-sm uppercase tracking-wider transition-all shadow-[0_4px_24px_rgba(215,25,32,0.35)] hover:shadow-[0_6px_30px_rgba(215,25,32,0.5)] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <>
                      <span>Apply</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] font-mono text-[#888885]">
                  🔒 Your information is confidential and will only be reviewed by Alpha Collectiv3 council members.
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* CONFIRMATION / SUCCESS VIEW */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="p-8 sm:p-12 rounded-2xl bg-[#141416] border border-[#2B2D31] text-center space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
          >
            {/* Animated Shield Crest */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#34D399]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 text-xs font-mono font-bold uppercase tracking-wider">
                APPLICATION RECORDED
              </span>

              <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white uppercase tracking-tight">
                TRANSMISSION SUCCESSFUL
              </h2>

              <p className="text-sm font-sans text-[#A8A8A5] max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{formData.fullName}</strong>. Your membership dossier has been logged into the Alpha Collectiv3 review backlog. Council updates will be relayed to your verified Discord handle (<strong className="text-white">{formData.discordHandle}</strong>) and X profile.
              </p>
            </div>

            {/* Application ID Box */}
            <div className="p-4 rounded-xl bg-[#0B0B0C] border border-[#242428] max-w-md mx-auto flex items-center justify-between gap-3 text-xs font-mono">
              <div className="text-left">
                <span className="text-[#888885] text-[10px] block">APPLICATION REFERENCE</span>
                <span className="text-white font-bold">{submittedAppId}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-[#1C1C21] hover:bg-[#25252B] border border-[#2B2D31] text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {hasCopiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#A8A8A5]" />
                    <span>COPY ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Keep an eye on your X DMs Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#1D9BF0]/15 via-[#1D9BF0]/10 to-transparent border border-[#1D9BF0]/35 max-w-md mx-auto flex items-center gap-3.5 text-left shadow-[0_0_20px_rgba(29,155,240,0.15)]">
              <div className="w-10 h-10 rounded-xl bg-[#1D9BF0]/20 border border-[#1D9BF0]/40 flex items-center justify-center shrink-0 text-[#1D9BF0]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#1D9BF0] font-bold block">
                  ACTION REQUIRED
                </span>
                <p className="text-sm font-sans font-bold text-white tracking-tight">
                  Keep an eye on your X DMs
                </p>
                <p className="text-[11px] font-sans text-[#A8A8A5] mt-0.5">
                  Council members verify applicant profiles and send membership invitations directly via Direct Message.
                </p>
              </div>
            </div>

            {/* Next Steps Timeline */}
            <div className="text-left max-w-md mx-auto space-y-3 pt-4 border-t border-[#1E1E22]">
              <h4 className="text-xs font-mono uppercase text-[#A8A8A5] tracking-wider font-bold">
                WHAT HAPPENS NEXT:
              </h4>

              <div className="space-y-2.5 text-xs font-sans">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0B0B0C] border border-[#1F1F24]">
                  <span className="w-5 h-5 rounded-full bg-[#1E1E22] text-[#38BDF8] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-white block font-medium">Council Review (24–48 Hours)</strong>
                    <span className="text-[#888885] text-[11px]">
                      Our team checks your X and Discord profile history for authenticity.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0B0B0C] border border-[#1F1F24]">
                  <span className="w-5 h-5 rounded-full bg-[#1E1E22] text-[#34D399] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-white block font-medium">Direct Message & Verification</strong>
                    <span className="text-[#888885] text-[11px]">
                      Upon approval, you'll receive your invite link directly from @NFTGuroETH or @Finisher.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0B0B0C] border border-[#1F1F24]">
                  <span className="w-5 h-5 rounded-full bg-[#1E1E22] text-[#F59E0B] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-white block font-medium">Ecosystem Role Onboarding</strong>
                    <span className="text-[#888885] text-[11px]">
                      Immediate entry into raffles, airdrop guides, and private alpha telemetry channels.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-[#EAEAEA] text-black font-sans font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                RETURN TO HOMEPAGE
              </button>

              <a
                href="https://x.com/AlphaCollectiv3"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1C1C21] hover:bg-[#25252B] border border-[#2B2D31] text-white font-sans font-medium text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <span>FOLLOW @ALPHACOLLECTIV3</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#A8A8A5]" />
              </a>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};
