import { GoogleGenAI, Type } from '@google/genai';
import { ExtractedProfile, JobFitScorePayload, JobFitResult } from '../utils/scoring';

// Initialize the Gemini client using the vite env variable
const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

const SYSTEM_PROMPT = `
You are the "JobFit Analyzer" evaluating LinkedIn profiles for the 2026 tech market.

Your goal is to compute the Job Fit Score (S_JF) based on the formula:
S_JF = \alpha * S_core + \beta * S_adj

Weighting heuristics:
- \\alpha (Core Technical Weight): 0.70
- \\beta (Adjacency Bonus Weight): 0.30

Target 2026 Niches & Core Requirements:
1. AI/ML: Focus on MLOps, LLM Fine-tuning, and Mathematical foundations.
2. Cybersecurity: Focus on Zero Trust and Cloud-native security.
3. AI Ethics: Focus on Bias Mitigation and AI Governance.

Instructions:
1. Evaluate the profile strictly against the specified target niche.
2. If given a multimodal input (image or video description), use it to visually verify skills or certifications.
3. Assign a core score (S_core) out of 100 based on the presence and depth of the target niche requirements.
4. Assign an adjacency score (S_adj) out of 100 based on complementary skills (e.g., a software engineer showing cloud experience).
5. Output the result mathematically as overall_score: (0.70 * S_core) + (0.30 * S_adj).
`;

export async function analyzeProfileTarget(
    payload: JobFitScorePayload,
    base64Images: string[] = [] // Support for multimodal analysis if we extract images
): Promise<JobFitResult> {
    const { candidate, targetNiche } = payload;

    const contentParts: any[] = [
        { text: `Target Niche: ${targetNiche}` },
        { text: `Profile JSON Data: ${JSON.stringify(candidate)}` }
    ];

    // Append images if they exist
    base64Images.forEach(base64 => {
        // Assuming base64 data URIs like "data:image/jpeg;base64,..."
        const match = base64.match(/^data:(image\/[a-z]+);base64,(.+)$/);
        if (match) {
            contentParts.push({
                inlineData: {
                    mimeType: match[1],
                    data: match[2]
                }
            });
        }
    });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro', // Specific 3.1 Pro model request
            contents: contentParts,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                temperature: 0.1, // Low temp for analytical consistency
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overall_score: { type: Type.NUMBER, description: "The final S_JF value (0-100)" },
                        coreScore: { type: Type.NUMBER, description: "The S_core value (0-100)" },
                        adjScore: { type: Type.NUMBER, description: "The S_adj value (0-100)" },
                        skill_breakdown: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    skill: { type: Type.STRING },
                                    score: { type: Type.NUMBER }
                                }
                            }
                        },
                        gap_analysis: { type: Type.STRING, description: "What the user is missing for the target role" },
                        action_plan: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "3 immediate actionable steps to improve the score"
                        }
                    },
                    required: ["overall_score", "coreScore", "adjScore", "skill_breakdown", "gap_analysis", "action_plan"]
                }
            }
        });

        const textRes = response.text;
        if (!textRes) throw new Error("Empty response from AI");

        const parsed = JSON.parse(textRes);

        return {
            score: parsed.overall_score,
            coreScore: parsed.coreScore,
            adjScore: parsed.adjScore,
            alpha: 0.7,
            beta: 0.3,
            analysis: `Gap: ${parsed.gap_analysis}\n\nAction Plan:\n - ${parsed.action_plan.join('\n - ')}`,
            skillBreakdown: parsed.skill_breakdown
        };
    } catch (err) {
        console.error('Gemini Analysis Failed:', err);
        throw err;
    }
}
