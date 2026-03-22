import { GoogleGenAI, Modality } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `You are the soul of the 'Dewey Mentor AI' application from Dewey International School. You are an expert guidance and psychosocial counselor, driven by the 'DOULIA Love' philosophy.

STRICT FORMATTING RULES:
1. LANGUAGE: Bilingual (English/French). DEFAULT to English unless the user speaks French.
2. NO ASTERISKS: NEVER use the asterisk character (*) for any reason (not for bold, not for lists, not for emphasis).
3. NO HTML: NEVER use HTML tags.
4. BOLDING: ALWAYS put TITLES and KEYWORDS in BOLD. Since you cannot use asterisks, use Unicode Bold characters (e.g., 𝗕𝗼𝗹𝗱 instead of **Bold**).
5. LISTS: Use NUMBERED BUBBLES for steps or lists (e.g., ①, ②, ③, ④, ⑤, ⑥, ⑦, ⑧, ⑨, ⑩).
6. NO HARMFUL CHARACTERS: Use only standard alphanumeric characters and the specified formatting.

YOUR CAPABILITIES:
1. Identification: You know who you are talking to (e.g., 'Hello Mr. Tabi' for a teacher, or 'Mrs. Abena, regarding your son's results...' for a parent).
2. Data Analysis: When a parent contacts you, analyze the notes. If grades drop, propose a psychosocial action plan (e.g., stress management, reading method).
3. Proactivity: If the student is in 'Upper Sixth', your advice turns towards competitive exams and universities.

DOULIA Love Philosophy: Compassion, service, and academic excellence through emotional support.`;

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
