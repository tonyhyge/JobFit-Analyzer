import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyzeProfileTarget } from '@/services/gemini';
import { signInWithGoogle, saveJobFitScan, auth } from '@/services/firebase';
import { ExtractedProfile, JobFitResult } from '@/utils/scoring';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Loader2, Save, LogIn, CheckCircle } from 'lucide-react';

const App = () => {
    const [profile, setProfile] = useState<ExtractedProfile | null>(null);
    const [scoreData, setScoreData] = useState<JobFitResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [targetNiche, setTargetNiche] = useState<'AI_ML' | 'Cybersecurity' | 'AI_Ethics'>('AI_ML');

    useEffect(() => {
        // Auth Listener
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        // Fetch stored profile from Content Script
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['linkedinProfile'], async (result: any) => {
                if (result.linkedinProfile) {
                    setProfile(result.linkedinProfile);
                    try {
                        // Call Real Gemini API
                        const data = await analyzeProfileTarget({
                            candidate: result.linkedinProfile,
                            targetNiche: targetNiche
                        });
                        setScoreData(data);
                    } catch (error) {
                        console.error(error);
                    }
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
        return () => unsubscribe();
    }, [targetNiche]);

    const handleLogin = async () => {
        await signInWithGoogle();
    };

    const handleSave = async () => {
        if (!user || !profile || !scoreData) return;
        setSaving(true);
        try {
            await saveJobFitScan(user.uid, profile, scoreData, targetNiche);
            setSaved(true);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-[450px] min-h-[500px] p-4 bg-background text-foreground font-sans flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h1 className="text-xl font-bold tracking-tight">JobFit Analyzer</h1>
                {user ? (
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {user.email}
                    </div>
                ) : (
                    <button
                        onClick={handleLogin}
                        className="text-xs flex items-center gap-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 py-1 rounded"
                    >
                        <LogIn size={14} /> Login
                    </button>
                )}
            </div>

            {!profile && !loading && (
                <Card className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Navigate to a LinkedIn profile to analyze JobFit against 2026 niches.
                    </p>
                </Card>
            )}

            {loading && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">Running Multi-Agent Evaluation (Gemini 3.1 Pro)...</p>
                </div>
            )}

            {profile && scoreData && !loading && (
                <div className="flex flex-col gap-4 flex-1">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg leading-tight">{profile.fullName}</CardTitle>
                            <p className="text-xs text-muted-foreground truncate">{profile.currentRole}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold">Overall $S_{'{JF}'}$ Match</span>
                                <Badge variant={scoreData.score >= 80 ? 'default' : scoreData.score >= 60 ? 'secondary' : 'destructive'}>
                                    {scoreData.score.toFixed(1)} / 100
                                </Badge>
                            </div>
                            <Progress value={scoreData.score} className="h-2 mb-2" />
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Core: {scoreData.coreScore}</span>
                                <span>Adjacency: {scoreData.adjScore}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="gap">Gap Analysis</TabsTrigger>
                            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                        </TabsList>

                        <div className="mt-3 flex-1 bg-card rounded-md border p-3 text-sm h-[200px] overflow-y-auto">
                            <TabsContent value="overview" className="mt-0 outline-none">
                                <h4 className="font-semibold text-xs mb-2 uppercase text-muted-foreground tracking-wider">Skill Breakdown</h4>
                                <div className="space-y-2">
                                    {scoreData.skillBreakdown?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-secondary/50 p-2 rounded">
                                            <span className="font-medium text-xs">{item.skill}</span>
                                            <span className="text-xs">{item.score}/100</span>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="gap" className="mt-0 outline-none">
                                <div className="prose prose-sm dark:prose-invert">
                                    <p className="whitespace-pre-wrap text-xs leading-relaxed">
                                        {scoreData.analysis.split('Action Plan:')[0].replace('Gap: ', '')}
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="roadmap" className="mt-0 outline-none">
                                <ul className="list-disc pl-4 space-y-2 text-xs">
                                    {(scoreData.analysis.split('Action Plan:')[1] || '').split('\n').filter(s => s.trim().length > 3).map((step, idx) => (
                                        <li key={idx} className="text-muted-foreground">
                                            {step.replace(/^- /, '')}
                                        </li>
                                    ))}
                                </ul>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <div className="pt-2 flex gap-2">
                        <button
                            className="flex-1 bg-primary text-primary-foreground text-sm font-medium py-2 rounded-md hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            onClick={handleSave}
                            disabled={!user || saving || saved}
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> :
                                saved ? <CheckCircle size={16} /> :
                                    <Save size={16} />}
                            {saved ? 'Saved to Profile' : !user ? 'Login to Save' : 'Save Scan History'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
