"use client";

import { useEffect, useState } from "react";
import { Sesiune, Grupa, Profesor } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin, Clock } from "lucide-react";
import { AddSesiuneDialog } from "@/components/AddSesiuneDialog";
import { EditSesiuneDialog } from "@/components/EditSesiuneDialog"; // <--- IMPORT AICI

export default function SesiuniPage() {
  const [sesiuni, setSesiuni] = useState<Sesiune[]>([]);
  const [grupe, setGrupe] = useState<Grupa[]>([]);
  const [profesori, setProfesori] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
        const [sRes, gRes, pRes] = await Promise.all([
            fetch("http://127.0.0.1:8000/sesiuni/"),
            fetch("http://127.0.0.1:8000/grupe/"),
            fetch("http://127.0.0.1:8000/profesori/")
        ]);
        
        if (sRes.ok) setSesiuni(await sRes.json());
        if (gRes.ok) setGrupe(await gRes.json());
        if (pRes.ok) setProfesori(await pRes.json());

    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sigur ștergi această sesiune?")) return;
    await fetch(`http://127.0.0.1:8000/sesiuni/${id}`, { method: "DELETE" });
    fetchData();
  };

  useEffect(() => { fetchData(); }, []);

  // Helpers
  const getGrupaName = (id: number) => grupe.find(g => g.id === id)?.nume_grupa || "Grupă Ștearsă";
  const getProfName = (id: number) => profesori.find(p => p.id === id)?.nume_complet || "-";
  
  // Formatare data: 20 Ian 2026, 14:00
  const formatDate = (isoStr: string) => {
      if(!isoStr) return "-";
      const d = new Date(isoStr);
      return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' }) + 
             ", " + d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="font-sans">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Orar & Sesiuni</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Calendar Activități</CardTitle>
          <AddSesiuneDialog onSesiuneAdded={fetchData} />
        </CardHeader>
        <CardContent>
          {loading ? <p>Se încarcă...</p> : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold text-slate-900">Data & Ora</TableHead>
                  <TableHead className="font-bold text-slate-900">Grupă</TableHead>
                  <TableHead className="font-bold text-slate-900">Profesor</TableHead>
                  <TableHead className="font-bold text-slate-900">Sală</TableHead>
                  <TableHead className="font-bold text-slate-900">Temă / Status</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sesiuni.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Nu există sesiuni planificate.</TableCell></TableRow>
                ) : (
                  sesiuni.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50/50">
                      
                      <TableCell className="font-medium text-slate-900">
                         <div className="flex items-center gap-2">
                             <Clock className="h-4 w-4 text-emerald-600"/> {formatDate(s.data_ora_start)}
                         </div>
                      </TableCell>
                      
                      <TableCell className="font-bold text-violet-700">{getGrupaName(s.grupa_id)}</TableCell>
                      
                      <TableCell>{getProfName(s.profesor_id)}</TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-500">
                             <MapPin className="h-3 w-3"/> {s.sala || "N/A"}
                        </div>
                      </TableCell>

                      <TableCell>
                         <div className="flex flex-col">
                            <span className="text-sm font-medium">{s.tema_lectiei || "-"}</span>
                            <span className={`text-[10px] uppercase font-bold w-fit px-1.5 py-0.5 rounded text-white mt-1
                                ${s.status_sesiune === 'planificata' ? 'bg-blue-400' : 
                                  s.status_sesiune === 'realizata' ? 'bg-emerald-500' : 'bg-red-400'}`}>
                                {s.status_sesiune}
                            </span>
                         </div>
                      </TableCell>

                      {/* --- COLOANA ACTIUNI MODIFICATA --- */}
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                            
                            {/* Buton EDIT */}
                            <EditSesiuneDialog 
                                sesiune={s} 
                                onSesiuneUpdated={fetchData} 
                            />

                            {/* Buton STERGE */}
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(s.id)}>
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