"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, Users, MapPin, GraduationCap, Pencil, BookOpen } from "lucide-react";
import { Grupa, Profesor, Sesiune } from "@/types";

interface EditSesiuneProps {
  sesiune: Sesiune;
  onSesiuneUpdated: () => void;
}

export function EditSesiuneDialog({ sesiune, onSesiuneUpdated }: EditSesiuneProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Liste
  const [grupe, setGrupe] = useState<Grupa[]>([]);
  const [profesori, setProfesori] = useState<Profesor[]>([]);

  // Extragem data si orele din string-urile ISO (ex: "2026-01-20T14:00:00")
  const initialDate = sesiune.data_ora_start.split("T")[0];
  const initialStart = sesiune.data_ora_start.split("T")[1]?.substring(0, 5); // "14:00"
  const initialEnd = sesiune.data_ora_end.split("T")[1]?.substring(0, 5);     // "16:00"

  const [formData, setFormData] = useState({
    grupa_id: sesiune.grupa_id.toString(),
    profesor_id: sesiune.profesor_id.toString(),
    data_start: initialDate,
    ora_start: initialStart,
    ora_end: initialEnd,
    sala: sesiune.sala || "",
    tema_lectiei: sesiune.tema_lectiei || "",
    status_sesiune: sesiune.status_sesiune
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        note: sesiune.note // pastram notele vechi
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/sesiuni/${sesiune.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onSesiuneUpdated();
      } else {
        alert("Eroare la actualizare.");
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const labelStyle = "flex items-center gap-2 text-slate-700 text-sm font-semibold mb-1.5";
  const inputStyle = "bg-white border-slate-300 text-slate-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-10 shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8 text-black hover:bg-slate-100">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-162.5 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-emerald-50 p-6 border-b border-emerald-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="cursor-pointer bg-white p-2 rounded-lg shadow-sm text-emerald-600">
                        <Pencil className="h-5 w-5 fill-emerald-100" />
                    </div>
                    Editare Sesiune
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                    Modifică detaliile lecției planificate.
                </DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
            
            {/* GRUPA & PROFESOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label className={labelStyle}><Users className="h-3.5 w-3.5"/> Grupă</Label>
                    <Select value={formData.grupa_id} onValueChange={v => setFormData({...formData, grupa_id: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {grupe.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.nume_grupa}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className={labelStyle}><GraduationCap className="h-3.5 w-3.5"/> Profesor</Label>
                    <Select value={formData.profesor_id} onValueChange={v => setFormData({...formData, profesor_id: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {profesori.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nume_complet}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* DATA & ORA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                    <Label htmlFor="edit_data" className={labelStyle}>Data</Label>
                    <Input id="edit_data" type="date" className={inputStyle} value={formData.data_start} onChange={e => setFormData({...formData, data_start: e.target.value})} />
                </div>
                <div>
                    <Label htmlFor="edit_start" className={labelStyle}>Ora Început</Label>
                    <Input id="edit_start" type="time" className={inputStyle} value={formData.ora_start} onChange={e => setFormData({...formData, ora_start: e.target.value})} />
                </div>
                <div>
                    <Label htmlFor="edit_end" className={labelStyle}>Ora Sfârșit</Label>
                    <Input id="edit_end" type="time" className={inputStyle} value={formData.ora_end} onChange={e => setFormData({...formData, ora_end: e.target.value})} />
                </div>
            </div>

            {/* SALA & TEMA & STATUS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label htmlFor="edit_sala" className={labelStyle}><MapPin className="h-3.5 w-3.5"/> Sală / Locație</Label>
                    <Input id="edit_sala" className={inputStyle} value={formData.sala} onChange={e => setFormData({...formData, sala: e.target.value})} />
                </div>
                 <div>
                    <Label htmlFor="edit_status" className={labelStyle}>Status</Label>
                    <Select value={formData.status_sesiune} onValueChange={v => setFormData({...formData, status_sesiune: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="planificata">Planificată</SelectItem>
                            <SelectItem value="realizata">Realizată</SelectItem>
                            <SelectItem value="anulata">Anulată</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            {/* TEMA LECTIEI */}
            <div>
                 <Label htmlFor="edit_tema" className={labelStyle}><BookOpen className="h-3.5 w-3.5"/> Temă Lecție</Label>
                 <Input id="edit_tema" className={inputStyle} value={formData.tema_lectiei} onChange={e => setFormData({...formData, tema_lectiei: e.target.value})} />
            </div>

            <DialogFooter>
                <Button type="button" variant="ghost" className="text-black cursor-pointer hover:bg-red-600/30" onClick={() => setOpen(false)}>Anulează</Button>
                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                    {loading ? "..." : "Salvează Modificările"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}