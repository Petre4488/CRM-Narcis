"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Landmark, Calendar, User, DollarSign } from "lucide-react";

export function AddFacturaDialog({ onFacturaAdded }: { onFacturaAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    serie_numar: "",
    client_nume: "",
    data_emitere: "",
    data_scadenta: "",
    total_plata: "",
    status: "draft"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
        ...formData,
        total_plata: parseFloat(formData.total_plata) || 0,
        moneda: "RON"
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/facturi/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onFacturaAdded();
        setFormData({
            serie_numar: "",
            client_nume: "",
            data_emitere: "",
            data_scadenta: "",
            total_plata: "",
            status: "draft"
        }); 
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const labelStyle = "flex items-center gap-2 text-slate-700 text-sm font-semibold mb-1.5";
  const inputStyle = "bg-white border-slate-300 text-slate-900 focus-visible:ring-emerald-500 h-10 shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg gap-2 px-6 rounded-full">
          <Plus className="h-4 w-4" /> Factură Nouă
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-162.5g-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-emerald-50 p-6 border-b border-emerald-100">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600">
                        <FileText className="h-5 w-5 fill-emerald-100" />
                    </div>
                    Emitere Factură
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                    Înregistrează o factură nouă în sistem.
                </DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
            
            {/* SERIE & CLIENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label htmlFor="serie" className={labelStyle}>Serie & Număr</Label>
                    <Input required id="serie" placeholder="ex: EDU-001" 
                        value={formData.serie_numar} onChange={e => setFormData({...formData, serie_numar: e.target.value})}
                        className={inputStyle}
                    />
                </div>
                <div>
                    <Label htmlFor="client" className={labelStyle}><User className="h-3.5 w-3.5"/> Nume Client (B2B/B2C)</Label>
                    <Input required id="client" placeholder="ex: Școala Nr. 1 sau Popescu Ion"
                        value={formData.client_nume} onChange={e => setFormData({...formData, client_nume: e.target.value})}
                        className={inputStyle}
                    />
                </div>
            </div>

            {/* DATE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <Label className={labelStyle}><Calendar className="h-3.5 w-3.5"/> Data Emitere</Label>
                    <Input type="date" required value={formData.data_emitere} onChange={e => setFormData({...formData, data_emitere: e.target.value})} className={inputStyle}/>
                </div>
                <div>
                    <Label className={labelStyle}><Calendar className="h-3.5 w-3.5"/> Data Scadență</Label>
                    <Input type="date" required value={formData.data_scadenta} onChange={e => setFormData({...formData, data_scadenta: e.target.value})} className={inputStyle}/>
                </div>
            </div>

            {/* TOTAL & STATUS */}
            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <h3 className="text-xs font-bold text-emerald-600 uppercase mb-4 flex items-center gap-2">
                    <Landmark className="h-3.5 w-3.5" /> Detalii Plată
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <Label htmlFor="total" className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                            <DollarSign className="h-3 w-3"/> Total de Plată (RON)
                        </Label>
                        <Input type="number" step="0.01" required id="total" 
                            value={formData.total_plata} onChange={e => setFormData({...formData, total_plata: e.target.value})}
                            className="bg-white border-slate-300 font-bold text-emerald-700"
                        />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-slate-500 mb-1.5">Status Factură</Label>
                        <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                            <SelectTrigger className="bg-white border-slate-300"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft (Ciornă)</SelectItem>
                                <SelectItem value="emisa">Emisă</SelectItem>
                                <SelectItem value="platita_integral">Plătită Integral</SelectItem>
                                <SelectItem value="scadenta_depasita">Scadență Depășită</SelectItem>
                                <SelectItem value="anulata">Anulată</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Anulează</Button>
                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                    {loading ? "..." : "Emite Factura"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}