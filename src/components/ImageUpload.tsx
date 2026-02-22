"use client";

import React, { useState, useRef } from "react";
import { uploadImage } from "@/lib/supabase";
import { Image as ImageIcon, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label: string;
}

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        if (file.size > MAX_FILE_SIZE) {
            setError("File size exceeds 1MB limit.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please upload an image file.");
            return;
        }

        try {
            setUploading(true);
            const url = await uploadImage(file);
            onChange(url);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            console.error("Upload error:", msg);
            setError(`Upload failed: ${msg}`);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        onChange("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="space-y-3">
            <label className="block text-xs font-bold text-rose-500 uppercase tracking-wider">
                {label}
            </label>

            <div className={`relative group border-2 border-dashed rounded-2xl transition-all h-40 overflow-hidden flex items-center justify-center ${value ? "border-rose-200" : "border-rose-100 hover:border-rose-300 bg-rose-50/30"
                }`}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    accept="image/*"
                    className="hidden"
                />

                {value ? (
                    <>
                        <img
                            src={value}
                            alt={label}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white rounded-xl text-rose-500 hover:bg-rose-50 shadow-lg active:scale-95 transition-all"
                                title="Change image"
                            >
                                <Upload className="w-5 h-5" />
                            </button>
                            <button
                                onClick={removeImage}
                                className="p-2 bg-white rounded-xl text-rose-500 hover:bg-rose-50 shadow-lg active:scale-95 transition-all"
                                title="Remove image"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full h-full flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform"
                    >
                        <div className={`p-4 rounded-full transition-colors ${uploading ? "bg-rose-100" : "bg-rose-100 text-rose-500 group-hover:bg-rose-200"
                            }`}>
                            {uploading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <ImageIcon className="w-6 h-6" />
                            )}
                        </div>
                        <span className="text-sm font-bold text-rose-400">
                            {uploading ? "Uploading..." : "Click to select photo"}
                        </span>
                        <span className="text-[10px] text-rose-300 font-bold uppercase tracking-widest">
                            Max 5MB — JPG, PNG, WEBP
                        </span>
                    </button>
                )}
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 text-rose-600 text-xs font-bold bg-rose-50 p-3 rounded-xl border border-rose-100"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
