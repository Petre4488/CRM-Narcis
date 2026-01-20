"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddCursDialog({ onCursAdded }: { onCursAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nume_curs: "",
    categorie: "Programare",
    nivel_dificultate: "Incepator",
    varsta_min: "7",
    varsta_max: "14",
    programa_link: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      varsta_min: parseInt(formData.varsta_min),
      varsta_max: parseInt(formData.varsta_max),
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/cursuri/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onCursAdded();
        setFormData({
            nume_curs: "",
            categorie: "Programare",
            nivel_dificultate: "Incepator",
            varsta_min: "7",
            varsta_max: "14",
            programa_link: "",
        });
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
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          + Adaugă Curs
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Curs Nou</DialogTitle>
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
            <Button type="submit" disabled={loading} className="bg-indigo-600">
              {loading ? "..." : "Salvează Curs"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}