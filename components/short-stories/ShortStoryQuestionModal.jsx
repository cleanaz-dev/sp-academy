"use client";
import { Modal, Toggle, Loader } from "rsuite";
import { recordStoryQuestions } from "@/lib/actions";
import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
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
        size="md"
        onClick={() => handleOpen("md")}
        className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        {story.StoryQuestions &&
        story.StoryQuestions.some(
          (question) => question.userId === story.user.userId,
        )
          ? "Practice Again"
          : "Practice Speaking"}
      </Button>

      <Modal size={size} open={open} onClose={handleClose}>
        <form action={recordStoryQuestions}>
          <Modal.Header>
            <Modal.Title>
              Are you ready to practice speaking based on the {story.title}!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-sm text-slate-600">
              Please go somewhere quiet and not too noisy so we can record.{" "}
              <br />
              Remember to listen carefully and speak clearly.
            </p>

            <input type="hidden" name="name" value={user?.firstName} />
            <input type="hidden" name="userId" value={user?.id} />
            <input type="hidden" name="storyId" value={story.id} />
            <input type="hidden" name="englishText" value={story.englishText} />
            <div className="my-4 space-y-2 p-1">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="Your phone number"
                name="phoneNumber"
                required
                className="max-w-md bg-white"
              />
              <div className="flex items-center gap-2">
                {" "}
                <Toggle
                  color="green"
                  size="sm"
                  checked={accept}
                  onChange={(value) => setAccept(value)}
                ></Toggle>
                <p className="text-sm text-green-500">
                  All answers are recorded and used to improving speech and
                  vocabulary.
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
