import enum
from sqlalchemy import Column, Float, Integer, String, Boolean, Date, DateTime, Text, ForeignKey, Numeric, Enum as SqlEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# ===================================================
# 0. ENUMS (Definitii listele fixe)
# ===================================================

class StatusLead(str, enum.Enum):
    NOU = "nou"
    CONTACTAT = "contactat"
    CALIFICAT = "calificat"
    OFERTAT = "ofertat"
    CONVERTIT = "convertit"
    PIERDUT = "pierdut"

class TipInstitutie(str, enum.Enum):
    SCOALA_STAT = "scoala_stat"
    SCOALA_PRIVATA = "scoala_privata"
    GRADINITA = "gradinita"
    HUB_EDUCATIONAL = "hub_educational"
    AFTER_SCHOOL = "after_school"

class StatusPartener(str, enum.Enum):
    POTENTIAL = "potential"
    ACTIV = "activ"
    INACTIV = "inactiv"
    BLACKLIST = "blacklist"

class TipContractHR(str, enum.Enum):
    CIM = "cim"
    PFA = "pfa"
    SRL = "srl"
    VOLUNTARIAT = "voluntariat"

class StatusFactura(str, enum.Enum):
    DRAFT = "draft"
    EMISA = "emisa"
    SCADENTA_DEPASITA = "scadenta_depasita"
    PLATITA_PARTIAL = "platita_partial"
    PLATITA_INTEGRAL = "platita_integral"
    ANULATA = "anulata"

class TipMiscareStoc(str, enum.Enum):
    ACHIZITIE_IN = "achizitie_in"
    CONSUM_OUT = "consum_out"
    RETUR_DEFECT = "retur_defect"
    TRANSFER_PROFESOR = "transfer_profesor"

class StatusSesiune(str, enum.Enum):
    PLANIFICATA = "planificata"
    REALIZATA = "realizata"
    ANULATA = "anulata"

class StatusInscriere(str, enum.Enum):
    ACTIV = "activ"
    RETRAS = "retras"
    IN_ASTEPTARE = "in_asteptare"

class StatusGrupa(str, enum.Enum):
    PLANIFICATA = "planificata"
    ACTIVA = "activa"
    INCHEIATA = "incheiata"
    ANULATA = "anulata"

class TipClient(str, enum.Enum):
    PARTENER = "partener"
    PARINTE = "parinte"

class ModCalculPret(str, enum.Enum):
    PER_GRUPA = "per_grupa"
    PER_COPIL = "per_copil"
    PER_PREZENTA = "per_prezenta"
    PAUSAL = "pausal"

class TipPlataGrupa(str, enum.Enum):
    PLATESTE_SCOALA = "plateste_scoala"
    PLATESTE_PARINTII = "plateste_parintii"
    MIXT = "mixt"


# ===================================================
# 1. DIMENSIUNE TIMP
# ===================================================

class Luna(Base):
    __tablename__ = "luni"

    id = Column(Integer, primary_key=True, index=True)
    cod_luna = Column(String, unique=True) # ex: 2026-01
    an = Column(Integer)
    luna = Column(Integer)
    nume_luna = Column(String)
    data_start = Column(Date)
    data_end = Column(Date)

    facturi = relationship("Factura", back_populates="luna_rel")
    kpi = relationship("KpiLunar", back_populates="luna_rel")
    achizitii = relationship("AchizitiePlan", back_populates="luna_rel")


# ===================================================
# 2. CRM & SALES
# ===================================================

class Partener(Base):
    __tablename__ = "parteneri"

    id = Column(Integer, primary_key=True, index=True)
    nume = Column(String, nullable=False)
    tip = Column(SqlEnum(TipInstitutie), nullable=False)
    oras = Column(String)
    adresa_completa = Column(String)
    cui_fiscal = Column(String)
    persoana_contact = Column(String)
    telefon = Column(String)
    email = Column(String)
    status = Column(SqlEnum(StatusPartener), default=StatusPartener.POTENTIAL)
    created_at = Column(DateTime, default=datetime.utcnow)
    note = Column(Text)

    leads = relationship("Lead", back_populates="partener")
    contracte = relationship("Contract", back_populates="partener")
    clienti = relationship("Client", back_populates="partener")
    tasks = relationship("Task", back_populates="partener")

class Campanie(Base):
    __tablename__ = "campanii"

    id = Column(Integer, primary_key=True, index=True)
    nume_campanie = Column(String, nullable=False)
    buget_alocat = Column(Numeric(10, 2))
    data_start = Column(Date)
    data_end = Column(Date)
    an_fiscal = Column(Integer)
    note = Column(Text)

    leads = relationship("Lead", back_populates="campanie")
    tasks = relationship("Task", back_populates="campanie")

class Lead(Base):
    __tablename__ = "leaduri"

    id = Column(Integer, primary_key=True, index=True)
    campanie_id = Column(Integer, ForeignKey("campanii.id"), nullable=True)
    partener_id = Column(Integer, ForeignKey("parteneri.id"), nullable=True)
    nume_contact = Column(String)
    telefon_contact = Column(String)
    email_contact = Column(String)
    status = Column(SqlEnum(StatusLead), default=StatusLead.NOU)
    sursa_lead = Column(String)
    ultimul_follow_up = Column(Date)
    urmatorul_follow_up = Column(Date)
    note = Column(Text)

    campanie = relationship("Campanie", back_populates="leads")
    partener = relationship("Partener", back_populates="leads")
    contract = relationship("Contract", back_populates="lead", uselist=False)

class Contract(Base):
    __tablename__ = "contracte"

    id = Column(Integer, primary_key=True, index=True)
    partener_id = Column(Integer, ForeignKey("parteneri.id"))
    lead_id = Column(Integer, ForeignKey("leaduri.id"), nullable=True)
    
    nume_contract = Column(String) # sau numar_contract
    data_semnarii = Column(Date)
    data_start = Column(Date)
    data_expirare = Column(Date)
    
    mod_calcul_pret = Column(SqlEnum(ModCalculPret), default=ModCalculPret.PAUSAL)
    valoare = Column(Numeric(10, 2)) # valoare_negociata
    moneda = Column(String, default='RON')
    status = Column(String) # activ / expirat
    document_url = Column(String)
    note = Column(Text)

    partener = relationship("Partener", back_populates="contracte")
    lead = relationship("Lead", back_populates="contract")
    grupe = relationship("Grupa", back_populates="contract")
    tasks = relationship("Task", back_populates="contract")


# ===================================================
# 3. HR & CURSURI
# ===================================================

class Profesor(Base):
    __tablename__ = "profesori"

    id = Column(Integer, primary_key=True, index=True)
    nume_complet = Column(String)
    email = Column(String)
    telefon = Column(String)
    tip_contract = Column(SqlEnum(TipContractHR))
    tarif_orar_default = Column(Numeric(10, 2))
    is_active = Column(Boolean, default=True)
    data_start = Column(Date)
    data_end = Column(Date)
    note = Column(Text)
    
    grupe = relationship("Grupa", back_populates="profesor_titular")
    competente = relationship("CompetentaProfesor", back_populates="profesor")
    sesiuni = relationship("Sesiune", back_populates="profesor")
    miscari_stoc = relationship("MiscareStoc", back_populates="profesor")
    tasks = relationship("Task", back_populates="profesor")

class Curs(Base):
    __tablename__ = "cursuri"

    id = Column(Integer, primary_key=True, index=True)
    nume_curs = Column(String, nullable=False)
    categorie = Column(String)
    nivel_dificultate = Column(String)
    varsta_min = Column(Integer)
    varsta_max = Column(Integer)
    programa_link = Column(String)
    descriere = Column(Text)

    grupe = relationship("Grupa", back_populates="curs")
    competente = relationship("CompetentaProfesor", back_populates="curs")
    echipamente_necesare = relationship("CursEchipament", back_populates="curs")

class CompetentaProfesor(Base):
    __tablename__ = "competente_profesori"

    id = Column(Integer, primary_key=True, index=True)
    profesor_id = Column(Integer, ForeignKey("profesori.id"))
    curs_id = Column(Integer, ForeignKey("cursuri.id"))
    nivel_expertiza = Column(Integer) # 1-5
    poate_predea = Column(Boolean, default=True)

    profesor = relationship("Profesor", back_populates="competente")
    curs = relationship("Curs", back_populates="competente")


# ===================================================
# 4. ACADEMIC
# ===================================================

class Elev(Base):
    __tablename__ = "elevi"

    id = Column(Integer, primary_key=True, index=True)
    nume_complet = Column(String)
    data_nasterii = Column(Date)
    scoala_curenta = Column(String)
    nume_parinte = Column(String)
    telefon_parinte = Column(String)
    email_parinte = Column(String)
    gdpr_accepted = Column(Boolean, default=False)
    note = Column(Text)
    
    inscrieri = relationship("Inscriere", back_populates="elev")
    clienti = relationship("Client", back_populates="elev")

class Grupa(Base):
    __tablename__ = "grupe"

    id = Column(Integer, primary_key=True, index=True)
    nume_grupa = Column(String)
    contract_id = Column(Integer, ForeignKey("contracte.id"), nullable=True)
    curs_id = Column(Integer, ForeignKey("cursuri.id"))
    profesor_titular_id = Column(Integer, ForeignKey("profesori.id"))
    max_copii = Column(Integer)
    data_inceput = Column(Date)
    data_sfarsit = Column(Date)
    status_grupa = Column(SqlEnum(StatusGrupa), default=StatusGrupa.PLANIFICATA)
    
    tip_plata_grupa = Column(SqlEnum(TipPlataGrupa)) # ENUM-ul nou
    note = Column(Text)

    contract = relationship("Contract", back_populates="grupe")
    curs = relationship("Curs", back_populates="grupe")
    profesor_titular = relationship("Profesor", back_populates="grupe")
    inscrieri = relationship("Inscriere", back_populates="grupa")
    sesiuni = relationship("Sesiune", back_populates="grupa")
    linii_factura = relationship("LinieFactura", back_populates="grupa")
    miscari_stoc = relationship("MiscareStoc", back_populates="grupa")
    tasks = relationship("Task", back_populates="grupa")

class Inscriere(Base):
    __tablename__ = "inscrieri"

    id = Column(Integer, primary_key=True, index=True)
    grupa_id = Column(Integer, ForeignKey("grupe.id"))
    elev_id = Column(Integer, ForeignKey("elevi.id"))
    data_inscriere = Column(Date, default=datetime.utcnow)
    status_inscriere = Column(SqlEnum(StatusInscriere), default=StatusInscriere.ACTIV)
    tip_plata = Column(String) 
    reducere_percent = Column(Numeric(5, 2))
    note = Column(Text)
    
    grupa = relationship("Grupa", back_populates="inscrieri")
    elev = relationship("Elev", back_populates="inscrieri")
    linii_factura = relationship("LinieFactura", back_populates="inscriere")


# ===================================================
# 5. OPERATIONAL
# ===================================================

class Sesiune(Base):
    __tablename__ = "sesiuni"

    id = Column(Integer, primary_key=True, index=True)
    grupa_id = Column(Integer, ForeignKey("grupe.id"))
    profesor_id = Column(Integer, ForeignKey("profesori.id"))
    data_ora_start = Column(DateTime)
    data_ora_end = Column(DateTime)
    sala = Column(String)
    tema_lectiei = Column(String)
    status_sesiune = Column(SqlEnum(StatusSesiune), default=StatusSesiune.PLANIFICATA)
    durata_ore = Column(Numeric(5, 2))
    note = Column(Text)

    grupa = relationship("Grupa", back_populates="sesiuni")
    profesor = relationship("Profesor", back_populates="sesiuni")
    prezente = relationship("Prezenta", back_populates="sesiune")
    miscari_stoc = relationship("MiscareStoc", back_populates="sesiune")

class Prezenta(Base):
    __tablename__ = "prezente"

    id = Column(Integer, primary_key=True, index=True)
    sesiune_id = Column(Integer, ForeignKey("sesiuni.id"))
    inscriere_id = Column(Integer, ForeignKey("inscrieri.id"))
    is_prezent = Column(Boolean, default=False)
    motiv_absenta = Column(String)
    rating_profesor = Column(Integer)
    note = Column(Text)

    sesiune = relationship("Sesiune", back_populates="prezente")
    inscriere = relationship("Inscriere")


# ===================================================
# 6. CLIENTI & FACTURARE
# ===================================================

class Client(Base):
    __tablename__ = "clienti"

    id = Column(Integer, primary_key=True, index=True)
    tip = Column(SqlEnum(TipClient))
    partener_id = Column(Integer, ForeignKey("parteneri.id"), nullable=True)
    elev_id = Column(Integer, ForeignKey("elevi.id"), nullable=True)
    nume_afisare = Column(String)
    cui_cnp = Column(String)
    adresa_facturare = Column(String)
    email_facturare = Column(String)
    telefon_facturare = Column(String)

    partener = relationship("Partener", back_populates="clienti")
    elev = relationship("Elev", back_populates="clienti")
    facturi = relationship("Factura", back_populates="client")

class Factura(Base):
    __tablename__ = "facturi"

    id = Column(Integer, primary_key=True, index=True)
    serie_numar = Column(String)
    client_id = Column(Integer, ForeignKey("clienti.id"))
    luna_id = Column(Integer, ForeignKey("luni.id"))
    data_emitere = Column(Date)
    data_scadenta = Column(Date)
    total_plata = Column(Numeric(10, 2))
    moneda = Column(String, default="RON")
    status = Column(SqlEnum(StatusFactura), default=StatusFactura.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("Client", back_populates="facturi")
    luna_rel = relationship("Luna", back_populates="facturi")
    linii = relationship("LinieFactura", back_populates="factura")
    plati = relationship("Plata", back_populates="factura")

class LinieFactura(Base):
    __tablename__ = "linii_factura"

    id = Column(Integer, primary_key=True, index=True)
    factura_id = Column(Integer, ForeignKey("facturi.id"))
    descriere_serviciu = Column(String)
    cantitate = Column(Numeric(10, 2))
    pret_unitar = Column(Numeric(10, 2))
    valoare_totala = Column(Numeric(10, 2))
    
    grupa_id = Column(Integer, ForeignKey("grupe.id"), nullable=True) 
    inscriere_id = Column(Integer, ForeignKey("inscrieri.id"), nullable=True)

    factura = relationship("Factura", back_populates="linii")
    grupa = relationship("Grupa", back_populates="linii_factura")
    inscriere = relationship("Inscriere", back_populates="linii_factura")

class Plata(Base):
    __tablename__ = "plati"

    id = Column(Integer, primary_key=True, index=True)
    factura_id = Column(Integer, ForeignKey("facturi.id"))
    data_plata = Column(Date)
    suma_achitata = Column(Numeric(10, 2))
    metoda_plata = Column(String)
    referinta_plata = Column(String)
    note = Column(Text)

    factura = relationship("Factura", back_populates="plati")


# ===================================================
# 7. KPI & CONFIG (NOU in v3)
# ===================================================

class KpiLunar(Base):
    __tablename__ = "kpi_lunar"
    
    luna_id = Column(Integer, ForeignKey("luni.id"), primary_key=True)
    clasificare_luna = Column(String)
    note = Column(Text)
    
    luna_rel = relationship("Luna", back_populates="kpi")

class ParametriFinanciari(Base):
    __tablename__ = "parametri_financiari"
    
    id = Column(Integer, primary_key=True, index=True)
    target_copii_lunar = Column(Integer)
    target_copii_saptamana = Column(Integer)
    valoare_prezenta_std = Column(Numeric(10, 2))
    note = Column(Text)


# ===================================================
# 8. INVENTAR & LOGISTICA
# ===================================================

class Produs(Base):
    __tablename__ = "produse"

    id = Column(Integer, primary_key=True, index=True)
    nume_produs = Column(String)
    cod_sku = Column(String)
    categorie = Column(String)
    unitate_masura = Column(String)
    cost_unitar_mediu = Column(Numeric(10, 2))
    note = Column(Text)

    miscari = relationship("MiscareStoc", back_populates="produs")
    echipamente_curs = relationship("CursEchipament", back_populates="produs")
    achizitii = relationship("AchizitiePlan", back_populates="produs")

class MiscareStoc(Base):
    __tablename__ = "miscari_stoc"

    id = Column(Integer, primary_key=True, index=True)
    produs_id = Column(Integer, ForeignKey("produse.id"))
    tip = Column(SqlEnum(TipMiscareStoc))
    cantitate = Column(Integer)
    
    profesor_id = Column(Integer, ForeignKey("profesori.id"), nullable=True)
    grupa_id = Column(Integer, ForeignKey("grupe.id"), nullable=True)
    sesiune_id = Column(Integer, ForeignKey("sesiuni.id"), nullable=True)
    achizitie_plan_id = Column(Integer, ForeignKey("achizitii_plan.id"), nullable=True)
    
    data_miscare = Column(DateTime, default=datetime.utcnow)
    note = Column(Text)

    produs = relationship("Produs", back_populates="miscari")
    profesor = relationship("Profesor", back_populates="miscari_stoc")
    grupa = relationship("Grupa", back_populates="miscari_stoc")
    sesiune = relationship("Sesiune", back_populates="miscari_stoc")
    achizitie = relationship("AchizitiePlan", back_populates="miscari_stoc")

class CursEchipament(Base):
    __tablename__ = "curs_echipament"

    id = Column(Integer, primary_key=True, index=True)
    curs_id = Column(Integer, ForeignKey("cursuri.id"))
    produs_id = Column(Integer, ForeignKey("produse.id"))
    cantitate_per_grupa = Column(Numeric(10, 2))

    curs = relationship("Curs", back_populates="echipamente_necesare")
    produs = relationship("Produs", back_populates="echipamente_curs")

class AchizitiePlan(Base):
    __tablename__ = "achizitii_plan"

    id = Column(Integer, primary_key=True, index=True)
    luna_id = Column(Integer, ForeignKey("luni.id"))
    produs_id = Column(Integer, ForeignKey("produse.id"), nullable=True)
    categorie = Column(String)
    descriere = Column(String)
    numar_bucati = Column(Integer)
    cost_total_ron = Column(Numeric(10, 2))
    cost_total_euro = Column(Numeric(10, 2))
    note = Column(Text)

    luna_rel = relationship("Luna", back_populates="achizitii")
    produs = relationship("Produs", back_populates="achizitii")
    miscari_stoc = relationship("MiscareStoc", back_populates="achizitie")


# ===================================================
# 9. TASKS & WORKFLOW
# ===================================================

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    titlu = Column(String)
    descriere = Column(Text)
    status = Column(String, default="todo")
    prioritate = Column(String, default="medium")
    deadline = Column(Date)
    responsabil = Column(String) 

    partener_id = Column(Integer, ForeignKey("parteneri.id"), nullable=True)
    campanie_id = Column(Integer, ForeignKey("campanii.id"), nullable=True)
    contract_id = Column(Integer, ForeignKey("contracte.id"), nullable=True)
    profesor_id = Column(Integer, ForeignKey("profesori.id"), nullable=True)
    grupa_id = Column(Integer, ForeignKey("grupe.id"), nullable=True)

    partener = relationship("Partener", back_populates="tasks")
    campanie = relationship("Campanie", back_populates="tasks")
    contract = relationship("Contract", back_populates="tasks")
    profesor = relationship("Profesor", back_populates="tasks")
    grupa = relationship("Grupa", back_populates="tasks")