"use client";

import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-4 safe-top">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
