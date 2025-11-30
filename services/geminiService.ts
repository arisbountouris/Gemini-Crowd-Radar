import { GoogleGenAI } from "@google/genai";
import { Coordinates, Place, GroundingChunk } from "../types";

const parseCrowdLevel = (levelStr: string): number => {
  const num = parseInt(levelStr.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 50 : Math.min(100, Math.max(0, num));
};

const getLabelFromLevel = (level: number): Place['crowdLabel'] => {
  if (level >= 80) return 'Severe';
  if (level >= 60) return 'High';
  if (level >= 30) return 'Moderate';
  return 'Low';
};

export const fetchCrowdData = async (
  query: string, 
  userLocation?: Coordinates
): Promise<{ places: Place[]; groundingChunks: GroundingChunk[] }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Constructing a prompt that encourages structured output without using JSON schema (forbidden with Google Maps tool)
  const locationContext = userLocation 
    ? `The user is currently at latitude: ${userLocation.latitude}, longitude: ${userLocation.longitude}. Prioritize places near here.` 
    : '';

  const prompt = `
    ${locationContext}
    I want to find crowded or popular places related to: "${query}".
    
    Using Google Maps, identify 6-9 specific, real-world places that match this query.
    For each place, estimate its CURRENT crowd density or typical popularity on a scale of 0 to 100 based on general knowledge of the area, time of day, and place type.
    
    You MUST output the details in the following strict plain text format for each place so I can parse it:
    
    ---PLACE_START---
    NAME: [Exact Name of Place]
    ADDRESS: [Short Address or Area]
    CATEGORY: [e.g. Park, Cafe, Mall, Street]
    CROWD_SCORE: [Number 0-100]
    DESCRIPTION: [A very short, punchy 10-word description of the current vibe. e.g. "Bustling with tourists" or "Quiet and cozy"]
    ---PLACE_END---

    Ensure you use the googleMaps tool to verify these places exist.
  `;

  try {
    const config: any = {
      tools: [{ googleMaps: {} }],
      temperature: 0.7,
    };

    // If we have coordinates, pass them to the tool config for better relevance
    if (userLocation) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: config
    });

    const text = response.text || "";
    const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];

    const places: Place[] = [];
    const chunks = text.split("---PLACE_START---");

    chunks.forEach((chunk, index) => {
      if (!chunk.includes("---PLACE_END---")) return;

      const nameMatch = chunk.match(/NAME:\s*(.+)/);
      const addressMatch = chunk.match(/ADDRESS:\s*(.+)/);
      const categoryMatch = chunk.match(/CATEGORY:\s*(.+)/);
      const scoreMatch = chunk.match(/CROWD_SCORE:\s*(\d+)/);
      const descMatch = chunk.match(/DESCRIPTION:\s*(.+)/);

      if (nameMatch && scoreMatch) {
        const name = nameMatch[1].trim();
        const score = parseCrowdLevel(scoreMatch[1]);
        
        // Attempt to find a matching grounding URI for this place
        const matchingChunk = groundingChunks.find(g => 
          g.maps?.title && name.toLowerCase().includes(g.maps.title.toLowerCase())
        );

        places.push({
          id: `place-${index}`,
          name: name,
          address: addressMatch ? addressMatch[1].trim() : "Unknown location",
          category: categoryMatch ? categoryMatch[1].trim() : "General",
          crowdLevel: score,
          crowdLabel: getLabelFromLevel(score),
          description: descMatch ? descMatch[1].trim() : "No description available.",
          googleMapsUri: matchingChunk?.maps?.uri
        });
      }
    });

    return { places, groundingChunks };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};