from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
# Importam Enum-urile din models ca sa validam strict
from models import (
    StatusFactura, StatusSesiune, TipInstitutie, StatusPartener, StatusLead, 
    TipContractHR, ModCalculPret, StatusGrupa
)

# ======================= 1. CRM & SALES =======================

# --- PARTENERI ---
class PartenerBase(BaseModel):
    nume: str
    tip: TipInstitutie
    oras: Optional[str] = None
    adresa_completa: Optional[str] = None
    cui_fiscal: Optional[str] = None
    persoana_contact: Optional[str] = None
    telefon: Optional[str] = None
    email: Optional[str] = None
    status: StatusPartener = StatusPartener.POTENTIAL
    note: Optional[str] = None

class PartenerCreate(PartenerBase):
    pass

class Partener(PartenerBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- LEADURI ---
class LeadBase(BaseModel):
    nume_contact: Optional[str] = None
    telefon_contact: Optional[str] = None
    email_contact: Optional[str] = None
    status: StatusLead = StatusLead.NOU
    sursa_lead: Optional[str] = None
    note: Optional[str] = None
    partener_id: Optional[int] = None 
    campanie_id: Optional[int] = None

class LeadCreate(LeadBase):
    pass

class Lead(LeadBase):
    id: int
    class Config:
        from_attributes = True

# --- CONTRACTE (Actualizat v3) ---
class ContractBase(BaseModel):
    nume_contract: str
    valoare: float
    data_semnarii: date
    data_start: Optional[date] = None
    data_expirare: Optional[date] = None
    status: str
    mod_calcul_pret: ModCalculPret = ModCalculPret.PAUSAL
    moneda: str = "RON"
    partener_id: int
    lead_id: Optional[int] = None

class ContractCreate(ContractBase):
    pass

class Contract(ContractBase):
    id: int
    class Config:
        from_attributes = True


# ======================= 2. HR & PROFESORI (NOU) =======================

class ProfesorBase(BaseModel):
    nume_complet: str
    email: Optional[str] = None
    telefon: Optional[str] = None
    tip_contract: TipContractHR = TipContractHR.CIM
    tarif_orar_default: Optional[float] = 0.0
    is_active: bool = True
    data_start: Optional[date] = None
    note: Optional[str] = None

class ProfesorCreate(ProfesorBase):
    pass

class Profesor(ProfesorBase):
    id: int
    class Config:
        from_attributes = True
        
# ======================= 3. ACADEMIC (CURSURI) =======================

class CursBase(BaseModel):
    nume_curs: str
    categorie: Optional[str] = "General"
    nivel_dificultate: Optional[str] = "Incepator"
    varsta_min: Optional[int] = 6
    varsta_max: Optional[int] = 18
    programa_link: Optional[str] = None
    descriere: Optional[str] = None

class CursCreate(CursBase):
    pass

class Curs(CursBase):
    id: int
    class Config:
        from_attributes = True
        
# ======================= 4. ACADEMIC (ELEVI) =======================

class ElevBase(BaseModel):
    nume_complet: str
    data_nasterii: Optional[date] = None
    scoala_curenta: Optional[str] = None
    nume_parinte: Optional[str] = None
    telefon_parinte: Optional[str] = None
    email_parinte: Optional[str] = None
    gdpr_accepted: bool = False
    note: Optional[str] = None

class ElevCreate(ElevBase):
    pass

class Elev(ElevBase):
    id: int
    class Config:
        from_attributes = True
        
# ... (dupa Elev)

# ======================= 5. GRUPE =======================

class GrupaBase(BaseModel):
    nume_grupa: str
    contract_id: Optional[int] = None
    curs_id: int
    profesor_titular_id: int
    max_copii: Optional[int] = 10
    data_inceput: Optional[date] = None
    data_sfarsit: Optional[date] = None
    status_grupa: StatusGrupa = StatusGrupa.PLANIFICATA
    tip_plata_grupa: str # Aici vom primi string din frontend ("plateste_scoala" etc.)
    note: Optional[str] = None

class GrupaCreate(GrupaBase):
    pass

class Grupa(GrupaBase):
    id: int
    class Config:
        from_attributes = True
        
# ... (dupa Grupa)

# ======================= 6. OPERATIONAL (SESIUNI) =======================

class SesiuneBase(BaseModel):
    grupa_id: int
    profesor_id: int
    data_ora_start: datetime
    data_ora_end: datetime
    sala: Optional[str] = None
    tema_lectiei: Optional[str] = None
    status_sesiune: StatusSesiune = StatusSesiune.PLANIFICATA
    durata_ore: Optional[float] = None
    note: Optional[str] = None

class SesiuneCreate(SesiuneBase):
    pass

class Sesiune(SesiuneBase):
    id: int
    class Config:
        from_attributes = True
        
# ... (dupa Sesiune)

# ======================= 7. FINANCIAR (FACTURI) =======================

class FacturaBase(BaseModel):
    serie_numar: str
    client_nume: str # Simplificam: Numele clientului direct (ex: "Sc. Gen 1" sau "Parinte X")
    data_emitere: date
    data_scadenta: date
    total_plata: float
    moneda: str = "RON"
    status: StatusFactura = StatusFactura.DRAFT

class FacturaCreate(FacturaBase):
    pass

class Factura(FacturaBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True