"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "@/components/ConfigContext";
import confetti from "canvas-confetti";
import { Gift, Sparkles, RefreshCcw, ArrowUpRight } from "lucide-react";

export default function Section4({ onNext }: { onNext: () => void }) {
    const config = useConfig();
    const [isSpinning, setIsSpinning] = useState(false);
    const [resultIndex, setResultIndex] = useState<number | null>(null);
    const [hasSpun, setHasSpun] = useState(false);
    const bribes = config.peaceOffering.bribes;

    const spin = async () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setResultIndex(null);

        // Visual spinning with slowing effect
        const totalSteps = 25;
        for (let i = 0; i < totalSteps; i++) {
            setResultIndex(Math.floor(Math.random() * bribes.length));
            // Slow down towards the end for tension
            const delay = 80 + (i / totalSteps) * 200;
            await new Promise((r) => setTimeout(r, delay));
        }

        // Pick a truly random winner
        const randomWinner = Math.floor(Math.random() * bribes.length);
        setResultIndex(randomWinner);
        setIsSpinning(false);
        setHasSpun(true);

        // Confetti burst
        const end = Date.now() + 1200;
        const colors = ["#FDA4AF", "#F43F5E", "#FB7185"];
        (function frame() {
            confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
            confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 min-h-[calc(100dvh-5rem)]">
            <div className="text-center space-y-3">
                <motion.div
                    initial={{ rotate: -20, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="flex justify-center"
                >
                    <div className="bg-rose-100 p-2.5 rounded-2xl shadow-sm">
                        <Gift className="w-8 h-8 text-rose-500" />
                    </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-rose-800 italic">Peace Offering</h2>
                <p className="text-rose-500 text-sm font-medium">Spin to see what I&apos;m offering...</p>
            </div>

            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Outer Glowing Ring */}
                <motion.div
                    animate={{ rotate: isSpinning ? 360 * 4 : 0 }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                    className="absolute inset-0 border-[3px] border-rose-100 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,113,133,0.1)]"
                >
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-rose-200 rounded-full shadow-sm"
                            style={{ transform: `rotate(${i * 30}deg) translateY(-116px)` }}
                        />
                    ))}
                </motion.div>

                {/* Center Slot Machine Display */}
                <div className="w-48 h-48 bg-white rounded-3xl shadow-2xl border-4 border-rose-50 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-rose-50/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-rose-50/50 to-transparent" />

                    <AnimatePresence mode="wait">
                        {resultIndex !== null ? (
                            <motion.div
                                key={resultIndex + (isSpinning ? "-spin" : "-done")}
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                className="flex flex-col items-center space-y-4 relative z-10"
                            >
                                <motion.div
                                    animate={{ scale: isSpinning ? [1, 1.1, 1] : 1 }}
                                    transition={{ repeat: Infinity, duration: 0.5 }}
                                >
                                    <Sparkles className="w-10 h-10 text-rose-400" />
                                </motion.div>
                                <h3 className="text-xl font-black text-rose-900 leading-tight uppercase tracking-tight">
                                    {bribes[resultIndex].label}
                                </h3>
                            </motion.div>
                        ) : (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                <RefreshCcw className="w-12 h-12 text-rose-200" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="w-full space-y-5">
                <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98, translateY: 0 }}
                    onClick={spin}
                    disabled={isSpinning}
                    className={`w-full py-5 rounded-2xl font-black shadow-2xl transition-all uppercase tracking-widest text-sm ${isSpinning
                        ? "bg-rose-100 text-rose-300 cursor-not-allowed"
                        : "bg-rose-500 text-white shadow-rose-200"
                        }`}
                >
                    {isSpinning ? "Crossing fingers..." : hasSpun ? "Spin Again!" : "Spin for a Bribe"}
                </motion.button>

                <AnimatePresence>
                    {hasSpun && !isSpinning && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <button
                                onClick={onNext}
                                className="flex items-center gap-2 text-rose-500 font-bold hover:text-rose-600 transition-colors py-2 px-6 rounded-full bg-rose-50/50"
                            >
                                That sounds fair <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
