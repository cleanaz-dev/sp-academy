"use client";
import React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./old-ui/button";
import { Loader2Icon } from "lucide-react";

export function SubmitNoteButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled>
          <Loader2Icon className="h-4 w-4 animate-spin" />
        </Button>
      ) : (
        <Button type="submit" variant="outline">
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
        <Button variant="outline" disabled>
          <Loader2Icon className="h-4 w-4 animate-spin" />
        </Button>
      ) : (
        <Button type="submit" variant="outline">
          Create Book Report
        </Button>
      )}
    </>
  );
}

export function AddReadingLog() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button variant="outline" disabled>
          <Loader2Icon className="h-4 w-4 animate-spin" />
        </Button>
      ) : (
        <Button type="submit" variant="outline">
          Add Reading Log
        </Button>
      )}
    </>
  );
}

export function EditReadingLogSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button variant="outline" disabled>
          <Loader2Icon className="h-4 w-4 animate-spin" />
        </Button>
      ) : (
        <Button type="submit" variant="outline">
          Save Changes
        </Button>
      )}
    </>
  );
}
