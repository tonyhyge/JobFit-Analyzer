export interface ExtractedProfile {
    fullName: string;
    currentRole: string;
    about: string;
    experience: Array<{ title: string; company: string; duration: string }>;
    skills: string[];
    hasFeaturedMedia: boolean;
    url: string;
}

export interface JobFitScorePayload {
    candidate: ExtractedProfile;
    targetNiche: 'AI_ML' | 'Cybersecurity' | 'AI_Ethics';
}

export interface JobFitResult {
    score: number;
    coreScore: number;
    adjScore: number;
    alpha: number;
    beta: number;
    analysis: string;
    skillBreakdown?: Array<{ skill: string, score: number }>;
}

/**
 * Prepares the payload for Gemini 3.1 Pro API based on the S_JF formula.
 * The formula: S_JF = \alpha \cdot S_{core} + \beta \cdot S_{adj}
 */
export function prepareScoringPayload(profile: ExtractedProfile, niche: JobFitScorePayload['targetNiche']): JobFitScorePayload {
    // In a real implementation this would clean/sanitize the data before sending to the LLM.
    // We enforce structure here to mitigate prompt injection to some degree.
    return {
        candidate: {
            fullName: profile.fullName.slice(0, 100), // sanitize length
            currentRole: profile.currentRole.slice(0, 500),
            about: profile.about.slice(0, 3000), // Limit context size
            experience: profile.experience.map(exp => ({
                title: exp.title.slice(0, 200),
                company: exp.company.slice(0, 200),
                duration: exp.duration.slice(0, 100)
            })),
            skills: profile.skills.map(skill => skill.slice(0, 100)),
            hasFeaturedMedia: profile.hasFeaturedMedia,
            url: profile.url
        },
        targetNiche: niche
    };
}

/**
 * Mock Gemini API Call specifically for VA validation before integrating real backend.
 */
export async function mockCalculateS_JF(payload: JobFitScorePayload): Promise<JobFitResult> {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Fake S_JF logic
    const coreScore = 85;
    const adjScore = 70;
    const alpha = 0.7;
    const beta = 0.3;

    return {
        score: (alpha * coreScore) + (beta * adjScore),
        coreScore,
        adjScore,
        alpha,
        beta,
        analysis: `Candidate shows strong ${payload.targetNiche} alignment based on skills ${payload.candidate.skills.slice(0, 3).join(', ')}.`
    };
}
