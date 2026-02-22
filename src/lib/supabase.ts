import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads a file via the /api/upload server route (uses service role key,
 * so it bypasses Supabase Storage RLS for non-auth users).
 * Returns the public URL of the uploaded file.
 * Retries once on transient failures.
 */
export async function uploadImage(file: File): Promise<string> {
    const MAX_RETRIES = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                const msg = body.error ?? `Upload failed (HTTP ${res.status})`;
                // Don't retry client errors (4xx)
                if (res.status >= 400 && res.status < 500) {
                    throw new Error(msg);
                }
                lastError = new Error(msg);
                continue; // retry on server errors
            }

            const data = await res.json();
            if (!data.url) {
                throw new Error("Server returned empty URL");
            }
            return data.url as string;
        } catch (err) {
            lastError = err instanceof Error ? err : new Error("Upload failed");
            // Don't retry non-retryable errors (client errors already thrown above)
            if (attempt === MAX_RETRIES - 1) break;
        }
    }

    throw lastError ?? new Error("Upload failed after retries");
}
