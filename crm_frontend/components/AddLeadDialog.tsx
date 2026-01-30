"use client";

import { useState, useEffect } from "react";
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
import { UserPlus, Building, Phone, Mail, Globe, Plus, Target } from "lucide-react";
import { Partener } from "@/types";

export function AddLeadDialog({ onLeadAdded }: { onLeadAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parteneri, setParteneri] = useState<Partener[]>([]);

  const [formData, setFormData] = useState({
    nume_contact: "",
    telefon_contact: "",
    email_contact: "",
    sursa_lead: "facebook",
    status: "nou",
    note: "",
    partener_id: "",
  });

  useEffect(() => {
    if (open) {
      fetch("http://127.0.0.1:8000/parteneri/")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setParteneri(data);
          } else {
            setParteneri([]);
          }
        })
        .catch((err) => console.error(err));
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
      const res = await fetch("http://127.0.0.1:8000/leaduri/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onLeadAdded();
        setFormData({
            nume_contact: "",
            telefon_contact: "",
            email_contact: "",
            sursa_lead: "facebook",
            status: "nou",
            note: "",
            partener_id: "",
        });
      } else {
        alert("Eroare la salvare.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = "flex items-center gap-2 text-slate-700 text-sm font-semibold mb-1.5";
  const inputStyle = "bg-white border-slate-300 text-slate-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-10 shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 gap-2 px-6 rounded-full cursor-pointer">
          <Plus className="h-4 w-4" /> Adaugă Lead
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-150 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-emerald-50 p-6 border-b border-emerald-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600">
                        <UserPlus className="h-5 w-5 fill-emerald-100" />
                    </div>
                    Lead Nou
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                    Înregistrează un potențial client în sistem.
                </DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          
          {/* PARTENER & NUME CONTACT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className={labelStyle}><Building className="h-3.5 w-3.5"/> Partener (Instituție)</Label>
                <Select 
                    value={formData.partener_id || undefined} 
                    onValueChange={(val) => setFormData({...formData, partener_id: val})}
                >
                    <SelectTrigger className={inputStyle}>
                        <SelectValue placeholder="Alege instituția..." />
                    </SelectTrigger>
                    <SelectContent className="bg-emerald-400">
                        {parteneri.map((p) => (
                        <SelectItem className="hover:bg-emerald-500 cursor-pointer" key={p.id} value={p.id.toString()}>
                            {p.nume} ({p.oras})
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nume" className={labelStyle}><UserPlus className="h-3.5 w-3.5"/> Nume Pers. Contact</Label>
                <Input 
                    id="nume" 
                    value={formData.nume_contact} 
                    onChange={(e) => setFormData({...formData, nume_contact: e.target.value})} 
                    className={inputStyle} required 
                />
              </div>
          </div>

          {/* SURSA & STATUS (Status e setat default, dar putem pune sursa full width sau grid) */}
          <div>
            <Label className={labelStyle}><Target className="h-3.5 w-3.5"/> Sursă Lead</Label>
            <Select 
                value={formData.sursa_lead || undefined}
                onValueChange={(val) => setFormData({...formData, sursa_lead: val})}
            >
                <SelectTrigger className={inputStyle}>
                    <SelectValue placeholder="Alege sursa..." />
                </SelectTrigger>
                <SelectContent className="bg-emerald-400">
                    <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="facebook">Facebook Ads</SelectItem>
                    <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="google">Google Search</SelectItem>
                    <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="recomandare">Recomandare</SelectItem>
                    <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="linkedin">LinkedIn</SelectItem>
                    <SelectItem className="hover:bg-emerald-500 cursor-pointer" value="rece">Apel la Rece</SelectItem>
                </SelectContent>
            </Select>
          </div>

          {/* TELEFON & EMAIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="tel" className={labelStyle}><Phone className="h-3.5 w-3.5"/> Telefon</Label>
                <Input 
                    id="tel" 
                    value={formData.telefon_contact} 
                    onChange={(e) => setFormData({...formData, telefon_contact: e.target.value})} 
                    className={inputStyle} 
                />
              </div>
              <div>
                 {/* Campul Email nu era in form-ul anterior in JSX, dar e in state. Il adaug aici. */}
                 <Label htmlFor="email" className={labelStyle}><Mail className="h-3.5 w-3.5"/> Email</Label>
                 <Input 
                    id="email" 
                    type="email"
                    value={formData.email_contact} 
                    onChange={(e) => setFormData({...formData, email_contact: e.target.value})} 
                    className={inputStyle} 
                />
              </div>
          </div>

          <DialogFooter>
            <Button className="cursor-pointer bg-emerald-800/10 text-emerald-900 hover:bg-red-50 hover:text-red-600" type="button" variant="ghost" onClick={() => setOpen(false)}>
                Anulează
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer">
                {loading ? "..." : "Salvează Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}