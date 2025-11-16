"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/old-ui/dialog";
import { Button } from "@/components/old-ui/button";
import { Trash2 } from "lucide-react";
import { deleteReadingLog } from "@/lib/actions";

export default function DeleteReadingDialog({ log }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteReadingLog(log.id);
      setIsOpen(false); // Close the dialog after successful deletion
    } catch (error) {
      console.error("Error deleting log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-gray-500 hover:text-gray-600"
        >
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Delete Log</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this log? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
