"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, BookOpen, GraduationCap, CreditCard, FileSignature, Plus, Layers } from "lucide-react";
import { Curs, Profesor, Contract } from "@/types";

export function AddGrupaDialog({ onGrupaAdded }: { onGrupaAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Liste pt dropdown
  const [cursuri, setCursuri] = useState<Curs[]>([]);
  const [profesori, setProfesori] = useState<Profesor[]>([]);
  const [contracte, setContracte] = useState<Contract[]>([]);

  const [formData, setFormData] = useState({
    nume_grupa: "",
    curs_id: "",
    profesor_titular_id: "",
    tip_plata_grupa: "plateste_cursantul",
    contract_id: "null", // string "null" pt select
    status_grupa: "activa"
  });

  // Incarcam datele cand se deschide fereastra
  useEffect(() => {
    if (open) {
        Promise.all([
            fetch("http://127.0.0.1:8000/cursuri/").then(r => r.json()),
            fetch("http://127.0.0.1:8000/profesori/").then(r => r.json()),
            fetch("http://127.0.0.1:8000/contracte/").then(r => r.json())
        ]).then(([cData, pData, kData]) => {
            if(Array.isArray(cData)) setCursuri(cData);
            if(Array.isArray(pData)) setProfesori(pData);
            if(Array.isArray(kData)) setContracte(kData);
        });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
        ...formData,
        curs_id: parseInt(formData.curs_id),
        profesor_titular_id: parseInt(formData.profesor_titular_id),
        contract_id: formData.contract_id === "null" ? null : parseInt(formData.contract_id)
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/grupe/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onGrupaAdded();
        setFormData({
            nume_grupa: "",
            curs_id: "",
            profesor_titular_id: "",
            tip_plata_grupa: "plateste_cursantul",
            contract_id: "null",
            status_grupa: "activa"
        }); 
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const labelStyle = "flex items-center gap-2 text-slate-700 text-sm font-semibold mb-1.5";
  const inputStyle = "bg-white border-slate-300 text-slate-900 focus-visible:ring-violet-500 focus-visible:border-violet-500 h-10 shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30 gap-2 px-6 rounded-full cursor-pointer">
          <Plus className="h-4 w-4" /> Grupă Nouă
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-162.5 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-violet-50 p-6 border-b border-violet-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-violet-600">
                        <Layers className="h-5 w-5 fill-violet-100" />
                    </div>
                    Grupă de Studiu
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                    Creează o clasă nouă și asociază-i un profesor.
                </DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
            
            {/* NUME GRUPA */}
            <div>
                <Label htmlFor="nume" className={labelStyle}><Users className="h-3.5 w-3.5"/> Nume Grupă</Label>
                <Input 
                    id="nume" placeholder="Ex: Python Începători - Marți" 
                    value={formData.nume_grupa} onChange={e => setFormData({...formData, nume_grupa: e.target.value})}
                    className={inputStyle} required
                />
            </div>

            {/* CURS & PROFESOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label className={labelStyle}><BookOpen className="h-3.5 w-3.5"/> Materie / Curs</Label>
                    <Select value={formData.curs_id} onValueChange={v => setFormData({...formData, curs_id: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue placeholder="Alege cursul..." /></SelectTrigger>
                        <SelectContent className="bg-violet-400">
                            {cursuri.map(c => <SelectItem className="hover:bg-violet-500 cursor-pointer" key={c.id} value={c.id.toString()}>{c.nume_curs}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className={labelStyle}><GraduationCap className="h-3.5 w-3.5"/> Profesor Titular</Label>
                    <Select value={formData.profesor_titular_id} onValueChange={v => setFormData({...formData, profesor_titular_id: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue placeholder="Alege profesorul..." /></SelectTrigger>
                        <SelectContent className="bg-violet-400">
                            {profesori.map(p => <SelectItem className="hover:bg-violet-500 cursor-pointer" key={p.id} value={p.id.toString()}>{p.nume_complet}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* PLATA & CONTRACT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label className={labelStyle}><CreditCard className="h-3.5 w-3.5"/> Tip Plată</Label>
                    <Select value={formData.tip_plata_grupa} onValueChange={v => setFormData({...formData, tip_plata_grupa: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-violet-400">
                            <SelectItem className="hover:bg-violet-500 cursor-pointer" value="plateste_cursantul">B2C (Plătește Elevul)</SelectItem>
                            <SelectItem className="hover:bg-violet-500 cursor-pointer" value="plateste_scoala">B2B (Plătește Școala)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className={labelStyle}><FileSignature className="h-3.5 w-3.5"/> Contract (Opțional)</Label>
                    <Select value={formData.contract_id} onValueChange={v => setFormData({...formData, contract_id: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue placeholder="Fără contract" /></SelectTrigger>
                        <SelectContent className="bg-violet-400">
                            <SelectItem className="hover:bg-violet-500 cursor-pointer" value="null">Niciunul</SelectItem>
                            {contracte.map(k => <SelectItem className="hover:bg-violet-500 cursor-pointer" key={k.id} value={k.id.toString()}>{k.nume_contract}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DialogFooter>
                <Button className="cursor-pointer bg-violet-800/10 text-violet-900 hover:bg-red-50 hover:text-red-600" type="button" variant="ghost" onClick={() => setOpen(false)}>Anulează</Button>
                <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white shadow-md cursor-pointer">
                    {loading ? "..." : "Creează Grupa"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}