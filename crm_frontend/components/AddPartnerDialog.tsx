"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
// Am importat iconitele necesare pentru a pastra stilul
import { Building2, MapPin, Phone, Mail, GraduationCap, Plus, Building } from "lucide-react";

// Definim ce date trimitem la Backend
interface PartnerFormData {
  nume: string;
  tip: string;
  oras: string;
  telefon: string;
  email: string;
}

export function AddPartnerDialog({ onPartnerAdded }: { onPartnerAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Starea formularului (neschimbata)
  const [formData, setFormData] = useState<PartnerFormData>({
    nume: "",
    tip: "scoala_stat",
    oras: "",
    telefon: "",
    email: "",
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
      const res = await fetch("http://127.0.0.1:8000/parteneri/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setOpen(false);
        onPartnerAdded();
        setFormData({ nume: "", tip: "scoala_stat", oras: "", telefon: "", email: "" });
      } else {
        alert("Ceva nu a mers bine.");
      }
    } catch (error) {
      console.error(error);
      alert("Eroare de conexiune.");
    } finally {
      setLoading(false);
    }
  };

  // Stiluri reutilizabile (copiate din componenta sursa)
  const labelStyle = "flex items-center gap-2 text-slate-700 text-sm font-semibold mb-1.5";
  const inputStyle = "bg-white border-slate-300 text-slate-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-10 shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Buton stilizat conform cerintei */}
        <Button className="bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 gap-2 px-6 rounded-full">
          <Plus className="h-4 w-4" /> Adaugă Partener
        </Button>
      </DialogTrigger>
      
      {/* Content stilizat cu header colorat si rounded corners */}
      <DialogContent className="sm:max-w-162.5 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-emerald-50 p-6 border-b border-emerald-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600">
                        <Building2 className="h-5 w-5 fill-emerald-100" />
                    </div>
                    Partener Nou
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                    Completează datele instituției aici.
                </DialogDescription>
            </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          
          {/* NUME & TIP - Pe doua coloane */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                  <Label htmlFor="nume" className={labelStyle}>
                      <Building className="h-3.5 w-3.5" /> Nume Instituție
                  </Label>
                  <Input
                    id="nume"
                    value={formData.nume}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                    placeholder="Ex: Școala Gimnazială Nr. 1"
                  />
              </div>

              <div>
                  <Label htmlFor="tip" className={labelStyle}>
                      <GraduationCap className="h-3.5 w-3.5" /> Tip Instituție
                  </Label>
                  <Select onValueChange={handleSelectChange} defaultValue={formData.tip}>
                    <SelectTrigger className={inputStyle}>
                      <SelectValue placeholder="Selectează tipul" />
                    </SelectTrigger>
                    {/* Am pastrat stilul de fundal verde din exemplul tau */}
                    <SelectContent className="bg-emerald-400">
                      <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="scoala_stat">Școală de Stat</SelectItem>
                      <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="scoala_privata">Școală Privată</SelectItem>
                      <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="gradinita">Grădiniță</SelectItem>
                      <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="hub_educational">Hub Educațional</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
          </div>

          {/* ORAS - Full width */}
          <div>
            <Label htmlFor="oras" className={labelStyle}>
                <MapPin className="h-3.5 w-3.5" /> Oraș / Locație
            </Label>
            <Input
              id="oras"
              value={formData.oras}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Ex: București, Sector 1"
            />
          </div>

          {/* TELEFON & EMAIL - Pe doua coloane */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="telefon" className={labelStyle}>
                    <Phone className="h-3.5 w-3.5" /> Telefon
                </Label>
                <Input
                  id="telefon"
                  value={formData.telefon}
                  onChange={handleChange}
                  className={inputStyle}
                  placeholder="07xx..."
                />
              </div>

              <div>
                <Label htmlFor="email" className={labelStyle}>
                    <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputStyle}
                  placeholder="contact@scoala.ro"
                />
              </div>
          </div>

          <DialogFooter>
            <Button className="cursor-pointer bg-emerald-800/10 text-emerald-900 hover:bg-red-50 hover:text-red-600" type="button" variant="ghost" onClick={() => setOpen(false)}>
                Anulează
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer">
              {loading ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}