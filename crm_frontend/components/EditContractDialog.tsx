"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Contract, Partener } from "@/types";
import { Pencil } from "lucide-react";

interface EditContractProps {
  contract: Contract;
  onContractUpdated: () => void;
}

export function EditContractDialog({ contract, onContractUpdated }: EditContractProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parteneri, setParteneri] = useState<Partener[]>([]);

  // Initializam starea cu datele contractului existent
  const [formData, setFormData] = useState({
    nume_contract: contract.nume_contract,
    valoare: contract.valoare.toString(),
    data_semnarii: contract.data_semnarii,
    status: contract.status,
    partener_id: contract.partener_id.toString(),
  });

  // Incarcam partenerii
  useEffect(() => {
    if (open) {
      fetch("http://127.0.0.1:8000/parteneri/")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setParteneri(data);
          else setParteneri([]);
        })
        .catch((err) => console.error(err));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      nume_contract: formData.nume_contract,
      valoare: parseFloat(formData.valoare),
      data_semnarii: formData.data_semnarii,
      status: formData.status,
      partener_id: parseInt(formData.partener_id),
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/contracte/${contract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        onContractUpdated();
      } else {
        alert("Eroare la actualizare.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer mr-2 border-slate-300">
          <Pencil className="h-4 w-4 text-slate-200 " />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Editează Contract</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Client</Label>
            <div className="col-span-3">
              <Select 
                value={formData.partener_id}
                onValueChange={(val) => setFormData({...formData, partener_id: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alege clientul..." />
                </SelectTrigger>
                <SelectContent>
                  {parteneri.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nume}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nume" className="text-right">Titlu</Label>
            <Input 
              id="nume" 
              value={formData.nume_contract} 
              onChange={(e) => setFormData({...formData, nume_contract: e.target.value})} 
              className="col-span-3" required 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="val" className="text-right">Valoare</Label>
            <Input 
              id="val" 
              type="number"
              value={formData.valoare} 
              onChange={(e) => setFormData({...formData, valoare: e.target.value})} 
              className="col-span-3" required 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="data" className="text-right">Data</Label>
            <Input 
              id="data" 
              type="date"
              value={formData.data_semnarii} 
              onChange={(e) => setFormData({...formData, data_semnarii: e.target.value})} 
              className="col-span-3" required 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status</Label>
            <div className="col-span-3">
              <Select 
                value={formData.status}
                onValueChange={(val) => setFormData({...formData, status: val})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="activ">Activ</SelectItem>
                  <SelectItem value="expirat">Expirat</SelectItem>
                  <SelectItem value="anulat">Anulat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? "..." : "Salvează Modificările"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}