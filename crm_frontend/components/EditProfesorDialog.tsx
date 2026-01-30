"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Pencil, User, Mail, Phone, Briefcase, Banknote, Calendar } from "lucide-react";
import { Profesor } from "@/types";

interface EditProps {
  profesor: Profesor;
  onUpdate: () => void;
}

export function EditProfesorDialog({ profesor, onUpdate }: EditProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nume_complet: profesor.nume_complet,
    email: profesor.email,
    telefon: profesor.telefon,
    tip_contract: profesor.tip_contract,
    tarif_orar_default: profesor.tarif_orar_default.toString(),
    data_start: profesor.data_start,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      tarif_orar_default: parseFloat(formData.tarif_orar_default),
      is_active: true
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/profesori/${profesor.id}`, {
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
  const inputStyle = "bg-white border-slate-300 text-slate-900 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-10 shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-150 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-blue-50 p-6 border-b border-blue-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600">
                        <GraduationCap className="h-5 w-5 fill-blue-100" />
                    </div>
                    Editare Profesor
                </DialogTitle>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          
          <div>
            <Label className={labelStyle}><User className="h-3.5 w-3.5"/> Nume Complet</Label>
            <Input value={formData.nume_complet} onChange={(e) => setFormData({...formData, nume_complet: e.target.value})} className={inputStyle} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className={labelStyle}><Mail className="h-3.5 w-3.5"/> Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={inputStyle} />
              </div>
              <div>
                <Label className={labelStyle}><Phone className="h-3.5 w-3.5"/> Telefon</Label>
                <Input value={formData.telefon} onChange={(e) => setFormData({...formData, telefon: e.target.value})} className={inputStyle} />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className={labelStyle}><Briefcase className="h-3.5 w-3.5"/> Tip Contract</Label>
                <Select value={formData.tip_contract} onValueChange={(val) => setFormData({...formData, tip_contract: val})}>
                    <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-blue-400">
                        <SelectItem value="cim" className="hover:bg-blue-500 cursor-pointer">CIM</SelectItem>
                        <SelectItem value="srl" className="hover:bg-blue-500 cursor-pointer">SRL</SelectItem>
                        <SelectItem value="pfa" className="hover:bg-blue-500 cursor-pointer">PFA</SelectItem>
                        <SelectItem value="voluntariat" className="hover:bg-blue-500 cursor-pointer">Voluntariat</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelStyle}><Banknote className="h-3.5 w-3.5"/> Tarif (RON/h)</Label>
                <Input type="number" step="0.5" value={formData.tarif_orar_default} onChange={(e) => setFormData({...formData, tarif_orar_default: e.target.value})} className={inputStyle} />
              </div>
          </div>

          <div>
            <Label className={labelStyle}><Calendar className="h-3.5 w-3.5"/> Data Start</Label>
            <Input type="date" value={formData.data_start} onChange={(e) => setFormData({...formData, data_start: e.target.value})} className={inputStyle} />
          </div>

          <DialogFooter>
            <Button type="button" className="text-black cursor-pointer hover:bg-red-600/30" variant="ghost" onClick={() => setOpen(false)}>Anulează</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Salvează</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}