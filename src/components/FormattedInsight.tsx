'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface FormattedInsightProps {
  text: string;
  isDark?: boolean;
}

export const FormattedInsight: React.FC<FormattedInsightProps> = ({ text, isDark = false }) => {
  if (!text) return null;

  const lines = text.split('\n').filter(l => l.trim() !== '');

  // Grouper les lignes en sections : [{ title, paragraphs[] }]
  type Section = { title: string | null; paragraphs: string[] };
  const sections: Section[] = [];
  let current: Section = { title: null, paragraphs: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    const isHeader =
      trimmed.startsWith('####') ||
      (trimmed.startsWith('**') && (trimmed.includes(':**') || trimmed.endsWith('**')));

    if (isHeader) {
      if (current.title !== null || current.paragraphs.length > 0) {
        sections.push(current);
      }
      const title = trimmed.startsWith('####')
        ? trimmed.replace(/^####\s*/, '')
        : (trimmed.match(/\*\*(.*?)\*\*/)?.[1] ?? trimmed).replace(':', '');
      current = { title, paragraphs: [] };
    } else {
      current.paragraphs.push(trimmed.replace(/\*\*/g, ''));
    }
  }
  if (current.title !== null || current.paragraphs.length > 0) sections.push(current);

  const headerClass = isDark
    ? "text-[#93bdfd] font-extrabold text-[11px] uppercase tracking-widest mb-2"
    : "text-[#004782] font-extrabold text-[11px] uppercase tracking-widest mb-2";

  const pClass = isDark
    ? "text-[12px] text-white/85 leading-relaxed"
    : "text-[14px] text-[#424751] leading-relaxed";

  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: 'auto',
      transition: { height: { duration: 0.1 }, staggerChildren: 0.15 },
    },
  };

  const section = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{ overflow: 'hidden' }}
      className={isDark ? "space-y-5" : "space-y-6"}
    >
      {sections.map((sec, i) => (
        <motion.div key={i} variants={section}>
          {sec.title && <h4 className={headerClass}>{sec.title}</h4>}
          {sec.paragraphs.map((p, j) => (
            <p key={j} className={pClass}>{p}</p>
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
};
