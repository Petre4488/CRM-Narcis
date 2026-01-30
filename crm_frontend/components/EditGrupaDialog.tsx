"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, BookOpen, GraduationCap, Briefcase, Pencil } from "lucide-react";
import { Contract, Curs, Grupa, Profesor } from "@/types";

interface EditGrupaProps {
  grupa: Grupa;
  onGrupaUpdated: () => void;
}

export function EditGrupaDialog({ grupa, onGrupaUpdated }: EditGrupaProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Liste pentru dropdown-uri
  const [cursuri, setCursuri] = useState<Curs[]>([]);
  const [profesori, setProfesori] = useState<Profesor[]>([]);
  const [contracte, setContracte] = useState<Contract[]>([]);

  // State-ul formularului
  const [formData, setFormData] = useState({
    nume_grupa: grupa.nume_grupa,
    curs_id: grupa.curs_id.toString(),
    profesor_titular_id: grupa.profesor_titular_id.toString(),
    contract_id: grupa.contract_id ? grupa.contract_id.toString() : "none",
    max_copii: grupa.max_copii.toString(),
    status_grupa: grupa.status_grupa,
    tip_plata_grupa: grupa.tip_plata_grupa,
    data_inceput: grupa.data_inceput || "",
    data_sfarsit: grupa.data_sfarsit || ""
  });

  // Incarcam listele cand se deschide fereastra
  useEffect(() => {
    if (open) {
        Promise.all([
            fetch("http://127.0.0.1:8000/cursuri/").then(r => r.json()),
            fetch("http://127.0.0.1:8000/profesori/").then(r => r.json()),
            fetch("http://127.0.0.1:8000/contracte/").then(r => r.json())
        ]).then(([cursData, profData, contractData]) => {
            if(Array.isArray(cursData)) setCursuri(cursData);
            if(Array.isArray(profData)) setProfesori(profData);
            if(Array.isArray(contractData)) setContracte(contractData);
        }).catch(err => console.error(err));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
        ...formData,
        curs_id: parseInt(formData.curs_id),
        profesor_titular_id: parseInt(formData.profesor_titular_id),
        contract_id: formData.contract_id === "none" ? null : parseInt(formData.contract_id),
        max_copii: parseInt(formData.max_copii),
        data_inceput: formData.data_inceput || null,
        data_sfarsit: formData.data_sfarsit || null,
        note: grupa.note // Pastram notele vechi momentan
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/grupe/${grupa.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onGrupaUpdated();
      } else {
        alert("Eroare la actualizare.");
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const labelStyle = "flex items-center gap-2 text-slate-700 text-sm font-semibold mb-1.5";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-black hover:bg-slate-100">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      {/* Design Alb Solid */}
      <DialogContent className="sm:max-w-175 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-violet-50 p-6 border-b border-violet-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="cursor-pointer bg-white p-2 rounded-lg shadow-sm text-violet-600">
                        <Pencil className="h-5 w-5 fill-violet-100" />
                    </div>
                    Editare Grupă
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                    Modifică detaliile grupei {grupa.nume_grupa}.
                </DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
            
            {/* NUME & DATA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label htmlFor="edit_nume_grupa" className={labelStyle}>Nume Grupă</Label>
                    <Input required id="edit_nume_grupa" 
                        value={formData.nume_grupa} onChange={e => setFormData({...formData, nume_grupa: e.target.value})}
                        className="bg-white border-slate-300 focus-visible:ring-violet-500"
                    />
                </div>
                <div>
                    <Label className={labelStyle}>Perioadă (Start - End)</Label>
                    <div className="flex gap-2">
                        <Input type="date" value={formData.data_inceput} onChange={e => setFormData({...formData, data_inceput: e.target.value})} className="bg-white border-slate-300"/>
                        <Input type="date" value={formData.data_sfarsit} onChange={e => setFormData({...formData, data_sfarsit: e.target.value})} className="bg-white border-slate-300"/>
                    </div>
                </div>
            </div>

            {/* CURS & PROFESOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label className={labelStyle}><BookOpen className="h-3.5 w-3.5"/> Materie / Curs</Label>
                    <Select value={formData.curs_id} onValueChange={v => setFormData({...formData, curs_id: v})}>
                        <SelectTrigger className="bg-white border-slate-300"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {cursuri.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nume_curs}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className={labelStyle}><GraduationCap className="h-3.5 w-3.5"/> Profesor Titular</Label>
                    <Select value={formData.profesor_titular_id} onValueChange={v => setFormData({...formData, profesor_titular_id: v})}>
                        <SelectTrigger className="bg-white border-slate-300"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {profesori.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nume_complet}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* STATUS & PLATA */}
            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <Label className="text-xs font-semibold text-slate-500 mb-1.5">Status Grupă</Label>
                        <Select value={formData.status_grupa} onValueChange={v => setFormData({...formData, status_grupa: v})}>
                            <SelectTrigger className="bg-white border-slate-300"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="planificata">Planificată</SelectItem>
                                <SelectItem value="activa">Activă (În curs)</SelectItem>
                                <SelectItem value="incheiata">Încheiată</SelectItem>
                                <SelectItem value="anulata">Anulată</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-slate-500 mb-1.5">Cine plătește?</Label>
                        <Select value={formData.tip_plata_grupa} onValueChange={v => setFormData({...formData, tip_plata_grupa: v})}>
                            <SelectTrigger className="bg-white border-slate-300"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="plateste_parintii">Părinții (Taxă lunară)</SelectItem>
                                <SelectItem value="plateste_scoala">Școala (Factură B2B)</SelectItem>
                                <SelectItem value="mixt">Mixt</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Anulează</Button>
                <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white shadow-md">
                    {loading ? "..." : "Salvează Modificările"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}