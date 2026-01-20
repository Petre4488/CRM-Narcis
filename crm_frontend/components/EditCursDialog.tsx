"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Curs } from "@/types";
import { Pencil } from "lucide-react";

interface EditCursProps {
  curs: Curs;
  onCursUpdated: () => void;
}

export function EditCursDialog({ curs, onCursUpdated }: EditCursProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initializam formularul cu datele existente
  const [formData, setFormData] = useState({
    nume_curs: curs.nume_curs,
    categorie: curs.categorie,
    nivel_dificultate: curs.nivel_dificultate,
    varsta_min: curs.varsta_min.toString(),
    varsta_max: curs.varsta_max.toString(),
    programa_link: curs.programa_link || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      varsta_min: parseInt(formData.varsta_min),
      varsta_max: parseInt(formData.varsta_max),
      // Adaugam descrierea existenta ca sa nu o pierdem (sau o poti pune in form)
      descriere: curs.descriere 
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/cursuri/${curs.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onCursUpdated();
      } else {
        alert("Eroare la actualizare.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-black hover:bg-slate-100">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Editează Curs</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Nume Curs</Label>
            <Input 
              value={formData.nume_curs} 
              onChange={(e) => setFormData({...formData, nume_curs: e.target.value})} 
              className="col-span-3" required 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Categorie</Label>
            <div className="col-span-3">
                <Select value={formData.categorie} onValueChange={(val) => setFormData({...formData, categorie: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Programare">Programare</SelectItem>
                        <SelectItem value="Robotica">Robotică</SelectItem>
                        <SelectItem value="Art">Art & Design</SelectItem>
                        <SelectItem value="Limbi Straine">Limbi Străine</SelectItem>
                        <SelectItem value="Personal">Dezvoltare Personală</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Nivel</Label>
            <div className="col-span-3">
                <Select value={formData.nivel_dificultate} onValueChange={(val) => setFormData({...formData, nivel_dificultate: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Incepator">Începător</SelectItem>
                        <SelectItem value="Mediu">Mediu</SelectItem>
                        <SelectItem value="Avansat">Avansat</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Vârstă (Ani)</Label>
            <div className="col-span-3 flex gap-2 items-center">
                <Input type="number" value={formData.varsta_min} onChange={(e) => setFormData({...formData, varsta_min: e.target.value})} placeholder="Min" />
                <span>-</span>
                <Input type="number" value={formData.varsta_max} onChange={(e) => setFormData({...formData, varsta_max: e.target.value})} placeholder="Max" />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? "..." : "Salvează Modificările"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}