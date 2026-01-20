"use client";

import { useEffect, useState } from "react";
import { Elev } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, User, Phone, CheckCircle, XCircle } from "lucide-react";
import { AddElevDialog } from "@/components/AddElevDialog";
import { EditElevDialog } from "@/components/EditElevDialog";

export default function EleviPage() {
  const [elevi, setElevi] = useState<Elev[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchElevi = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/elevi/");
      const data = await res.json();
      if (Array.isArray(data)) setElevi(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sigur ștergi acest elev?")) return;
    await fetch(`http://127.0.0.1:8000/elevi/${id}`, { method: "DELETE" });
    fetchElevi();
  };

  useEffect(() => { fetchElevi(); }, []);

  // Calculare varsta
  const getVarsta = (dataNasterii: string) => {
    if (!dataNasterii) return "-";
    const birth = new Date(dataNasterii);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
        age--;
    }
    return `${age} ani`;
  };

  return (
    <div className="font-sans">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Elevi & Înscrieri</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bază de date Elevi</CardTitle>
          <AddElevDialog onElevAdded={fetchElevi} />
        </CardHeader>
        <CardContent>
          {loading ? <p>Se încarcă...</p> : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold text-slate-900">Nume Elev</TableHead>
                  <TableHead className="font-bold text-slate-900">Vârstă</TableHead>
                  <TableHead className="font-bold text-slate-900">Părinte</TableHead>
                  <TableHead className="font-bold text-slate-900">Telefon</TableHead>
                  <TableHead className="font-bold text-slate-900">GDPR</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {elevi.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Nu există elevi.</TableCell></TableRow>
                ) : (
                  elevi.map((e) => (
                    <TableRow key={e.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-sky-500"/> {e.nume_complet}
                      </TableCell>
                      <TableCell>{getVarsta(e.data_nasterii)}</TableCell>
                      <TableCell>{e.nume_parinte || "-"}</TableCell>
                      <TableCell className="text-slate-600">
                         {e.telefon_parinte && (
                             <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3"/> {e.telefon_parinte}
                             </div>
                         )}
                      </TableCell>
                      <TableCell>
                        {e.gdpr_accepted ? 
                            <span className="text-green-600 flex items-center gap-1 text-xs font-bold"><CheckCircle className="h-3 w-3"/> OK</span> : 
                            <span className="text-red-400 flex items-center gap-1 text-xs font-bold"><XCircle className="h-3 w-3"/> Lipsă</span>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                            <EditElevDialog elev={e} onElevUpdated={fetchElevi} />
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(e.id)}>
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