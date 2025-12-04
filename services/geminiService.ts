import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateExplanation = async (
  target: string,
  feature: string,
  stats: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "AI Explanations are unavailable (Missing API Key).";

  try {
    const prompt = `
      You are a medical data analyst expert.
      I am analyzing a dataset likely related to health or breast cancer.
      
      Target Variable: "${target}"
      Feature Variable: "${feature}"
      Statistical Context: ${stats}

      Please explain in simple, plain English (for a non-expert) what the relationship between "${feature}" and "${target}" might indicate in a medical context. 
      Use an analogy if helpful. Keep it under 3 sentences.
      Do not use jargon.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No explanation generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate explanation at this time.";
  }
};
