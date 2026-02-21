import { supabase } from "@/lib/supabase";
import { defaultSiteConfig } from "@/site.config";
import ViewClient from "./ViewClient";
import type { Metadata } from "next";

// Generate metadata for social sharing
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const { data } = await supabase
        .from("projects")
        .select("data")
        .eq("slug", slug)
        .eq("is_published", true)
        .eq("template_type", "sorry")
        .single();

    const title = data?.data?.title || defaultSiteConfig.title;

    return {
        title: `${title} — A Special Apology`,
        description: "Someone made this just for you. Open to see their heartfelt apology.",
    };
}

export default async function ViewPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const { data, error } = await supabase
        .from("projects")
        .select("data, is_published")
        .eq("slug", slug)
        .eq("is_published", true)
        .eq("template_type", "sorry")
        .single();

    if (error || !data) {
        return <NotFound />;
    }

    // Deep merge with defaults to fill any missing fields
    const mergedConfig = {
        ...defaultSiteConfig,
        ...(data.data as Record<string, unknown>),
        hero: { ...defaultSiteConfig.hero, ...((data.data as Record<string, unknown>)?.hero as Record<string, unknown> || {}) },
        confession: { ...defaultSiteConfig.confession, ...((data.data as Record<string, unknown>)?.confession as Record<string, unknown> || {}) },
        memoryLane: { ...defaultSiteConfig.memoryLane, ...((data.data as Record<string, unknown>)?.memoryLane as Record<string, unknown> || {}) },
        peaceOffering: { ...defaultSiteConfig.peaceOffering, ...((data.data as Record<string, unknown>)?.peaceOffering as Record<string, unknown> || {}) },
        puzzle: { ...defaultSiteConfig.puzzle, ...((data.data as Record<string, unknown>)?.puzzle as Record<string, unknown> || {}) },
        verdict: { ...defaultSiteConfig.verdict, ...((data.data as Record<string, unknown>)?.verdict as Record<string, unknown> || {}) },
    };

    return <ViewClient config={mergedConfig} />;
}

function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100 flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-sm">
                <div className="text-6xl">💔</div>
                <h1 className="text-2xl font-extrabold text-rose-900">
                    Oops! Not Found
                </h1>
                <p className="text-rose-500 font-medium leading-relaxed">
                    This apology doesn&apos;t exist or hasn&apos;t been published yet.
                </p>
                <a
                    href="/"
                    className="inline-block px-8 py-3 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
}
