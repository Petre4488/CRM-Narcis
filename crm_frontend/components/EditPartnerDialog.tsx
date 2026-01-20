"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react"; // Iconita de creion
import { Partener } from "@/types";

interface EditPartnerDialogProps {
  partener: Partener; // Datele initiale ale partenerului
  onPartnerUpdated: () => void; // Functia de refresh
}

export function EditPartnerDialog({ partener, onPartnerUpdated }: EditPartnerDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Initializam formularul cu datele existente ale partenerului
  const [formData, setFormData] = useState({
    nume: partener.nume,
    tip: partener.tip,
    oras: partener.oras || "",
    telefon: partener.telefon || "",
    email: partener.email || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, tip: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Trimitem cererea de UPDATE (PUT) catre Backend
      const res = await fetch(`http://127.0.0.1:8000/parteneri/${partener.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setOpen(false);
        onPartnerUpdated(); // Facem refresh la tabel
      } else {
        alert("Eroare la actualizare.");
      }
    } catch (error) {
      console.error(error);
      alert("Eroare de conexiune.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mr-2">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Editează Partener</DialogTitle>
          <DialogDescription>
            Modifică datele instituției {partener.nume}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nume" className="text-right">Nume</Label>
            <Input id="nume" value={formData.nume} onChange={handleChange} className="col-span-3" required />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tip" className="text-right">Tip</Label>
            <div className="col-span-3">
              <Select onValueChange={handleSelectChange} defaultValue={formData.tip}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează tipul" />
                </SelectTrigger>
                <SelectContent className="bg-blue-500">
                  <SelectItem className="hover:bg-blue-600 cursor-pointer" value="scoala_stat">Școală de Stat</SelectItem>
                  <SelectItem className="hover:bg-blue-600 cursor-pointer" value="scoala_privata">Școală Privată</SelectItem>
                  <SelectItem className="hover:bg-blue-600 cursor-pointer" value="gradinita">Grădiniță</SelectItem>
                  <SelectItem className="hover:bg-blue-600 cursor-pointer" value="hub_educational">Hub Educațional</SelectItem>
                  <SelectItem className="hover:bg-blue-600 cursor-pointer" value="after_school">After School</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="oras" className="text-right">Oraș</Label>
            <Input id="oras" value={formData.oras} onChange={handleChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="telefon" className="text-right">Telefon</Label>
            <Input id="telefon" value={formData.telefon} onChange={handleChange} className="col-span-3" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Se salvează..." : "Salvează Modificările"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}