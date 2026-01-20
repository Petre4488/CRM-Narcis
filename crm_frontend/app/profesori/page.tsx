"use client";

import { useEffect, useState } from "react";
import { Profesor } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Phone, Mail } from "lucide-react";
import { AddProfesorDialog } from "@/components/AddProfesorDialog";

export default function ProfesoriPage() {
  const [profesori, setProfesori] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfesori = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/profesori/");
      const data = await res.json();
      if (Array.isArray(data)) setProfesori(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sigur ștergi acest profesor?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/profesori/${id}`, { method: "DELETE" });
      if (res.ok) fetchProfesori();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfesori();
  }, []);

  return (
    <div className="font-sans">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Echipa & HR</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profesori & Colaboratori</CardTitle>
          <AddProfesorDialog onProfesorAdded={fetchProfesori} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Se încarcă...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50">
                  <TableHead className="font-bold text-slate-900">Nume</TableHead>
                  <TableHead className="font-bold text-slate-900">Contact</TableHead>
                  <TableHead className="font-bold text-slate-900">Tip Contract</TableHead>
                  <TableHead className="font-bold text-slate-900">Tarif Orar</TableHead>
                  <TableHead className="font-bold text-slate-900">Status</TableHead>
                  <TableHead className="font-bold text-slate-900 text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profesori.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Nu există profesori adăugați.
                    </TableCell>
                  </TableRow>
                ) : (
                  profesori.map((p) => (
                    <TableRow key={p.id} className="hover:bg-slate-50/50">
                      
                      {/* Nume */}
                      <TableCell className="font-medium text-slate-900">
                        {p.nume_complet}
                      </TableCell>
                      
                      {/* Contact cu Iconite */}
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm text-slate-600">
                            {p.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3 text-slate-400"/> {p.email}
                                </div>
                            )}
                            {p.telefon && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3 text-slate-400"/> {p.telefon}
                                </div>
                            )}
                        </div>
                      </TableCell>
                      
                      {/* Tip Contract - Badge Albastru */}
                      <TableCell>
                         <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">
                            {p.tip_contract}
                         </span>
                      </TableCell>
                      
                      {/* Tarif - Verde */}
                      <TableCell className="text-emerald-600 font-bold">
                        {p.tarif_orar_default} RON/h
                      </TableCell>
                      
                      {/* Status - Activ/Inactiv */}
                      <TableCell>
                         <span className={`px-2 py-1 rounded text-xs text-white uppercase font-bold
                            ${p.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                            {p.is_active ? "Activ" : "Inactiv"}
                         </span>
                      </TableCell>

                      {/* Actiuni */}
                      <TableCell className="text-right">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(p.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
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