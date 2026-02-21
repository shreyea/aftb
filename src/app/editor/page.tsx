"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { defaultSiteConfig, type SiteConfig } from "@/site.config";
import { ConfigProvider } from "@/components/ConfigContext";
import MobileFrame from "@/components/MobileFrame";
import FlowController from "@/components/FlowController";
import {
    Save, Share2, Eye, EyeOff, Loader2, Check, Copy, ExternalLink,
    Type, Image as ImageIcon, MessageCircle, Gift, Puzzle, Heart,
    ChevronDown, ChevronRight, LogOut
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
        <div className="border border-rose-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-5 py-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors text-left"
            >
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <span className="font-bold text-rose-900 text-sm flex-1">{title}</span>
                {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-rose-400" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-rose-400" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 space-y-4 border-t border-rose-50 pt-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="block text-xs font-bold text-rose-500 uppercase tracking-wider mb-1.5">{children}</label>;
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

    const baseClass = "w-full px-4 py-3 bg-rose-50/50 border-2 border-rose-100 rounded-xl text-rose-900 placeholder:text-rose-300 text-sm font-medium focus:outline-none focus:border-rose-300 focus:bg-white transition-all";

    if (multiline) {
        return (
            <textarea
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className={`${baseClass} resize-none`}
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
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4"
                >
                    <Loader2 className="w-10 h-10 text-rose-400 animate-spin mx-auto" />
                    <p className="text-rose-500 font-medium">Loading your template...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100">
            {/* Top Bar */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-rose-100 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-rose-500 fill-rose-200" />
                        <h1 className="font-extrabold text-rose-900 text-lg tracking-tight">Template Editor</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Save Status */}
                        <div className="flex items-center gap-1.5 text-xs font-bold mr-2">
                            {saving && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 text-rose-400">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Saving...
                                </motion.div>
                            )}
                            {saved && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 text-green-500">
                                    <Check className="w-3.5 h-3.5" />
                                    Saved
                                </motion.div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors lg:hidden"
                            title="Toggle preview"
                        >
                            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="p-2.5 rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
                {/* Editor Panel */}
                <div className={`flex-1 space-y-4 ${showPreview ? "hidden lg:block" : ""}`}>
                    {/* Images */}
                    <EditorSection title="Images" icon={<ImageIcon className="w-4 h-4 text-rose-500" />} defaultOpen>
                        {["Confession Image", "Memory Lane Image", "Puzzle Image"].map((label, i) => (
                            <div key={i}>
                                <FieldLabel>{label}</FieldLabel>
                                <TextInput
                                    value={config.images[i]}
                                    onChange={(v) => updateConfig(prev => {
                                        const images = [...prev.images] as [string, string, string];
                                        images[i] = v;
                                        return { ...prev, images };
                                    })}
                                    placeholder="Paste image URL"
                                />
                                {config.images[i] && (
                                    <div className="mt-2 rounded-xl overflow-hidden border border-rose-100 h-24">
                                        <img src={config.images[i]} alt={label} className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </EditorSection>

                    {/* Hero */}
                    <EditorSection title="Hero Section" icon={<Type className="w-4 h-4 text-rose-500" />}>
                        <div>
                            <FieldLabel>Typing Text</FieldLabel>
                            <TextInput
                                value={config.hero.typingText}
                                onChange={(v) => updateConfig(prev => ({ ...prev, hero: { ...prev.hero, typingText: v } }))}
                                placeholder="I know you're mad at me right now..."
                            />
                        </div>
                        <div>
                            <FieldLabel>Slider Text</FieldLabel>
                            <TextInput
                                value={config.hero.sliderText}
                                onChange={(v) => updateConfig(prev => ({ ...prev, hero: { ...prev.hero, sliderText: v } }))}
                                placeholder="Slide to hear me out"
                            />
                        </div>
                    </EditorSection>

                    {/* Confession */}
                    <EditorSection title="Confession" icon={<MessageCircle className="w-4 h-4 text-rose-500" />}>
                        <div>
                            <FieldLabel>Confession Text</FieldLabel>
                            <TextInput
                                value={config.confession.text}
                                onChange={(v) => updateConfig(prev => ({ ...prev, confession: { ...prev.confession, text: v } }))}
                                multiline
                            />
                        </div>
                        {config.confession.reasons.map((reason: string, i: number) => (
                            <div key={i}>
                                <FieldLabel>Reason {i + 1}</FieldLabel>
                                <TextInput
                                    value={reason}
                                    onChange={(v) => updateConfig(prev => {
                                        const reasons = [...prev.confession.reasons];
                                        reasons[i] = v;
                                        return { ...prev, confession: { ...prev.confession, reasons } };
                                    })}
                                />
                            </div>
                        ))}
                    </EditorSection>

                    {/* Memory Lane */}
                    <EditorSection title="Memory Lane" icon={<ImageIcon className="w-4 h-4 text-rose-500" />}>
                        <div>
                            <FieldLabel>Apology Message</FieldLabel>
                            <TextInput
                                value={config.memoryLane.apologyMessage}
                                onChange={(v) => updateConfig(prev => ({ ...prev, memoryLane: { apologyMessage: v } }))}
                                multiline
                            />
                        </div>
                    </EditorSection>

                    {/* Peace Offering */}
                    <EditorSection title="Peace Offering (Wheel)" icon={<Gift className="w-4 h-4 text-rose-500" />}>
                        {config.peaceOffering.bribes.map((bribe: { label: string; probability: number }, i: number) => (
                            <div key={i}>
                                <FieldLabel>Bribe {i + 1}</FieldLabel>
                                <TextInput
                                    value={bribe.label}
                                    onChange={(v) => updateConfig(prev => {
                                        const bribes = [...prev.peaceOffering.bribes];
                                        bribes[i] = { ...bribes[i], label: v };
                                        return { ...prev, peaceOffering: { ...prev.peaceOffering, bribes } };
                                    })}
                                />
                            </div>
                        ))}
                    </EditorSection>

                    {/* Puzzle */}
                    <EditorSection title="Puzzle Section" icon={<Puzzle className="w-4 h-4 text-rose-500" />}>
                        <div>
                            <FieldLabel>Final Plea Text</FieldLabel>
                            <TextInput
                                value={config.puzzle.finalPlea}
                                onChange={(v) => updateConfig(prev => ({ ...prev, puzzle: { finalPlea: v } }))}
                            />
                        </div>
                    </EditorSection>

                    {/* Verdict */}
                    <EditorSection title="Final Verdict" icon={<Heart className="w-4 h-4 text-rose-500" />}>
                        <div>
                            <FieldLabel>Forgive Button Text</FieldLabel>
                            <TextInput
                                value={config.verdict.forgiveText}
                                onChange={(v) => updateConfig(prev => ({ ...prev, verdict: { ...prev.verdict, forgiveText: v } }))}
                            />
                        </div>
                        <div>
                            <FieldLabel>Nope Button Text</FieldLabel>
                            <TextInput
                                value={config.verdict.nopeText}
                                onChange={(v) => updateConfig(prev => ({ ...prev, verdict: { ...prev.verdict, nopeText: v } }))}
                            />
                        </div>
                        <div>
                            <FieldLabel>WhatsApp Message</FieldLabel>
                            <TextInput
                                value={config.verdict.whatsappMessage}
                                onChange={(v) => updateConfig(prev => ({ ...prev, verdict: { ...prev.verdict, whatsappMessage: v } }))}
                                multiline
                            />
                        </div>
                        <div>
                            <FieldLabel>WhatsApp Number</FieldLabel>
                            <TextInput
                                value={config.verdict.whatsappNumber}
                                onChange={(v) => updateConfig(prev => ({ ...prev, verdict: { ...prev.verdict, whatsappNumber: v } }))}
                                placeholder="e.g. 919876543210"
                            />
                        </div>
                    </EditorSection>

                    {/* Publish Section */}
                    <div className="border-2 border-rose-200 rounded-2xl p-5 bg-white space-y-4">
                        <h3 className="font-extrabold text-rose-900 flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-rose-500" />
                            Publish & Share
                        </h3>

                        {!published ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handlePublish}
                                disabled={publishing}
                                className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-2 ${publishing
                                    ? "bg-rose-300 cursor-not-allowed"
                                    : "bg-rose-500 shadow-rose-200 hover:bg-rose-600"
                                    }`}
                            >
                                {publishing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-5 h-5" />
                                        Publish Template
                                    </>
                                )}
                            </motion.button>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span className="text-green-700 font-bold text-sm">Published!</span>
                                </div>

                                {slug && (
                                    <div className="bg-rose-50 rounded-xl p-3 flex items-center gap-2">
                                        <input
                                            readOnly
                                            value={`${typeof window !== "undefined" ? window.location.origin : ""}/view/${slug}`}
                                            className="flex-1 bg-transparent text-rose-800 text-sm font-medium outline-none truncate"
                                        />
                                        <button
                                            onClick={copyLink}
                                            className="p-2 rounded-lg bg-white text-rose-500 hover:bg-rose-100 transition-colors"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                        <a
                                            href={`/view/${slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg bg-white text-rose-500 hover:bg-rose-100 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handlePublish}
                                    disabled={publishing}
                                    className="w-full py-3 rounded-xl font-bold text-rose-500 border-2 border-rose-200 hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Update Published Version
                                </motion.button>
                            </div>
                        )}
                    </div>

                    {/* Spacer for mobile */}
                    <div className="h-4" />
                </div>

                {/* Preview Panel */}
                <div className={`lg:w-[420px] lg:sticky lg:top-20 lg:self-start ${showPreview ? "" : "hidden lg:block"}`}>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-rose-100 shadow-lg">
                        <div className="flex items-center justify-between mb-3 px-2">
                            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Live Preview</span>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        </div>
                        <div className="transform scale-[0.85] origin-top -mb-[15%]">
                            <ConfigProvider config={config}>
                                <MobileFrame>
                                    <FlowController />
                                </MobileFrame>
                            </ConfigProvider>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
