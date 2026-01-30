"use client";

import { useEffect, useState } from "react";
import { Grupa, Curs, Profesor, Contract } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Users, School } from "lucide-react";
import { AddGrupaDialog } from "@/components/AddGrupaDialog";
import { EditGrupaDialog } from "@/components/EditGrupaDialog"; // <--- AM IMPORTAT AICI

export default function GrupePage() {
  const [grupe, setGrupe] = useState<Grupa[]>([]);
  
  // Avem nevoie de listele auxiliare pentru a afisa Numele in loc de ID-uri
  const [cursuri, setCursuri] = useState<Curs[]>([]);
  const [profesori, setProfesori] = useState<Profesor[]>([]);
  const [contracte, setContracte] = useState<Contract[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Functie care incarca TOT (Grupe + Cataloage)
  const fetchData = async () => {
    setLoading(true);
    try {
        const [gRes, cRes, pRes, kRes] = await Promise.all([
            fetch("http://127.0.0.1:8000/grupe/"),
            fetch("http://127.0.0.1:8000/cursuri/"),
            fetch("http://127.0.0.1:8000/profesori/"),
            fetch("http://127.0.0.1:8000/contracte/")
        ]);
        
        const gData = await gRes.json();
        const cData = await cRes.json();
        const pData = await pRes.json();
        const kData = await kRes.json();

        if (Array.isArray(gData)) setGrupe(gData);
        if (Array.isArray(cData)) setCursuri(cData);
        if (Array.isArray(pData)) setProfesori(pData);
        if (Array.isArray(kData)) setContracte(kData);

    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sigur ștergi această grupă?")) return;
    await fetch(`http://127.0.0.1:8000/grupe/${id}`, { method: "DELETE" });
    fetchData(); // Reincarcam datele
  };

  useEffect(() => { fetchData(); }, []);

  // Helper ca sa gasim numele dupa ID
  const getCursName = (id: number) => cursuri.find(c => c.id === id)?.nume_curs || "Necunoscut";
  const getProfName = (id: number) => profesori.find(p => p.id === id)?.nume_complet || "Fără Profesor";
  const getContractName = (id?: number | null) => {
      if(!id) return "-";
      return contracte.find(c => c.id === id)?.nume_contract || "ID Inexistent";
  };

  return (
    <div className="font-sans">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Grupe de Studiu</h1>

      <Card>
        <CardHeader className="text-black flex flex-row items-center justify-between">
          <CardTitle>Orar & Grupe Active</CardTitle>
          <AddGrupaDialog onGrupaAdded={fetchData} />
        </CardHeader>
        <CardContent>
          {loading ? <p>Se încarcă...</p> : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold text-slate-900">Nume Grupă</TableHead>
                  <TableHead className="font-bold text-slate-900">Materie</TableHead>
                  <TableHead className="font-bold text-slate-900">Profesor</TableHead>
                  <TableHead className="font-bold text-slate-900">Tip Plată</TableHead>
                  <TableHead className="font-bold text-slate-900">Contract</TableHead>
                  <TableHead className="font-bold text-slate-900">Status</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grupe.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-black/80 text-center py-8">Nu există grupe create.</TableCell></TableRow>
                ) : (
                  grupe.map((g) => (
                    <TableRow key={g.id} className="hover:bg-slate-50/50">
                      
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-violet-500"/> {g.nume_grupa}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-black" >{getCursName(g.curs_id)}</TableCell>
                      
                      <TableCell className="text-slate-600">{getProfName(g.profesor_titular_id)}</TableCell>
                      
                      <TableCell>
                        {g.tip_plata_grupa === 'plateste_scoala' ? 
                            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">B2B (Școală)</span> :
                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">B2C (Părinți)</span>
                        }
                      </TableCell>

                      <TableCell className="text-xs text-slate-500">
                         {g.contract_id ? <div className="flex items-center gap-1"><School className="h-3 w-3"/> {getContractName(g.contract_id)}</div> : "Direct"}
                      </TableCell>

                      <TableCell>
                         <span className={`px-2 py-1 rounded text-[10px] text-white uppercase font-bold
                            ${g.status_grupa === 'activa' ? 'bg-emerald-500' : 
                              g.status_grupa === 'incheiata' ? 'bg-slate-500' : 'bg-blue-400'}`}>
                            {g.status_grupa}
                         </span>
                      </TableCell>

                      {/* --- COLOANA ACTIUNI CU EDITARE --- */}
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                            
                            {/* Buton EDIT */}
                            <EditGrupaDialog 
                                grupa={g} 
                                onGrupaUpdated={fetchData} 
                            />

                            {/* Buton STERGE */}
                            <Button variant="ghost" size="icon" className="cursor-pointer text-black h-8 w-8 hover:text-red-600" onClick={() => handleDelete(g.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}