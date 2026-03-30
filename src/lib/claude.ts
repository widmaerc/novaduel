/**
 * Anthropic Claude API — SERVER-SIDE ONLY
 */
import Anthropic from '@anthropic-ai/sdk';
import { cached, TTL } from './redis';
import type { Player } from '@/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
        model: 'claude-3-5-sonnet-20241022',
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

export async function generatePlayerInsight(
  player: Player,
  locale: string = 'fr',
): Promise<string> {
  const key = `ai:player:${player.id}:${locale}`;

  return cached(
    key,
    async () => {
      const prompts: Record<string, string> = {
        fr: `En tant qu'analyste football expert, donne une analyse structurée de ${player.name} en français. 
            Structure ta réponse exactement avec ces trois sections :
            #### Profil : (caractéristiques physiques et poste)
            #### Style de jeu : (forces techniques, influence tactique)
            #### Impact tactique : (rôle dans son équipe actuelle)`,
        en: `As an expert football analyst, provide a structured analysis of ${player.name} in English. 
            Structure your response exactly with these three sections:
            #### Profile: (physical characteristics and position)
            #### Play Style: (technical strengths, tactical influence)
            #### Tactical Impact: (role in current team)`,
        es: `Como analista de fútbol experto, proporciona un análisis estructurado de ${player.name} en español. 
            Estructura tu respuesta exactamente con estas tres secciones:
            #### Perfil: (características físicas y posición)
            #### Estilo de juego: (fortalezas técnicas, influencia tactique)
            #### Impacto táctico: (papel en su equipo actual)`
      };

      const msg = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 350,
        messages: [
          {
            role: 'user',
            content: (prompts[locale] || prompts.fr) + '\n\nBe concise but informative (2-3 sentences per section).',
          },
        ],
      });

      const block = msg.content[0];
      return block.type === 'text' ? block.text : '';
    },
    TTL.comparison,
  );
}
