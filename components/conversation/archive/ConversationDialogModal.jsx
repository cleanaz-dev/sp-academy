"use client";
import {
  Modal,
  ButtonToolbar,
  Button,
  Placeholder,
  Toggle,
  Loader,
} from "rsuite";
import { recordConversation } from "@/lib/actions";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@clerk/nextjs";
import { SubmitNoteButton } from "@/components/SubmitButton";

export default function ConversationDialogModal() {
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
      <Button size="lg" onClick={() => handleOpen("lg")} className="py-2">
        ☎️
      </Button>

      <Modal size={size} open={open} onClose={handleClose}>
        <form action={recordConversation}>
          <Modal.Header>
            <Modal.Title>
              Are you ready to have a friendly conversation{" "}
              <span className="font-bold">{user?.firstName}</span>!😄{" "}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Body>
              <p className="text-slate-600">
                For optimal recording quality, please choose a quiet,
                distraction-free environment.
                <br />
                Be sure to speak clearly and listen carefully throughout the
                session.
              </p>
            </Modal.Body>

            <input type="hidden" name="name" value={user?.firstName} />
            <input type="hidden" name="userId" value={user?.id} />
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
                  Record conversation for improved speech and vocabulary.
                </p>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleClose} appearance="subtle">
              Cancel
            </Button>

            <Button
              type="submit"
              appearance="primary"
              disabled={!accept}
              onClick={() => setSubmitting(true)}
            >
              {submitting ? <Loader /> : "Start Journal"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}
