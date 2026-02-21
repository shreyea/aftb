"use client";

import React from "react";
import { useConfig } from "@/components/ConfigContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function MobileFrame({ children }: { children: React.ReactNode }) {
    const config = useConfig();
    const pathname = usePathname();

    const showLoginIcon = pathname === "/" || pathname.startsWith("/view/");

    return (
        <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white min-h-[80vh] rounded-[3rem] shadow-2xl overflow-hidden relative border-8 border-rose-100 flex flex-col">
                {/* Floating Login/Customize Icon */}
                {showLoginIcon && (
                    <Link
                        href="/login"
                        className="absolute top-8 right-6 z-50 p-2.5 bg-white/40 backdrop-blur-md rounded-2xl shadow-xl shadow-rose-200/20 border border-white/40 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group active:scale-95"
                        title="Customize this template"
                    >
                        <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </Link>
                )}

                {/* Notch - for aesthetics */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-rose-100 rounded-b-2xl z-50 flex items-center justify-center">
                    <div className="w-12 h-1 bg-rose-200 rounded-full" />
                </div>

                <main className="flex-1 overflow-y-auto no-scrollbar relative pt-6">
                    {children}
                </main>

                {/* Home Indicator */}
                <div className="h-6 w-full flex items-center justify-center pb-2 bg-white">
                    <div className="w-32 h-1 bg-rose-100 rounded-full" />
                </div>
            </div>

            <p className="mt-8 text-rose-300 text-sm font-medium tracking-wide uppercase">
                {config.title} — Powered by Crafting Factory
            </p>
        </div>
    );
}
