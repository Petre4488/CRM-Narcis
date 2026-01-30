"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Pencil, MapPin, Phone, Mail, Building, GraduationCap } from "lucide-react";
import { Partener } from "@/types";

interface EditProps {
  partener: Partener;
  onUpdate: () => void;
}

export function EditPartnerDialog({ partener, onUpdate }: EditProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nume: partener.nume,
    tip: partener.tip,
    oras: partener.oras,
    telefon: partener.telefon,
    email: partener.email,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, tip: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/parteneri/${partener.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setOpen(false);
        onUpdate();
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
        <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-162.5 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-emerald-50 p-6 border-b border-emerald-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600">
                        <Building2 className="h-5 w-5 fill-emerald-100" />
                    </div>
                    Editare Partener
                </DialogTitle>
                <DialogDescription className="text-slate-600">Modifică datele instituției.</DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                  <Label htmlFor="nume" className={labelStyle}><Building className="h-3.5 w-3.5"/> Nume Instituție</Label>
                  <Input id="nume" value={formData.nume} onChange={handleChange} className={inputStyle} required />
              </div>
              <div>
                  <Label htmlFor="tip" className={labelStyle}><GraduationCap className="h-3.5 w-3.5"/> Tip Instituție</Label>
                  <Select onValueChange={handleSelectChange} defaultValue={formData.tip}>
                    <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-emerald-400">
                      <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="scoala_stat">Școală de Stat</SelectItem>
                      <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="scoala_privata">Școală Privată</SelectItem>
                      <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="gradinita">Grădiniță</SelectItem>
                      <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="hub_educational">Hub Educațional</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
          </div>

          <div>
            <Label htmlFor="oras" className={labelStyle}><MapPin className="h-3.5 w-3.5"/> Oraș</Label>
            <Input id="oras" value={formData.oras} onChange={handleChange} className={inputStyle} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="telefon" className={labelStyle}><Phone className="h-3.5 w-3.5"/> Telefon</Label>
                <Input id="telefon" value={formData.telefon} onChange={handleChange} className={inputStyle} />
              </div>
              <div>
                <Label htmlFor="email" className={labelStyle}><Mail className="h-3.5 w-3.5"/> Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} className={inputStyle} />
              </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Anulează</Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">Salvează</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}