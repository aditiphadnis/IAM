
import { GoogleGenAI } from "@google/genai";

// Standard implementation using GoogleGenAI with direct API key and systemInstruction
export async function getOnboardingAssistance(prompt: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert enterprise systems architect and support specialist. Help the user with the following onboarding task. Provide concise, actionable steps for enterprise configuration.",
        temperature: 0.7,
        topP: 0.95,
      }
    });
    
    // Accessing .text property directly as per modern @google/genai guidelines
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
}
