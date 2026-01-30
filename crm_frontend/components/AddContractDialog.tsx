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
  DialogDescription,
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
import { FileSignature, Building, Calendar, CreditCard, FileText, Plus } from "lucide-react";
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

  const labelStyle = "flex items-center gap-2 text-slate-700 text-sm font-semibold mb-1.5";
  const inputStyle = "bg-white border-slate-300 text-slate-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-10 shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 gap-2 px-6 rounded-full cursor-pointer">
          <Plus className="h-4 w-4" /> Contract Nou
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-150 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-emerald-50 p-6 border-b border-emerald-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600">
                        <FileSignature className="h-5 w-5 fill-emerald-100" />
                    </div>
                    Contract Nou
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                    Înregistrează un nou contract pentru un partener.
                </DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          
          {/* CLIENT */}
          <div>
            <Label className={labelStyle}><Building className="h-3.5 w-3.5"/> Client (Partener)</Label>
            <Select 
                value={formData.partener_id || undefined}
                onValueChange={(val) => setFormData({...formData, partener_id: val})} 
            >
                <SelectTrigger className={inputStyle}>
                    <SelectValue placeholder="Alege clientul..." />
                </SelectTrigger>
                <SelectContent className="bg-emerald-400">
                    {parteneri.map((p) => (
                    <SelectItem className="hover:bg-emerald-500 cursor-pointer" key={p.id} value={p.id.toString()}>
                        {p.nume}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          {/* TITLU & VALOARE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="nume" className={labelStyle}><FileText className="h-3.5 w-3.5"/> Titlu Contract</Label>
                <Input 
                    id="nume" 
                    placeholder="ex: Abonament Anual"
                    value={formData.nume_contract} 
                    onChange={(e) => setFormData({...formData, nume_contract: e.target.value})} 
                    className={inputStyle} required 
                />
              </div>

              <div>
                <Label htmlFor="val" className={labelStyle}><CreditCard className="h-3.5 w-3.5"/> Valoare (RON)</Label>
                <Input 
                    id="val" 
                    type="number"
                    placeholder="0.00"
                    value={formData.valoare} 
                    onChange={(e) => setFormData({...formData, valoare: e.target.value})} 
                    className={inputStyle} required 
                />
              </div>
          </div>

          {/* DATA & STATUS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="data" className={labelStyle}><Calendar className="h-3.5 w-3.5"/> Data Semnării</Label>
                <Input 
                    id="data" 
                    type="date"
                    value={formData.data_semnarii} 
                    onChange={(e) => setFormData({...formData, data_semnarii: e.target.value})} 
                    className={inputStyle} required 
                />
              </div>
              
              <div>
                <Label className={labelStyle}>Status</Label>
                <Select 
                    value={formData.status || undefined}
                    onValueChange={(val) => setFormData({...formData, status: val})}
                >
                    <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-emerald-400">
                        <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="draft">Draft (Ciornă)</SelectItem>
                        <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="activ">Activ</SelectItem>
                        <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="expirat">Expirat</SelectItem>
                        <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="anulat">Anulat</SelectItem>
                    </SelectContent>
                </Select>
              </div>
          </div>

          <DialogFooter>
            <Button className="cursor-pointer bg-emerald-800/10 text-emerald-900 hover:bg-red-50 hover:text-red-600" type="button" variant="ghost" onClick={() => setOpen(false)}>
                Anulează
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer">
                {loading ? "..." : "Salvează Contract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}