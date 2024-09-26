"use client";
import { Modal, ButtonToolbar, Button, Placeholder, Toggle, Loader } from "rsuite";
import { recordJournal } from "@/lib/actions";
import React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useUser } from "@clerk/nextjs";
import { SubmitNoteButton } from "./SubmitButton";

export default function JournalRecordAgainModal({journalId}) {
 const {user} = useUser();
 const [open, setOpen] = React.useState(false);
 const [size, setSize] = React.useState();
 const [accept, setAccept] = React.useState(false)
 const [submitting, setSubmitting] = React.useState(false)

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
     className="bg-gradient-to-br from-rose-400 via-purple-600 to-rose-700 hover:animate-pulse py-2"
     size="md" onClick={() => handleOpen("lg")}
    > <span className="text-white">Record Again 😅</span>
   </Button>

   <Modal size={size} open={open} onClose={handleClose}>
   <form action={recordJournal}>
    <Modal.Header>
     <Modal.Title>
      Would you like to record again <span className="font-bold">{user?.firstName}</span>?😄{" "}
     </Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <p className="text-slate-600">
      Please go somewhere quiet and not too noisy so we can record your journal.{" "}
      <br />
      Remember to listen carefully and speak clearly.
     </p>
     
      <input type="hidden" name="name" value={user?.firstName} />
      <input type="hidden" name="userId" value={user?.id} />
      <input type="hidden" name ="journalId" value={journalId} />
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
          onChange={(value) => setAccept(value)}>

          </Toggle>
        <p className="text-sm text-green-500">
         All journals are recorded and used to improving speech and vocabulary.
         Please accept consent.
        </p>
       </div>
      </div>
     
    </Modal.Body>
    <Modal.Footer>
     <Button onClick={handleClose} appearance="subtle">
      Cancel
     </Button>
    
     <Button type="submit" appearance="primary" disabled={!accept} onClick={() => setSubmitting(true)} >
      {submitting ? <Loader /> : "Record Again"}
     </Button>
    </Modal.Footer>
    </form>
   </Modal>
  </>
 );
}
