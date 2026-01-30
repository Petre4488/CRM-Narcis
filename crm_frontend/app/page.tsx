"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, Layers, Calendar, ArrowRight, TrendingUp, UserPlus, Clock } from "lucide-react";
import Link from "next/link";
import { Sesiune } from "@/types";

// Definim tipul datelor pe care le primim de la dashboard
interface DashboardStats {
  total_elevi: number;
  venituri_luna: number;
  grupe_active: number;
  leaduri_noi: number;
  sesiuni_azi: Sesiune[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/dashboard/stats");
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  // Formatare ora (ex: 14:00)
  const formatTime = (isoString: string) => {
      const d = new Date(isoString);
      return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
      return <div className="flex h-screen items-center justify-center text-slate-400">Se încarcă dashboard-ul...</div>;
  }

  if (!stats) return <div>Eroare la încărcare date.</div>;

  return (
    <div className="font-sans max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* 1. HEADER & WELCOME */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Bună ziua, Director! 👋</h1>
            <p className="text-slate-500">Iată situația școlii tale pentru astăzi.</p>
          </div>
          <div className="flex gap-2">
             <Link href="/inscrieri">
                <Button className="bg-slate-900 text-white hover:bg-slate-700 cursor-pointer">Înscrie Elev</Button>
             </Link>
             <Link href="/financiar">
                <Button variant="outline" className="border-slate-300 cursor-pointer">Factură Nouă</Button>
             </Link>
          </div>
      </div>

      {/* 2. STATS CARDS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card Elevi */}
          <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                  <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Total Elevi</p>
                      <h3 className="text-3xl font-bold text-slate-800">{stats.total_elevi}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Users className="h-6 w-6" />
                  </div>
              </CardContent>
          </Card>

          {/* Card Venituri */}
          <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                  <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Venituri (Luna curentă)</p>
                      <h3 className="text-3xl font-bold text-emerald-600">{stats.venituri_luna} <span className="text-sm text-slate-400">RON</span></h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CreditCard className="h-6 w-6" />
                  </div>
              </CardContent>
          </Card>

           {/* Card Grupe */}
           <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                  <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Grupe Active</p>
                      <h3 className="text-3xl font-bold text-violet-600">{stats.grupe_active}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
                      <Layers className="h-6 w-6" />
                  </div>
              </CardContent>
          </Card>

           {/* Card Lead-uri */}
           <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                  <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Lead-uri Noi</p>
                      <h3 className="text-3xl font-bold text-orange-500">{stats.leaduri_noi}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                      <UserPlus className="h-6 w-6" />
                  </div>
              </CardContent>
          </Card>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: ORAR AZI (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
              <Card className="border-slate-200 shadow-md">
                  <CardHeader className="border-b border-slate-100 pb-4">
                      <CardTitle className="flex items-center gap-2 text-xl text-black">
                          <Calendar className="h-5 w-5 text-indigo-500"/> Orarul Zilei
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                      {stats.sesiuni_azi.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">
                              Nu sunt sesiuni programate pentru astăzi.
                              <br/>
                              <Link href="/sesiuni" className="text-indigo-600 hover:underline text-sm font-semibold">Vezi calendarul complet</Link>
                          </div>
                      ) : (
                          <div className="divide-y divide-slate-100">
                              {stats.sesiuni_azi.map((sesiune) => (
                                  <div key={sesiune.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                      <div className="flex items-center gap-4">
                                          <div className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg font-bold text-sm flex flex-col items-center min-w-17.5">
                                              <span>{formatTime(sesiune.data_ora_start)}</span>
                                              <span className="text-[10px] text-indigo-400 font-normal">START</span>
                                          </div>
                                          <div>
                                              <h4 className="font-bold text-slate-800">{sesiune.tema_lectiei || "Activitate Curs"}</h4>
                                              <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3"/> Durată: {sesiune.durata_ore}h • Sala: {sesiune.sala}
                                              </p>
                                          </div>
                                      </div>
                                      <Link href="/catalog">
                                        <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                            Catalog <ArrowRight className="ml-1 h-4 w-4"/>
                                        </Button>
                                      </Link>
                                  </div>
                              ))}
                          </div>
                      )}
                  </CardContent>
              </Card>

              {/* Banner Promovare / Info (Optional) */}
              <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between">
                  <div>
                      <h3 className="text-lg font-bold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-400"/> Crește productivitatea!</h3>
                      <p className="text-slate-300 text-sm mt-1">Verifică stocul de materiale înainte de ore.</p>
                  </div>
                  <Link href="/inventar">
                    <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-200 cursor-pointer">Verifică Inventar</Button>
                  </Link>
              </div>
          </div>

          {/* Right Column: SHORTCUTS & ALERTS (1/3 width) */}
          <div className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="text-lg text-black">Comenzi Rapide</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                      <Link href="/leaduri">
                        <Button variant="outline" className="w-full justify-start h-12 bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600">
                            <UserPlus className="mr-2 h-4 w-4"/> Gestionează Lead-uri
                        </Button>
                      </Link>
                      <Link href="/grupe">
                        <Button variant="outline" className="w-full justify-start h-12 bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600">
                            <Layers className="mr-2 h-4 w-4"/> Vezi Grupele
                        </Button>
                      </Link>
                      <Link href="/catalog">
                        <Button variant="outline" className="w-full justify-start h-12 bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600">
                            <Users className="mr-2 h-4 w-4"/> Prezență Azi
                        </Button>
                      </Link>
                  </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-100">
                  <CardContent className="p-4">
                      <h4 className="font-bold text-yellow-800 mb-2 text-sm flex items-center gap-2">
                          ⚠️ Notă importantă
                      </h4>
                      <p className="text-xs text-yellow-700 leading-relaxed">
                          Nu uita să marchezi prezențele la finalul fiecărei zile pentru a genera facturile automat la sfârșitul lunii.
                      </p>
                  </CardContent>
              </Card>
          </div>

      </div>
    </div>
  );
}