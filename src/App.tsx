import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ParticleBackground } from './components/ParticleBackground';
import { WhatWeDo } from './components/WhatWeDo';
import { CultureStatement } from './components/CultureStatement';
import { CollabsSection } from './components/CollabsSection';
import { TeamSection } from './components/TeamSection';
import { JoinSection } from './components/JoinSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { CollabModal } from './components/CollabModal';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ScrollFadeIn } from './components/ScrollFadeIn';
import { JoinAlphaApplicationPage } from './components/JoinAlphaApplicationPage';

import { NavigationTab, CollabProposalData } from './types';
import { OFFICIAL_LINKS } from './content/ecosystem';

interface ScrollySectionMeta {
  id: string;
  tab: NavigationTab;
}

const SCROLLY_SECTIONS: ScrollySectionMeta[] = [
  { id: 'hero-section', tab: 'home' },
  { id: 'what-we-do-section', tab: 'community' },
  { id: 'culture-section', tab: 'community' },
  { id: 'collabs-section', tab: 'collabs' },
  { id: 'team-section', tab: 'team' },
  { id: 'join-section', tab: 'faq' },
  { id: 'faq-section', tab: 'faq' },
];

const VALID_TABS: NavigationTab[] = ['home', 'community', 'collabs', 'team', 'faq'];

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [activeView, setActiveView] = useState<'home' | 'apply'>('home');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [openRafflesSignal, setOpenRafflesSignal] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isUserClickScrolling = useRef(false);
  const clickScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleJoinAlpha = () => {
    setActiveView('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState(null, '', '#apply');
    } catch {}
  };

  // Initial mount initialization & URL hash sync
  useEffect(() => {
    const hash = (window.location.hash || '').replace('#', '');
    if (hash === 'apply' || hash === 'join' || hash === 'join-alpha') {
      setActiveView('apply');
    } else if (VALID_TABS.includes(hash as NavigationTab)) {
      setActiveTab(hash as NavigationTab);
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = (window.location.hash || '').replace('#', '');
      if (hash === 'apply' || hash === 'join' || hash === 'join-alpha') {
        setActiveView('apply');
      } else {
        setActiveView('home');
        if (VALID_TABS.includes(hash as NavigationTab)) {
          setActiveTab(hash as NavigationTab);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Real-time Section Tracker for Navbar Active State
  useEffect(() => {
    if (isLoading) return;

    let ticking = false;

    const updateActiveSection = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      const heroEl = document.getElementById('hero-section');
      const heroBottom = heroEl
        ? heroEl.offsetTop + heroEl.offsetHeight - 80
        : 550;
      setShowScrollTop(scrollY > heroBottom);

      if (isUserClickScrolling.current) return;

      if (scrollY + windowHeight >= fullHeight - 140) {
        setActiveTab('faq');
        return;
      }
      if (scrollY < 260) {
        setActiveTab('home');
        return;
      }

      const focalPoint = scrollY + windowHeight * 0.32;
      let detectedSection: ScrollySectionMeta | null = null;

      for (let i = SCROLLY_SECTIONS.length - 1; i >= 0; i--) {
        const meta = SCROLLY_SECTIONS[i];
        const el = document.getElementById(meta.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const elTop = rect.top + scrollY;
          if (focalPoint >= elTop) {
            detectedSection = meta;
            break;
          }
        }
      }

      if (detectedSection) {
        setActiveTab(detectedSection.tab);
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateActiveSection();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleNavigate = (tab: NavigationTab) => {
    setActiveView('home');
    setActiveTab(tab);

    try {
      window.history.replaceState(null, '', `#${tab}`);
    } catch {}

    isUserClickScrolling.current = true;
    if (clickScrollTimer.current) clearTimeout(clickScrollTimer.current);
    clickScrollTimer.current = setTimeout(() => {
      isUserClickScrolling.current = false;
    }, 900);

    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const sectionMap: Record<string, string> = {
      community: 'what-we-do-section',
      collabs: 'collabs-section',
      team: 'team-section',
      faq: 'faq-section',
    };

    const targetId = sectionMap[tab];
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleCollabProposalSuccess = (proposal: CollabProposalData) => {
    showToast(`Proposal for ${proposal.projectName} transmitted successfully!`);
    setIsCollabModalOpen(false);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F3] flex flex-col font-sans selection:bg-[#D71920] selection:text-white relative">
      {/* Dynamic Cosmic Particle Starfield Canvas */}
      <ParticleBackground />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-sm bg-[#141416] text-white shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-[#29292B] text-xs font-mono flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#D71920] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Render Dedicated Application Page or Main Website */}
      {activeView === 'apply' ? (
        <JoinAlphaApplicationPage
          onBack={() => {
            setActiveView('home');
            handleNavigate('home');
          }}
        />
      ) : (
        <>
          {/* Sticky Header Navigation */}
          <Navbar
            activeTab={activeTab}
            onNavigate={handleNavigate}
            onOpenJoinModal={handleJoinAlpha}
            onOpenCollabModal={() => setIsCollabModalOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 relative z-10 overflow-x-hidden">
            <ScrollFadeIn>
              <Hero
                onJoinClick={handleJoinAlpha}
                onExploreClick={() => handleNavigate('collabs')}
                onCommunityClick={() => {
                  handleNavigate('community');
                  setOpenRafflesSignal((prev) => prev + 1);
                }}
              />
            </ScrollFadeIn>

            <ScrollFadeIn>
              <WhatWeDo openRafflesSignal={openRafflesSignal} />
            </ScrollFadeIn>

            <ScrollFadeIn>
              <CultureStatement />
            </ScrollFadeIn>

            <ScrollFadeIn>
              <CollabsSection
                onOpenCollabProposal={() => setIsCollabModalOpen(true)}
              />
            </ScrollFadeIn>

            <ScrollFadeIn>
              <TeamSection />
            </ScrollFadeIn>

            <ScrollFadeIn>
              <JoinSection onApplyClick={handleJoinAlpha} />
            </ScrollFadeIn>

            <ScrollFadeIn>
              <FaqSection />
            </ScrollFadeIn>
          </main>

          <Footer
            onNavigate={handleNavigate}
            onOpenJoinModal={handleJoinAlpha}
            onOpenCollabModal={() => setIsCollabModalOpen(true)}
          />
        </>
      )}

      <CollabModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
        onSubmit={handleCollabProposalSuccess}
      />

      {/* Floating Scroll to Top Button (Appears after scrolling past Hero section) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-to-top-btn"
            id="scroll-to-top-button"
            type="button"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => handleNavigate('home')}
            aria-label="Scroll to top"
            title="Scroll to top"
            className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 px-3.5 py-3 rounded-xl bg-[#141418]/95 hover:bg-[#D71920] border border-[#2E2E36] hover:border-[#D71920] text-[#F5F5F3] hover:text-white shadow-[0_10px_30px_rgba(0,0,0,0.85)] backdrop-blur-md transition-colors duration-200 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4 text-[#D71920] group-hover:text-white group-hover:-translate-y-0.5 transition-all duration-200" />
            <span className="hidden sm:inline text-[11px] font-mono font-semibold uppercase tracking-wider">
              TOP
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
