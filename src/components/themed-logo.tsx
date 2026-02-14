"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export function ThemedLogo() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return placeholder with same dimensions to prevent CLS
        return <div className="h-6 w-20" />;
    }

    const src = resolvedTheme === "dark" ? "/8nel_dark.png" : "/8nel_light.png";

    return (
        <a href="https://8nel.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-block ml-2 align-middle">
            <Image
                src={src}
                alt="8nel Logo"
                width={80}
                height={24}
                className="h-6 w-auto object-contain hover:opacity-80 transition-opacity"
            />
        </a>
    );
}
