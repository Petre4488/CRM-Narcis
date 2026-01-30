"use client";

import { useEffect, useState } from "react";
import { Factura } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { AddFacturaDialog } from "@/components/AddFacturaDialog";
import { EditFacturaDialog } from "@/components/EditFacturaDialog";

export default function FinanciarPage() {
  const [facturi, setFacturi] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFacturi = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/facturi/");
      const data = await res.json();
      if (Array.isArray(data)) setFacturi(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sigur ștergi această factură?")) return;
    await fetch(`http://127.0.0.1:8000/facturi/${id}`, { method: "DELETE" });
    fetchFacturi();
  };

  useEffect(() => { fetchFacturi(); }, []);

  // Helper pentru culoarea si iconita statusului
  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'platita_integral':
            return <span className="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3"/> Plătită</span>;
        case 'scadenta_depasita':
            return <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 w-fit"><AlertCircle className="h-3 w-3"/> Restantă</span>;
        case 'emisa':
            return <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 w-fit"><Clock className="h-3 w-3"/> Emisă</span>;
        default:
            return <span className="bg-slate-400 text-white px-2 py-1 rounded text-xs font-bold uppercase w-fit">Draft</span>;
    }
  };

  return (
    <div className="font-sans">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Financiar</h1>

      <Card>
        <CardHeader className="text-black flex flex-row items-center justify-between">
          <CardTitle>Facturi Emise</CardTitle>
          <AddFacturaDialog onFacturaAdded={fetchFacturi} />
        </CardHeader>
        <CardContent>
          {loading ? <p>Se încarcă...</p> : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold text-slate-900">Serie / Nr</TableHead>
                  <TableHead className="font-bold text-slate-900">Client</TableHead>
                  <TableHead className="font-bold text-slate-900">Dată Emitere</TableHead>
                  <TableHead className="font-bold text-slate-900">Scadență</TableHead>
                  <TableHead className="font-bold text-slate-900">Total</TableHead>
                  <TableHead className="font-bold text-slate-900">Status</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facturi.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-black/80 text-center py-8">Nu există facturi înregistrate.</TableCell></TableRow>
                ) : (
                  facturi.map((f) => (
                    <TableRow key={f.id} className="hover:bg-slate-50/50">
                      
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-emerald-600"/> {f.serie_numar}
                        </div>
                      </TableCell>
                      
                      <TableCell className="font-bold text-slate-700">{f.client_nume}</TableCell>
                      
                      <TableCell className="text-black" >{f.data_emitere}</TableCell>
                      
                      <TableCell className={f.status === 'scadenta_depasita' ? "text-red-600 font-bold" : "text-slate-600"}>
                        {f.data_scadenta}
                      </TableCell>

                      <TableCell className="text-emerald-700 font-bold text-base">
                         {f.total_plata} RON
                      </TableCell>

                      <TableCell>
                         {getStatusBadge(f.status)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                            
                            <EditFacturaDialog 
                                factura={f} 
                                onFacturaUpdated={fetchFacturi} 
                            />

                            <Button variant="ghost" size="icon" className=" cursor-pointer text-black h-8 w-8 hover:text-red-600" onClick={() => handleDelete(f.id)}>
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