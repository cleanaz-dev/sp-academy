"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/old-ui/sheet";
import { Button } from "@/components/old-ui/button";
import NavLogo from "@/public/logo1.png";
import NavLogoMobile from "@/public/logo1-min.png";
import Link from "next/link";

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            {/* Desktop Logo */}
            <Image
              src={NavLogo}
              alt="Logo"
              width={200}
              height={200}
              className="hidden object-cover md:block"
            />
            {/* Mobile Logo */}
            <Image
              src={NavLogoMobile}
              alt="Logo"
              width={50}
              height={50}
              className="object-contain md:hidden"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            <a href="#home" className="text-gray-700 hover:text-gray-900">
              Home
            </a>
            <a href="#features" className="text-gray-700 hover:text-gray-900">
              Features
            </a>
            <a href="#features" className="text-gray-700 hover:text-gray-900">
              Possiblities
            </a>
            <a href="#stats" className="text-gray-700 hover:text-gray-900">
              Testimonials
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center space-x-4 md:flex">
            <Button variant="ghost">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white">
                <div className="mt-8 flex flex-col space-y-4">
                  <a
                    href="#home"
                    className="text-lg font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </a>
                  <a
                    href="#features"
                    className="text-lg font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Features
                  </a>
                  <a
                    href="#stats"
                    className="text-lg font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Stats
                  </a>
                  <div className="space-y-2 pt-4">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false);
                      }}
                    >
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false);
                      }}
                    >
                      <Link href="/sign-up">Sign Up</Link>
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
