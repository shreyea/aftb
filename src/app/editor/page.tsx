"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { defaultSiteConfig, type SiteConfig } from "@/site.config";
import { ConfigProvider } from "@/components/ConfigContext";
import MobileFrame from "@/components/MobileFrame";
import FlowController from "@/components/FlowController";
import ImageUpload from "@/components/ImageUpload";
import {
    Save, Share2, Eye, EyeOff, Loader2, Check, Copy, ExternalLink,
    Type, MessageCircle, Gift, Puzzle, Heart,
    ChevronDown, ChevronRight, LogOut, Sparkles
} from "lucide-react";

// Deep merge utility for partial config updates
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const result = { ...target };
    for (const key in source) {
        if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
            result[key] = deepMerge(
                (target[key] as Record<string, unknown>) || {},
                source[key] as Record<string, unknown>
            );
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

interface EditorSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function EditorSection({ title, icon, children, defaultOpen = false }: EditorSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-rose-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-5 py-5 flex items-center gap-3 hover:bg-rose-50/30 transition-colors text-left"
            >
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 text-rose-500">
                    {icon}
                </div>
                <span className="font-bold text-rose-900 text-base flex-1">{title}</span>
                {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-rose-300" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-rose-300" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-6 space-y-6 border-t border-rose-50 pt-5">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="block text-xs font-black text-rose-400 uppercase tracking-[0.1em] mb-2">{children}</label>;
}

function TextInput({
    value,
    onChange,
    placeholder,
    multiline = false,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    multiline?: boolean;
}) {
    const [localValue, setLocalValue] = useState(value);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

    useEffect(() => { setLocalValue(value); }, [value]);

    const handleChange = (v: string) => {
        setLocalValue(v);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onChange(v), 300);
    };

    const baseClass = "w-full px-5 py-4 bg-rose-50/40 border-2 border-rose-100/50 rounded-2xl text-rose-900 placeholder:text-rose-200 text-sm font-semibold focus:outline-none focus:border-rose-300 focus:bg-white transition-all shadow-inner-sm";

    if (multiline) {
        return (
            <textarea
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                rows={4}
                className={`${baseClass} resize-none leading-relaxed`}
            />
        );
    }
    return (
        <input
            type="text"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className={baseClass}
        />
    );
}

export default function EditorPage() {
    const router = useRouter();
    const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
    const [projectId, setProjectId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [published, setPublished] = useState(false);
    const [slug, setSlug] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

    // Load project data
    useEffect(() => {
        const id = sessionStorage.getItem("sorry_project_id");
        if (!id) {
            router.push("/login");
            return;
        }
        setProjectId(id);

        (async () => {
            const { data } = await supabase
                .from("projects")
                .select("data, is_published, slug")
                .eq("id", id)
                .eq("template_type", "sorry")
                .single();

            if (data) {
                if (data.data && typeof data.data === "object") {
                    const merged = deepMerge(
                        defaultSiteConfig as unknown as Record<string, unknown>,
                        data.data as Record<string, unknown>
                    );
                    setConfig(merged as unknown as SiteConfig);
                }
                if (data.is_published) setPublished(true);
                if (data.slug) setSlug(data.slug);
            }
            setLoading(false);
        })();
    }, [router]);

    // Auto-save (debounced)
    const saveToSupabase = useCallback(async (newConfig: SiteConfig) => {
        if (!projectId) return;
        setSaving(true);
        setSaved(false);

        await supabase
            .from("projects")
            .update({ data: newConfig, updated_at: new Date().toISOString() })
            .eq("id", projectId)
            .eq("template_type", "sorry");

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }, [projectId]);

    const updateConfig = useCallback((updater: (prev: SiteConfig) => SiteConfig) => {
        setConfig(prev => {
            const next = updater(prev);
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => saveToSupabase(next), 1500);
            return next;
        });
    }, [saveToSupabase]);

    const handlePublish = async () => {
        if (!projectId) return;
        setPublishing(true);

        // Save current config first
        await supabase
            .from("projects")
            .update({
                data: config,
                is_published: true,
                updated_at: new Date().toISOString(),
            })
            .eq("id", projectId)
            .eq("template_type", "sorry");

        // Fetch the slug (may be auto-generated)
        const { data } = await supabase
            .from("projects")
            .select("slug")
            .eq("id", projectId)
            .eq("template_type", "sorry")
            .single();

        if (data?.slug) {
            setSlug(data.slug);
        }
        setPublished(true);
        setPublishing(false);
    };

    const copyLink = () => {
        if (!slug) return;
        const url = `${window.location.origin}/view/${slug}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = () => {
        sessionStorage.removeItem("sorry_project_id");
        sessionStorage.removeItem("sorry_email");
        sessionStorage.removeItem("sorry_code");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-rose-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-rose-200 blur-2xl opacity-40 animate-pulse" />
                        <Loader2 className="w-12 h-12 text-rose-500 animate-spin relative z-10" />
                    </div>
                    <p className="text-rose-900 font-black uppercase tracking-[0.2em] text-xs">Preparing Editor</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Header */}
            <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-rose-50 px-4 py-4 sm:px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-rose-50 p-2 rounded-xl">
                            <Sparkles className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-rose-900 leading-none">Customize</h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                {saving ? (
                                    <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest flex items-center gap-1">
                                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> Saving
                                    </span>
                                ) : (
                                    <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${saved ? "text-green-500" : "text-rose-200"}`}>
                                        <Check className="w-2.5 h-2.5" /> {saved ? "Saved" : "Cloud Sync Ready"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-3 bg-rose-50 rounded-2xl text-rose-400 hover:text-rose-600 active:scale-95 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="max-w-lg mx-auto pb-32">
                <div className="p-4 sm:p-6 space-y-4">
                    {/* Images Overhaul */}
                    <EditorSection title="Photos" icon={<Heart className="w-5 h-5" />} defaultOpen>
                        <ImageUpload
                            label="Landing Photo (Hero)"
                            value={config.images[0]}
                            onChange={(url) => updateConfig(prev => {
                                const images = [...prev.images] as [string, string, string];
                                images[0] = url;
                                return { ...prev, images };
                            })}
                        />
                        <ImageUpload
                            label="Our Memory Photo"
                            value={config.images[1]}
                            onChange={(url) => updateConfig(prev => {
                                const images = [...prev.images] as [string, string, string];
                                images[1] = url;
                                return { ...prev, images };
                            })}
                        />
                        <ImageUpload
                            label="Puzzle Photo"
                            value={config.images[2]}
                            onChange={(url) => updateConfig(prev => {
                                const images = [...prev.images] as [string, string, string];
                                images[2] = url;
                                return { ...prev, images };
                            })}
                        />
                    </EditorSection>

                    {/* Intro Section */}
                    <EditorSection title="The Hook" icon={<Type className="w-5 h-5" />}>
                        <div>
                            <FieldLabel>Typing Message</FieldLabel>
                            <TextInput
                                value={config.hero.typingText}
                                onChange={(v) => updateConfig(prev => ({ ...prev, hero: { ...prev.hero, typingText: v } }))}
                                placeholder="I know you're mad..."
                            />
                        </div>
                        <div>
                            <FieldLabel>Slider Prompt</FieldLabel>
                            <TextInput
                                value={config.hero.sliderText}
                                onChange={(v) => updateConfig(prev => ({ ...prev, hero: { ...prev.hero, sliderText: v } }))}
                                placeholder="Slide to hear me out"
                            />
                        </div>
                    </EditorSection>

                    {/* Confession Section */}
                    <EditorSection title="The Apology" icon={<MessageCircle className="w-5 h-5" />}>
                        <div>
                            <FieldLabel>Inner Heart Message</FieldLabel>
                            <TextInput
                                value={config.confession.text}
                                onChange={(v) => updateConfig(prev => ({ ...prev, confession: { ...prev.confession, text: v } }))}
                                multiline
                            />
                        </div>
                        <div className="space-y-4">
                            <p className="text-[11px] font-bold text-rose-300 uppercase tracking-widest pl-1">3 Things I&apos;m Sorry For:</p>
                            {config.confession.reasons.map((reason: string, i: number) => (
                                <TextInput
                                    key={i}
                                    value={reason}
                                    onChange={(v) => updateConfig(prev => {
                                        const reasons = [...prev.confession.reasons];
                                        reasons[i] = v;
                                        return { ...prev, confession: { ...prev.confession, reasons } };
                                    })}
                                    placeholder={`Reason ${i + 1}`}
                                />
                            ))}
                        </div>
                    </EditorSection>

                    {/* Memory Lane */}
                    <EditorSection title="Memory Lane" icon={<Heart className="w-5 h-5" />}>
                        <div>
                            <FieldLabel>Message for Us</FieldLabel>
                            <TextInput
                                value={config.memoryLane.apologyMessage}
                                onChange={(v) => updateConfig(prev => ({ ...prev, memoryLane: { apologyMessage: v } }))}
                                multiline
                            />
                        </div>
                    </EditorSection>

                    {/* Peace Offering */}
                    <EditorSection title="The Bribe" icon={<Gift className="w-5 h-5" />}>
                        <div className="space-y-4">
                            <p className="text-[11px] font-bold text-rose-300 uppercase tracking-widest pl-1">Wheel of Rewards (6 Options):</p>
                            {config.peaceOffering.bribes.map((bribe: { label: string; probability: number }, i: number) => (
                                <TextInput
                                    key={i}
                                    value={bribe.label}
                                    onChange={(v) => updateConfig(prev => {
                                        const bribes = [...prev.peaceOffering.bribes];
                                        bribes[i] = { ...bribes[i], label: v };
                                        return { ...prev, peaceOffering: { ...prev.peaceOffering, bribes } };
                                    })}
                                    placeholder={`Reward ${i + 1}`}
                                />
                            ))}
                        </div>
                    </EditorSection>

                    {/* Verdict & WhatsApp */}
                    <EditorSection title="The Reply" icon={<Sparkles className="w-5 h-5" />}>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <FieldLabel>Yes Button</FieldLabel>
                                <TextInput
                                    value={config.verdict.forgiveText}
                                    onChange={(v) => updateConfig(prev => ({ ...prev, verdict: { ...prev.verdict, forgiveText: v } }))}
                                />
                            </div>
                            <div>
                                <FieldLabel>No Button</FieldLabel>
                                <TextInput
                                    value={config.verdict.nopeText}
                                    onChange={(v) => updateConfig(prev => ({ ...prev, verdict: { ...prev.verdict, nopeText: v } }))}
                                />
                            </div>
                        </div>
                        <div>
                            <FieldLabel>WhatsApp Number (w/ Country Code)</FieldLabel>
                            <TextInput
                                value={config.verdict.whatsappNumber}
                                onChange={(v) => updateConfig(prev => ({ ...prev, verdict: { ...prev.verdict, whatsappNumber: v } }))}
                                placeholder="e.g. 919876543210"
                            />
                        </div>
                        <div>
                            <FieldLabel>Ready-made Text Message</FieldLabel>
                            <TextInput
                                value={config.verdict.whatsappMessage}
                                onChange={(v) => updateConfig(prev => ({ ...prev, verdict: { ...prev.verdict, whatsappMessage: v } }))}
                                multiline
                            />
                        </div>
                    </EditorSection>

                    {/* Publish */}
                    <div className="pt-8 px-2">
                        {!published ? (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePublish}
                                disabled={publishing}
                                className={`w-full py-5 rounded-[2rem] font-black text-white shadow-2xl flex items-center justify-center gap-3 transition-all text-lg ${publishing
                                        ? "bg-rose-200 cursor-not-allowed"
                                        : "bg-rose-500 shadow-rose-200 active:bg-rose-600"
                                    }`}
                            >
                                {publishing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Share2 className="w-6 h-6" />}
                                {publishing ? "MAKING IT LIVE..." : "PUBLISH MY APOLOGY"}
                            </motion.button>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-green-500 text-white p-5 rounded-[2rem] flex items-center justify-center gap-3 font-black shadow-xl shadow-green-100">
                                    <Check className="w-6 h-6" />
                                    LIVE & READY!
                                </div>

                                {slug && (
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-rose-50 p-6 rounded-[2rem] border-2 border-rose-100 space-y-4 text-center">
                                            <p className="text-xs font-black text-rose-400 uppercase tracking-widest leading-loose">
                                                Your Special Link:
                                            </p>
                                            <p className="text-rose-900 font-bold underline decoration-2 decoration-rose-200 underline-offset-8 break-all">
                                                {`${window.location.origin}/view/${slug}`}
                                            </p>
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={copyLink}
                                                    className="flex-1 py-4 bg-white rounded-2xl border-2 border-rose-200 text-rose-600 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                                                >
                                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                    {copied ? "COPIED" : "COPY LINK"}
                                                </button>
                                                <a
                                                    href={`/view/${slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-4 bg-rose-500 rounded-2xl text-white shadow-lg active:scale-95 transition-all"
                                                >
                                                    <ExternalLink className="w-6 h-6" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar — Preview Toggle */}
            <div className="fixed bottom-0 left-0 right-0 p-6 z-[100] bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowPreview(!showPreview)}
                        className="w-full py-4 bg-rose-950 text-white rounded-2xl font-black shadow-2xl flex items-center justify-center gap-3 active:bg-black transition-all group"
                    >
                        {showPreview ? <EyeOff className="w-5 h-5 group-hover:scale-110 transition-transform" /> : <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                        {showPreview ? "CONTINUE EDITING" : "PREVIEW TEMPLATE"}
                    </motion.button>
                </div>
            </div>

            {/* Preview Modal — full-page PWA style */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-stretch justify-center"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="w-full max-w-md bg-white flex flex-col shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-5 py-3 border-b border-rose-50 bg-white shrink-0">
                                <div>
                                    <h3 className="font-extrabold text-rose-900 text-sm">Live Preview</h3>
                                    <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Updates in real-time</p>
                                </div>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="px-4 py-2 bg-rose-50 rounded-2xl text-rose-700 font-bold text-sm active:scale-95 transition-all"
                                >
                                    CLOSE
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <ConfigProvider config={config}>
                                    <MobileFrame>
                                        <FlowController />
                                    </MobileFrame>
                                </ConfigProvider>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
