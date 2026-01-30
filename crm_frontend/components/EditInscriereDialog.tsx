"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, User, Percent } from "lucide-react";
import { Inscriere, Elev, Grupa } from "@/types";

interface EditProps {
  inscriere: Inscriere;
  onUpdate: () => void;
}

export function EditInscriereDialog({ inscriere, onUpdate }: EditProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Avem nevoie de liste pt a popula numele in dropdown-uri, chiar daca sunt preselectate
  const [elevi, setElevi] = useState<Elev[]>([]);
  const [grupe, setGrupe] = useState<Grupa[]>([]);

  const [formData, setFormData] = useState({
    grupa_id: inscriere.grupa_id.toString(),
    elev_id: inscriere.elev_id.toString(),
    data_inscriere: inscriere.data_inscriere,
    status_inscriere: inscriere.status_inscriere,
    tip_plata: inscriere.tip_plata || "standard",
    reducere_percent: inscriere.reducere_percent.toString(),
    note: inscriere.note || ""
  });

  useEffect(() => {
    if (open) {
        Promise.all([
            fetch("http://127.0.0.1:8000/elevi/").then(r => r.json()),
            fetch("http://127.0.0.1:8000/grupe/").then(r => r.json())
        ]).then(([eData, gData]) => {
            if(Array.isArray(eData)) setElevi(eData);
            if(Array.isArray(gData)) setGrupe(gData);
        });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
        ...formData,
        grupa_id: parseInt(formData.grupa_id),
        elev_id: parseInt(formData.elev_id),
        reducere_percent: parseFloat(formData.reducere_percent) || 0
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/inscrieri/${inscriere.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onUpdate();
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const labelStyle = "flex items-center gap-2 text-slate-700 text-sm font-semibold mb-1.5";
  const inputStyle = "bg-white border-slate-300 text-slate-900 focus-visible:ring-indigo-500 h-10 shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8 text-black hover:bg-slate-100">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-162.5 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-indigo-50 p-6 border-b border-indigo-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
                        <Pencil className="h-5 w-5 fill-indigo-100" />
                    </div>
                    Modificare Înscriere
                </DialogTitle>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
            
            {/* GRUPA & ELEV (De obicei nu se schimba la editare, dar le lasam active) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label className={labelStyle}>Grupă</Label>
                    <Select value={formData.grupa_id} onValueChange={v => setFormData({...formData, grupa_id: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                        <SelectContent>{grupe.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.nume_grupa}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className={labelStyle}>Elev</Label>
                    <Select value={formData.elev_id} onValueChange={v => setFormData({...formData, elev_id: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                        <SelectContent>{elevi.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.nume_complet}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label className={labelStyle}>Data Înscrierii</Label>
                    <Input type="date" required value={formData.data_inscriere} onChange={e => setFormData({...formData, data_inscriere: e.target.value})} className={inputStyle}/>
                </div>
                <div>
                     <Label className={labelStyle}>Status</Label>
                     <Select value={formData.status_inscriere} onValueChange={v => setFormData({...formData, status_inscriere: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="activ">Activ</SelectItem>
                            <SelectItem value="in_asteptare">În așteptare</SelectItem>
                            <SelectItem value="retras">Retras</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <Label className={labelStyle}>Tip Plată (Intern)</Label>
                        <Input value={formData.tip_plata} onChange={e => setFormData({...formData, tip_plata: e.target.value})} className="bg-white border-slate-300"/>
                    </div>
                    <div>
                        <Label className={labelStyle}><Percent className="h-3.5 w-3.5"/> Reducere (%)</Label>
                        <Input type="number" min="0" max="100" value={formData.reducere_percent} onChange={e => setFormData({...formData, reducere_percent: e.target.value})} className="bg-white border-slate-300"/>
                    </div>
                 </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Anulează</Button>
                <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                    {loading ? "..." : "Salvează"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}