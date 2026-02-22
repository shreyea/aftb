"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "@/components/ConfigContext";
import { RotateCcw, Image as ImageIcon } from "lucide-react";

export default function Section3({ onNext }: { onNext: () => void }) {
    const config = useConfig();
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 min-h-[calc(100dvh-5rem)]">
            <div className="text-center space-y-3">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex justify-center"
                >
                    <div className="bg-rose-100 p-2 rounded-xl">
                        <ImageIcon className="w-6 h-6 text-rose-500" />
                    </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-rose-800 italic">Memory Lane</h2>
                <p className="text-rose-500 text-sm font-medium">Tap to see the message on the back</p>
            </div>

            <div className="perspective-1000 relative w-64 h-80">
                <motion.div
                    initial={{ y: -600, rotate: -25, opacity: 0 }}
                    animate={{
                        y: 0,
                        rotate: isFlipped ? 3 : -5,
                        rotateY: isFlipped ? 180 : 0,
                        opacity: 1
                    }}
                    transition={{
                        y: { type: "spring", stiffness: 60, damping: 12 },
                        rotate: { type: "spring", stiffness: 80 },
                        rotateY: { duration: 0.6, ease: "easeInOut" }
                    }}
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full h-full relative preserve-3d cursor-pointer"
                >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-white p-4 pb-14 rounded-sm shadow-2xl border border-rose-50 flex flex-col">
                        <div className="flex-1 overflow-hidden bg-rose-50 rounded-sm relative group">
                            <img
                                src={config.images[1]}
                                alt="Memory"
                                className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-rose-400/10 mix-blend-overlay"></div>
                        </div>
                        <div className="h-10 flex items-center justify-center">
                            <span className="font-handwriting text-rose-400 text-2xl rotate-[-2deg]">Together ❤️</span>
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden bg-rose-50 p-8 rounded-sm shadow-2xl border-2 border-white [transform:rotateY(180deg)] flex flex-col items-center justify-center text-center">
                        <div className="absolute top-4 right-4 animate-spin-slow">
                            <RotateCcw className="w-5 h-5 text-rose-200" />
                        </div>
                        <p className="font-handwriting text-rose-700 text-2xl leading-relaxed">
                            {config.memoryLane.apologyMessage}
                        </p>
                        <div className="mt-8 pt-4 border-t border-rose-100 w-full">
                            <p className="text-[10px] text-rose-300 font-bold uppercase tracking-widest leading-none">
                                Thinking of you
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {isFlipped && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onNext}
                        className="mt-8 px-10 py-4 bg-rose-500 text-white rounded-full font-bold shadow-xl shadow-rose-200"
                    >
                        I Read It...
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
