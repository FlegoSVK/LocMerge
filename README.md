# LocMerge by Flego (v1.2)

Profesionálny a robustný lokalizačný nástroj pre herných vývojárov navrhnutý na zjednodušenie a zabezpečenie celého procesu prekladu herných textov. 

Aplikácia beží plne vo vašom webovom prehliadači, nevymieňa si žiadne dáta so serverom a garantuje maximálne bezpečie vašich súborov.

---

## 🚀 O projekte

Pri preklade hier sa vývojári často stretávajú s tisíckami malých textových súborov (typicky pre rôzne herné dialógy, predmety či úlohy). Ručný preklad takého množstva súborov je neefektívny. 

**LocMerge** rieši tento problém elegantne:
1. **Zlúči** všetky tieto súbory do jedného veľkého textového alebo JSON súboru (**Master**), ktorý môže prekladateľ pohodlne otvoriť v jednom okne alebo importovať do prekladateľského nástroja (CAT).
2. Súbežne vygeneruje mapovací súbor (`map.json`), ktorý slúži ako "odtlačok prsta" a recept pre rekonštrukciu.
3. Po dokončení prekladu Master súboru ho **rozdelí** späť do pôvodnej hierarchie a zabalí do prehľadného ZIP archívu alebo jedného štruktúrovaného dokumentu.

---

## ✨ Kľúčové a bezpečnostné vlastnosti

### 🛡️ 1. Pokročilá validácia integrity (CRC32 a riadkovanie)
Prekladatelia môžu pri práci omylom vymazať alebo pridať riadok v hlavnom súbore, čo by pri bežných skriptoch viedlo k posunu prekladov a znefunkčneniu celej lokalizácie hry. LocMerge obsahuje integrovaný bezpečnostný systém:
* **Autodetekcia a varovanie**: Pri sčítavaní a porovnávaní riadkov v druhej fáze systém okamžite zistí akúkoľvek anomáliu.
* **Heuristická analýza chýb**: Ak nesedí celkový počet riadkov, systém porovná prázdne riadky a ich indexy. Na základe tejto heuristiky dokáže označiť **konkrétny súbor**, v ktorom prekladateľ s najväčšou pravdepodobnosťou omylom riadok zmazal alebo pridal.
* **CRC32 Hashe**: Do `map.json` sa ukladajú unikátne bezpečnostné kontrolné súčty pre každý jeden spracovaný súbor.

### ⚙️ 2. Fázový workflow
* **Fáza 1: Zlúčiť** - Rýchle spojenie tisícov súborov (formáty `.txt`, `.json`) do jedného Master súboru so zvoleným kódovaním a stiahnutie mapy.
* **Fáza 2: Rozdeliť** - Prísna validácia a rýchla rekonštrukcia pôvodnej štruktúry s kódovaním podľa vašich porieb (možnosť konverzie kódovania).

### 🔤 3. Široká podpora kódovania
* **UTF-8** (Štandard pre moderné aplikácie)
* **Windows-1250** (Stredoeurópske kódovanie dôležité najmä pre staršie herné enginy)
* **UTF-16LE s BOM** (Špecifické kódovanie pre niektoré herné systémy)
* **JSON** (Asociatívne polia pre moderne štruktúrovanú lokalizáciu)

### 💻 4. Client-side rýchlosť a bezpečnosť
* Celé spracovanie prebieha výhradne vo vašom lokálnom prehliadači prostredníctvom moderného JS enginu.
* Žiadne vaše herné texty ani preklady sa neposielajú na externé servery.
* Vynikajúca odozva (stovky súborov spracuje za zlomok sekundy).

---

## 🛠️ Použité technológie

Aplikácia je postavená na moderných a efektívnych technológiách s čistým kódom:
- **React 19** & **TypeScript** (Komponentový model so striktnou typovou kontrolou)
- **Tailwind CSS** (Elegantný tmavý techno vizuál s flexibilným dizajnom)
- **JSZip** (Rýchla a natívna tvorba archívov priamo v prehliadači)
- **Lucide React** (Moderný balík ikon pre čisté používateľské rozhranie)

---

**Vytvoril Flego**
