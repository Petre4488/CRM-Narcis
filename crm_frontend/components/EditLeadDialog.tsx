"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Pencil, Building, Phone, Mail, Target, Flag } from "lucide-react";
import { Lead, Partener } from "@/types";

interface EditProps {
  lead: Lead;
  onUpdate: () => void;
}

export function EditLeadDialog({ lead, onUpdate }: EditProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parteneri, setParteneri] = useState<Partener[]>([]);

  const [formData, setFormData] = useState({
    nume_contact: lead.nume_contact,
    telefon_contact: lead.telefon_contact,
    email_contact: lead.email_contact,
    sursa_lead: lead.sursa_lead,
    status: lead.status,
    note: lead.note || "",
    partener_id: lead.partener_id ? lead.partener_id.toString() : "",
  });

  useEffect(() => {
    if (open) {
      fetch("http://127.0.0.1:8000/parteneri/").then(r => r.json()).then(data => {
          if (Array.isArray(data)) setParteneri(data);
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      partener_id: formData.partener_id ? parseInt(formData.partener_id) : null,
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/leaduri/${lead.id}`, {
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
  const inputStyle = "bg-white border-slate-300 text-slate-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-10 shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-150 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-emerald-50 p-6 border-b border-emerald-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600">
                        <UserPlus className="h-5 w-5 fill-emerald-100" />
                    </div>
                    Editare Lead
                </DialogTitle>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className={labelStyle}><Building className="h-3.5 w-3.5"/> Partener</Label>
                <Select value={formData.partener_id} onValueChange={(val) => setFormData({...formData, partener_id: val})}>
                    <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-emerald-400">
                        {parteneri.map(p => <SelectItem className="hover:bg-emerald-500 cursor-pointer" key={p.id} value={p.id.toString()}>{p.nume}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelStyle}>Nume Contact</Label>
                <Input value={formData.nume_contact} onChange={(e) => setFormData({...formData, nume_contact: e.target.value})} className={inputStyle} required />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className={labelStyle}><Target className="h-3.5 w-3.5"/> Sursă</Label>
                <Select value={formData.sursa_lead} onValueChange={(val) => setFormData({...formData, sursa_lead: val})}>
                    <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-emerald-400">
                        <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="facebook">Facebook Ads</SelectItem>
                        <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="google">Google Search</SelectItem>
                        <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="recomandare">Recomandare</SelectItem>
                        <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelStyle}><Flag className="h-3.5 w-3.5"/> Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                    <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-emerald-400">
                        <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="nou">Nou</SelectItem>
                        <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="contactat">Contactat</SelectItem>
                        <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="calificat">Calificat</SelectItem>
                        <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="pierdut">Pierdut</SelectItem>
                    </SelectContent>
                </Select>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className={labelStyle}><Phone className="h-3.5 w-3.5"/> Telefon</Label>
                <Input value={formData.telefon_contact} onChange={(e) => setFormData({...formData, telefon_contact: e.target.value})} className={inputStyle} />
              </div>
              <div>
                <Label className={labelStyle}><Mail className="h-3.5 w-3.5"/> Email</Label>
                <Input value={formData.email_contact} onChange={(e) => setFormData({...formData, email_contact: e.target.value})} className={inputStyle} />
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