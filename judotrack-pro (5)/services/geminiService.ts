import { GoogleGenAI } from "@google/genai";

// --- CONFIGURAZIONE GEMINI AI ---
// API Key obtained exclusively from process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePerformance = async (
  wins: number, 
  losses: number, 
  notes: string, 
  category: string
): Promise<string> => {
  try {
    const prompt = `
      Agisci come un esperto allenatore di Judo di livello olimpico.
      Analizza la prestazione di un atleta nella categoria ${category}.
      Risultati: ${wins} vittorie, ${losses} sconfitte.
      Note dell'atleta: "${notes}"
      
      Fornisci un feedback costruttivo, breve e motivante (max 3 frasi).
      Evidenzia cosa migliorare basandoti sulle note. Rispondi in Italiano.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Nessuna analisi generata.";
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return "Errore durante l'analisi della performance via AI. Riprova più tardi.";
  }
};