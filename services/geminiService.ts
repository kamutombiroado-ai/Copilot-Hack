
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialEntry, AIAnalysisResult } from "../types";

export const analyzeFinancials = async (entries: FinancialEntry[]): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const assets = entries.filter(e => e.type === 'ASSET');
  const liabilities = entries.filter(e => e.type === 'LIABILITY');
  
  const prompt = `
    Analyze the following financial portfolio and provide strategic advice:
    
    Assets: ${JSON.stringify(assets.map(a => ({ name: a.name, category: a.category, value: a.value })))}
    Liabilities: ${JSON.stringify(liabilities.map(l => ({ name: l.name, category: l.category, value: l.value })))}
    
    Please provide:
    1. A concise summary of the current financial position.
    2. Three actionable suggestions to improve net worth or reduce risk.
    3. An overall risk assessment (Low, Medium, High).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            riskAssessment: { 
              type: Type.STRING,
              description: "Low, Medium, or High"
            }
          },
          required: ["summary", "suggestions", "riskAssessment"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      summary: result.summary || "No summary available.",
      suggestions: result.suggestions || [],
      riskAssessment: (result.riskAssessment as any) || "Medium"
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "I'm sorry, I couldn't analyze your data at this moment. Please check your connection and try again.",
      suggestions: ["Diversify your investments", "Reduce high-interest debt", "Maintain an emergency fund"],
      riskAssessment: "Medium"
    };
  }
};
