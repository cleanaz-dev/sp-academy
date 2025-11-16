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
import { Input } from "@/components/old-ui/input";
import { Button } from "@/components/old-ui/button";
import { Edit } from "lucide-react";
import { editReadingLog } from "@/lib/actions";
import { Textarea } from "../old-ui/textarea";

export default function EditReadingLog({ log }) {
  const [formData, setFormData] = useState({
    shortSummary: log.shortSummary,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = new FormData();
    data.append("readingLogId", log.id);
    data.append("shortSummary", formData.shortSummary);
    try {
      await editReadingLog(data);
      setIsOpen(false); // Close the dialog after successful submission
    } catch (error) {
      console.error("Error editing reading log:", error.message);
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
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Edit Log</DialogTitle>
          <DialogDescription>
            Modify the details of your reading log.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Textarea
              name="shortSummary"
              value={formData.shortSummary}
              onChange={handleChange}
              placeholder="Enter new short summary...."
              required
              className="h-32"
            />
          </div>
          <div className="mt-4">
            <DialogFooter>
              <Button type="submit" variant="outline" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
