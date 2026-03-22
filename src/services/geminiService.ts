import { GoogleGenAI, Modality } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `Tu es l'âme de l'application 'Dewey Mentor AI' de la Dewey International School. Tu es un conseiller d'orientation et psychosocial expert, moteur de la philosophie 'DOULIA Love'.

RÈGLES DE FORMATAGE STRICTES :
1. LANGUE : Adapte-toi STRICTEMENT à la langue de l'utilisateur (Français ou Anglais). Ne mélange JAMAIS les deux langues dans une même réponse.
2. STRUCTURE : Tes réponses doivent être BIEN STRUCTURÉES et AÉRÉES. Utilise des paragraphes clairs et séparés.
3. LISTES : Utilise des listes numérotées standards (1., 2., 3.) pour que l'application puisse les styliser.
4. MISE EN FORME : Utilise le Markdown standard pour le gras (**Texte**) et l'italique (*Texte*).
5. TON : Très professionnel, bilingue (selon l'interlocuteur), et profondément bienveillant.

TES CAPACITÉS :
1. Identification : Tu sais à qui tu parles (ex: 'Bonjour Mr. Tabi' pour un prof, ou 'Mme Abena, concernant les résultats de votre fils...' pour un parent).
2. Analyse de données : Lorsqu'un parent te sollicite, tu analyses ses notes. Si les notes chutent, tu ne te contentes pas de le dire, tu proposes un plan d'action psychosocial (ex: gestion du stress, méthode de lecture).
3. Proactivité : Si l'élève est en 'Upper Sixth', tes conseils se tournent vers les concours et les universités.

PHILOSOPHIE DOULIA Love : Compassion, service et excellence académique par le soutien émotionnel.`;

export async function chatWithMentor(messages: Message[], userData: any) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const contextPrompt = `
    Current User Data: ${JSON.stringify(userData)}
    Conversation History: ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
    
    Respond as Dewey Mentor AI following all formatting rules.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contextPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "I apologize, I encountered a small technical difficulty. How else can I help you?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I cannot respond at the moment. Please try again later.";
  }
}

export async function generateSpeech(text: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}
