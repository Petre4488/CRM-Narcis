"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Calendar, School, Phone, Mail, ShieldCheck, UserCheck, Pencil } from "lucide-react";
import { Elev } from "@/types";

export function EditElevDialog({ elev, onElevUpdated }: { elev: Elev; onElevUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nume_complet: elev.nume_complet,
    data_nasterii: elev.data_nasterii || "",
    scoala_curenta: elev.scoala_curenta || "",
    nume_parinte: elev.nume_parinte || "",
    telefon_parinte: elev.telefon_parinte || "",
    email_parinte: elev.email_parinte || "",
    gdpr_accepted: elev.gdpr_accepted,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...formData, data_nasterii: formData.data_nasterii || null };

    try {
      const res = await fetch(`http://127.0.0.1:8000/elevi/${elev.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onElevUpdated();
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const inputStyle = "bg-white border-slate-300 text-slate-900 h-10 shadow-sm focus-visible:ring-blue-600";
  const labelStyle = "flex items-center gap-2 text-slate-700 text-sm font-bold mb-1.5";
  const sectionTitleStyle = "text-xs font-bold text-blue-700 uppercase tracking-widest mb-4 flex items-center gap-2";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-black hover:bg-slate-100">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      {/* DESIGN ALB SOLID - FORTAT 
      */}
      <DialogContent className="sm:max-w-162.5 bg-white! h-4/5 border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-xl text-slate-900">
        
        <div className="bg-slate-50 p-6 border-b border-slate-200">
            <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-blue-600">
                    <Pencil className="h-5 w-5" />
                </div>
                Editare Elev
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-base mt-1">
                Modifică datele existente (Design Alb).
            </DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white! overflow-y-auto">
          
          <div>
            <h3 className={sectionTitleStyle}><User className="h-4 w-4" /> Datele Copilului</h3>
            <div className="grid gap-5">
                <div className="grid gap-1">
                    <Label className={labelStyle}>Nume Complet <span className="text-red-500">*</span></Label>
                    <Input required value={formData.nume_complet} onChange={e => setFormData({...formData, nume_complet: e.target.value})} className={inputStyle} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="grid gap-1">
                        <Label className={labelStyle}><Calendar className="h-3.5 w-3.5 text-blue-600"/> Data Nașterii</Label>
                        <Input type="date" value={formData.data_nasterii} onChange={e => setFormData({...formData, data_nasterii: e.target.value})} className={inputStyle} />
                    </div>
                    <div className="grid gap-1">
                        <Label className={labelStyle}><School className="h-3.5 w-3.5 text-blue-600"/> Școala</Label>
                        <Input value={formData.scoala_curenta} onChange={e => setFormData({...formData, scoala_curenta: e.target.value})} className={inputStyle} />
                    </div>
                </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h3 className={`${sectionTitleStyle} mt-4`}><UserCheck className="h-4 w-4" /> Contact Tutore</h3>
            <div className="grid gap-5">
                 <div className="grid gap-1">
                    <Label className={labelStyle}>Nume Părinte</Label>
                    <Input value={formData.nume_parinte} onChange={e => setFormData({...formData, nume_parinte: e.target.value})} className={inputStyle} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="grid gap-1">
                        <Label className={labelStyle}><Phone className="h-3.5 w-3.5 text-blue-600"/> Telefon</Label>
                        <Input value={formData.telefon_parinte} onChange={e => setFormData({...formData, telefon_parinte: e.target.value})} className={inputStyle} />
                    </div>
                    <div className="grid gap-1">
                        <Label className={labelStyle}><Mail className="h-3.5 w-3.5 text-blue-600"/> Email</Label>
                        <Input type="email" value={formData.email_parinte} onChange={e => setFormData({...formData, email_parinte: e.target.value})} className={inputStyle} />
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${formData.gdpr_accepted ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                    <Label className="font-bold text-slate-800 cursor-pointer">Acord GDPR</Label>
                    <p className="text-xs text-slate-500">Status acord actual.</p>
                </div>
             </div>
            <Switch checked={formData.gdpr_accepted} onCheckedChange={(c) => setFormData({...formData, gdpr_accepted: c})} className="data-[state=checked]:bg-green-600" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-600 hover:bg-slate-100">Anulează</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                {loading ? "..." : "Actualizează"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}