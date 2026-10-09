"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SpoonLogo } from "../misc/logo";

// Adjust this import path to wherever you saved the SpoonLogo component!

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo (Now scalable with standard text utilities!) */}
          <div className="shrink-0 transition-transform hover:scale-105 active:scale-95">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <SpoonLogo className="text-3xl md:text-4xl" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            <Link href="#home" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Home
            </Link>
            <Link href="#features" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Features
            </Link>
            <Link href="#possibilities" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Possibilities
            </Link>
            <Link href="#stats" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Testimonials
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center space-x-4 md:flex">
            <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>
              Sign In
            </Button>
          
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              {/* Base UI: SheetTrigger takes the Button via the render prop, not asChild + child Button */}
              <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                <Menu className="h-6 w-6 text-slate-800" />
              </SheetTrigger>
              <SheetContent side="right" className="bg-white">
                <div className="mt-8 flex flex-col space-y-4">
                  <Link
                    href="#home"
                    className="text-lg font-medium text-slate-800"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="#features"
                    className="text-lg font-medium text-slate-800"
                    onClick={() => setIsOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="#possibilities"
                    className="text-lg font-medium text-slate-800"
                    onClick={() => setIsOpen(false)}
                  >
                    Possibilities
                  </Link>
                  <Link
                    href="#stats"
                    className="text-lg font-medium text-slate-800"
                    onClick={() => setIsOpen(false)}
                  >
                    Testimonials
                  </Link>
                  
                  <div className="space-y-3 pt-6 border-t">
                    <Button
                      variant="ghost"
                      className="w-full text-base h-12"
                      nativeButton={false}
                      render={<Link href="/sign-in" />}
                      onClick={() => setIsOpen(false)}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="w-full text-base h-12"
                      nativeButton={false}
                      render={<Link href="/sign-up" />}
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}