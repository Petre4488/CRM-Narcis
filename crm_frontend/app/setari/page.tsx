"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, CreditCard, Save, Database, Download, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from "lucide-react"; // <--- Am adaugat iconitele noi
import { Settings } from "@/types";

export default function SetariPage() {
  const [activeTab, setActiveTab] = useState<"general" | "financiar" | "sistem">("general");
  const [loading, setLoading] = useState(false);
  
  // State nou pentru Google Status
  const [googleConnected, setGoogleConnected] = useState(false);

  const [formData, setFormData] = useState<Settings>({
    id: 0,
    nume_institutiei: "",
    adresa_fizica: "",
    email_contact: "",
    telefon_contact: "",
    an_scolar_curent: "",
    nume_legala_firma: "",
    cui: "",
    reg_com: "",
    banca: "",
    iban: "",
    serie_facturi: "",
    numar_curent_factura: 1,
    moneda_default: "RON",
    tva_percent: 0
  });

  // Load Settings & Google Status
  useEffect(() => {
    // 1. Luam setarile generale
    fetch("http://127.0.0.1:8000/settings/")
        .then(res => res.json())
        .then(data => setFormData(data))
        .catch(err => console.error(err));

    // 2. Verificam statusul Google
    checkGoogleStatus();
  }, []);

  // Functie verificare status Google
  const checkGoogleStatus = async () => {
      try {
          const res = await fetch("http://127.0.0.1:8000/google/status");
          const data = await res.json();
          setGoogleConnected(data.is_connected);
      } catch (error) { console.error(error); }
  };

  // Functie deconectare Google
  const handleDisconnect = async () => {
      if(!confirm("Ești sigur? Sincronizarea automată se va opri.")) return;
      try {
          await fetch("http://127.0.0.1:8000/google/disconnect", { method: "DELETE" });
          setGoogleConnected(false); // Update UI instant
          alert("Te-ai deconectat de la Google Calendar.");
      } catch (error) { console.error(error); }
  };

  // Save Settings
  const handleSave = async () => {
    setLoading(true);
    try {
        const res = await fetch("http://127.0.0.1:8000/settings/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            alert("Setări salvate cu succes! ✅");
        }
    } catch (error) { console.error(error); alert("Eroare la salvare ❌"); } 
    finally { setLoading(false); }
  };

  // Download Backup (EXCEL)
  const handleBackup = async () => {
      try {
          const res = await fetch("http://127.0.0.1:8000/system/backup");
          if (!res.ok) throw new Error("Eroare download");
          
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Backup_EduCRM_${new Date().toISOString().slice(0,10)}.xlsx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          
      } catch (error) {
          console.error(error);
          alert("Nu s-a putut descărca fișierul Excel.");
      }
  };

  const inputStyle = "bg-white border-slate-300 focus-visible:ring-blue-500";
  const labelStyle = "mb-1.5 block text-sm font-semibold text-slate-700";

  return (
    <div className="font-sans max-w-4xl mx-auto pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Setări Platformă ⚙️</h1>
            <p className="text-slate-500 mt-1">Configurează detaliile școlii și preferințele sistemului.</p>
          </div>
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white shadow-lg gap-2">
             <Save className="h-4 w-4"/> {loading ? "Se salvează..." : "Salvează Modificările"}
          </Button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-lg w-fit">
          <button 
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2
            ${activeTab === "general" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Building2 className="h-4 w-4"/> General
          </button>
          <button 
            onClick={() => setActiveTab("financiar")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2
            ${activeTab === "financiar" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <CreditCard className="h-4 w-4"/> Financiar
          </button>
          <button 
            onClick={() => setActiveTab("sistem")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2
            ${activeTab === "sistem" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Database className="h-4 w-4"/> Date & Sistem
          </button>
      </div>

      {/* TAB CONTENT: GENERAL */}
      {activeTab === "general" && (
        <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardHeader className="text-black">
                <CardTitle>Profil Instituție</CardTitle>
                <CardDescription>Datele care apar în antetul platformei și în comunicări.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label className={labelStyle}>Numele Școlii / Hub-ului</Label>
                        <Input value={formData.nume_institutiei} onChange={e => setFormData({...formData, nume_institutiei: e.target.value})} className={inputStyle} />
                    </div>
                    <div>
                        <Label className={labelStyle}>An Școlar Curent</Label>
                        <Input value={formData.an_scolar_curent} onChange={e => setFormData({...formData, an_scolar_curent: e.target.value})} className={inputStyle} placeholder="2025-2026" />
                    </div>
                </div>
                <div>
                    <Label className={labelStyle}>Adresă Fizică</Label>
                    <Input value={formData.adresa_fizica || ""} onChange={e => setFormData({...formData, adresa_fizica: e.target.value})} className={inputStyle} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label className={labelStyle}>Email Contact</Label>
                        <Input value={formData.email_contact || ""} onChange={e => setFormData({...formData, email_contact: e.target.value})} className={inputStyle} />
                    </div>
                    <div>
                        <Label className={labelStyle}>Telefon Contact</Label>
                        <Input value={formData.telefon_contact || ""} onChange={e => setFormData({...formData, telefon_contact: e.target.value})} className={inputStyle} />
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: FINANCIAR */}
      {activeTab === "financiar" && (
        <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300 border-emerald-100">
            <CardHeader className="bg-emerald-50/50">
                <CardTitle className="text-emerald-800">Date Fiscale & Facturare</CardTitle>
                <CardDescription className="text-emerald-600">Aceste date vor apărea automat pe facturile emise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label className={labelStyle}>Nume Firmă (Legal)</Label>
                        <Input value={formData.nume_legala_firma || ""} onChange={e => setFormData({...formData, nume_legala_firma: e.target.value})} className={inputStyle} placeholder="S.C. EXEMPLU S.R.L." />
                    </div>
                    <div>
                        <Label className={labelStyle}>CUI / CIF</Label>
                        <Input value={formData.cui || ""} onChange={e => setFormData({...formData, cui: e.target.value})} className={inputStyle} placeholder="RO123456" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label className={labelStyle}>Nr. Reg. Comerțului</Label>
                        <Input value={formData.reg_com || ""} onChange={e => setFormData({...formData, reg_com: e.target.value})} className={inputStyle} placeholder="J40/..." />
                    </div>
                    <div>
                        <Label className={labelStyle}>Banca</Label>
                        <Input value={formData.banca || ""} onChange={e => setFormData({...formData, banca: e.target.value})} className={inputStyle} placeholder="Banca Transilvania" />
                    </div>
                </div>
                <div>
                    <Label className={labelStyle}>Cont IBAN</Label>
                    <Input value={formData.iban || ""} onChange={e => setFormData({...formData, iban: e.target.value})} className={inputStyle} placeholder="RO..." />
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6">
                     <div>
                        <Label className={labelStyle}>Serie Facturi</Label>
                        <Input value={formData.serie_facturi} onChange={e => setFormData({...formData, serie_facturi: e.target.value})} className="bg-white font-mono" />
                    </div>
                    <div>
                        <Label className={labelStyle}>Nr. Curent</Label>
                        <Input type="number" value={formData.numar_curent_factura} onChange={e => setFormData({...formData, numar_curent_factura: parseInt(e.target.value)})} className="bg-white font-mono" />
                    </div>
                     <div>
                        <Label className={labelStyle}>Monedă</Label>
                        <Input value={formData.moneda_default} onChange={e => setFormData({...formData, moneda_default: e.target.value})} className="bg-white" />
                    </div>
                    <div>
                        <Label className={labelStyle}>TVA (%)</Label>
                        <Input type="number" value={formData.tva_percent} onChange={e => setFormData({...formData, tva_percent: parseFloat(e.target.value)})} className="bg-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: SISTEM */}
      {activeTab === "sistem" && (
        <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300 border-violet-100">
            <CardHeader className="bg-violet-50/50">
                <CardTitle className="text-violet-800">Mentenanță & Date</CardTitle>
                <CardDescription className="text-violet-600">Gestionează copiile de rezervă și integritatea datelor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                
                {/* 1. BACKUP DATA */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white">
                    <div>
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                             <Download className="h-5 w-5 text-blue-500"/> Export Backup Date
                        </h4>
                        <p className="text-sm text-slate-500 mt-1">Descarcă un fișier Excel cu toate datele din CRM (Elevi, Note, Inventar).</p>
                    </div>
                    <Button onClick={handleBackup} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-white cursor-pointer">
                        Descarcă Date
                    </Button>
                </div>

                {/* 2. RESET DATA */}
                <div className="flex items-center justify-between p-4 border border-red-100 rounded-lg bg-red-50/30">
                    <div>
                        <h4 className="font-bold text-red-700 flex items-center gap-2">
                             <AlertTriangle className="h-5 w-5"/> Resetare Sistem
                        </h4>
                        <p className="text-sm text-red-600/70 mt-1">Această acțiune este ireversibilă. Folosește doar în caz de urgență.</p>
                    </div>
                    <Button variant="destructive" className="text-red-950 cursor-not-allowed">
                        Șterge Tot (Dezactivat)
                    </Button>
                </div>

                {/* 3. GOOGLE CALENDAR INTEGRATION (UPDATED) */}
                <div className={`flex flex-col md:flex-row items-start md:items-center justify-between p-5 border rounded-xl mt-6 transition-colors ${googleConnected ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                    
                    <div className="flex gap-4 items-center mb-4 md:mb-0">
                        {/* Iconita Status */}
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${googleConnected ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>
                            {googleConnected ? <CheckCircle2 className="h-6 w-6"/> : <XCircle className="h-6 w-6"/>}
                        </div>
                        
                        <div>
                            <h4 className={`font-bold text-lg flex items-center gap-2 ${googleConnected ? "text-emerald-800" : "text-slate-700"}`}>
                                 Google Calendar
                                 {googleConnected && <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full uppercase">Conectat</span>}
                            </h4>
                            <p className="text-sm text-slate-500 mt-1">
                                {googleConnected 
                                    ? "Sincronizarea este activă. Evenimentele se actualizează automat." 
                                    : "Conectează contul pentru a sincroniza sesiunile automat."}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        
                        {/* BUTOANE PENTRU STATUS: NECONECTAT */}
                        {!googleConnected && (
                            <Button 
                                className="bg-blue-600 text-white hover:bg-blue-700 shadow-md gap-2 w-full md:w-auto cursor-pointer"
                                onClick={async () => {
                                    try {
                                        const res = await fetch("http://127.0.0.1:8000/google/login");
                                        const data = await res.json();
                                        if(data.url) window.location.href = data.url; 
                                    } catch(e) { console.error(e); }
                                }}
                            >
                                Conectează Cont
                            </Button>
                        )}

                        {/* BUTOANE PENTRU STATUS: CONECTAT */}
                        {googleConnected && (
                            <>
                                <Button 
                                    variant="outline"
                                    className="border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-100 gap-2 w-full md:w-auto cursor-pointer"
                                    onClick={async () => {
                                        const btn = document.activeElement as HTMLButtonElement;
                                        if(btn) btn.innerText = "Se verifică...";
                                        
                                        try {
                                            const res = await fetch("http://127.0.0.1:8000/google/sync-events");
                                            
                                            // Chiar daca e eroare de logica, backend-ul da acum JSON, nu crapa
                                            const data = await res.json();
                                            
                                            if (data.success) {
                                                alert("✅ " + data.message);
                                            } else {
                                                alert("⚠️ " + data.message);
                                            }

                                        } catch(e) { 
                                            console.error(e); 
                                            alert("❌ Eroare de conexiune cu serverul."); 
                                        }
                                        finally { if(btn) btn.innerText = "Forțează Sync"; }
                                    }}
                                >
                                    <RefreshCw className="h-4 w-4"/> Forțează Sync
                                </Button>

                                <Button 
                                    variant="ghost"
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 w-full md:w-auto cursor-pointer"
                                    onClick={handleDisconnect}
                                >
                                    Deconectează
                                </Button>
                            </>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
      )}

    </div>
  );
}