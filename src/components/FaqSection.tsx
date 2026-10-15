import React, { useState } from 'react';
import { FAQ_DATA } from '../content/ecosystem';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="bg-[#09090B] text-[#F4F3EF] py-24 sm:py-32 border-b border-white/[0.07] relative select-none">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-14 sm:mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-sans text-[#9A9891] mb-3">
            <span>06. Clarifications</span>
            <span aria-hidden="true">·</span>
            <span>Common Questions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans font-semibold text-[#F4F3EF] tracking-tight mb-3">
            Frequently <span className="font-serif-editorial italic font-normal text-[#D4CFC7]">Asked</span>
          </h2>
          <p className="text-sm font-sans text-[#8E8D87] max-w-md mx-auto leading-relaxed">
            Direct answers on membership, partner allocations, and how our collectiv3 operates.
          </p>
        </div>

        {/* Clean Hairline FAQ Accordion */}
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq.id} className="transition-colors">
                <button
                  onClick={() => toggle(idx)}
                  className="w-full py-5 sm:py-6 text-left flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <span className="font-sans font-medium text-base sm:text-lg text-[#F4F3EF] group-hover:text-white transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#9A9891] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#F4F3EF]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="pb-6 text-sm font-sans text-[#9A9891] leading-relaxed pr-8">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
