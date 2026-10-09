import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";

// Initialize Plus Jakarta Sans (Variable Font)
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  // Defines a CSS variable so we can use it in Tailwind if needed
  variable: "--font-jakarta", 
});

export const metadata: Metadata = {
  title: "Spoon Academy - Revolutionizing Learning with AI",
  description:
    "Transform your learning experience with Spoon Academy’s cutting-edge AI-powered approach.",
  openGraph: {
    title: "Spoon Academy - Revolutionizing Learning with AI",
    description:
      "Transform your learning experience with Spoon Academy’s cutting-edge AI-powered approach.",
    images: [
      {
        url: "/logo1.png",
        width: 1200,
        height: 630,
        alt: "Spoon Fed Academy Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spoon Academy - Revolutionizing Learning with AI",
    description:
      "Transform your learning experience with Spoon Academy’s cutting-edge AI-powered approach.",
    images: ["/logo1.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Pass the CSS variable to the HTML tag
    <html lang="en" className={jakarta.variable}>
      {/* Apply the font class and smooth antialiasing */}
      <body className={`${jakarta.className} antialiased`}>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            theme="system"
            closeButton
          />
      </body>
    </html>
  );
}