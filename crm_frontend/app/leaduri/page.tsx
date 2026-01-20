"use client";

import { useEffect, useState } from "react";
import { Lead } from "@/types";
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
import { AddLeadDialog } from "@/components/AddLeadDialog";

export default function LeadsPage() {
  const [leaduri, setLeaduri] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  const fetchLeaduri = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/leaduri/");
      const data = await response.json();
      
      console.log("Ce a venit de la Python:", data); // <--- Verificam in consola

      // VERIFICARE DE SIGURANTA: Este 'data' o lista?
      if (Array.isArray(data)) {
        setLeaduri(data);
      } else {
        console.error("API-ul nu a trimis o lista corecta!", data);
        setLeaduri([]); // Punem lista goala ca sa nu crape .map
      }

    } catch (error) {
      console.error("Eroare:", error);
      setLeaduri([]); // In caz de eroare grava, lista goala
    } finally {
      setLoading(false);
    }
  };
  // Delete Function
  const handleDelete = async (id: number) => {
    if (!confirm("Sigur ștergi acest lead?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/leaduri/${id}`, { method: "DELETE" });
      if (res.ok) fetchLeaduri();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLeaduri();
  }, []);

  // Functie simpla pentru culoarea statusului (Badge)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "nou": return "bg-blue-500";
      case "contactat": return "bg-yellow-500";
      case "calificat": return "bg-purple-500";
      case "convertit": return "bg-green-500";
      case "pierdut": return "bg-red-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <div className="font-sans">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Pipeline Vânzări</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-black">Lead-uri Active</CardTitle>
          {/* Aici vom pune butonul de AddLead mai tarziu */}
          <AddLeadDialog onLeadAdded={fetchLeaduri} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Se încarcă...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 hover:bg-slate-100">
                  <TableHead className="text-slate-900 font-bold">Nume Contact</TableHead>
                  <TableHead className="text-slate-900 font-bold">Sursă</TableHead>
                  <TableHead className="text-slate-900 font-bold">Telefon</TableHead>
                  <TableHead className="text-slate-900 font-bold">Status</TableHead>
                  <TableHead className="text-right text-slate-900 font-bold">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaduri.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      Nu există lead-uri momentan.
                    </TableCell>
                  </TableRow>
                ) : (
                  leaduri.map((lead) => (
                    <TableRow className="text-black" key={lead.id}>
                      <TableCell className="font-medium">{lead.nume_contact}</TableCell>
                      <TableCell className="capitalize">{lead.sursa_lead || "-"}</TableCell>
                      <TableCell>{lead.telefon_contact || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs text-white uppercase font-bold ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(lead.id)}
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