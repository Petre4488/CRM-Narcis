"use client";

import { useEffect, useState } from "react";
import { Inscriere, Elev, Grupa } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, User, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { AddInscriereDialog } from "@/components/AddInscriereDialog";
import { EditInscriereDialog } from "@/components/EditInscriereDialog";

export default function InscrieriPage() {
  const [inscrieri, setInscrieri] = useState<Inscriere[]>([]);
  const [elevi, setElevi] = useState<Elev[]>([]);
  const [grupe, setGrupe] = useState<Grupa[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
        const [iRes, eRes, gRes] = await Promise.all([
            fetch("http://127.0.0.1:8000/inscrieri/"),
            fetch("http://127.0.0.1:8000/elevi/"),
            fetch("http://127.0.0.1:8000/grupe/")
        ]);
        
        if (iRes.ok) setInscrieri(await iRes.json());
        if (eRes.ok) setElevi(await eRes.json());
        if (gRes.ok) setGrupe(await gRes.json());

    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sigur ștergi această înscriere?")) return;
    await fetch(`http://127.0.0.1:8000/inscrieri/${id}`, { method: "DELETE" });
    fetchData();
  };

  useEffect(() => { fetchData(); }, []);

  // Helpers
  const getElevName = (id: number) => elevi.find(e => e.id === id)?.nume_complet || "Necunoscut";
  const getGrupaName = (id: number) => grupe.find(g => g.id === id)?.nume_grupa || "Necunoscută";

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'activ': return <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3"/> Activ</span>;
          case 'retras': return <span className="bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1 w-fit"><XCircle className="h-3 w-3"/> Retras</span>;
          default: return <span className="bg-amber-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1 w-fit"><Clock className="h-3 w-3"/> Așteptare</span>;
      }
  }

  return (
    <div className="font-sans">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Registru Înscrieri</h1>

      <Card>
        <CardHeader className="text-black flex flex-row items-center justify-between">
          <CardTitle>Lista Elevi Înscriși</CardTitle>
          <AddInscriereDialog onInscriereAdded={fetchData} />
        </CardHeader>
        <CardContent>
          {loading ? <p>Se încarcă...</p> : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold text-slate-900">Elev</TableHead>
                  <TableHead className="font-bold text-slate-900">Grupă</TableHead>
                  <TableHead className="font-bold text-slate-900">Data Înscrierii</TableHead>
                  <TableHead className="font-bold text-slate-900">Status</TableHead>
                  <TableHead className="font-bold text-slate-900">Reducere</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inscrieri.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Nu există înscrieri.</TableCell></TableRow>
                ) : (
                  inscrieri.map((i) => (
                    <TableRow key={i.id} className="hover:bg-slate-50/50">
                      
                      <TableCell className="font-bold text-slate-800">
                         <div className="flex items-center gap-2"><User className="h-4 w-4 text-indigo-500"/> {getElevName(i.elev_id)}</div>
                      </TableCell>
                      
                      <TableCell className="text-indigo-700 font-medium">
                         <div className="flex items-center gap-2"><Users className="h-4 w-4 text-indigo-400"/> {getGrupaName(i.grupa_id)}</div>
                      </TableCell>
                      
                      <TableCell className="text-black" >{i.data_inscriere}</TableCell>
                      
                      <TableCell>{getStatusBadge(i.status_inscriere)}</TableCell>

                      <TableCell>
                         {i.reducere_percent > 0 ? <span className="text-emerald-600 font-bold">-{i.reducere_percent}%</span> : "-"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                            
                            <EditInscriereDialog 
                                inscriere={i} 
                                onUpdate={fetchData} 
                            />

                            <Button variant="ghost" size="icon" className="cursor-pointer text-black h-8 w-8 hover:text-red-600" onClick={() => handleDelete(i.id)}>
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