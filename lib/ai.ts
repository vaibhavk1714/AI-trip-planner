/* eslint-disable @typescript-eslint/no-explicit-any */
import 'server-only';
import {
	GoogleGenAI,
	HarmBlockThreshold,
	HarmCategory,
	type GenerateContentConfig,
} from '@google/genai';

const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

export const MODEL_NAME = 'gemini-2.0-flash-lite'; // or 'gemini-2.5-flash'

if (!API_KEY) {
	throw new Error('Missing GOOGLE_API_KEY or GEMINI_API_KEY');
}

export const SYSTEM_INSTRUCTIONS = `
You are my travel budget assistant. I need information about staying in [Destination].  

Please include:
- Average hotel costs (budget, mid-range, luxury)
- Recommended hotel areas (safe, convenient, good connectivity)
- Estimated daily food expenses (budget/mid-range/high-end)
- Transportation costs (public transport, taxis, ride-share)
- Any local money-saving tips (passes, cards, etc.)
- Rough total daily budget ranges (budget/mid-range/luxury traveler)

Present the results in a comparison table format if possible and keep it in short and keep the currency in INR.
`;

export const SAFETY_SETTINGS = [
	{
		category: HarmCategory.HARM_CATEGORY_HARASSMENT,
		threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
		threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
		threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
		threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
	},
];

const ai = new GoogleGenAI({ apiKey: API_KEY });

const groundingTool = { googleSearch: {} };

// Base config used on every call
const BASE_CONFIG: GenerateContentConfig = {
	systemInstruction: SYSTEM_INSTRUCTIONS,
	temperature: 0.7,
	safetySettings: SAFETY_SETTINGS,
	tools: [groundingTool],
};

export async function callGemini(prompt: string) {
	const res = await ai.models.generateContent({
		model: MODEL_NAME,
		contents: [{ role: 'user', parts: [{ text: prompt }] }],
		config: BASE_CONFIG,
	});
	return res.text; // no parentheses
}

export async function suggestDestination(inputs: Record<string, any>) {
	const prompt = `
Suggest ONE single best destination in India based on these preferences.
Provide only the name of the destination (e.g., "Auli, Uttarakhand"). Do not add any other text.

Preferences: ${JSON.stringify(inputs)}
`;
	const response = await callGemini(prompt);
	if (!response) {
		return 'Unknown error generating data';
	}
	return response.trim();
}

export async function getDestinationOverview(destination: string, inputs: Record<string, any>) {
	const prompt = `
Provide a concise overview for a trip to ${destination} in ${inputs['Time of Year']}.
Include these points in a bulleted list:
- Safety, Weather, Festivals/Events, Restrictions, Culture (1-2 do's/don'ts), Best Visit Time.
`;

	return callGemini(prompt);
}

export async function createDailyItinerary(destination: string, inputs: Record<string, any>) {
	const prompt = `
Create a detailed day-by-day suggested itinerary for a ${inputs['Travel Duration']} trip to ${destination}.
The theme is '${inputs['Travel Themes']}' for a '${inputs['Travellers']}'.
Include timings (morning/afternoon/evening) and weather-dependent alternatives.
`;
	return callGemini(prompt);
}

export async function getBudgetAndLogistics(destination: string, inputs: Record<string, any>) {
	const prompt = `
Provide a cost and logistics breakdown for a trip to ${destination} on a budget of ${inputs['Budget']}.
Use these headings:
### Accommodation (Recommended areas, average costs)
### Food (Estimated daily expenses)
### Transportation (Local travel details)
### Budget Summary (Daily budget range, money-saving tips)
`;
	return callGemini(prompt);
}
