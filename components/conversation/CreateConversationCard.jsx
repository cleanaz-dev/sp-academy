import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function CreateConversationCard() {
  return (
    <Card className="w-full max-w-sm flex flex-col justify-center items-center bg-gradient-to-b from-sky-400 via-amber-400 to-emerald-400 p-1 rounded-lg shadow-lg hover:shadow-xl transition-shadow animate-[gradient_6s_ease_infinite]">
      <CardContent className="w-full h-full bg-white rounded-md p-6 flex flex-col items-center space-y-4">
        <Link
          href="/conversation/create"
          className="w-full flex flex-col items-center text-center space-y-3 group"
        >
          {/* Icon with Gradient Background */}
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full shadow-lg transition-transform group-hover:scale-105">
            <PlusCircle className="h-8 w-8 text-white" />
          </div>

          {/* Description Text */}
          <p className="text-base font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
            Start a new conversation and sharpen your skills through practice!
          </p>
        </Link>
      </CardContent>
    </Card>
  );
}
