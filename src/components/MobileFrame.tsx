"use client";

import React, { useEffect, useState } from "react";
import { useConfig } from "@/components/ConfigContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

const HEARTS = [
    { left: "5%",  size: 18, duration: 12, delay: 0,    opacity: 0.55 },
    { left: "12%", size: 12, duration: 16, delay: 2,    opacity: 0.40 },
    { left: "22%", size: 24, duration: 10, delay: 5,    opacity: 0.60 },
    { left: "33%", size: 14, duration: 14, delay: 1,    opacity: 0.45 },
    { left: "45%", size: 20, duration: 11, delay: 7,    opacity: 0.55 },
    { left: "55%", size: 10, duration: 18, delay: 3,    opacity: 0.35 },
    { left: "65%", size: 22, duration: 13, delay: 6,    opacity: 0.50 },
    { left: "75%", size: 16, duration: 15, delay: 0.5,  opacity: 0.45 },
    { left: "83%", size: 11, duration: 17, delay: 4,    opacity: 0.40 },
    { left: "92%", size: 26, duration: 9,  delay: 8,    opacity: 0.60 },
    { left: "18%", size: 8,  duration: 20, delay: 9,    opacity: 0.30 },
    { left: "50%", size: 18, duration: 12, delay: 11,   opacity: 0.50 },
    { left: "70%", size: 13, duration: 16, delay: 2.5,  opacity: 0.40 },
    { left: "38%", size: 9,  duration: 19, delay: 13,   opacity: 0.35 },
];

export default function MobileFrame({ children }: { children: React.ReactNode }) {
    const config = useConfig();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const projectId = sessionStorage.getItem("sorry_project_id");
        setIsLoggedIn(!!projectId);
    }, [pathname]);

    const showLoginIcon = pathname === "/" && !isLoggedIn;

    return (
        <div className="min-h-dvh bg-linear-to-br from-rose-50 via-white to-pink-50 flex flex-col">
            <style>{`
                @keyframes floatHeart {
                    0%   { transform: translateY(100vh) scale(0.6) rotate(-10deg); opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { transform: translateY(-12vh) scale(1) rotate(10deg); opacity: 0; }
                }
                .floating-heart {
                    animation: floatHeart linear infinite;
                    will-change: transform, opacity;
                }
            `}</style>

            {/* Ambient blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-100/20 rounded-full blur-3xl" />
            </div>

            {/* Floating hearts */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
                {HEARTS.map((h, i) => (
                    <div
                        key={i}
                        className="floating-heart absolute bottom-0"
                        style={{
                            left: h.left,
                            fontSize: h.size,
                            opacity: h.opacity,
                            color: "#f43f5e",
                            animationDuration: `${h.duration}s`,
                            animationDelay: `${h.delay}s`,
                        }}
                    >
                        ♥
                    </div>
                ))}
            </div>

            {/* Floating top-right customize button */}
            {showLoginIcon && (
                <div className="fixed top-4 right-4 z-50">
                    <Link
                        href="/login"
                        className="flex items-center gap-2 px-3 py-2 bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-rose-100/40 border border-white/60 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group active:scale-95 text-sm font-bold"
                        title="Customize this template"
                    >
                        <LogIn className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span className="hidden sm:inline">Customize</span>
                    </Link>
                </div>
            )}

            {/* Content area — flex-1 so it fills remaining screen height */}
            <main className="flex-1 flex flex-col w-full">
                {children}
            </main>

            {/* Footer */}
            <footer className="py-4 text-center">
                <p className="text-rose-300/70 text-xs font-medium tracking-widest uppercase">
                    {config.title} &mdash; Powered by Crafting Factory
                </p>
            </footer>
        </div>
    );
}
