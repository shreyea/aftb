import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Ensure we run on Node.js runtime (not Edge) for larger uploads
export const runtime = "nodejs";

// Uses service role key — bypasses RLS on storage
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "template-assets";
const MAX_SIZE = 1 * 1024 * 1024; // 1 MB

/**
 * Ensures the storage bucket exists; creates it (public) if missing.
 * Runs once per cold start thanks to the module-level promise.
 */
let bucketReady: Promise<void> | null = null;

function ensureBucket(): Promise<void> {
    if (bucketReady) return bucketReady;
    bucketReady = (async () => {
        const { error } = await supabaseAdmin.storage.getBucket(BUCKET);
        if (error) {
            // Bucket doesn't exist → create it as public so getPublicUrl works
            const { error: createErr } = await supabaseAdmin.storage.createBucket(BUCKET, {
                public: true,
                fileSizeLimit: MAX_SIZE, // 1 MB
                allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
            });
            if (createErr) {
                console.error("Failed to create bucket:", createErr);
                // Reset so we retry next time
                bucketReady = null;
                throw createErr;
            }
            console.log(`Created storage bucket "${BUCKET}" (public).`);
        }
    })();
    return bucketReady;
}

export async function POST(req: NextRequest) {
    try {
        // Make sure the bucket exists before attempting upload
        await ensureBucket();

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "File exceeds 1 MB limit" }, { status: 400 });
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
        }

        const ext = file.name.split(".").pop() ?? "jpg";
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${ext}`;
        const filePath = `sorry-template/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);

        return NextResponse.json({ url: data.publicUrl });
    } catch (err) {
        console.error("Upload route error:", err);
        const message = err instanceof Error ? err.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
