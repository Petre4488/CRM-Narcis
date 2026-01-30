"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Produs } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  produs: Produs | null;
  onSuccess: () => void;
  defaultType?: "in" | "out";
}

export function StockMovementDialog({ open, onOpenChange, produs, onSuccess, defaultType = "in" }: Props) {
  const [loading, setLoading] = useState(false);
  const [cantitate, setCantitate] = useState("1");
  const [tip, setTip] = useState(defaultType === "in" ? "achizitie_in" : "consum_out");
  const [nota, setNota] = useState("");

  const handleSubmit = async () => {
    if (!produs) return;
    setLoading(true);

    const payload = {
        produs_id: produs.id,
        tip: tip,
        cantitate: parseInt(cantitate) || 0,
        note: nota
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/inventar/miscare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        onOpenChange(false);
        setCantitate("1");
        setNota("");
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const isIn = tip === "achizitie_in" || tip === "retur_defect";
  const colorClass = isIn ? "emerald" : "red";
  const bgHeader = isIn ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100";
  const textTitle = isIn ? "text-emerald-600" : "text-red-600";
  const iconFill = isIn ? "fill-emerald-100" : "fill-red-100";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-112.5 bg-white border border-slate-200 shadow-xl rounded-2xl p-0 overflow-hidden">
        <div className={`p-6 border-b ${bgHeader}`}>
            <DialogHeader>
            <DialogTitle className={`text-2xl font-bold flex items-center gap-3 text-slate-900`}>
                <div className={`bg-white p-2 rounded-lg shadow-sm ${textTitle}`}>
                    {isIn ? <ArrowUpCircle className={`h-6 w-6 ${iconFill}`}/> : <ArrowDownCircle className={`h-6 w-6 ${iconFill}`}/>}
                </div>
                {isIn ? "Intrare Stoc" : "Ieșire Stoc"}
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
                Actualizează stocul pentru: <strong className="text-slate-900">{produs?.nume_produs}</strong>
            </DialogDescription>
            </DialogHeader>
        </div>

        <div className="p-6 space-y-4 bg-white">
            <div>
                <Label className="mb-1.5 block text-sm font-semibold text-slate-700">Tip Operațiune</Label>
                <Select value={tip} onValueChange={setTip}>
                    <SelectTrigger className="bg-white border-slate-300 h-10"><SelectValue /></SelectTrigger>
                    <SelectContent className={isIn ? "bg-emerald-400" : "bg-red-400"}>
                        <SelectItem value="achizitie_in" className="cursor-pointer hover:bg-white/20">Achiziție (Intrare)</SelectItem>
                        <SelectItem value="retur_defect" className="cursor-pointer hover:bg-white/20">Retur (Intrare)</SelectItem>
                        <SelectItem value="consum_out" className="cursor-pointer hover:bg-white/20">Consum / Vânzare (Ieșire)</SelectItem>
                        <SelectItem value="transfer_profesor" className="cursor-pointer hover:bg-white/20">Transfer la Profesor (Ieșire)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label className="mb-1.5 block text-sm font-semibold text-slate-700">Cantitate ({produs?.unitate_masura})</Label>
                <Input type="number" min="1" value={cantitate} onChange={(e) => setCantitate(e.target.value)} 
                    className={`bg-white border-slate-300 h-12 text-2xl font-bold text-center ${isIn ? "text-emerald-600 focus-visible:ring-emerald-500" : "text-red-600 focus-visible:ring-red-500"}`} 
                />
            </div>

            <div>
                <Label className="mb-1.5 block text-sm font-semibold text-slate-700">Notă (Opțional)</Label>
                <Input placeholder="Ex: Factura nr. 123" value={nota} onChange={(e) => setNota(e.target.value)} className="bg-white border-slate-300 h-10"/>
            </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100">
          <Button variant="ghost" className="cursor-pointer" onClick={() => onOpenChange(false)}>Anulează</Button>
          <Button onClick={handleSubmit} className={`${isIn ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"} text-white shadow-md cursor-pointer px-8`}>
             Confirmă
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}