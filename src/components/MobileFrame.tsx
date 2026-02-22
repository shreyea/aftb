"use client";

import React, { useEffect, useState } from "react";
import { useConfig } from "@/components/ConfigContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

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
            {/* Ambient blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-100/20 rounded-full blur-3xl" />
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
