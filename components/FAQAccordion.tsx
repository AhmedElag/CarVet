"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What makes CarVet different?",
    answer:
      "CarVet is buyer-side only. We are not trying to sell you the car, finance the car, or push you toward a dealership. The goal is to help you understand risk before you waste time or money.",
  },
  {
    question: "How long does a review take?",
    answer:
      "Most basic listing reviews can be completed the same day. More detailed reviews, comparisons, or market-watch services may take 24 hours or longer depending on the vehicle and information provided.",
  },
  {
    question: "Do you buy or sell cars?",
    answer:
      "No. CarVet does not buy, sell, or broker vehicles. We help buyers evaluate listings, understand common issues, and make more informed decisions.",
  },
  {
    question: "Can you guarantee I will not buy a bad car?",
    answer:
      "No service can guarantee that. CarVet helps reduce risk by highlighting red flags, known model-specific problems, inspection priorities, and questions to ask before you commit.",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={faq.question} className="rounded bg-[#ded9cd]">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between px-6 py-5 text-left"
            >
              <p className="text-sm font-black">{faq.question}</p>
              <span className="text-3xl text-slate-500">
                {isOpen ? "−" : "+"}
              </span>
            </button>

            {isOpen && (
              <div className="px-6 pb-5 text-sm leading-6 text-slate-600">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}