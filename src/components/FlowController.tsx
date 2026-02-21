"use client";

import React, { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Section1 from "./sections/Section1";
import Section2 from "./sections/Section2";
import Section3 from "./sections/Section3";
import Section4 from "./sections/Section4";
import Section5 from "./sections/Section5";
import Section6 from "./sections/Section6";

const sections = [Section1, Section2, Section3, Section4, Section5, Section6];

export default function FlowController() {
    const [currentStep, setCurrentStep] = useState(0);
    // Key used to force remount all sections on replay
    const [flowKey, setFlowKey] = useState(0);

    const nextStep = useCallback(() => {
        if (currentStep < sections.length - 1) {
            setCurrentStep((s) => s + 1);
        }
    }, [currentStep]);

    const restart = useCallback(() => {
        setCurrentStep(0);
        setFlowKey((k) => k + 1); // Remount everything so state resets
    }, []);

    const CurrentSection = sections[currentStep];
    const isLastSection = currentStep === sections.length - 1;

    return (
        <div className="relative flex-1 flex flex-col h-full w-full overflow-hidden" key={flowKey}>
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20, scale: 0.98, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -20, scale: 1.02, filter: "blur(8px)" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-1 flex flex-col h-full w-full"
                >
                    {isLastSection ? (
                        <CurrentSection onNext={nextStep} onRestart={restart} />
                    ) : (
                        <CurrentSection onNext={nextStep} />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Progress Indicator */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-50/50 flex gap-1.5 px-6 pt-2 z-50">
                {sections.map((_, index) => (
                    <div key={index} className="h-1 flex-1 rounded-full overflow-hidden bg-white/50 relative">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: index <= currentStep ? "100%" : "0%" }}
                            className={`h-full transition-all duration-700 ${index < currentStep
                                    ? "bg-rose-300 opacity-50"
                                    : index === currentStep
                                        ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                                        : "bg-transparent"
                                }`}
                        />
                    </div>
                ))}
            </div>

            {/* Background Micro-elements */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div
                    animate={{ x: [0, 10, 0], y: [0, -20, 0], rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -right-20 w-64 h-64 bg-rose-100/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, -15, 0], y: [0, 30, 0], rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-32 -left-32 w-80 h-80 bg-rose-50/30 rounded-full blur-3xl"
                />
            </div>
        </div>
    );
}
