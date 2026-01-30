"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Users, User, Percent, Plus, Wallet } from "lucide-react";
import { Elev, Grupa } from "@/types";

export function AddInscriereDialog({ onInscriereAdded }: { onInscriereAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [elevi, setElevi] = useState<Elev[]>([]);
  const [grupe, setGrupe] = useState<Grupa[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    grupa_id: "",
    elev_id: "",
    data_inscriere: today,
    status_inscriere: "activ",
    tip_plata: "standard",
    reducere_percent: "0",
    note: ""
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
      const res = await fetch("http://127.0.0.1:8000/inscrieri/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onInscriereAdded();
        setFormData({...formData, elev_id: "", reducere_percent: "0"}); 
      } else {
          alert("Eroare! Posibil elevul este deja în această grupă.");
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const labelStyle = "flex items-center gap-2 text-slate-700 text-sm font-semibold mb-1.5";
  const inputStyle = "bg-white border-slate-300 text-slate-900 focus-visible:ring-orange-500 focus-visible:border-orange-500 h-10 shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 gap-2 px-6 rounded-full cursor-pointer">
          <Plus className="h-4 w-4" /> Înscrie Elev
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-162.5 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-orange-50 p-6 border-b border-orange-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-orange-500">
                        <UserPlus className="h-5 w-5 fill-orange-100" />
                    </div>
                    Înscriere Nouă
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                    Adaugă un elev într-o grupă activă.
                </DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label className={labelStyle}><Users className="h-3.5 w-3.5"/> Grupă</Label>
                    <Select value={formData.grupa_id} onValueChange={v => setFormData({...formData, grupa_id: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue placeholder="Alege grupa..." /></SelectTrigger>
                        <SelectContent className="bg-orange-400">
                            {grupe.map(g => <SelectItem className="hover:bg-orange-500 cursor-pointer" key={g.id} value={g.id.toString()}>{g.nume_grupa}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className={labelStyle}><User className="h-3.5 w-3.5"/> Elev</Label>
                    <Select value={formData.elev_id} onValueChange={v => setFormData({...formData, elev_id: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue placeholder="Alege elevul..." /></SelectTrigger>
                        <SelectContent className="bg-orange-400">
                            {elevi.map(e => <SelectItem className="hover:bg-orange-500 cursor-pointer" key={e.id} value={e.id.toString()}>{e.nume_complet}</SelectItem>)}
                        </SelectContent>
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
                        <SelectContent className="bg-orange-400">
                            <SelectItem className="hover:bg-orange-500 cursor-pointer" value="activ">Activ</SelectItem>
                            <SelectItem className="hover:bg-orange-500 cursor-pointer" value="in_asteptare">În așteptare</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label className={labelStyle}><Wallet className="h-3.5 w-3.5"/> Tip Plată</Label>
                    <Input placeholder="Standard" value={formData.tip_plata} onChange={e => setFormData({...formData, tip_plata: e.target.value})} className={inputStyle}/>
                </div>
                <div>
                    <Label className={labelStyle}><Percent className="h-3.5 w-3.5"/> Reducere (%)</Label>
                    <Input type="number" min="0" max="100" value={formData.reducere_percent} onChange={e => setFormData({...formData, reducere_percent: e.target.value})} className={inputStyle}/>
                </div>
            </div>

            <DialogFooter>
                <Button className="cursor-pointer bg-orange-800/10 text-orange-900 hover:bg-red-50 hover:text-red-600" type="button" variant="ghost" onClick={() => setOpen(false)}>Anulează</Button>
                <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white shadow-md cursor-pointer">
                    {loading ? "..." : "Confirmă Înscrierea"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}