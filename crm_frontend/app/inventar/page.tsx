"use client";

import { useEffect, useState } from "react";
import { Produs } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { AddProdusDialog } from "@/components/AddProdusDialog";
import { StockMovementDialog } from "@/components/StockMovementDialog";

export default function InventarPage() {
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(true);

  // State pentru Dialogul de Miscare Stoc
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produs | null>(null);
  const [moveType, setMoveType] = useState<"in" | "out">("in");

  const fetchProduse = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/produse/");
      const data = await res.json();
      if (Array.isArray(data)) setProduse(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sigur ștergi acest produs?")) return;
    await fetch(`http://127.0.0.1:8000/produse/${id}`, { method: "DELETE" });
    fetchProduse();
  };

  const openMovement = (produs: Produs, type: "in" | "out") => {
      setSelectedProduct(produs);
      setMoveType(type);
      setMoveDialogOpen(true);
  };

  useEffect(() => { fetchProduse(); }, []);

  return (
    <div className="font-sans">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Gestiune Inventar</h1>

      <Card>
        <CardHeader className="text-black flex flex-row items-center justify-between">
          <CardTitle>Stocuri Curente</CardTitle>
          <AddProdusDialog onProdusAdded={fetchProduse} />
        </CardHeader>
        <CardContent>
          {loading ? <p>Se încarcă...</p> : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold text-slate-900">Produs</TableHead>
                  <TableHead className="font-bold text-slate-900">Categorie</TableHead>
                  <TableHead className="font-bold text-slate-900">Cod SKU</TableHead>
                  <TableHead className="font-bold text-slate-900 text-center">Stoc</TableHead>
                  <TableHead className="font-bold text-slate-900 text-center">Operațiuni Stoc</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produse.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-black text-center py-8">Nu există produse.</TableCell></TableRow>
                ) : (
                  produse.map((p) => (
                    <TableRow key={p.id} className="hover:bg-slate-50/50">
                      
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-500"/> {p.nume_produs}
                        </div>
                      </TableCell>
                      
                      <TableCell><span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">{p.categorie}</span></TableCell>
                      
                      <TableCell className="text-slate-500 font-mono text-xs">{p.cod_sku || "-"}</TableCell>

                      <TableCell className="text-center">
                         <span className={`font-bold text-lg ${p.stoc_curent > 0 ? 'text-slate-800' : 'text-red-500'}`}>
                            {p.stoc_curent}
                         </span>
                         <span className="text-xs text-slate-400 ml-1">{p.unitate_masura}</span>
                      </TableCell>

                      <TableCell className="text-center">
                         <div className="flex justify-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => openMovement(p, "in")} className="bg-white cursor-pointer h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                                <ArrowUp className="h-3 w-3 mr-1"/> Intrare
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openMovement(p, "out")} className="bg-white cursor-pointer  h-8 text-red-600 border-red-200 hover:bg-red-50">
                                <ArrowDown className="h-3 w-3 mr-1"/> Ieșire
                            </Button>
                         </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="cursor-pointer text-black h-8 w-8 hover:text-red-600" onClick={() => handleDelete(p.id)}>
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

      {/* MODAL PENTRU MISCARI STOC */}
      <StockMovementDialog 
         open={moveDialogOpen}
         onOpenChange={setMoveDialogOpen}
         produs={selectedProduct}
         defaultType={moveType}
         onSuccess={fetchProduse}
      />
    </div>
  );
}