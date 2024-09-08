import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import {Roboto} from "next/font/google"

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
  weight: ["100", "300", "400", "500", "700", "900"]
})

export const metadata = {
 title: "SP Academy - Revolutionizing Learning with AI",
 description:
  "Transform your learning experience with SP Academy’s cutting-edge AI-powered approach.",
};

export default function RootLayout({ children }) {
 return (
  <ClerkProvider>
   <html lang="en">
    <body className={roboto.className}>
     {children}
    </body>
   </html>
  </ClerkProvider>
 );
}
