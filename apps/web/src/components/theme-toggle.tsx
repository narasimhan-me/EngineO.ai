"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className={cn("inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background/50 text-muted-foreground", className)}>
                <span className="sr-only">Toggle theme</span>
            </button>
        )
    }

    return (
        <div className={cn("flex items-center gap-1 border border-border/10 bg-cockpit/50 rounded-lg p-1", className)}>
            <button
                onClick={() => setTheme("light")}
                className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-md transition-all",
                    theme === "light"
                        ? "bg-background text-signal shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                )}
                title="Light Mode"
            >
                <Sun className="h-4 w-4" />
                <span className="sr-only">Light</span>
            </button>
            <button
                onClick={() => setTheme("system")}
                className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-md transition-all",
                    theme === "system"
                        ? "bg-background text-signal shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                )}
                title="System Preference"
            >
                <Laptop className="h-4 w-4" />
                <span className="sr-only">System</span>
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-md transition-all",
                    theme === "dark"
                        ? "bg-background text-signal shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                )}
                title="Dark Mode"
            >
                <Moon className="h-4 w-4" />
                <span className="sr-only">Dark</span>
            </button>
        </div>
    )
}
