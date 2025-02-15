import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Roboto, Comfortaa, Nunito } from "next/font/google";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Spoon Fed Academy - Revolutionizing Learning with AI",
  description:
    "Transform your learning experience with SP Academy’s cutting-edge AI-powered approach.",
  openGraph: {
    title: "Spoon Fed Academy - Revolutionizing Learning with AI",
    description:
      "Transform your learning experience with SP Academy’s cutting-edge AI-powered approach.",
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
    title: "Spoon Fed Academy - Revolutionizing Learning with AI",
    description:
      "Transform your learning experience with SP Academy’s cutting-edge AI-powered approach.",
    images: ["/logo1.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
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
