"use client"

import { Modal, ButtonToolbar, Button, } from 'rsuite';
import RemindIcon from '@rsuite/icons/legacy/Remind';
import React, {useState, useEffect} from 'react'
import { deleteJournalById } from '@/lib/actions';
import { Loader2 } from 'lucide-react';



export default function DeleteJournalModal({journalId}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  

  const handleDelete = async () => {
    await deleteJournalById(journalId)
    setSubmitting(true)
    handleClose()
  }

  return (
    <>
  <ButtonToolbar>
    <span className=''>
      <Button color="red" appearance="primary" onClick={handleOpen}>Delete</Button>
    </span>
  </ButtonToolbar>

  <Modal backdrop="static" role="alertdialog" open={open} onClose={handleClose} size="sm">
    <Modal.Body>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <RemindIcon style={{ color: '#ffb300', fontSize: 24, marginBottom: '10px' }} />
        <p>
          Once a journal is deleted, the data will be gone forever. 
        </p>
        <p className='my-2'>Are you sure you want to proceed?</p>
     
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={handleDelete} appearance="primary">
        {!submitting ? "Delete Journal" : <Loader2 className='animate-spin' />}
      </Button>
      <Button onClick={handleClose} appearance="subtle" disabled={submitting}>
        Cancel
      </Button>
    </Modal.Footer>
  </Modal> 
</>
  )
}
