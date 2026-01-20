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

// Definim ce date trimitem la Backend
interface PartnerFormData {
  nume: string;
  tip: string;
  oras: string;
  telefon: string;
  email: string;
}

export function AddPartnerDialog({ onPartnerAdded }: { onPartnerAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Starea formularului
  const [formData, setFormData] = useState<PartnerFormData>({
    nume: "",
    tip: "scoala_stat", // valoare default
    oras: "",
    telefon: "",
    email: "",
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
      // Trimitem datele la Python
      const res = await fetch("http://127.0.0.1:8000/parteneri/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setOpen(false); // Inchidem fereastra
        onPartnerAdded(); // Spunem paginii principale sa faca refresh la tabel
        // Resetam formularul
        setFormData({ nume: "", tip: "scoala_stat", oras: "", telefon: "", email: "" });
      } else {
        alert("Ceva nu a mers bine.");
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
        <Button className="bg-slate-900 text-white hover:bg-slate-700">
          + Adaugă Partener
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Partener Nou</DialogTitle>
          <DialogDescription>
            Completează datele instituției aici.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nume" className="text-right">
              Nume
            </Label>
            <Input
              id="nume"
              value={formData.nume}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tip" className="text-right">
              Tip
            </Label>
            <div className="col-span-3">
              <Select onValueChange={handleSelectChange} defaultValue={formData.tip}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează tipul" />
                </SelectTrigger>
                <SelectContent className="bg-blue-500">
                  <SelectItem  className="hover:bg-blue-600 cursor-pointer" value="scoala_stat">Școală de Stat</SelectItem>
                  <SelectItem  className="hover:bg-blue-600 cursor-pointer" value="scoala_privata">Școală Privată</SelectItem>
                  <SelectItem  className="hover:bg-blue-600 cursor-pointer" value="gradinita">Grădiniță</SelectItem>
                  <SelectItem  className="hover:bg-blue-600 cursor-pointer" value="hub_educational">Hub Educațional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="oras" className="text-right">
              Oraș
            </Label>
            <Input
              id="oras"
              value={formData.oras}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="telefon" className="text-right">
              Telefon
            </Label>
            <Input
              id="telefon"
              value={formData.telefon}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}