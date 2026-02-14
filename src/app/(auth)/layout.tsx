import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/20 p-4 relative">
            <div className="absolute top-4 right-4">
                <ModeToggle />
            </div>
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl shadow-lg shadow-primary/25">
                        💰
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">DuitTrack</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Track your daily spending
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}
