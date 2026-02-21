"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useConfig } from "@/components/ConfigContext";
import { Heart, MoveRight } from "lucide-react";

export default function Section1({ onNext }: { onNext: () => void }) {
    const config = useConfig();
    const [displayText, setDisplayText] = useState("");
    const [showSlider, setShowSlider] = useState(false);
    const fullText = config.hero.typingText;
    const x = useMotionValue(0);
    const opacity = useTransform(x, [0, 200], [1, 0]);
    const scale = useTransform(x, [0, 200], [1, 0.9]);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayText(fullText.slice(0, i));
            i++;
            if (i > fullText.length) {
                clearInterval(interval);
                setTimeout(() => setShowSlider(true), 500);
            }
        }, 60);
        return () => clearInterval(interval);
    }, [fullText]);

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > 180) {
            onNext();
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-between py-16 px-8 min-h-[calc(100dvh-5rem)] bg-gradient-to-b from-rose-50/50 to-white">
            <motion.div
                style={{ opacity, scale }}
                className="flex flex-col items-center text-center space-y-10"
            >
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-rose-200 blur-3xl opacity-30 animate-pulse"></div>
                    <Heart className="w-28 h-28 text-rose-400 fill-rose-100 relative z-10" />
                    <motion.div
                        animate={{
                            y: [0, -8, 0],
                            opacity: [1, 0.7, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -top-1 -right-1 z-20"
                    >
                        <div className="text-3xl filter drop-shadow-sm">🥺</div>
                    </motion.div>
                </motion.div>

                <div className="min-h-[120px] flex items-center justify-center">
                    <h1 className="text-3xl font-extrabold text-rose-900 leading-tight tracking-tight">
                        {displayText}
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-1.5 h-9 bg-rose-400 ml-1.5 align-middle"
                        />
                    </h1>
                </div>
            </motion.div>

            <AnimatePresence>
                {showSlider && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-6"
                    >
                        <div className="relative w-full h-20 bg-rose-100/50 backdrop-blur-sm rounded-[2rem] p-2 flex items-center overflow-hidden border border-rose-100 shadow-inner">
                            <motion.div
                                drag="x"
                                dragConstraints={{ left: 0, right: 280 }}
                                dragElastic={0.1}
                                dragMomentum={false}
                                onDragEnd={handleDragEnd}
                                style={{ x }}
                                className="z-20 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing border border-rose-50"
                            >
                                <MoveRight className="w-8 h-8 text-rose-500" />
                            </motion.div>

                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-rose-400 font-bold tracking-wider uppercase text-xs opacity-60">
                                    {config.hero.sliderText}
                                </span>
                            </div>

                            <motion.div
                                style={{ width: x }}
                                className="absolute left-0 top-0 h-full bg-rose-300 opacity-20"
                            />
                        </div>

                        <p className="text-center text-rose-300 text-[10px] font-bold uppercase tracking-widest animate-bounce">
                            Slide to the right
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
