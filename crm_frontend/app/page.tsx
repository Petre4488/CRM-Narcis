"use client";

import { useEffect, useState } from "react";
import { Partener } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddPartnerDialog } from "@/components/AddPartnerDialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditPartnerDialog } from "@/components/EditPartnerDialog";

export default function Home() {
  const [parteneri, setParteneri] = useState<Partener[]>([]);
  const [loading, setLoading] = useState(true);

  // Functia care aduce datele din Python
  const fetchParteneri = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/parteneri/");
      const data = await response.json();
      setParteneri(data);
    } catch (error) {
      console.error("Eroare la incarcarea datelor:", error);
    } finally {
      setLoading(false);
    }
  };

  // Functia de stergere
  const handleDelete = async (id: number) => {
    if (!confirm("Sigur vrei să ștergi acest partener?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/parteneri/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchParteneri();
      } else {
        alert("Eroare la ștergere.");
      }
    } catch (error) {
      console.error(error);
      alert("Eroare de conexiune.");
    }
  };

  useEffect(() => {
    fetchParteneri();
  }, []);

  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Dashboard CRM</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between text-slate-800">
          <CardTitle>Lista Parteneri</CardTitle>
          <AddPartnerDialog onPartnerAdded={fetchParteneri} />
          {/* AM SCOS <TableHead> DE AICI, NU AVEA CE CAUTA AICI */}
        </CardHeader>
        <CardContent className="text-slate-800">
          {loading ? (
            <p>Se încarcă datele...</p>
          ) : (
            <Table>
              <TableHeader>
                  <TableRow className="border-b border-slate-200 hover:bg-slate-100">
                    <TableHead className="w-12.5 text-slate-900 font-bold">ID</TableHead>
                    <TableHead className="text-slate-900 font-bold">Nume Instituție</TableHead>
                    <TableHead className="text-slate-900 font-bold">Tip</TableHead>
                    <TableHead className="text-slate-900 font-bold">Oraș</TableHead>
                    <TableHead className="text-slate-900 font-bold">Telefon</TableHead>
                    <TableHead className="text-slate-900 font-bold">Status</TableHead>
                    <TableHead className="text-right text-slate-900 font-bold">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {parteneri.length === 0 ? (
                  <TableRow>
                    {/* Atentie: colSpan trebuie sa fie 7 acum (erau 6 inainte) */}
                    <TableCell colSpan={7} className="text-center">
                      Nu există parteneri.
                    </TableCell>
                  </TableRow>
                ) : (
                  parteneri.map((p) => (
                    <TableRow key={p.id}  >
                      <TableCell className="font-medium">{p.id}</TableCell>
                      <TableCell>{p.nume}</TableCell>
                      <TableCell className="capitalize">
                        {p.tip.replace("_", " ")}
                      </TableCell>
                      <TableCell>{p.oras || "-"}</TableCell>
                      <TableCell>{p.telefon || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs text-white ${
                            p.status === "activ"
                              ? "bg-green-500"
                              : p.status === "potential"
                              ? "bg-blue-500"
                              : "bg-gray-500"
                          }`}
                        >
                          {p.status}
                        </span>
                      </TableCell>{/* Celula de Actiuni Modificata */}
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center text-slate-200">
                           {/* Butonul de Editare - primeste datele partenerului curent (p) */}
                          <EditPartnerDialog 
                            partener={p} 
                            onPartnerUpdated={fetchParteneri} 
                          />
                          
                          {/* Butonul de Stergere */}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(p.id)}
                            className="text-slate-800"
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