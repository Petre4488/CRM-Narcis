export interface Partener {
  id: number;
  nume: string;
  tip: string;
  oras: string;
  telefon: string;
  email: string;
  status: string;
  created_at: string;
}

// --- UPDATE AICI ---
export interface Lead {
  id: number;
  nume_contact: string;
  telefon_contact: string;
  email_contact: string;
  status: string;     // nou, contactat, calificat...
  sursa_lead: string; // facebook, google, recomandare...
  note: string;
  partener_id: number | null;
}

export interface Contract {
  id: number;
  nume_contract: string;
  valoare: number;
  data_semnarii: string;
  status: string;
  partener_id: number;
}

export interface Profesor {
  id: number;
  nume_complet: string;
  email: string;
  telefon: string;
  tip_contract: string; // "cim", "pfa", "srl"
  tarif_orar_default: number;
  is_active: boolean;
  data_start: string;
  note: string;
}

export interface Curs {
  id: number;
  nume_curs: string;
  categorie: string;
  nivel_dificultate: string;
  varsta_min: number;
  varsta_max: number;
  programa_link: string;
  descriere: string;
}

export interface Elev {
  id: number;
  nume_complet: string;
  data_nasterii: string;
  scoala_curenta: string;
  nume_parinte: string;
  telefon_parinte: string;
  email_parinte: string;
  gdpr_accepted: boolean;
  note: string;
}

// ... (celelalte interfete)

export interface Grupa {
  id: number;
  nume_grupa: string;
  contract_id?: number | null;
  curs_id: number;
  profesor_titular_id: number;
  max_copii: number;
  data_inceput: string;
  data_sfarsit: string;
  status_grupa: string; // planificata, activa, incheiata
  tip_plata_grupa: string; // plateste_scoala, plateste_parintii
  note: string;
}

export interface Sesiune {
  id: number;
  grupa_id: number;
  profesor_id: number;
  data_ora_start: string; // ISO String din backend
  data_ora_end: string;
  sala: string;
  tema_lectiei: string;
  status_sesiune: string;
  durata_ore: number;
  note: string;
}

export interface Factura {
  id: number;
  serie_numar: string;
  client_nume: string;
  data_emitere: string;
  data_scadenta: string;
  total_plata: number;
  moneda: string;
  status: string; // draft, emisa, platita, etc.
}

export interface Inscriere {
  id: number;
  grupa_id: number;
  elev_id: number;
  data_inscriere: string;
  status_inscriere: string; // activ, retras, in_asteptare
  tip_plata: string;
  reducere_percent: number;
  note: string;
}

export interface CatalogItem {
  elev_id: number;
  nume_elev: string;
  inscriere_id: number;
  prezenta_id: number | null;
  is_prezent: boolean;
  motiv_absenta: string | null;
  note: string | null;
  rating_profesor: number; // 0 = normal, 5 = star player
}

export interface Produs {
  id: number;
  nume_produs: string;
  cod_sku: string;
  categorie: string;
  unitate_masura: string;
  cost_unitar_mediu: number;
  note: string;
  stoc_curent: number; // Vine calculat din backend
}

export interface MiscareStoc {
  id: number;
  produs_id: number;
  tip: string; // achizitie_in, consum_out
  cantitate: number;
  data_miscare: string;
}

export interface Settings {
  id: number;
  nume_institutiei: string;
  adresa_fizica: string;
  email_contact: string;
  telefon_contact: string;
  an_scolar_curent: string;
  
  nume_legala_firma: string;
  cui: string;
  reg_com: string;
  banca: string;
  iban: string;
  serie_facturi: string;
  numar_curent_factura: number;
  moneda_default: string;
  tva_percent: number;
}