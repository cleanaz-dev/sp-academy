// app/(dashboard)/conversation/page.jsx

import DialogueGenerator from '@/components/conversation/DialogueGenerator';


export default function page() {
  return (
    <main className="min-h-screen p-4">
      <DialogueGenerator />
    </main>
  );
}