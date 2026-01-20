"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Calendar, School, Phone, Mail, ShieldCheck, UserCheck, Plus, Sparkles } from "lucide-react";

export function AddElevDialog({ onElevAdded }: { onElevAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nume_complet: "",
    data_nasterii: "",
    scoala_curenta: "",
    nume_parinte: "",
    telefon_parinte: "",
    email_parinte: "",
    gdpr_accepted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
        ...formData,
        data_nasterii: formData.data_nasterii || null
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/elevi/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onElevAdded();
        setFormData({
            nume_complet: "",
            data_nasterii: "",
            scoala_curenta: "",
            nume_parinte: "",
            telefon_parinte: "",
            email_parinte: "",
            gdpr_accepted: false,
        });
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // Stiluri reutilizabile (am scos transparenta si de la input-uri ca sa fie clean)
  const inputStyle = "bg-white border-slate-200 text-slate-900 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-10 shadow-sm";
  const labelStyle = "flex items-center gap-2 text-slate-600 text-sm font-semibold mb-1.5";
  const sectionTitleStyle = "text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 gap-2 px-6 rounded-full transition-all">
          <Plus className="h-4 w-4" /> Adaugă Elev
        </Button>
      </DialogTrigger>
      
      {/* 👇 AICI AM SCHIMBAT:
         - Am pus 'bg-white' (alb solid).
         - Am sters 'backdrop-blur-xl' (nu mai avem nevoie de blur daca e solid).
         - Am sters '/85' sau alte opacitati.
      */}
      <DialogContent className="sm:max-w-162.5  bg-white border h-4/5 border-slate-100 shadow-2xl p-0 overflow-hidden rounded-2xl">
        
        {/* HEADER */}
        <div className="bg-blue-50/50 p-6 border-b border-blue-100/50 ">
            <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600">
                    <Sparkles className="h-5 w-5 fill-blue-100" />
                </div>
                Înregistrare Elev
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-base mt-1">
                Completează fișa de înscriere digitală.
            </DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
          
          {/* SECTIUNEA 1 */}
          <div>
            <h3 className={sectionTitleStyle}>
                <User className="h-4 w-4" /> Datele Copilului
            </h3>
            
            <div className="grid gap-5">
                <div className="grid gap-1">
                    <Label htmlFor="nume_elev" className={labelStyle}>
                        Nume Complet <span className="text-blue-500">*</span>
                    </Label>
                    <Input 
                        id="nume_elev"
                        required 
                        placeholder="Ex: Andrei Popescu"
                        value={formData.nume_complet} 
                        onChange={e => setFormData({...formData, nume_complet: e.target.value})}
                        className={inputStyle}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="grid gap-1">
                        <Label htmlFor="data_nasterii" className={labelStyle}>
                            <Calendar className="h-3.5 w-3.5 text-blue-500"/> Data Nașterii
                        </Label>
                        <Input 
                            id="data_nasterii"
                            type="date" 
                            value={formData.data_nasterii} 
                            onChange={e => setFormData({...formData, data_nasterii: e.target.value})}
                            className={inputStyle}
                        />
                    </div>
                    <div className="grid gap-1">
                        <Label htmlFor="scoala" className={labelStyle}>
                            <School className="h-3.5 w-3.5 text-blue-500"/> Școala
                        </Label>
                        <Input 
                            id="scoala"
                            placeholder="Școala..."
                            value={formData.scoala_curenta} 
                            onChange={e => setFormData({...formData, scoala_curenta: e.target.value})}
                            className={inputStyle}
                        />
                    </div>
                </div>
            </div>
          </div>

          {/* SECTIUNEA 2 */}
          <div>
            <h3 className={sectionTitleStyle}>
                <UserCheck className="h-4 w-4" /> Contact Tutore
            </h3>
            
            <div className="grid gap-5">
                 <div className="grid gap-1">
                    <Label htmlFor="nume_parinte" className={labelStyle}>
                        Nume Părinte
                    </Label>
                    <Input 
                        id="nume_parinte"
                        placeholder="Nume..."
                        value={formData.nume_parinte} 
                        onChange={e => setFormData({...formData, nume_parinte: e.target.value})}
                        className={inputStyle}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="grid gap-1">
                        <Label htmlFor="telefon" className={labelStyle}>
                            <Phone className="h-3.5 w-3.5 text-blue-500"/> Telefon
                        </Label>
                        <Input 
                            id="telefon"
                            placeholder="07xx..."
                            value={formData.telefon_parinte} 
                            onChange={e => setFormData({...formData, telefon_parinte: e.target.value})}
                            className={inputStyle}
                        />
                    </div>
                    <div className="grid gap-1">
                        <Label htmlFor="email" className={labelStyle}>
                            <Mail className="h-3.5 w-3.5 text-blue-500"/> Email
                        </Label>
                        <Input 
                            id="email"
                            type="email"
                            placeholder="email@..."
                            value={formData.email_parinte} 
                            onChange={e => setFormData({...formData, email_parinte: e.target.value})}
                            className={inputStyle}
                        />
                    </div>
                </div>
            </div>
          </div>

          {/* SECTIUNEA 3 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full transition-colors ${formData.gdpr_accepted ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                    <Label htmlFor="gdpr_switch" className="font-bold text-slate-800 cursor-pointer">Acord GDPR</Label>
                    <p className="text-xs text-slate-500">Acord pentru prelucrarea datelor.</p>
                </div>
             </div>
            
            <Switch 
                id="gdpr_switch"
                checked={formData.gdpr_accepted}
                onCheckedChange={(c) => setFormData({...formData, gdpr_accepted: c})}
                className="data-[state=checked]:bg-blue-600"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-800 hover:bg-slate-100">
                Anulează
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 shadow-md transition-all">
                {loading ? "Se procesează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}