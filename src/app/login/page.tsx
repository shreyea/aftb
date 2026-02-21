"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Heart, Mail, Key, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [templateCode, setTemplateCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const trimmedEmail = email.trim().toLowerCase();
        const trimmedCode = templateCode.trim();

        if (!trimmedEmail || !trimmedCode) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            const { data, error: dbError } = await supabase
                .from("projects")
                .select("id, data, is_published, slug, editable_until")
                .eq("owner_email", trimmedEmail)
                .eq("template_code", trimmedCode)
                .eq("template_type", "sorry")
                .single();

            if (dbError || !data) {
                setError("No matching template found. Check your email and code.");
                setLoading(false);
                return;
            }

            // Check if still editable
            if (data.editable_until && new Date(data.editable_until) < new Date()) {
                setError("This template's editing period has expired.");
                setLoading(false);
                return;
            }

            // Store project info in sessionStorage
            sessionStorage.setItem("sorry_project_id", data.id);
            sessionStorage.setItem("sorry_email", trimmedEmail);
            sessionStorage.setItem("sorry_code", trimmedCode);

            router.push("/editor");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-32 -right-32 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-3xl"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-rose-100/50 border border-rose-100/50 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-b from-rose-50/80 to-transparent pt-12 pb-8 px-8 text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                            className="mb-6 inline-block"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-rose-200 blur-2xl opacity-30 animate-pulse" />
                                <div className="bg-rose-100 p-4 rounded-2xl relative">
                                    <Heart className="w-10 h-10 text-rose-500 fill-rose-200" />
                                </div>
                            </div>
                        </motion.div>
                        <h1 className="text-2xl font-extrabold text-rose-900 tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-rose-500 text-sm font-medium mt-2">
                            Enter your details to customize your apology
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-rose-500 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email"
                                    className="w-full pl-12 pr-4 py-4 bg-rose-50/50 border-2 border-rose-100 rounded-2xl text-rose-900 placeholder:text-rose-300 font-medium focus:outline-none focus:border-rose-300 focus:bg-white transition-all"
                                    autoComplete="email"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-rose-500 transition-colors">
                                    <Key className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={templateCode}
                                    onChange={(e) => setTemplateCode(e.target.value)}
                                    placeholder="Template code"
                                    className="w-full pl-12 pr-4 py-4 bg-rose-50/50 border-2 border-rose-100 rounded-2xl text-rose-900 placeholder:text-rose-300 font-medium focus:outline-none focus:border-rose-300 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium px-4 py-3 rounded-xl"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02, translateY: loading ? 0 : -2 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-3 transition-all ${loading
                                    ? "bg-rose-300 cursor-not-allowed shadow-none"
                                    : "bg-rose-500 shadow-rose-200 hover:bg-rose-600"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    Open My Template
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>

                <p className="text-center mt-6 text-rose-300 text-[11px] font-bold uppercase tracking-[0.15em]">
                    Premium Template by Crafting Factory
                </p>
            </motion.div>
        </div>
    );
}
