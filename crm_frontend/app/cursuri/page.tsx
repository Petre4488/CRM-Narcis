"use client";

import { useEffect, useState } from "react";
import { Curs } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, BookOpen } from "lucide-react";
import { AddCursDialog } from "@/components/AddCursDialog";
import { EditCursDialog } from "@/components/EditCursDialog"; // <--- IMPORTAM AICI

export default function CursuriPage() {
  const [cursuri, setCursuri] = useState<Curs[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCursuri = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/cursuri/");
      const data = await res.json();
      if (Array.isArray(data)) setCursuri(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sigur ștergi acest curs?")) return;
    await fetch(`http://127.0.0.1:8000/cursuri/${id}`, { method: "DELETE" });
    fetchCursuri();
  };

  useEffect(() => { fetchCursuri(); }, []);

  return (
    <div className="font-sans">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Curriculum & Materii</h1>

      <Card>
        <CardHeader className="text-black flex flex-row items-center justify-between">
          <CardTitle>Cursuri Disponibile</CardTitle>
          <AddCursDialog onCursAdded={fetchCursuri} />
        </CardHeader>
        <CardContent>
          {loading ? <p>Se încarcă...</p> : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold text-slate-900">Nume Curs</TableHead>
                  <TableHead className="font-bold text-slate-900">Categorie</TableHead>
                  <TableHead className="font-bold text-slate-900">Nivel</TableHead>
                  <TableHead className="font-bold text-slate-900">Interval Vârstă</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cursuri.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-black/70 text-center py-8">Nu există cursuri.</TableCell></TableRow>
                ) : (
                  cursuri.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium flex items-center gap-2 text-slate-900">
                        <BookOpen className="h-4 w-4 text-indigo-500"/> {c.nume_curs}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold uppercase">{c.categorie}</span>
                      </TableCell>
                      <TableCell className="text-slate-700">{c.nivel_dificultate}</TableCell>
                      <TableCell className="text-slate-700">{c.varsta_min} - {c.varsta_max} ani</TableCell>
                      
                      {/* --- COLOANA ACTIUNI MODIFICATA --- */}
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                            
                            {/* Buton EDIT (Componenta noua) */}
                            <EditCursDialog curs={c} onUpdate={fetchCursuri} />

                            {/* Buton STERGE */}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-black h-8 w-8 hover:text-red-600 hover:bg-red-50" 
                                onClick={() => handleDelete(c.id)}
                            >
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