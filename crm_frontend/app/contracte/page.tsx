"use client";

import { useEffect, useState } from "react";
import { Contract, Partener } from "@/types";
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
import { Trash2, Building, Calendar, FileText } from "lucide-react";
import { AddContractDialog } from "@/components/AddContractDialog";
import { EditContractDialog } from "@/components/EditContractDialog"; // <--- Importam componenta de Edit

export default function ContractePage() {
  const [contracte, setContracte] = useState<Contract[]>([]);
  const [parteneri, setParteneri] = useState<Partener[]>([]);
  const [loading, setLoading] = useState(true);

  // Incarcam Contracte + Parteneri (ca sa afisam numele clientului, nu ID-ul)
  const fetchData = async () => {
    try {
      const [resContracte, resParteneri] = await Promise.all([
        fetch("http://127.0.0.1:8000/contracte/"),
        fetch("http://127.0.0.1:8000/parteneri/")
      ]);

      const dataContracte = await resContracte.json();
      const dataParteneri = await resParteneri.json();

      if (Array.isArray(dataContracte)) setContracte(dataContracte);
      if (Array.isArray(dataParteneri)) setParteneri(dataParteneri);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sigur ștergi acest contract?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/contracte/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper sa gasim numele partenerului dupa ID
  const getPartenerName = (id: number) => {
      const p = parteneri.find(item => item.id === id);
      return p ? p.nume : "Client Necunoscut";
  };

  // Badge status
  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'activ': return <span className="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold uppercase">Activ</span>;
          case 'draft': return <span className="bg-slate-400 text-white px-2 py-1 rounded text-xs font-bold uppercase">Draft</span>;
          case 'expirat': return <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold uppercase">Expirat</span>;
          case 'anulat': return <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold uppercase">Anulat</span>;
          default: return <span>{status}</span>;
      }
  };

  return (
    <div className="font-sans">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Contracte & Legal</h1>

      <Card>
        <CardHeader className="text-black flex flex-row items-center justify-between">
          <CardTitle>Listă Contracte</CardTitle>
          <AddContractDialog onContractAdded={fetchData} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Se încarcă...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold text-slate-900">Titlu Contract</TableHead>
                  <TableHead className="font-bold text-slate-900">Client</TableHead>
                  <TableHead className="font-bold text-slate-900">Dată Semnare</TableHead>
                  <TableHead className="font-bold text-slate-900">Valoare</TableHead>
                  <TableHead className="font-bold text-slate-900">Status</TableHead>
                  <TableHead className="font-bold text-slate-900 text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracte.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-black/80 text-center py-8 ">
                      Nu există contracte.
                    </TableCell>
                  </TableRow>
                ) : (
                  contracte.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50/50">
                      
                      <TableCell className="font-medium text-slate-900">
                         <div className="flex items-center gap-2">
                             <FileText className="h-4 w-4 text-emerald-600"/> {c.nume_contract}
                         </div>
                      </TableCell>
                      
                      <TableCell className="text-slate-600">
                         <div className="flex items-center gap-2">
                             <Building className="h-3 w-3"/> {getPartenerName(c.partener_id)}
                         </div>
                      </TableCell>
                      
                      <TableCell>
                         <div className="flex items-center gap-2 text-black">
                             <Calendar className="h-3 w-3 text-slate-600"/> {c.data_semnarii}
                         </div>
                      </TableCell>

                      <TableCell className="font-bold text-emerald-700">
                         {c.valoare} RON
                      </TableCell>

                      <TableCell>
                         {getStatusBadge(c.status)}
                      </TableCell>

                      {/* COLOANA ACTIUNI */}
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                            
                            {/* 👇 AICI E FIX-UL: Folosim prop-ul `onUpdate`, nu `onContractUpdated` */}
                            <EditContractDialog 
                                contract={c} 
                                onUpdate={fetchData} 
                            />

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