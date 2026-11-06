import React from 'react';
import { AlphaShieldLogo } from './AlphaShieldLogo';
import { NavigationTab } from '../types';
import { OFFICIAL_LINKS } from '../content/ecosystem';

interface FooterProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenJoinModal?: () => void;
  onOpenCollabModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
}) => {
  return (
    <footer className="bg-[#09090B] text-[#F4F3EF] pt-20 pb-12 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-white/[0.07]">
          
          {/* Col 1: Brand (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <AlphaShieldLogo variant="badge" />
            <p className="text-xs sm:text-sm font-sans text-[#8E8D87] max-w-sm leading-relaxed mt-3">
              A curated Web3 collective built on genuine relationships, thoughtful market research, and verifiable partner collaborations.
            </p>
          </div>

          {/* Col 2: Navigation (3 cols) */}
          <div className="md:col-span-3">
            <h4 className="font-sans font-medium text-xs text-[#D4CFC7] mb-4">
              Directory
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-[#8E8D87]">
              {([
                ['home', 'Home'],
                ['community', 'Community Pillars'],
                ['collabs', 'Collaborations'],
                ['team', 'Leadership'],
                ['faq', 'FAQ'],
              ] as [NavigationTab, string][]).map(([tab, label]) => (
                <li key={tab}>
                  <button
                    onClick={() => onNavigate(tab)}
                    className="hover:text-[#F4F3EF] transition-colors cursor-pointer"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Direct Actions & Socials (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-sans font-medium text-xs text-[#D4CFC7] mb-4">
              Connect
            </h4>
            
            <div className="flex items-center gap-3">
              <a
                href={OFFICIAL_LINKS.xTwitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Alpha Collective on X"
                className="group inline-flex items-center justify-center w-8 h-8 rounded-lg bg-black hover:bg-[#151518] border border-white/10 hover:border-white/30 transition-all p-1.5 cursor-pointer shadow-sm"
              >
                <img
                  src="/assets/aistudio/image_716e51fe.png"
                  alt="X (formerly Twitter)"
                  className="w-full h-full object-contain transition-transform group-hover:scale-110"
                />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-[#6E6D68]">
          <div>
            © {new Date().getFullYear()} Alpha Collective. All rights reserved.
          </div>
          <div>
            Where Conviction Meets Community
          </div>
        </div>

      </div>
    </footer>
  );
};
