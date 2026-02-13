
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(dateStr: string, format: "full" | "short" | "relative" = "full"): string {
    const date = new Date(dateStr);
    const now = new Date();

    if (format === "relative") {
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (date.toDateString() === now.toDateString()) return "Today";

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

        return date.toLocaleDateString("en-US", { weekday: 'long' });
    }

    if (format === "short") {
        return date.toLocaleDateString("en-US", { day: 'numeric', month: 'short' });
    }

    return date.toLocaleDateString("en-US", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

export function getSpendingColor(remaining: number, total: number): string {
    if (total === 0) return "text-muted-foreground";
    const ratio = remaining / total;
    if (ratio > 0.5) return "text-emerald-600";
    if (ratio > 0.2) return "text-amber-500";
    return "text-destructive";
}

export function getTodayDate(): string {
    // Returns YYYY-MM-DD in local time
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getSpendingStatus(remaining: number, total: number): { level: "good" | "caution" | "danger" | "neutral", emoji: string } {
    if (total === 0) return { level: "neutral", emoji: "😐" };

    const ratio = remaining / total;

    if (ratio > 0.5) return { level: "good", emoji: "😁" };
    if (ratio > 0.2) return { level: "caution", emoji: "😅" };
    return { level: "danger", emoji: "💸" };
}
