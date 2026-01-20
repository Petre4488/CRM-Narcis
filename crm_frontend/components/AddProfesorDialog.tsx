"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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

export function AddProfesorDialog({ onProfesorAdded }: { onProfesorAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nume_complet: "",
    email: "",
    telefon: "",
    tip_contract: "cim",
    tarif_orar_default: "",
    data_start: "",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Pregatim datele (convertim tariful la numar)
    const payload = {
      ...formData,
      tarif_orar_default: parseFloat(formData.tarif_orar_default) || 0,
      // Daca data e goala, o lasam null sau o ignoram (backend-ul o poate face optionala)
      data_start: formData.data_start || null, 
      is_active: true
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/profesori/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onProfesorAdded();
        setFormData({
            nume_complet: "",
            email: "",
            telefon: "",
            tip_contract: "cim",
            tarif_orar_default: "",
            data_start: "",
            note: "",
        });
      } else {
        alert("Eroare la salvare.");
        console.error(await res.json());
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
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          + Adaugă Profesor
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Profesor Nou</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* Nume */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nume" className="text-right">Nume</Label>
            <Input 
              id="nume" 
              value={formData.nume_complet} 
              onChange={(e) => setFormData({...formData, nume_complet: e.target.value})} 
              className="col-span-3" required 
            />
          </div>

          {/* Contact (Email / Tel) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input 
              id="email" type="email"
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              className="col-span-3" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tel" className="text-right">Telefon</Label>
            <Input 
              id="tel" 
              value={formData.telefon} 
              onChange={(e) => setFormData({...formData, telefon: e.target.value})} 
              className="col-span-3" 
            />
          </div>

          {/* Tip Contract */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Contract</Label>
            <div className="col-span-3">
              <Select 
                value={formData.tip_contract}
                onValueChange={(val) => setFormData({...formData, tip_contract: val})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cim">CIM (Angajat)</SelectItem>
                  <SelectItem value="pfa">PFA</SelectItem>
                  <SelectItem value="srl">SRL</SelectItem>
                  <SelectItem value="voluntariat">Voluntariat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tarif Orar */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tarif" className="text-right">Tarif (RON/h)</Label>
            <Input 
              id="tarif" type="number" step="0.5"
              value={formData.tarif_orar_default} 
              onChange={(e) => setFormData({...formData, tarif_orar_default: e.target.value})} 
              className="col-span-3" 
            />
          </div>

           {/* Data Start */}
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="data" className="text-right">Data Start</Label>
            <Input 
              id="data" type="date"
              value={formData.data_start} 
              onChange={(e) => setFormData({...formData, data_start: e.target.value})} 
              className="col-span-3" 
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Se salvează..." : "Salvează Profesor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}