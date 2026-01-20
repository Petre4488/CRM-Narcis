"use client";

import { useEffect, useState } from "react";
import { Contract } from "@/types";
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
import { Trash2 } from "lucide-react";
import { AddContractDialog } from "@/components/AddContractDialog";
import { EditContractDialog } from "@/components/EditContractDialog";

export default function ContractsPage() {
  const [contracte, setContracte] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracte = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/contracte/");
      const data = await res.json();
      if (Array.isArray(data)) setContracte(data);
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
      if (res.ok) fetchContracte();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchContracte();
  }, []);

  // Funcție helper pentru culoarea statusului (ca să fie codul mai curat)
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "activ":
        return "bg-emerald-500"; // Verdele din poză
      case "expirat":
        return "bg-red-500";     // Roșul din poză
      case "anulat":
        return "bg-slate-500";
      default:
        return "bg-gray-400";    // Draft sau altele
    }
  };

  return (
    <div className="font-sans">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Gestiune Contracte</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contracte Semnate</CardTitle>
          <AddContractDialog onContractAdded={fetchContracte} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Se încarcă...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50">
                  <TableHead className="font-bold text-slate-900 w-12.5">ID</TableHead>
                  <TableHead className="font-bold text-slate-900">Titlu Contract</TableHead>
                  <TableHead className="font-bold text-slate-900">Valoare</TableHead>
                  <TableHead className="font-bold text-slate-900">Data Semnării</TableHead>
                  <TableHead className="font-bold text-slate-900">Status</TableHead>
                  <TableHead className="font-bold text-slate-900 text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracte.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Nu există contracte înregistrate.
                    </TableCell>
                  </TableRow>
                ) : (
                  contracte.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-700">{c.id}</TableCell>
                      
                      <TableCell className="font-medium text-slate-900">
                        {c.nume_contract}
                      </TableCell>
                      
                      {/* Valoarea Verde */}
                      <TableCell className="text-emerald-600 font-bold">
                        {c.valoare} RON
                      </TableCell>
                      
                      <TableCell className="text-slate-600">
                        {c.data_semnarii}
                      </TableCell>
                      
                      {/* Ecusonul Status */}
                      <TableCell>
                        <span className={`px-3 py-1 rounded text-[11px] text-white uppercase font-bold tracking-wide ${getStatusBadgeColor(c.status)}`}>
                          {c.status}
                        </span>
                      </TableCell>
                      
                      {/* Acțiuni - Butoane Ghost (fără fundal colorat, doar iconiță) */}
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          
                          <EditContractDialog 
                            contract={c} 
                            onContractUpdated={fetchContracte} 
                          />

                          <Button
                            variant="ghost" // Asta îl face transparent, ca în poză
                            size="icon"     // Îl face mic și pătrat
                            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 cursor-pointer" // Se înroșește doar la hover
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