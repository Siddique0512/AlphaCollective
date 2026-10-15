import React, { useState } from 'react';
import { CollabProposalData } from '../types';
import { X, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface CollabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CollabProposalData) => void;
}

export const CollabModal: React.FC<CollabModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CollabProposalData>({
    projectName: '',
    projectLink: '',
    contactDiscordOrX: '',
    summary: '',
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.contactDiscordOrX) return;
    onSubmit(formData);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="bg-[#111114] border border-white/[0.1] w-full max-w-lg rounded-2xl p-7 sm:p-9 relative text-[#F4F3EF] shadow-[0_25px_70px_rgba(0,0,0,0.9)]">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#9A9891] hover:text-white rounded-lg bg-white/[0.04] border border-white/[0.08] cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-10 h-10 text-[#F4F3EF] mx-auto" />
            <h3 className="font-sans font-semibold text-2xl">
              Proposal Received
            </h3>
            <p className="text-sm font-sans text-[#9A9891] leading-relaxed">
              Our partnerships team will review {formData.projectName} and reach out via {formData.contactDiscordOrX}.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-4 px-6 py-2.5 bg-[#F4F3EF] text-[#09090B] text-xs font-sans font-semibold rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="text-xs font-sans text-[#9A9891] mb-1.5">
                Partnership Inquiry
              </div>
              <h3 className="font-sans font-semibold text-2xl sm:text-3xl tracking-tight text-[#F4F3EF]">
                Partner With <span className="font-serif-editorial italic font-normal text-[#D4CFC7]">Alpha</span>
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-medium text-[#D4CFC7] mb-1.5">
                  Project or Studio Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aetherium Studio"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#09090B] border border-white/[0.1] focus:border-white/[0.3] rounded-lg text-xs font-sans text-[#F4F3EF] placeholder:text-[#6E6D68] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-[#D4CFC7] mb-1.5">
                  Official Link (X or Website)
                </label>
                <input
                  type="text"
                  placeholder="https://x.com/project"
                  value={formData.projectLink}
                  onChange={(e) => setFormData({ ...formData, projectLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#09090B] border border-white/[0.1] focus:border-white/[0.3] rounded-lg text-xs font-sans text-[#F4F3EF] placeholder:text-[#6E6D68] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-[#D4CFC7] mb-1.5">
                  Primary Contact (Discord or X) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="@handle or discord_username"
                  value={formData.contactDiscordOrX}
                  onChange={(e) => setFormData({ ...formData, contactDiscordOrX: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#09090B] border border-white/[0.1] focus:border-white/[0.3] rounded-lg text-xs font-sans text-[#F4F3EF] placeholder:text-[#6E6D68] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-[#D4CFC7] mb-1.5">
                  Collaboration Scope & Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Allowlist allocation, community playtest, or AMA details..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#09090B] border border-white/[0.1] focus:border-white/[0.3] rounded-lg text-xs font-sans text-[#F4F3EF] placeholder:text-[#6E6D68] focus:outline-none resize-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#F4F3EF] hover:bg-white text-[#09090B] text-xs font-sans font-semibold tracking-wide transition-colors rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Submit Proposal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
