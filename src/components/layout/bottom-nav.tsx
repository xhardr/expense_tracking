"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Clock, User } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/add-expense", icon: PlusCircle, label: "Add" },
    { href: "/history", icon: Clock, label: "History" },
    { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl safe-bottom">
            <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
                {navItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center gap-0.5 px-4 py-2"
                        >
                            <div className="relative">
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        className="absolute -inset-2 rounded-xl bg-primary/10"
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                <Icon
                                    className={`relative h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"
                                        }`}
                                />
                            </div>
                            <span
                                className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"
                                    }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
