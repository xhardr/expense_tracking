
"use client";

import { useState } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProfile } from "@/lib/hooks/use-profile";
import { useFamily } from "@/lib/hooks/use-family";
import { motion, AnimatePresence } from "framer-motion";
import {
    LogOut,
    Mail,
    Shield,
    Info,
    Loader2,
    Users,
    Copy,
    LogIn,
    Plus,
    Edit2,
    Check,
    X
} from "lucide-react";

export default function ProfilePage() {
    const { user, signOut } = useAuth();
    const { profile, loading: profileLoading, updateDisplayName } = useProfile();
    const {
        family,
        members,
        loading: familyLoading,
        createFamily,
        joinFamily,
        leaveFamily
    } = useFamily();

    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState("");

    // Family actions state
    const [showJoinInput, setShowJoinInput] = useState(false);
    const [inviteCodeInput, setInviteCodeInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (profileLoading || familyLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const initial = profile?.display_name
        ? profile.display_name.charAt(0).toUpperCase()
        : user?.email?.charAt(0).toUpperCase() ?? "?";

    const handleUpdateName = async () => {
        if (!newName.trim()) return;
        setIsSubmitting(true);
        await updateDisplayName(newName);
        setIsSubmitting(false);
        setIsEditingName(false);
    };

    const handleCreateFamily = async () => {
        setIsSubmitting(true);
        setError("");
        try {
            const name = `${profile?.display_name || 'My'}'s Family`;
            await createFamily(name);
        } catch (err) {
            setError("Failed to create family");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleJoinFamily = async () => {
        if (!inviteCodeInput.trim() || inviteCodeInput.length !== 6) {
            setError("Invalid code format");
            return;
        }
        setIsSubmitting(true);
        setError("");
        try {
            await joinFamily(inviteCodeInput);
            setShowJoinInput(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to join");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLeaveFamily = async () => {
        if (!confirm("Are you sure you want to leave this family?")) return;
        setIsSubmitting(true);
        try {
            await leaveFamily();
        } catch (err) {
            setError("Failed to leave family");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyInviteCode = () => {
        if (family?.invite_code) {
            navigator.clipboard.writeText(family.invite_code);
            // Could add a toast here
        }
    };

    return (
        <PageTransition>
            <div className="space-y-5 pb-8">
                {/* Header */}
                <div className="pt-2">
                    <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
                    <p className="text-sm text-muted-foreground">
                        Your account settings
                    </p>
                </div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border-0 shadow-md">
                        <CardContent className="flex items-center gap-4 p-6">
                            <Avatar className="h-16 w-16 bg-primary text-lg">
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-lg font-bold text-white">
                                    {initial}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                {isEditingName ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="Display Name"
                                            className="h-8"
                                            autoFocus
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-green-600"
                                            onClick={handleUpdateName}
                                            disabled={isSubmitting}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => setIsEditingName(false)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold capitalize">
                                            {profile?.display_name || "User"}
                                        </h2>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 text-muted-foreground"
                                            onClick={() => {
                                                setNewName(profile?.display_name || "");
                                                setIsEditingName(true);
                                            }}
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span>{user?.email}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Family Section */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground px-1">
                        Family Group
                    </h3>
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-0">
                            {family ? (
                                <div className="p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{family.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {members.length} members
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={copyInviteCode}
                                        >
                                            <span className="font-mono">{family.invite_code}</span>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <p className="text-xs font-medium text-muted-foreground">MEMBERS</p>
                                        {members.map((member) => (
                                            <div key={member.user_id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="text-xs bg-muted">
                                                            {member.profiles?.display_name?.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">
                                                        {member.profiles?.display_name}
                                                        {member.user_id === user?.id && " (You)"}
                                                    </span>
                                                </div>
                                                {member.role === 'admin' && (
                                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={handleLeaveFamily}
                                        disabled={isSubmitting}
                                    >
                                        Leave Family
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-6 text-center space-y-4">
                                    <div className="mx-auto bg-primary/10 h-12 w-12 flex items-center justify-center rounded-full">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Join a Family</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Share expenses and track budget together
                                        </p>
                                    </div>

                                    {showJoinInput ? (
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="invite-code">Invite Code</Label>
                                                <Input
                                                    id="invite-code"
                                                    placeholder="Enter 6-digit code"
                                                    className="text-center font-mono uppercase"
                                                    maxLength={6}
                                                    value={inviteCodeInput}
                                                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowJoinInput(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleJoinFamily}
                                                    disabled={isSubmitting || inviteCodeInput.length !== 6}
                                                >
                                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => setShowJoinInput(true)}
                                            >
                                                <LogIn className="mr-2 h-4 w-4" />
                                                Join
                                            </Button>
                                            <Button
                                                className="w-full shadow-lg shadow-primary/25"
                                                onClick={handleCreateFamily}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}

                                    {error && (
                                        <p className="text-xs text-destructive mt-2">{error}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Account Section */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground px-1">
                        Account
                    </h3>
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3 p-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
                                    <Shield className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Authentication</p>
                                    <p className="text-xs text-muted-foreground">
                                        Email & Password
                                    </p>
                                </div>
                            </div>
                            <Separator className="mx-4" />
                            <div className="flex items-center gap-3 p-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10">
                                    <Info className="h-4 w-4 text-purple-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Member since</p>
                                    <p className="text-xs text-muted-foreground">
                                        {user?.created_at
                                            ? new Date(user.created_at).toLocaleDateString("en-US", {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Sign Out */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Button
                        variant="destructive"
                        className="h-12 w-full text-base font-semibold"
                        onClick={signOut}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </motion.div>
            </div>
        </PageTransition>
    );
}
