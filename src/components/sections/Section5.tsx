"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "@/components/ConfigContext";
import { CheckCircle2, RefreshCw, Puzzle } from "lucide-react";
import confetti from "canvas-confetti";

/*
  Canvas-based puzzle:
  - On mount, loads the puzzle image and splits it into 4 quadrant data-URLs via Canvas.
  - Pieces sit in a randomized tray below a 2×2 target grid.
  - Drag a piece onto its matching slot → snap. Miss → spring back.
*/

const SNAP_RADIUS = 60;
const PIECE_SIZE = 72;

function usePuzzlePieces(imageUrl: string) {
    const [pieces, setPieces] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const size = Math.min(img.width, img.height);
            const half = size / 2;
            const results: string[] = [];

            for (let row = 0; row < 2; row++) {
                for (let col = 0; col < 2; col++) {
                    const canvas = document.createElement("canvas");
                    canvas.width = half;
                    canvas.height = half;
                    const ctx = canvas.getContext("2d")!;
                    // Draw the correct quadrant: crop from (col*half, row*half)
                    const sx = (img.width - size) / 2 + col * half;
                    const sy = (img.height - size) / 2 + row * half;
                    ctx.drawImage(img, sx, sy, half, half, 0, 0, half, half);
                    results.push(canvas.toDataURL("image/jpeg", 0.85));
                }
            }

            setPieces(results); // [TL, TR, BL, BR]
            setLoading(false);
        };
        img.onerror = () => setLoading(false);
        img.src = imageUrl;
    }, [imageUrl]);

    return { pieces, loading };
}

interface PieceState {
    id: number;
    solved: boolean;
}

export default function Section5({ onNext }: { onNext: () => void }) {
    const config = useConfig();
    const { pieces: pieceImages, loading } = usePuzzlePieces(config.images[2]);

    const [solvedState, setSolvedState] = useState<PieceState[]>([
        { id: 0, solved: false },
        { id: 1, solved: false },
        { id: 2, solved: false },
        { id: 3, solved: false },
    ]);

    const [trayOrder] = useState(() => [0, 1, 2, 3].sort(() => Math.random() - 0.5));

    const slotRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
    const pieceRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

    const allSolved = solvedState.every((p) => p.solved);

    const handleDragEnd = useCallback((pieceId: number) => {
        const slotEl = slotRefs.current[pieceId];
        const pieceEl = pieceRefs.current[pieceId];
        if (!slotEl || !pieceEl) return;

        const slotRect = slotEl.getBoundingClientRect();
        const pieceRect = pieceEl.getBoundingClientRect();

        const slotCX = slotRect.left + slotRect.width / 2;
        const slotCY = slotRect.top + slotRect.height / 2;
        const pieceCX = pieceRect.left + pieceRect.width / 2;
        const pieceCY = pieceRect.top + pieceRect.height / 2;

        const dist = Math.sqrt((slotCX - pieceCX) ** 2 + (slotCY - pieceCY) ** 2);

        if (dist < SNAP_RADIUS) {
            setSolvedState((prev) =>
                prev.map((p) => (p.id === pieceId ? { ...p, solved: true } : p))
            );
        }
    }, []);

    useEffect(() => {
        if (allSolved) {
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                colors: ["#FDA4AF", "#F43F5E", "#FB7185"],
            });
        }
    }, [allSolved]);

    const resetPuzzle = () => {
        setSolvedState([
            { id: 0, solved: false },
            { id: 1, solved: false },
            { id: 2, solved: false },
            { id: 3, solved: false },
        ]);
    };

    if (loading || pieceImages.length < 4) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 min-h-[calc(100dvh-5rem)]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Puzzle className="w-12 h-12 text-rose-300" />
                </motion.div>
                <p className="text-rose-400 text-sm font-medium">Preparing your puzzle...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 space-y-6 min-h-[calc(100dvh-5rem)]">
            {/* Header */}
            <div className="text-center space-y-2">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center">
                    <div className="bg-rose-100 p-2 rounded-xl">
                        <Puzzle className="w-6 h-6 text-rose-500" />
                    </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-rose-800 italic">Us Against The World</h2>
                <p className="text-rose-500 text-sm font-medium">Drag each piece to its correct spot</p>
            </div>

            {/* Target Grid — 2×2 */}
            <div className="relative">
                {/* Ghost hint */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none rounded-2xl overflow-hidden">
                    <img src={config.images[2]} alt="hint" className="w-full h-full object-cover" />
                </div>

                <div
                    className="grid grid-cols-2 gap-1 rounded-2xl border-2 border-dashed border-rose-200 p-1 bg-rose-50/40"
                    style={{ width: PIECE_SIZE * 2 + 12, height: PIECE_SIZE * 2 + 12 }}
                >
                    {[0, 1, 2, 3].map((slotId) => {
                        const isSolved = solvedState[slotId].solved;
                        return (
                            <div
                                key={slotId}
                                ref={(el) => { slotRefs.current[slotId] = el; }}
                                className={`rounded-lg flex items-center justify-center transition-colors duration-300 ${isSolved ? "bg-transparent" : "bg-white/60 border border-dashed border-rose-200"
                                    }`}
                                style={{ width: PIECE_SIZE, height: PIECE_SIZE }}
                            >
                                {isSolved ? (
                                    <motion.div
                                        initial={{ scale: 1.3, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="rounded-lg overflow-hidden"
                                        style={{ width: PIECE_SIZE, height: PIECE_SIZE }}
                                    >
                                        <img
                                            src={pieceImages[slotId]}
                                            alt="solved"
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                ) : (
                                    <span className="text-rose-200 text-xs font-bold">{slotId + 1}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Piece Tray */}
            <div className="flex flex-wrap justify-center gap-4 min-h-[90px]">
                {trayOrder.map((pieceId) => {
                    if (solvedState[pieceId].solved) return null;

                    return (
                        <motion.div
                            key={pieceId}
                            ref={(el) => { pieceRefs.current[pieceId] = el as HTMLDivElement | null; }}
                            drag
                            dragSnapToOrigin
                            dragElastic={0.15}
                            dragMomentum={false}
                            onDragEnd={() => handleDragEnd(pieceId)}
                            whileDrag={{ scale: 1.12, zIndex: 50, boxShadow: "0 20px 40px rgba(244,63,94,0.3)" }}
                            whileTap={{ scale: 1.05 }}
                            className="cursor-grab active:cursor-grabbing rounded-xl shadow-lg border-2 border-rose-100 bg-white touch-none select-none overflow-hidden"
                            style={{ width: PIECE_SIZE, height: PIECE_SIZE }}
                        >
                            <img
                                src={pieceImages[pieceId]}
                                alt={`Piece ${pieceId + 1}`}
                                className="w-full h-full object-cover pointer-events-none"
                                draggable={false}
                            />
                        </motion.div>
                    );
                })}
            </div>

            {/* Solved overlay + next */}
            <AnimatePresence>
                {allSolved && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full text-center space-y-4"
                    >
                        <div className="flex items-center justify-center gap-2 text-green-600">
                            <CheckCircle2 className="w-6 h-6" />
                            <span className="font-bold">{config.puzzle.finalPlea}</span>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onNext}
                            className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-xl shadow-rose-200 text-lg"
                        >
                            We Are ❤️
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reset */}
            {!allSolved && (
                <button
                    onClick={resetPuzzle}
                    className="flex items-center gap-2 text-rose-400 text-sm font-semibold hover:text-rose-600 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reset Puzzle
                </button>
            )}
        </div>
    );
}
