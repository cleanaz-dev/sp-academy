"use client";
import React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";

export function SubmitNoteButton() {
 const { pending } = useFormStatus();
 return (
  <>
   {pending ? (
    <Button disabled>
     <Loader2Icon className="w-4 h-4 animate-spin" />
    </Button>
   ) : (
    <Button 
      type="submit"
      variant="outline"
    >
      Start Journal
    </Button>
   )}
  </>
 );
}

export function CreateBookReportButton() {
  const { pending } = useFormStatus();
 return (
  <>
   {pending ? (
    <Button disabled>
     <Loader2Icon className="w-4 h-4 animate-spin" />
    </Button>
   ) : (
    <Button
      type="submit"
      variant="outline"
    >
      Create Book Report
    </Button>
   )}
  </>
 )
}