/**
 * Anthropic Claude API — SERVER-SIDE ONLY
 */
import Anthropic from '@anthropic-ai/sdk';
import { cached, TTL } from './redis';
import type { Player } from '../types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Claude Official Model IDs (April 2026)
 */
export const MODELS = {
  OPUS: 'claude-3-opus-20260205',    // Claude 4.6 Opus
  SONNET: 'claude-3-sonnet-20260217', // Claude 4.6 Sonnet
  HAIKU: 'claude-3-haiku-20251022',  // Claude 4.5 Haiku
} as const;

export interface StructuredAnalysis {
  insight: string;
  roles: string[];
  strengths: string[];
  weaknesses: string[];
}

export async function generateComparisonInsight(
  playerA: Player,
  playerB: Player,
  locale: string = 'fr',
): Promise<string> {
  const key = `ai:comparison:${playerA.id}:${playerB.id}:${locale}`;

  return cached(
    key,
    async () => {
      const prompts: Record<string, string> = {
        fr: `Tu es un analyste football expert. Compare ${playerA.name} et ${playerB.name} en français. 
            Structure ta réponse exactement avec ces trois sections :
            #### Profils comparés : (brève comparaison physique/âge/statut)
            #### Analyse technique & tactique : (comparaison des styles, forces et faiblesses avec données)
            #### Verdict NovaDuel : (qui est le plus complet ou le plus adapté à un rôle spécifique)`,
        en: `You are an expert football analyst. Compare ${playerA.name} and ${playerB.name} in English. 
            Structure your response exactly with these three sections:
            #### Compared Profiles: (brief physical/age/status comparison)
            #### Technical & Tactical Analysis: (comparison of styles, strengths and weaknesses with data)
            #### NovaDuel Verdict: (who is more complete or better suited for a specific role)`,
        es: `Eres un analista de fútbol experto. Compara a ${playerA.name} y ${playerB.name} en español. 
            Estructura tu respuesta exactamente con estas tres secciones:
            #### Perfiles comparados: (breve comparación física/edad/estatus)
            #### Análisis técnico y táctico: (comparación de estilos, fortalezas y debilidades con datos)
            #### Veredicto de NovaDuel: (quién es más completo o se adapta mejor a un rol específico)`
      };

      const msg = await anthropic.messages.create({
        model: MODELS.HAIKU,
        max_tokens: 450,
        messages: [
          {
            role: 'user',
            content: (prompts[locale] || prompts.fr) + '\n\nBe analytical, precise and impactful.',
          },
        ],
      });

      const block = msg.content[0];
      return block.type === 'text' ? block.text : '';
    },
    TTL.comparison,
  );
}

export async function generatePlayerAnalysis(
  player: Player,
  locale: string = 'fr',
): Promise<StructuredAnalysis> {
  const key = `ai:player-analysis:${player.id}:${locale}`;

  return cached(
    key,
    async () => {
      const statsSummary = `
        Stats Season ${player.season}:
        - Goals: ${player.goals}
        - Assists: ${player.assists}
        - Rating: ${player.rating}/10
        - Pass Accuracy: ${player.pass_accuracy}%
        - Dribbles: ${player.dribbles}/match
        - Duels Won: ${player.duels_won}%
        - Shots on Target: ${player.shots_on_target}/match
        - Position: ${player.position_name}
      `;

      const prompts: Record<string, string> = {
        fr: `Tu es un analyste football expert. Analyse ${player.name} en français en te basant sur ses statistiques réelles.\n${statsSummary}`,
        en: `You are an expert football analyst. Analyze ${player.name} in English based on their real statistics.\n${statsSummary}`,
        es: `Eres un analista de fútbol experto. Analiza a ${player.name} en español basándote en sus estadísticas reales.\n${statsSummary}`
      };

      const systemPrompt = `
        You must return a JSON object with this exact structure:
        {
          "insight": "A narrative analysis in 3 short paragraphs (Profile, Style, Impact) using #### Titles.",
          "roles": ["Role 1", "Role 2"],
          "strengths": ["Strength 1", "Strength 2"],
          "weaknesses": ["Weakness 1", "Weakness 2"]
        }
        Use the requested language (${locale}) for all text.
      `;

      const msg = await anthropic.messages.create({
        model: MODELS.HAIKU,
        max_tokens: 800,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: (prompts[locale] || prompts.fr) + '\n\nReturn only the JSON object.',
          },
        ],
      });

      const block = msg.content[0];
      const text = block.type === 'text' ? block.text : '{}';
      
      try {
        // Find JSON start/end in case Claude adds comments
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        const jsonStr = text.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonStr) as StructuredAnalysis;
      } catch (e) {
        console.error('Failed to parse Claude JSON:', e);
        return {
          insight: text,
          roles: [],
          strengths: [],
          weaknesses: []
        };
      }
    },
    TTL.comparison,
  );
}

export async function generatePlayerInsight(
  player: Player,
  locale: string = 'fr',
): Promise<string> {
  const analysis = await generatePlayerAnalysis(player, locale);
  return analysis.insight;
}
