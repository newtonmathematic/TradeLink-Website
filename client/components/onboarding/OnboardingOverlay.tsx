import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessService, type BusinessProfile } from "@/services/businessService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, ArrowLeft, Building2, Handshake, Globe, Instagram, Facebook, Linkedin, Twitter, Youtube, Music2, CheckCircle2 } from "lucide-react";

interface OnboardingOverlayProps {
  onClose: () => void;
}

export default function OnboardingOverlay({ onClose }: OnboardingOverlayProps) {
  const { user } = useAuth();
  const bizId = user ? `biz_${user.id}` : "";
  const initialBusiness = useMemo(() => (bizId ? BusinessService.getBusinessById(bizId) : null), [bizId]);

  const [step, setStep] = useState(0); // 0=intro, 1..5=questions, 6=done
  const totalSteps = 6; // excluding final confirmation slide for progress

  const [description, setDescription] = useState(initialBusiness?.description || "");
  const [offers, setOffers] = useState<string[]>([...(initialBusiness?.partnershipTypes || [])]);
  const [seeking, setSeeking] = useState<string[]>([...(initialBusiness?.seekingTypes || [])]);
  const [goals, setGoals] = useState<string[]>([...(initialBusiness?.matchCriteria || [])]);
  const [website, setWebsite] = useState(initialBusiness?.website || "");
  const [social, setSocial] = useState<Record<string, string>>({ ...(initialBusiness?.socialMedia || {}) });

  const goalOptions = [
    "Increase sales",
    "Expand reach",
    "Reduce costs",
    "Employee perks",
    "Innovation",
  ];

  const saveBusiness = () => {
    if (!user || !bizId) return;
    const existing = BusinessService.getBusinessById(bizId);
    if (!existing) return;
    const updated: BusinessProfile = {
      ...existing,
      description: description || existing.description,
      partnershipTypes: offers.filter(Boolean),
      seekingTypes: seeking.filter(Boolean),
      matchCriteria: goals.filter(Boolean),
      website: website || undefined,
      socialMedia: Object.fromEntries(Object.entries(social).filter(([_, v]) => !!v && v.trim().length > 0)),
    };
    try { BusinessService.upsertBusiness(updated); } catch {}
  };

  const handleNext = () => {
    if (step < totalSteps) {
      saveBusiness();
      setStep((s) => s + 1);
    }
  };
  const handleBack = () => {
    if (step > 0) {
      saveBusiness();
      setStep((s) => s - 1);
    }
  };

  useEffect(() => {
    // Autosave when fields change after a small debounce
    const t = setTimeout(saveBusiness, 400);
    return () => clearTimeout(t);
  }, [description, offers, seeking, goals, website, social]);

  useEffect(() => {
    if (step === totalSteps) {
      // Final confirmation screen, mark completed and auto close after delay
      try {
        if (user) {
          localStorage.setItem(`tradelink_onboarding_completed_${user.id}`, "1");
          localStorage.removeItem(`tradelink_onboarding_pending_${user.id}`);
        }
      } catch {}
      const t = setTimeout(onClose, 1400);
      return () => clearTimeout(t);
    }
  }, [step, user, onClose]);

  const addItem = (list: string[], setList: (v: string[]) => void) => setList([...list, ""]);
  const updateItem = (list: string[], setList: (v: string[]) => void, idx: number, val: string) => setList(list.map((x, i) => (i === idx ? val : x)));
  const removeItem = (list: string[], setList: (v: string[]) => void, idx: number) => setList(list.filter((_, i) => i !== idx));

  const progressPct = Math.min(100, Math.max(0, (step / totalSteps) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <div className="relative h-full flex flex-col">
        {/* Top progress */}
        <div className="p-4">
          <Progress value={progressPct} className="h-2" />
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full w-full relative">
            {/* Slides container */}
            <div
              className="h-full w-full flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${step * 100}%)` }}
            >
              {/* Intro */}
              <div className="min-w-full p-6 flex items-center justify-center">
                <div className="max-w-2xl text-center">
                  <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h1 className="text-3xl font-bold mb-3">Welcome to TradeLink</h1>
                  <p className="text-gray-700 text-lg">
                    Before you continue, please answer a few quick onboarding questions so we can personalize your TradeLink experience and help you connect with the right partners.
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="min-w-full p-6 flex items-center justify-center">
                <Card className="w-full max-w-3xl border-0 shadow-xl">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-6 w-6 text-blue-600" />
                      <h2 className="text-xl font-semibold">Business Description</h2>
                    </div>
                    <p className="text-sm text-gray-600">Tell us who you are and what you do.</p>
                    <Textarea rows={6} value={description} onChange={(e)=> setDescription(e.target.value)} placeholder="Write a short paragraph about your business" />
                  </CardContent>
                </Card>
              </div>

              {/* What we offer */}
              <div className="min-w-full p-6 flex items-center justify-center">
                <Card className="w-full max-w-3xl border-0 shadow-xl">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <Handshake className="h-6 w-6 text-green-600" />
                      <h2 className="text-xl font-semibold">What We Offer</h2>
                    </div>
                    <p className="text-sm text-gray-600">List your key products, services, or benefits.</p>
                    <div className="space-y-3">
                      {offers.map((val, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input value={val} onChange={(e)=> updateItem(offers, setOffers, idx, e.target.value)} placeholder="Add an offering" />
                          <Button variant="outline" onClick={()=> removeItem(offers, setOffers, idx)}>Remove</Button>
                        </div>
                      ))}
                      <Button variant="secondary" onClick={()=> addItem(offers, setOffers)}>Add another</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* What we're looking for */}
              <div className="min-w-full p-6 flex items-center justify-center">
                <Card className="w-full max-w-3xl border-0 shadow-xl">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                      <h2 className="text-xl font-semibold">What We're Looking For</h2>
                    </div>
                    <p className="text-sm text-gray-600">Which partnerships, services, or opportunities are you seeking?</p>
                    <div className="space-y-3">
                      {seeking.map((val, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input value={val} onChange={(e)=> updateItem(seeking, setSeeking, idx, e.target.value)} placeholder="Add what you're seeking" />
                          <Button variant="outline" onClick={()=> removeItem(seeking, setSeeking, idx)}>Remove</Button>
                        </div>
                      ))}
                      <Button variant="secondary" onClick={()=> addItem(seeking, setSeeking)}>Add another</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Goals */}
              <div className="min-w-full p-6 flex items-center justify-center">
                <Card className="w-full max-w-3xl border-0 shadow-xl">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-amber-600" />
                      <h2 className="text-xl font-semibold">Partnership Goals</h2>
                    </div>
                    <p className="text-sm text-gray-600">Select your top goals on TradeLink.</p>
                    <div className="flex flex-wrap gap-2">
                      {goalOptions.map((g) => {
                        const active = goals.includes(g);
                        return (
                          <button
                            key={g}
                            onClick={() => setGoals(active ? goals.filter(x=> x!==g) : [...goals, g])}
                            className={`px-3 py-1 rounded-full border transition ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Links */}
              <div className="min-w-full p-6 flex items-center justify-center">
                <Card className="w-full max-w-3xl border-0 shadow-xl">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <Globe className="h-6 w-6 text-sky-600" />
                      <h2 className="text-xl font-semibold">Website & Social Links (Optional)</h2>
                    </div>
                    <div className="grid gap-3">
                      <Input placeholder="Website URL" value={website} onChange={(e)=> setWebsite(e.target.value)} />
                      {[
                        { key: "instagram", label: "Instagram", Icon: Instagram },
                        { key: "youtube", label: "YouTube", Icon: Youtube },
                        { key: "tiktok", label: "TikTok", Icon: Music2 },
                        { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
                        { key: "facebook", label: "Facebook", Icon: Facebook },
                        { key: "twitter", label: "Twitter", Icon: Twitter },
                      ].map(({ key, label, Icon }) => (
                        <div key={key} className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <Input placeholder={`${label} URL`} value={social[key] || ""} onChange={(e)=> setSocial({ ...social, [key]: e.target.value })} />
                          {!!social[key] && (
                            <Button variant="ghost" size="sm" onClick={()=> { const { [key]: _omit, ...rest } = social; setSocial(rest); }}>Clear</Button>
                          )}
                        </div>
                      ))}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        <Input placeholder="Other platform name" value={(social as any)._customName || ""} onChange={(e)=> setSocial({ ...(social as any), _customName: e.target.value } as any)} />
                        <div className="flex items-center gap-2">
                          <Input placeholder="Other platform URL" value={(social as any)._customUrl || ""} onChange={(e)=> setSocial({ ...(social as any), _customUrl: e.target.value } as any)} />
                          <Button onClick={()=> {
                            const name = ((social as any)._customName || "").trim();
                            const url = ((social as any)._customUrl || "").trim();
                            if (!name || !url) return;
                            const s = { ...(social as any) } as Record<string, string>;
                            delete (s as any)._customName;
                            delete (s as any)._customUrl;
                            setSocial({ ...s, [name.toLowerCase()]: url });
                          }}>Add</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Confirmation */}
              <div className="min-w-full p-6 flex items-center justify-center">
                <div className="max-w-2xl text-center">
                  <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center text-white shadow-lg">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">All set!</h2>
                  <p className="text-gray-700">
                    Your information has been saved and your profile is now ready to help you connect with the best business partners. You can update these details anytime in your settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="p-4 border-t bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step===0}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps + 1 }).map((_, i) => (
                <span key={i} className={`h-2 w-2 rounded-full ${i===step ? 'bg-blue-600' : 'bg-gray-300'}`} />
              ))}
            </div>
            <Button onClick={handleNext}>
              {step < totalSteps ? (
                <>
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>Close</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
