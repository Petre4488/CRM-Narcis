"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Pencil, Layers, BarChart, Users, Target } from "lucide-react";
import { Curs } from "@/types";

interface EditProps {
  curs: Curs;
  onUpdate: () => void;
}

export function EditCursDialog({ curs, onUpdate }: EditProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nume_curs: curs.nume_curs,
    categorie: curs.categorie,
    nivel_dificultate: curs.nivel_dificultate,
    varsta_min: curs.varsta_min.toString(),
    varsta_max: curs.varsta_max.toString(),
    programa_link: curs.programa_link || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      varsta_min: parseInt(formData.varsta_min),
      varsta_max: parseInt(formData.varsta_max),
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/cursuri/${curs.id}`, {
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
  const inputStyle = "bg-white border-slate-300 text-slate-900 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 h-10 shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer  h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-150 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-indigo-50 p-6 border-b border-indigo-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
                        <BookOpen className="h-5 w-5 fill-indigo-100" />
                    </div>
                    Editare Curs
                </DialogTitle>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          <div>
            <Label className={labelStyle}><Target className="h-3.5 w-3.5"/> Nume Curs</Label>
            <Input value={formData.nume_curs} onChange={(e) => setFormData({...formData, nume_curs: e.target.value})} className={inputStyle} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className={labelStyle}><Layers className="h-3.5 w-3.5"/> Categorie</Label>
                <Select value={formData.categorie} onValueChange={(val) => setFormData({...formData, categorie: val})}>
                    <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-indigo-400">
                        <SelectItem value="Programare" className="hover:bg-indigo-500 cursor-pointer">Programare</SelectItem>
                        <SelectItem value="Robotica" className="hover:bg-indigo-500 cursor-pointer">Robotică</SelectItem>
                        <SelectItem value="Art" className="hover:bg-indigo-500 cursor-pointer">Art & Design</SelectItem>
                        <SelectItem value="Limbi Straine" className="hover:bg-indigo-500 cursor-pointer">Limbi Străine</SelectItem>
                        <SelectItem value="Personal" className="hover:bg-indigo-500 cursor-pointer">Dezvoltare Personală</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelStyle}><BarChart className="h-3.5 w-3.5"/> Nivel</Label>
                <Select value={formData.nivel_dificultate} onValueChange={(val) => setFormData({...formData, nivel_dificultate: val})}>
                    <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-indigo-400">
                        <SelectItem value="Incepator" className="hover:bg-indigo-500 cursor-pointer">Începător</SelectItem>
                        <SelectItem value="Mediu" className="hover:bg-indigo-500 cursor-pointer">Mediu</SelectItem>
                        <SelectItem value="Avansat" className="hover:bg-indigo-500 cursor-pointer">Avansat</SelectItem>
                        <SelectItem value="Expert" className="hover:bg-indigo-500 cursor-pointer">Expert</SelectItem>
                    </SelectContent>
                </Select>
              </div>
          </div>

          <div>
            <Label className={labelStyle}><Users className="h-3.5 w-3.5"/> Interval Vârstă</Label>
            <div className="flex gap-4 items-center">
                <Input type="number" className={inputStyle} value={formData.varsta_min} onChange={(e) => setFormData({...formData, varsta_min: e.target.value})} />
                <span>-</span>
                <Input type="number" className={inputStyle} value={formData.varsta_max} onChange={(e) => setFormData({...formData, varsta_max: e.target.value})} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button"  className="text-black cursor-pointer hover:bg-red-600/30" variant="ghost" onClick={() => setOpen(false)}>Anulează</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">Salvează</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}