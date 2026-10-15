import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlphaShieldLogo } from './AlphaShieldLogo';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { NavigationTab } from '../types';
import { OFFICIAL_LINKS } from '../content/ecosystem';
import { useDiscordSync } from '../hooks/useDiscordSync';

interface NavbarProps {
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onOpenJoinModal: () => void;
  onOpenCollabModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  onOpenJoinModal,
  onOpenCollabModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const discord = useDiscordSync(OFFICIAL_LINKS.discordGuildId, OFFICIAL_LINKS.discordInvitePlaceholder);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: NavigationTab; label: string }[] = [
    { id: 'community', label: 'COMMUNITY' },
    { id: 'collabs', label: 'COLLABS' },
    { id: 'team', label: 'TEAM' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0B0B0C]/95 backdrop-blur-md border-b border-[#29292B] py-4 shadow-[0_4px_24px_rgba(0,0,0,0.6)]'
          : 'bg-[#0B0B0C] border-b border-[#1E1E20] py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between gap-6">
        
        {/* Brand Logo (Spacious Left Anchor) */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-left focus:outline-none group cursor-pointer"
            id="nav-brand-button"
          >
            <AlphaShieldLogo variant="badge" />
          </button>
        </div>

        {/* Spacious Centered Desktop Navigation Links */}
        <nav className="hidden md:flex items-center justify-center gap-7 lg:gap-11 relative">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                id={`nav-item-${item.id}`}
                className={`relative py-1.5 text-[13px] font-sans tracking-[0.14em] uppercase transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#F5F5F3] font-semibold'
                    : 'text-[#9A9A96] hover:text-[#F5F5F3] font-medium'
                }`}
              >
                <span>{item.label}</span>
                
                {/* Active Indicator Underline */}
                {isActive && (
                  <motion.span
                    layoutId="activeNavUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#D71920]"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 35,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Mobile Toggle (Spacious Right Anchor) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Live Discord Status Indicator (Non-link status display) */}
          <div
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-sm bg-[#141416] border border-[#29292B] text-xs font-mono select-none"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className="text-[#F5F5F3] font-semibold tracking-wider">{discord.onlineCount}</span>
            <span className="text-[#10B981] text-[10px] font-semibold tracking-wider">ONLINE</span>
            <span className="text-[#3A3A3E]">/</span>
            <span className="text-[#A8A8A5] text-[11px] font-normal">{discord.totalMembers}</span>
          </div>

          <button
            onClick={onOpenCollabModal}
            className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#141416] hover:bg-[#1C1C1E] border border-[#29292B] hover:border-[#A8A8A5] text-[#F5F5F3] text-xs font-sans font-semibold tracking-wider transition-colors cursor-pointer"
          >
            <span>PROPOSE COLLAB</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#A8A8A5]" />
          </button>

          {/* Primary CTA with restrained crimson */}
          <button
            onClick={onOpenJoinModal}
            id="nav-join-button"
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-sm bg-[#D71920] hover:bg-[#B8151B] text-white text-xs font-sans font-semibold tracking-wider transition-all shadow-[0_2px_12px_rgba(215,25,32,0.25)] flex items-center gap-1.5 cursor-pointer"
          >
            <span>JOIN ALPHA</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#A8A8A5] hover:text-white rounded-sm bg-[#141416] border border-[#29292B] cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0B0C] border-b border-[#29292B] px-5 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2.5 px-3 rounded-sm text-left text-xs font-mono tracking-widest uppercase transition-colors ${
                  activeTab === item.id
                    ? 'bg-[#141416] text-white font-semibold border-l-2 border-[#D71920]'
                    : 'text-[#888885] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[#29292B] flex flex-col gap-2">
            <div className="w-full py-2.5 px-3 rounded-sm bg-[#141416] border border-[#29292B] flex items-center justify-center gap-2 text-xs font-mono select-none">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-white font-semibold">{discord.onlineCount} ONLINE</span>
              <span className="text-[#666662]">/</span>
              <span className="text-[#A8A8A5]">{discord.totalMembers} MEMBERS</span>
            </div>

            <button
              onClick={() => {
                onOpenCollabModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-sm bg-[#141416] border border-[#29292B] text-white text-xs font-mono text-center"
            >
              PROPOSE COLLAB ↗
            </button>
            <button
              onClick={() => {
                onOpenJoinModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-sm bg-[#D71920] text-white text-xs font-mono font-semibold text-center"
            >
              JOIN ALPHA ↗
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
