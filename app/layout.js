import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Nunito } from "next/font/google";
import { Toaster } from "sonner";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700", "800", "900"],
});

export const metadata = {
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

export default function RootLayout({ children }) {
  return (
    <ClerkProvider dynamic>
      <html lang="en">
        <body className={nunito.className}>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            theme="system"
            closeButton
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
