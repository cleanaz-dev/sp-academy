"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import NavLogo from "@/public/logo1.png";
import NavLogoMobile from "@/public/logo1-min.png";

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = () => {
    console.log("Login clicked");
  };

  const handleSignup = () => {
    console.log("Signup clicked");
  };

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            {/* Desktop Logo */}
            <Image
              src={NavLogo}
              alt="Logo"
              width={200}
              height={200}
              className="object-cover hidden md:block"
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
          <div className="hidden md:flex items-center space-x-8">
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
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" onClick={handleLogin}>
              Login
            </Button>
            <Button onClick={handleSignup}>
              Sign Up
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
                <div className="flex flex-col space-y-4 mt-8">
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
                  <div className="pt-4 space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        handleLogin();
                        setIsOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        handleSignup();
                        setIsOpen(false);
                      }}
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