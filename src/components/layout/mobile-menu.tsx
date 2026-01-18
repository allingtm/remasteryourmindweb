"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeLogo } from "@/components/ui/theme-logo";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Settings } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { BlogCategory } from "@/types";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BlogCategory[];
}

export function MobileMenu({ isOpen, onClose, categories }: MobileMenuProps) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[100] w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border"
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={onClose}>
  <ThemeLogo
                  width={200}
                  height={225}
                  className="h-20 w-auto"
                />
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-foreground"
                onClick={onClose}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                {/* Categories */}
                <div className="space-y-1 py-6">
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Explore
                  </p>
                  <Link
                    href="/"
                    className={cn(
                      "block rounded-lg px-3 py-2 text-base font-medium",
                      pathname === "/"
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                    onClick={onClose}
                  >
                    Latest
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/${category.slug}`}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-base font-medium",
                        pathname === `/${category.slug}`
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={onClose}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
                {/* Actions */}
                <div className="py-6 space-y-2">
                  <Link
                    href="/about"
                    className={cn(
                      "block rounded-lg px-3 py-2 text-base font-medium",
                      pathname === "/about"
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                    onClick={onClose}
                  >
                    About Us
                  </Link>
                  <Button asChild className="w-full">
                    <Link href="/contact" onClick={onClose}>
                      Contact Us
                    </Link>
                  </Button>
                </div>
                {/* Settings */}
                <div className="py-6 space-y-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-base font-medium text-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  {isLoggedIn ? (
                    <Link
                      href="/admin"
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium",
                        pathname.startsWith("/admin")
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={onClose}
                    >
                      <Settings className="h-5 w-5" />
                      Admin
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium",
                        pathname === "/login"
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={onClose}
                    >
                      <User className="h-5 w-5" />
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
