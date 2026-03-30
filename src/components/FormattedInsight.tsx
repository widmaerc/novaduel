import React from 'react';

interface FormattedInsightProps {
  text: string;
  isDark?: boolean;
}

/**
 * FormattedInsight — Convertit le texte de l'IA (Markdown ou formaté) en HTML sémantique.
 * Supporte :
 * - #### Titre -> <h4>
 * - **Titre:** -> <h4> (pour la compatibilité)
 */
export const FormattedInsight: React.FC<FormattedInsightProps> = ({ text, isDark = false }) => {
  if (!text) return null;

  // Séparer par lignes pour traiter les blocs
  const lines = text.split('\n').filter(l => l.trim() !== '');

  const headerClass = isDark 
    ? "text-[#93bdfd] font-extrabold text-[13px] mt-5 first:mt-0 uppercase tracking-wider"
    : "text-[#004782] font-extrabold text-[15px] mt-6 first:mt-0 uppercase tracking-wider";
  
  const pClass = isDark
    ? "text-[12px] text-white/85 leading-relaxed"
    : "text-[14px] text-[#424751] leading-relaxed";

  return (
    <div className={isDark ? "space-y-3" : "space-y-4"}>
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // Cas 1 : Titre Markdown ####
        if (trimmed.startsWith('####')) {
          const content = trimmed.replace(/^####\s*/, '');
          return (
            <h4 key={i} className={headerClass}>
              {content}
            </h4>
          );
        }

        // Cas 2 : Titre Ancien Format **Titre:** ou **Titre**
        if (trimmed.startsWith('**') && (trimmed.includes(':**') || trimmed.endsWith('**'))) {
          // Extraire le contenu entre les étoiles
          const content = trimmed.match(/\*\*(.*?)\*\*/)?.[1] || trimmed;
          const rest = trimmed.replace(/\*\*(.*?)\*\*/, '').trim();
          
          if (rest === '' || rest === ':') {
             return (
              <h4 key={i} className={headerClass}>
                {content.replace(':', '')}
              </h4>
            );
          }
        }

        // Cas 3 : Paragraphe normal
        const cleanText = trimmed.replace(/\*\*/g, '');

        return (
          <p key={i} className={pClass}>
            {cleanText}
          </p>
        );
      })}
    </div>
  );
};
