"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // Ca sa stim pe ce pagina suntem
import { LayoutDashboard, Users, FileText, Settings, Target, GraduationCap, BookOpenCheck, Blocks, Group, NotebookTabs, PiggyBank } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  // Lista de link-uri din meniu
  const menuItems = [
    { name: "Parteneri", href: "/parteneri", icon: Users },
    { name: "Lead-uri", href: "/leaduri", icon: Target },
    { name: "Contracte", href: "/contracte", icon: FileText },
    { name: "Profesori", href: "/profesori", icon: GraduationCap},
    { name: "Cursuri", href: "/cursuri", icon: BookOpenCheck},
    { name: "Elevi", href: "/elevi", icon: Blocks},
    { name: "Grupe", href: "/grupe", icon: Group},
    { name: "Sesiuni", href: "/sesiuni", icon: NotebookTabs},
    { name: "Financiar", href: "/financiar", icon: PiggyBank},
    { name: "Inscrieri", href: "/inscrieri", icon: PiggyBank},
    { name: "Catalog", href: "/catalog", icon: PiggyBank},
    { name: "Inventar", href: "/inventar", icon: PiggyBank},
    { name: "Setări", href: "/setari", icon: Settings },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <Link href="/">
          <h1 className="text-2xl font-bold text-blue-500 cursor-pointer hover:text-blue-400 transition-colors">
            EduCRM 🚀
          </h1>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          v1.0.0 by Narcis & Gemini
        </p>
      </div>
    </div>
  );
}