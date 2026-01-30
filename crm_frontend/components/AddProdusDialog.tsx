"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Tag, Layers, Barcode } from "lucide-react";

export function AddProdusDialog({ onProdusAdded }: { onProdusAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nume_produs: "",
    cod_sku: "",
    categorie: "Materiale Didactice",
    unitate_masura: "buc",
    cost_unitar_mediu: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
        ...formData,
        cost_unitar_mediu: parseFloat(formData.cost_unitar_mediu) || 0
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/produse/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onProdusAdded();
        setFormData({
            nume_produs: "",
            cod_sku: "",
            categorie: "Materiale Didactice",
            unitate_masura: "buc",
            cost_unitar_mediu: ""
        });
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const labelStyle = "flex items-center gap-2 text-slate-700 text-sm font-semibold mb-1.5";
  const inputStyle = "bg-white border-slate-300 text-slate-900 focus-visible:ring-sky-500 focus-visible:border-sky-500 h-10 shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/30 gap-2 px-6 rounded-full cursor-pointer">
          <Plus className="h-4 w-4" /> Produs Nou
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-150 bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-sky-50 p-6 border-b border-sky-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-sky-600">
                        <Package className="h-5 w-5 fill-sky-100" />
                    </div>
                    Definire Produs
                </DialogTitle>
                <DialogDescription className="text-slate-600">Adaugă un nou articol în catalogul de inventar.</DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
            
            <div>
                <Label className={labelStyle}><Package className="h-3.5 w-3.5"/> Nume Produs</Label>
                <Input required placeholder="ex: Kit Robotică LEGO" 
                    value={formData.nume_produs} onChange={e => setFormData({...formData, nume_produs: e.target.value})}
                    className={inputStyle}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label className={labelStyle}><Tag className="h-3.5 w-3.5"/> Categorie</Label>
                    <Select value={formData.categorie} onValueChange={v => setFormData({...formData, categorie: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-sky-400">
                            <SelectItem value="Materiale Didactice" className="hover:bg-sky-500 cursor-pointer">Materiale Didactice</SelectItem>
                            <SelectItem value="Echipamente IT" className="hover:bg-sky-500 cursor-pointer">Echipamente IT</SelectItem>
                            <SelectItem value="Birotică" className="hover:bg-sky-500 cursor-pointer">Birotică</SelectItem>
                            <SelectItem value="Consumabile" className="hover:bg-sky-500 cursor-pointer">Consumabile</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className={labelStyle}><Layers className="h-3.5 w-3.5"/> Unitate de Măsură</Label>
                    <Select value={formData.unitate_masura} onValueChange={v => setFormData({...formData, unitate_masura: v})}>
                        <SelectTrigger className={inputStyle}><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-sky-400">
                            <SelectItem value="buc" className="hover:bg-sky-500 cursor-pointer">Bucată (buc)</SelectItem>
                            <SelectItem value="set" className="hover:bg-sky-500 cursor-pointer">Set / Cutie</SelectItem>
                            <SelectItem value="kg" className="hover:bg-sky-500 cursor-pointer">Kilogram (kg)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label className={labelStyle}><Barcode className="h-3.5 w-3.5"/> Cod SKU (Opțional)</Label>
                    <Input placeholder="ex: ROB-001" value={formData.cod_sku} onChange={e => setFormData({...formData, cod_sku: e.target.value})} className={inputStyle}/>
                </div>
                <div>
                    <Label className={labelStyle}>Cost Mediu (RON)</Label>
                    <Input type="number" step="0.01" placeholder="0.00" value={formData.cost_unitar_mediu} onChange={e => setFormData({...formData, cost_unitar_mediu: e.target.value})} className={inputStyle}/>
                </div>
            </div>

            <DialogFooter>
                <Button className="cursor-pointer bg-sky-800/10 text-sky-900 hover:bg-red-50 hover:text-red-600" type="button" variant="ghost" onClick={() => setOpen(false)}>Anulează</Button>
                <Button type="submit" disabled={loading} className="bg-sky-600 hover:bg-sky-700 text-white shadow-md cursor-pointer">
                    {loading ? "..." : "Salvează Produs"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}