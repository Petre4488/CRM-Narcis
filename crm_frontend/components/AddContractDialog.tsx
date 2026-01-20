"use client";

import { useState, useEffect } from "react";
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
import { Partener } from "@/types";

export function AddContractDialog({ onContractAdded }: { onContractAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parteneri, setParteneri] = useState<Partener[]>([]);

  const [formData, setFormData] = useState({
    nume_contract: "",
    valoare: "",
    data_semnarii: "",
    status: "draft",
    partener_id: "",
  });

  // Incarcam partenerii pentru dropdown
  useEffect(() => {
    if (open) {
      fetch("http://127.0.0.1:8000/parteneri/")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setParteneri(data);
          else setParteneri([]);
        })
        .catch((err) => console.error(err));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Convertim datele pentru Backend
    const payload = {
      nume_contract: formData.nume_contract,
      valoare: parseFloat(formData.valoare), // Convertim in numar
      data_semnarii: formData.data_semnarii,
      status: formData.status,
      partener_id: parseInt(formData.partener_id), // Convertim in numar
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/contracte/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onContractAdded();
        // Reset
        setFormData({
            nume_contract: "",
            valoare: "",
            data_semnarii: "",
            status: "draft",
            partener_id: "",
        });
      } else {
        alert("Eroare la salvare.");
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
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          + Contract Nou
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Contract Nou</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* Partener */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Client</Label>
            <div className="col-span-3 ">
              <Select 
                value={formData.partener_id || undefined}
                onValueChange={(val) => setFormData({...formData, partener_id: val})} 
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alege clientul..." />
                </SelectTrigger>
                <SelectContent className="bg-blue-500">
                  {parteneri.map((p) => (
                    <SelectItem className="hover:bg-blue-600 cursor-pointer" key={p.id} value={p.id.toString()}>
                      {p.nume}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nume Contract */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nume" className="text-right">Titlu</Label>
            <Input 
              id="nume" 
              placeholder="ex: Abonament Anual"
              value={formData.nume_contract} 
              onChange={(e) => setFormData({...formData, nume_contract: e.target.value})} 
              className="col-span-3" required 
            />
          </div>

          {/* Valoare */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="val" className="text-right">Valoare (RON)</Label>
            <Input 
              id="val" 
              type="number"
              placeholder="0.00"
              value={formData.valoare} 
              onChange={(e) => setFormData({...formData, valoare: e.target.value})} 
              className="col-span-3" required 
            />
          </div>

          {/* Data Semnarii */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="data" className="text-right">Data</Label>
            <Input 
              id="data" 
              type="date"
              value={formData.data_semnarii} 
              onChange={(e) => setFormData({...formData, data_semnarii: e.target.value})} 
              className="col-span-3" required 
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status</Label>
            <div className="col-span-3">
              <Select 
                value={formData.status || undefined}
                onValueChange={(val) => setFormData({...formData, status: val})}
              >
                <SelectTrigger><SelectValue  /></SelectTrigger>
                <SelectContent className="bg-blue-500">
                  <SelectItem className="hover:bg-blue-600 cursor-pointer" value="draft">Draft (Ciornă)</SelectItem>
                  <SelectItem className="hover:bg-blue-600 cursor-pointer" value="activ">Activ</SelectItem>
                  <SelectItem className="hover:bg-blue-600 cursor-pointer" value="expirat">Expirat</SelectItem>
                  <SelectItem className="hover:bg-blue-600 cursor-pointer" value="anulat">Anulat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? "Se salvează..." : "Salvează Contract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}