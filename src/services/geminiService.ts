import { GoogleGenAI, Modality } from "@google/genai";
import { Message } from "../types";
import { Language } from "../translations";

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

export async function chatWithMentor(messages: Message[], userData: any, lang: Language) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const contextPrompt = `
    LANGUE DE RÉPONSE OBLIGATOIRE : ${lang === 'fr' ? 'FRANÇAIS' : 'ENGLISH'}
    
    CONTEXTE UTILISATEUR :
    - Profil : ${JSON.stringify(userData.profile)}
    
    DONNÉES EN TEMPS RÉEL DE LA BASE DE DONNÉES SUPABASE :
    - PROFILS (Table 'profils') : ${JSON.stringify(userData.allProfiles || [])}
    - RÉSULTATS ACADÉMIQUES (Table 'resultats_academiques') : ${JSON.stringify(userData.academicResults || [])}
    
    INSTRUCTIONS CRITIQUES :
    1. RÉPONDRE UNIQUEMENT EN ${lang === 'fr' ? 'FRANÇAIS' : 'ENGLISH'}. Ne mélange JAMAIS les deux langues.
    2. Utilise STRICTEMENT les données JSON ci-dessus pour répondre aux questions sur les notes, les élèves ou le personnel.
    3. CORRESPONDANCE DES RÔLES : Note que 'admin' = 'administrateur', 'teacher' = 'professeur', 'student' = 'étudiant'.
    4. CORRESPONDANCE DES COLONNES : 
       - Profils : 'nom_complet' est le nom, 'role' est le rôle.
       - Résultats : 'matiere' est la matière, 'note' est la note, 'trimestre' est le trimestre.
    5. Si les données sont vides [], dis poliment que tu n'as pas encore accès aux informations sur Supabase.
    6. NE JAMAIS inventer de notes ou de rôles qui ne sont pas dans les données fournies.
    7. Pour les questions sur des personnes spécifiques (ex: Oben Kotto, Monsieur Kamga), cherche-les dans la liste des PROFILS.
    8. Analyse les tendances : si les notes baissent, propose un plan psychosocial.
    
    HISTORIQUE DE LA CONVERSATION :
    ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
    
    Réponds en tant que Dewey Mentor AI en respectant toutes les règles de formatage et la langue imposée.
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
