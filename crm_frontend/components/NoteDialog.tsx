"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  initialNote: string;
  onSave: (note: string) => void;
}

export function NoteDialog({ open, onOpenChange, studentName, initialNote, onSave }: NoteDialogProps) {
  const [note, setNote] = useState(initialNote || "");

  const handleSave = () => {
    onSave(note);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 bg-white border border-slate-200 shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
             <MessageSquare className="h-5 w-5 text-blue-500" />
             Observații: {studentName}
          </DialogTitle>
          <DialogDescription className="text-blue-500">
            Adaugă detalii despre comportamentul sau performanța elevului.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 text-black">
            <Textarea 
                value={note} 
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: A lucrat excelent la proiect, dar a întârziat 5 minute..."
                className="min-h-30 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
            />
        </div>

        <DialogFooter>
          <Button className="cursor-pointer  text-violet-900 hover:bg-red-50 hover:text-red-600" variant="ghost" onClick={() => onOpenChange(false)}>Anulează</Button>
          <Button onClick={handleSave} className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white">Salvează Nota</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}