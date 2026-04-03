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
  OPUS: 'claude-opus-4-6',
  SONNET: 'claude-sonnet-4-6',
  HAIKU: 'claude-haiku-4-5-20251001',
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
      const dataSummary = `
        Données réelles pour la comparaison (NE PAS INVENTER D'AUTRES DONNÉES) :
        - ${playerA.name} : ${playerA.age} ans, ${playerA.height}cm, équipe: ${playerA.team}, poste: ${playerA.position_name}, buts: ${playerA.goals}, assists: ${playerA.assists}, rating: ${playerA.rating}/10.
        - ${playerB.name} : ${playerB.age} ans, ${playerB.height}cm, équipe: ${playerB.team}, poste: ${playerB.position_name}, buts: ${playerB.goals}, assists: ${playerB.assists}, rating: ${playerB.rating}/10.
      `;

      const prompts: Record<string, string> = {
        fr: `Tu es un analyste football expert. Compare ${playerA.name} et ${playerB.name} en français en te basant exclusivement sur les données fournies.\n${dataSummary}
            Structure ta réponse exactement avec ces trois sections (utilise des #### titres) :
            #### Profils comparés : (comparaison physique, âge et statut actuel)
            #### Analyse technique & tactique : (comparaison des styles et forces basée sur les stats fournies)
            #### Verdict NovaDuel : (conclusion sur qui est le plus performant ou adapté)`,
        en: `You are an expert football analyst. Compare ${playerA.name} and ${playerB.name} in English based exclusively on the provided data.\n${dataSummary}
            Structure your response exactly with these three sections:
            #### Compared Profiles: (physical, age and status comparison)
            #### Technical & Tactical Analysis: (comparison of styles and strengths based on stats)
            #### NovaDuel Verdict: (conclusion on who is more performing or better suited)`,
        es: `Eres un analista de fútbol experto. Compara a ${playerA.name} y ${playerB.name} en español basándote exclusivamente en los datos proporcionados.\n${dataSummary}
            Estructura tu respuesta exactamente con estas tres secciones:
            #### Perfiles comparados: (comparación física, edad y estatus actual)
            #### Análisis técnico y táctico: (comparación de estilos y fortalezas basada en las estadísticas)
            #### Veredicto de NovaDuel: (conclusión sobre quién es más completo o adecuado)`
      };

      const msg = await anthropic.messages.create({
        model: MODELS.HAIKU,
        max_tokens: 450,
        messages: [
          {
            role: 'user',
            content: (prompts[locale] || prompts.fr) + '\n\nBe analytical, precise and impactful. Use ONLY the provided data for ages and physical traits.',
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
