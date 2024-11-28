"use client";
import { Modal, Toggle, Loader } from "rsuite";
import { recordStoryQuestions } from "@/lib/actions";
import React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";

export default function ShortStoryQuestionsModal({ story }) {
  const { user } = useUser();
  const [open, setOpen] = React.useState(false);
  const [size, setSize] = React.useState();
  const [accept, setAccept] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const handleOpen = (value) => {
    setSize(value);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* <Button size="md" onClick={() => handleOpen('md')}>
           Record
         </Button> */}
      <Button
        size="lg"
        onClick={() => handleOpen("lg")}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        {story.StoryQuestions && story.StoryQuestions.length > 0
          ? "Practice Again"
          : "Practice Speaking"}
      </Button>

      <Modal size={size} open={open} onClose={handleClose}>
        <form action={recordStoryQuestions}>
          <Modal.Header>
            <Modal.Title>
              Are you ready to practice speaking based on the story{" "}
              <span className="font-bold">{user?.firstName}</span>!😄{" "}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-slate-600 text-sm">
              Please go somewhere quiet and not too noisy so we can record.{" "}
              <br />
              Remember to listen carefully and speak clearly.
            </p>

            <input type="hidden" name="name" value={user?.firstName} />
            <input type="hidden" name="userId" value={user?.id} />
            <input type="hidden" name="storyId" value={story.id} />
            <input type="hidden" name="englishText" value={story.englishText} />
            <div className="my-4 p-1 space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="Your phone number"
                name="phoneNumber"
                required
                className="bg-white max-w-md"
              />
              <div className="flex gap-2 items-center">
                {" "}
                <Toggle
                  color="green"
                  size="sm"
                  checked={accept}
                  onChange={(value) => setAccept(value)}
                ></Toggle>
                <p className="text-sm text-green-500">
                  All answers are recorded and used to improving speech and
                  vocabulary. Please accept consent.
                </p>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="gap-2">
              <Button
                onClick={handleClose}
                appearance="subtle"
                className="mr-2"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                appearance="primary"
                disabled={!accept}
                onClick={() => setSubmitting(true)}
              >
                {submitting ? <Loader /> : "Start Questions"}
              </Button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}
