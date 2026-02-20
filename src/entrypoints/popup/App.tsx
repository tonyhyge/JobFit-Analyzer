import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockCalculateS_JF, ExtractedProfile, JobFitResult } from '@/utils/scoring';

const App = () => {
    const [profile, setProfile] = useState<ExtractedProfile | null>(null);
    const [scoreData, setScoreData] = useState<JobFitResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch stored profile from Content Script
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['linkedinProfile'], async (result) => {
                if (result.linkedinProfile) {
                    setProfile(result.linkedinProfile);

                    // Calculate score
                    const data = await mockCalculateS_JF({
                        candidate: result.linkedinProfile,
                        targetNiche: 'AI_ML'
                    });
                    setScoreData(data);
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <div className="w-[400px] p-4 bg-background text-foreground font-sans">
            <h1 className="text-xl font-bold mb-4 tracking-tight">JobFit Analyzer</h1>

            {!profile && !loading && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground text-center">
                            Please navigate to a LinkedIn profile to analyze JobFit.
                        </p>
                    </CardContent>
                </Card>
            )}

            {loading && (
                <div className="flex justify-center p-8">
                    <p className="text-sm text-muted-foreground animate-pulse">Analyzing Profile...</p>
                </div>
            )}

            {profile && scoreData && !loading && (
                <div className="flex flex-col gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{profile.fullName}</CardTitle>
                            <p className="text-sm text-muted-foreground truncate">{profile.currentRole}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">JobFit Score ($S_{'{JF}'}$)</span>
                                <Badge variant={scoreData.score > 75 ? 'default' : 'secondary'}>
                                    {scoreData.score.toFixed(1)} / 100
                                </Badge>
                            </div>
                            <Progress value={scoreData.score} className="h-2" />

                            <div className="mt-4 flex gap-2 flex-wrap">
                                {profile.skills.slice(0, 5).map((skill, i) => (
                                    <Badge key={i} variant="outline" className="text-xs font-normal">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">2026 Niche Analysis: AI/ML</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {scoreData.analysis}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default App;
