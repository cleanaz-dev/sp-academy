import { Button } from "@/components/ui/button";

export default function GenerateBookCover() {
  return (
    <div className="flex flex-col gap-4 max-w-72 mt-8">
      <div className="flex h-96 w-72 items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-500 text-center px-4">
          Book Cover
        </p>
      </div>
      <Button>
        Generate Book Cover
      </Button>
    </div>
  )
}