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
  SelectValue, // <--- AM READUS SELECTVALUE (E IMPORTAT)
} from "@/components/ui/select";
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          + Adaugă Lead
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Lead Nou</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* --- PARTENER --- */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Partener</Label>
            <div className="col-span-3">
              <Select 
                // TRUCUL CARE REZOLVA SUPRAPUNEREA:
                // Daca e string gol "", trimitem undefined.
                // Asta ii zice componentei: "Nu e nimic selectat, arata placeholder-ul".
                value={formData.partener_id || undefined} 
                onValueChange={(val) => setFormData({...formData, partener_id: val})}
              >
                <SelectTrigger>
                  {/* Folosim prop-ul placeholder, NU scriem text intre tag-uri */}
                  <SelectValue placeholder="Alege instituția..." />
                </SelectTrigger>
                <SelectContent className="bg-blue-500">
                  {parteneri.map((p) => (
                    <SelectItem  className="hover:bg-blue-600 cursor-pointer" key={p.id} value={p.id.toString()}>
                      {p.nume} ({p.oras})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nume" className="text-right">Nume</Label>
            <Input 
              id="nume" 
              value={formData.nume_contact} 
              onChange={(e) => setFormData({...formData, nume_contact: e.target.value})} 
              className="col-span-3" required 
            />
          </div>

          {/* --- SURSA --- */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Sursă</Label>
            <div className="col-span-3">
              <Select 
                // ACELASI TRUC SI AICI
                value={formData.sursa_lead || undefined}
                onValueChange={(val) => setFormData({...formData, sursa_lead: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alege sursa..." />
                </SelectTrigger>
                <SelectContent className="bg-blue-500">
                  <SelectItem  className="hover:bg-blue-600 cursor-pointer" value="facebook">Facebook Ads</SelectItem>
                  <SelectItem  className="hover:bg-blue-600 cursor-pointer" value="google">Google Search</SelectItem>
                  <SelectItem  className="hover:bg-blue-600 cursor-pointer" value="recomandare">Recomandare</SelectItem>
                  <SelectItem  className="hover:bg-blue-600 cursor-pointer" value="linkedin">LinkedIn</SelectItem>
                  <SelectItem  className="hover:bg-blue-600 cursor-pointer" value="rece">Apel la Rece</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tel" className="text-right">Telefon</Label>
            <Input 
              id="tel" 
              value={formData.telefon_contact} 
              onChange={(e) => setFormData({...formData, telefon_contact: e.target.value})} 
              className="col-span-3" 
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
              {loading ? "Se salvează..." : "Salvează Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}