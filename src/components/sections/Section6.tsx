"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "@/components/ConfigContext";
import confetti from "canvas-confetti";
import { Heart, MessageCircle, PartyPopper, ArrowUpRight, RotateCcw } from "lucide-react";

export default function Section6({ onRestart }: { onRestart?: () => void }) {
    const config = useConfig();
    const [isForgiven, setIsForgiven] = useState(false);
    const [nopePosition, setNopePosition] = useState({ x: 0, y: 0 });
    const [nopeAttempts, setNopeAttempts] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleNopeHover = () => {
        if (isForgiven) return;

        const multiplier = Math.min(1 + nopeAttempts * 0.2, 2.5);
        const x = (Math.random() - 0.5) * 300 * multiplier;
        const y = (Math.random() - 0.5) * 300 * multiplier;

        setNopePosition({ x, y });
        setNopeAttempts((prev) => prev + 1);
    };

    const handleForgive = () => {
        setIsForgiven(true);

        const end = Date.now() + 6 * 1000;
        const colors = ["#FDA4AF", "#F43F5E", "#E11D48", "#FB7185"];

        (function frame() {
            confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
            confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
    };

    const openWhatsApp = () => {
        const message = encodeURIComponent(config.verdict.whatsappMessage);
        const number = config.verdict.whatsappNumber;
        window.open(`https://wa.me/${number}?text=${message}`, "_blank");
    };

    // Fixed heart sizes to avoid dynamic Tailwind class issues
    const heartSizes = [16, 20, 24, 16, 20, 24, 16, 20, 24, 16, 20, 24, 16, 20, 24];

    return (
        <div
            ref={containerRef}
            className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-rose-50/20"
        >
            <AnimatePresence mode="wait">
                {!isForgiven ? (
                    <motion.div
                        key="question"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                        className="text-center space-y-12 w-full z-10"
                    >
                        <div className="space-y-6">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-rose-300 blur-2xl opacity-20 animate-pulse" />
                                    <Heart className="w-24 h-24 text-rose-500 fill-rose-200 relative z-10" />
                                </div>
                            </motion.div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-extrabold text-rose-900 tracking-tight">
                                    The Final Verdict
                                </h2>
                                <p className="text-rose-500 font-semibold italic text-sm px-6 leading-relaxed">
                                    &quot;I&apos;ve shared my heart, my memories, and even a bribe... what do you say?&quot;
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5 w-full relative pt-10">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleForgive}
                                className="w-full py-5 bg-rose-500 text-white rounded-3xl font-extrabold shadow-2xl shadow-rose-200 text-xl z-20 relative overflow-hidden group"
                            >
                                <span className="relative z-10">{config.verdict.forgiveText} ❤️</span>
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    whileHover={{ x: "100%" }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                />
                            </motion.button>

                            <motion.div
                                animate={{ x: nopePosition.x, y: nopePosition.y }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="z-10"
                            >
                                <button
                                    onMouseEnter={handleNopeHover}
                                    onTouchStart={handleNopeHover}
                                    className="w-full py-4 bg-white/80 backdrop-blur-sm text-rose-300 rounded-2xl font-bold border border-rose-100 shadow-sm transition-colors hover:text-rose-400"
                                >
                                    {config.verdict.nopeText}
                                </button>
                            </motion.div>

                            {nopeAttempts > 3 && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.6 }}
                                    className="text-[10px] text-rose-300 font-bold uppercase tracking-widest"
                                >
                                    You&apos;re trying to say yes, right? 😉
                                </motion.p>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center space-y-10 flex flex-col items-center w-full"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.4, 1], rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                className="absolute -inset-8 bg-gradient-to-tr from-rose-200 to-rose-100 rounded-full blur-3xl opacity-40"
                            />
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12 }}
                            >
                                <PartyPopper className="w-32 h-32 text-rose-500 relative z-10 filter drop-shadow-xl" />
                            </motion.div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-extrabold text-rose-900 tracking-tight leading-none px-4">
                                Best. Decision. Ever.
                            </h2>
                            <p className="text-rose-600 font-medium px-8 leading-relaxed">
                                I promise to make every day as special as this one. Let&apos;s go get that prize!
                            </p>
                        </div>

                        <div className="space-y-3 w-full px-4">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={openWhatsApp}
                                className="w-full py-5 bg-green-500 text-white rounded-[2rem] font-black shadow-2xl shadow-green-200 flex items-center justify-center gap-3 text-lg border-b-4 border-green-700"
                            >
                                <MessageCircle className="w-6 h-6 fill-current" />
                                SEND FORGIVENESS
                                <ArrowUpRight className="w-5 h-5 opacity-70" />
                            </motion.button>

                            {/* Watch Again Button */}
                            {onRestart && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onRestart}
                                    className="w-full py-4 bg-white border-2 border-rose-200 text-rose-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    Watch It Again
                                </motion.button>
                            )}

                            <p className="text-[10px] text-rose-300 font-black uppercase tracking-[0.2em] pt-2">
                                Premium Template by Crafting Factory
                            </p>
                        </div>

                        {/* Floating Hearts */}
                        {heartSizes.map((size, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: (Math.random() - 0.5) * 400, y: 400 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    y: -800,
                                    rotate: [0, 90, -90, 0],
                                    scale: [0.5, 1.5, 0.5],
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 4,
                                    repeat: Infinity,
                                    delay: Math.random() * 5,
                                    ease: "easeInOut",
                                }}
                                className="absolute pointer-events-none"
                                style={{ zIndex: 0 }}
                            >
                                <Heart
                                    style={{ width: size, height: size }}
                                    className="text-rose-300 fill-current opacity-40"
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
