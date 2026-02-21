"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "@/components/ConfigContext";
import ScratchCard from "../ScratchCard";
import { ChevronDown, AlertCircle, Sparkles } from "lucide-react";

export default function Section2({ onNext }: { onNext: () => void }) {
    const config = useConfig();
    const [scratched, setScratched] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    return (
        <div className="flex-1 flex flex-col items-center py-8 px-6 space-y-8 min-h-[calc(100dvh-5rem)] overflow-y-auto">
            <div className="text-center space-y-2">
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-rose-800 italic"
                >
                    The Confession
                </motion.h2>

            </div>

            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-200 to-rose-100 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <ScratchCard
                    image={config.images[0]}
                    width={300}
                    height={200}
                    onComplete={() => setScratched(true)}
                />
            </div>

            <AnimatePresence>
                {scratched && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-6"
                    >
                        <div className="bg-rose-50/80 backdrop-blur-sm p-5 rounded-2xl border border-rose-100 flex gap-4 shadow-sm">
                            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                                <AlertCircle className="w-6 h-6 text-rose-500" />
                            </div>
                            <p className="text-rose-800 text-sm leading-relaxed font-medium">
                                {config.confession.text}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {config.confession.reasons.map((reason: string, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border border-rose-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <button
                                        onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                        className="w-full p-4 flex items-center justify-between text-left hover:bg-rose-50/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-xs font-bold text-rose-600">
                                                {index + 1}
                                            </span>
                                            <span className="font-semibold text-rose-900 text-sm">Reason for being an idiot</span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                                        >
                                            <ChevronDown className="w-4 h-4 text-rose-400" />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {expandedIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="p-4 pt-0 text-rose-600 text-sm leading-relaxed border-t border-rose-50">
                                                    {reason}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onNext}
                            className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-xl shadow-rose-200 flex items-center justify-center gap-2 group"
                        >
                            Okay, I&apos;m Listening...
                            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
