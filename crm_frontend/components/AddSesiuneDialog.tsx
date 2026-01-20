"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, Users, MapPin, GraduationCap, Plus, BookOpen } from "lucide-react";
import { Grupa, Profesor } from "@/types";

export function AddSesiuneDialog({ onSesiuneAdded }: { onSesiuneAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Liste
  const [grupe, setGrupe] = useState<Grupa[]>([]);
  const [profesori, setProfesori] = useState<Profesor[]>([]);

  const [formData, setFormData] = useState({
    grupa_id: "",
    profesor_id: "",
    data_start: "",
    ora_start: "14:00",
    ora_end: "16:00",
    sala: "",
    tema_lectiei: "",
    status_sesiune: "planificata"
  });

  useEffect(() => {
    if (open) {
        Promise.all([
            fetch("http://127.0.0.1:8000/grupe/").then(r => r.json()),
            fetch("http://127.0.0.1:8000/profesori/").then(r => r.json())
        ]).then(([gData, pData]) => {
            if(Array.isArray(gData)) setGrupe(gData);
            if(Array.isArray(pData)) setProfesori(pData);
        });
    }
  }, [open]);

  // Cand selectam grupa, punem automat profesorul titular
  const handleGrupaChange = (grupaId: string) => {
      const g = grupe.find(item => item.id.toString() === grupaId);
      setFormData({
          ...formData, 
          grupa_id: grupaId,
          profesor_id: g ? g.profesor_titular_id.toString() : "" 
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Combinam data cu ora pentru a face ISO String
    const startIso = `${formData.data_start}T${formData.ora_start}:00`;
    const endIso = `${formData.data_start}T${formData.ora_end}:00`;

    const payload = {
        grupa_id: parseInt(formData.grupa_id),
        profesor_id: parseInt(formData.profesor_id),
        data_ora_start: startIso,
        data_ora_end: endIso,
        sala: formData.sala,
        tema_lectiei: formData.tema_lectiei,
        status_sesiune: formData.status_sesiune,
        note: ""
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/sesiuni/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onSesiuneAdded();
        setFormData({...formData, tema_lectiei: ""}); 
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const labelStyle = "flex items-center gap-2 text-slate-700 text-sm font-semibold mb-1.5";
  const inputStyle = "bg-white border-slate-300 text-slate-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-10 shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 gap-2 px-6 rounded-full">
          <Plus className="h-4 w-4" /> Sesiune Nouă
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-162.5 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-emerald-50 p-6 border-b border-emerald-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600">
                        <CalendarClock className="h-5 w-5 fill-emerald-100" />
                    </div>
                    Planificare Sesiune
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                    Adaugă o lecție în calendar.
                </DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
            
            {/* GRUPA & PROFESOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label className={labelStyle}><Users className="h-3.5 w-3.5"/> Grupă</Label>
                    <Select value={formData.grupa_id} onValueChange={handleGrupaChange}>
                        <SelectTrigger className={inputStyle}><SelectValue placeholder="Alege grupa..." /></SelectTrigger>
                        <SelectContent>
                            {grupe.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.nume_grupa}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className={labelStyle}><GraduationCap className="h-3.5 w-3.5"/> Profesor</Label>
                    <Select value={formData.profesor_id} onValueChange={v => setFormData({...formData, profesor_id: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue placeholder="Profesor..." /></SelectTrigger>
                        <SelectContent>
                            {profesori.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nume_complet}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* DATA & ORA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                    <Label htmlFor="data" className={labelStyle}>Data</Label>
                    <Input id="data" type="date" className={inputStyle} value={formData.data_start} onChange={e => setFormData({...formData, data_start: e.target.value})} />
                </div>
                <div>
                    <Label htmlFor="start" className={labelStyle}>Ora Început</Label>
                    <Input id="start" type="time" className={inputStyle} value={formData.ora_start} onChange={e => setFormData({...formData, ora_start: e.target.value})} />
                </div>
                <div>
                    <Label htmlFor="end" className={labelStyle}>Ora Sfârșit</Label>
                    <Input id="end" type="time" className={inputStyle} value={formData.ora_end} onChange={e => setFormData({...formData, ora_end: e.target.value})} />
                </div>
            </div>

            {/* SALA & TEMA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label htmlFor="sala" className={labelStyle}><MapPin className="h-3.5 w-3.5"/> Sală / Locație</Label>
                    <Input id="sala" placeholder="Ex: Sala 1, Online..." className={inputStyle} value={formData.sala} onChange={e => setFormData({...formData, sala: e.target.value})} />
                </div>
                 <div>
                    <Label htmlFor="tema" className={labelStyle}><BookOpen className="h-3.5 w-3.5"/> Temă Lecție (Opțional)</Label>
                    <Input id="tema" placeholder="Ex: Introducere in Python" className={inputStyle} value={formData.tema_lectiei} onChange={e => setFormData({...formData, tema_lectiei: e.target.value})} />
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Anulează</Button>
                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                    {loading ? "..." : "Salvează în Orar"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}