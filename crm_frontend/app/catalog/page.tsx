"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sesiune, CatalogItem, Grupa } from "@/types";
import { Check, X, Calendar, MapPin, User, Loader2, Sparkles, Star, MessageSquare } from "lucide-react";
import { NoteDialog } from "@/components/NoteDialog";

export default function CatalogPage() {
  const [sesiuni, setSesiuni] = useState<Sesiune[]>([]);
  const [grupe, setGrupe] = useState<Grupa[]>([]);
  
  const [selectedSesiuneId, setSelectedSesiuneId] = useState<string>("");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  
  const [loadingSesiuni, setLoadingSesiuni] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // State pentru Dialogul de Note
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<{id: number, name: string, note: string} | null>(null);

  // 1. Incarcam datele initiale
  useEffect(() => {
    const initData = async () => {
      try {
        const [sRes, gRes] = await Promise.all([
             fetch("http://127.0.0.1:8000/sesiuni/"),
             fetch("http://127.0.0.1:8000/grupe/")
        ]);
        if (sRes.ok) setSesiuni(await sRes.json());
        if (gRes.ok) setGrupe(await gRes.json());
      } catch (err) { console.error(err); } 
      finally { setLoadingSesiuni(false); }
    };
    initData();
  }, []);

  // 2. Incarcam catalogul cand alegem sesiunea
  useEffect(() => {
    if (!selectedSesiuneId) return;
    const fetchCatalog = async () => {
        setLoadingCatalog(true);
        try {
            const res = await fetch(`http://127.0.0.1:8000/catalog/${selectedSesiuneId}`);
            if (res.ok) setCatalog(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoadingCatalog(false); }
    };
    fetchCatalog();
  }, [selectedSesiuneId]);

  // --- ACTIUNI (Update la server) ---

  // Definim ce campuri putem trimite la update (toate optionale)
  type UpdatePayload = {
      is_prezent?: boolean;
      rating_profesor?: number;
      note?: string;
  };

  const updateServer = async (inscriere_id: number, payload: UpdatePayload) => {
      try {
          await fetch("http://127.0.0.1:8000/catalog/mark", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  sesiune_id: parseInt(selectedSesiuneId),
                  inscriere_id: inscriere_id,
                  ...payload
              })
          });
      } catch (error) { console.error("Eroare update server", error); }
  };
  
  // 1. Toggle Prezenta
  const togglePrezenta = (inscriere_id: number, status: boolean) => {
      setCatalog(prev => prev.map(item => item.inscriere_id === inscriere_id ? { ...item, is_prezent: status } : item));
      updateServer(inscriere_id, { is_prezent: status });
  };

  // 2. Toggle Star Player
  const toggleStar = (inscriere_id: number, currentRating: number) => {
      const newRating = currentRating === 5 ? 0 : 5; // 5 = Star, 0 = Normal
      setCatalog(prev => prev.map(item => item.inscriere_id === inscriere_id ? { ...item, rating_profesor: newRating } : item));
      updateServer(inscriere_id, { rating_profesor: newRating });
  };

  // 3. Save Note
  const saveNote = (noteText: string) => {
      if (!selectedStudentForNote) return;
      const id = selectedStudentForNote.id; // este inscriere_id de fapt (vezi mai jos)
      
      setCatalog(prev => prev.map(item => item.inscriere_id === id ? { ...item, note: noteText } : item));
      updateServer(id, { note: noteText });
  };

  const openNoteDialog = (item: CatalogItem) => {
      setSelectedStudentForNote({ id: item.inscriere_id, name: item.nume_elev, note: item.note || "" });
      setNoteDialogOpen(true);
  };

  // Helpers
  const currentSesiune = sesiuni.find(s => s.id.toString() === selectedSesiuneId);
  const currentGrupaName = currentSesiune ? grupe.find(g => g.id === currentSesiune.grupa_id)?.nume_grupa : "";
  const totalStudents = catalog.length;
  const presentStudents = catalog.filter(c => c.is_prezent).length;
  const percentage = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
  
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  const colors = ["bg-red-100 text-red-600", "bg-blue-100 text-blue-600", "bg-green-100 text-green-600", "bg-purple-100 text-purple-600", "bg-orange-100 text-orange-600"];
  const getColor = (id: number) => colors[id % colors.length];

  return (
    <div className="font-sans max-w-5xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                Catalog Digital <Sparkles className="h-6 w-6 text-yellow-500 fill-yellow-100" />
            </h1>
            <p className="text-slate-500 mt-1">Gestionează prezența și performanța elevilor.</p>
        </div>
        <div className="w-full md:w-72">
            <Select value={selectedSesiuneId} onValueChange={setSelectedSesiuneId}>
                <SelectTrigger className="bg-violet-600 h-12  border-slate-300 shadow-sm text-base"><SelectValue  placeholder="Alege Ședința..." /></SelectTrigger>
                <SelectContent className="bg-indigo-600">
                    {sesiuni.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.data_ora_start.split("T")[0]} - {s.tema_lectiei || "Fără Temă"}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      {selectedSesiuneId && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* STATS CARD */}
            <Card className="border-none shadow-lg bg-linear-to-r from-violet-600 to-indigo-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><User className="h-32 w-32" /></div>
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold">{currentGrupaName}</h2>
                        <div className="flex items-center gap-4 mt-2 text-violet-100">
                            <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {currentSesiune?.data_ora_start.split("T")[0]}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {currentSesiune?.sala || "Sala ?"}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold">{presentStudents} / {totalStudents}</div>
                            <div className="text-xs uppercase tracking-wider opacity-80">Prezenți</div>
                        </div>
                        <div className="h-16 w-16 rounded-full border-4 border-white/30 flex items-center justify-center font-bold text-lg bg-white/10 backdrop-blur-sm">{percentage}%</div>
                    </div>
                </CardContent>
            </Card>

            {/* LISTA STUDENTI */}
            {loadingCatalog ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600"/></div>
            ) : catalog.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500 font-medium">Această grupă nu are niciun elev înscris.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {catalog.map((student) => (
                        <div key={student.elev_id} 
                             className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 shadow-sm
                                ${student.is_prezent ? "bg-white border-emerald-200 hover:border-emerald-400 hover:shadow-md" : "bg-slate-50 border-transparent opacity-90 hover:opacity-100 hover:bg-white hover:border-slate-300"}`}
                        >
                            {/* STANGA: Avatar + Nume */}
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm relative ${getColor(student.elev_id)}`}>
                                    {getInitials(student.nume_elev)}
                                    {/* Star Badge pe Avatar daca e Star Player */}
                                    {student.rating_profesor === 5 && (
                                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-0.5 rounded-full shadow-sm border-2 border-white">
                                            <Star className="h-3 w-3 fill-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg ${student.is_prezent ? "text-slate-800" : "text-slate-500"}`}>{student.nume_elev}</h3>
                                    {student.note && <p className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-0.5"><MessageSquare className="h-3 w-3"/> Are observații salvate</p>}
                                </div>
                            </div>

                            {/* DREAPTA: Actiuni */}
                            <div className="flex items-center gap-3">
                                
                                {/* 1. Buton NOTE */}
                                <Button 
                                    onClick={() => openNoteDialog(student)}
                                    variant="ghost" size="icon"
                                    className={`h-10 w-10 rounded-full ${student.note ? 'text-blue-600 bg-blue-50' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'}`}
                                >
                                    <MessageSquare className="h-5 w-5" />
                                </Button>

                                {/* 2. Buton STAR PLAYER */}
                                <Button 
                                    onClick={() => toggleStar(student.inscriere_id, student.rating_profesor)}
                                    variant="ghost" size="icon"
                                    className={`h-10 w-10 rounded-full transition-all ${student.rating_profesor === 5 ? 'text-yellow-400 bg-yellow-50 hover:bg-yellow-100 scale-110' : 'text-slate-300 hover:text-yellow-400 hover:bg-yellow-50'}`}
                                >
                                    <Star className={`h-5 w-5 ${student.rating_profesor === 5 ? 'fill-yellow-400' : ''}`} />
                                </Button>
                                
                                {/* Divider vertical */}
                                <div className="h-8 w-px bg-slate-200 mx-1"></div>

                                {/* 3. Butoane PREZENTA */}
                                <Button onClick={() => togglePrezenta(student.inscriere_id, false)} className={`h-10 w-10 rounded-full transition-all ${!student.is_prezent ? 'bg-red-500 hover:bg-red-600 text-white shadow-md scale-110' : 'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500'}`} size="icon" variant="ghost">
                                    <X className="h-5 w-5" />
                                </Button>
                                
                                <Button onClick={() => togglePrezenta(student.inscriere_id, true)} className={`h-10 w-10 rounded-full transition-all ${student.is_prezent ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md scale-110' : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-500'}`} size="icon" variant="ghost">
                                    <Check className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
      )}

      {/* COMPONENTA DE MODAL PENTRU NOTE */}
      {selectedStudentForNote && (
          <NoteDialog 
            open={noteDialogOpen}
            onOpenChange={setNoteDialogOpen}
            studentName={selectedStudentForNote.name}
            initialNote={selectedStudentForNote.note}
            onSave={saveNote}
          />
      )}
    </div>
  );
}