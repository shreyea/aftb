"use client";

import React, { useRef, useEffect, useState } from "react";

interface ScratchCardProps {
    image: string;
    onComplete: () => void;
    width: number;
    height: number;
}

export default function ScratchCard({ image, onComplete, width, height }: ScratchCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isScratched, setIsScratched] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Fill with a solid color or pattern for the scratch area
        ctx.fillStyle = "#E2E8F0"; // Slate-200
        ctx.fillRect(0, 0, width, height);

        // Add some "scratch here" text
        ctx.font = "20px Arial";
        ctx.fillStyle = "#94A3B8";
        ctx.textAlign = "center";
        ctx.fillText("Scratch to reveal", width / 2, height / 2);

        let isDrawing = false;

        const scratch = (x: number, y: number) => {
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();
            checkScratchPercentage();
        };

        const checkScratchPercentage = () => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const pixels = imageData.data;
            let clearPixels = 0;
            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] === 0) clearPixels++;
            }
            const percentage = (clearPixels / (width * height)) * 100;
            if (percentage > 50 && !isScratched) {
                setIsScratched(true);
                onComplete();
                // Clear the whole canvas
                ctx.clearRect(0, 0, width, height);
            }
        };

        const handleMouseDown = () => (isDrawing = true);
        const handleMouseUp = () => (isDrawing = false);
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            scratch(e.clientX - rect.left, e.clientY - rect.top);
        };

        const handleTouchMove = (e: TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            scratch(touch.clientX - rect.left, touch.clientY - rect.top);
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("touchmove", handleTouchMove);

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("touchmove", handleTouchMove);
        };
    }, [width, height, onComplete, isScratched]);

    return (
        <div className="relative shadow-xl rounded-2xl overflow-hidden" style={{ width, height }}>
            <img
                src={image}
                alt="Revealed"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="absolute inset-0 cursor-crosshair touch-none"
            />
        </div>
    );
}
