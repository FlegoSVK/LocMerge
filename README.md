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

## ✨ Komplexný zoznam funkcií

### 🛡️ 1. Pokročilá validácia integrity a Heuristika chýb
Prekladatelia môžu pri práci omylom vymazať alebo pridať riadok v hlavnom súbore, čo by pri bežných skriptoch viedlo k posunu prekladov a znefunkčneniu celej lokalizácie hry. LocMerge obsahuje integrovaný bezpečnostný systém:
* **Autodetekcia chýb**: Pri sčítavaní a porovnávaní riadkov v druhej fáze systém okamžite zistí akúkoľvek anomáliu v celkovom počte riadkov.
* **Heuristická analýza (Novinka)**: Ak nesedí celkový počet riadkov, systém porovná rozloženie prázdnych riadkov (tzv. záchytné body). Na základe tejto heuristiky dokáže presne označiť **konkrétny súbor**, v ktorom prekladateľ s najväčšou pravdepodobnosťou omylom riadok zmazal alebo pridal.
* **CRC32 Hashe**: Do `map.json` sa ukladajú unikátne bezpečnostné kontrolné súčty pre každý jeden spracovaný súbor pre 100% istotu neporušenosti štruktúry.

### 📁 2. Práca so zložitou adresárovou štruktúrou
* **Import celých zložiek**: Môžete načítať priamo celé priečinky s vnorenými podpriečinkami. 
* **Filtrovanie súborov**: Automaticky filtruje a spracúva iba validné koncovky (`.txt`, `.json`), pričom ignoruje irelevantné súbory v zložkách.
* **Verná rekonštrukcia štruktúry**: Po preklade a rozdelení bude vo vygenerovanom ZIP archíve automaticky zrekonštruovaná kompletná pôvodná adresárová hierarchia do posledného detailu.
* **Ochrana proti duplikátom**: Automatické ignorovanie už nahratých súborov (na základe cesty).

### ⚙️ 3. Fázový workflow
* **Fáza 1: Zlúčiť (Merge)** - Rýchle spojenie tisícov súborov do jedného Master súboru so zvoleným kódovaním a paralelné stiahnutie `map.json`.
* **Fáza 2: Rozdeliť (Split)** - Prísna validácia a blesková rekonštrukcia pôvodných súborov zo zlúčeného Master dokumentu s možnosťou zmeniť finálne kódovanie textu.

### 🔤 4. Široká podpora kódovania a konverzia za letu
Zabudovaná schopnosť meniť kódovanie súborov počas "Rozdeľovacej" fázy (napr. preložili ste v UTF-8 a exportujete do Windows-1250):
* **UTF-8** (Štandard pre moderné aplikácie a CAT nástroje)
* **Windows-1250** (Stredoeurópske kódovanie dôležité najmä pre staršie herné enginy)
* **UTF-16LE s BOM** (Špecifické kódovanie pre niektoré ázijské/custom herné enginy)
* **JSON** (Štruktúrovaný výstup a vstup v podobe asociatívnych polí a kľúčov)

### 🔧 5. Kontrola koncov riadkov (Line Endings)
Umožňuje explicitne nastaviť formát zalomenia riadkov pre exportovaný Master aj finálne zrekonštruované texty:
* **Windows (CRLF - `\r\n`)** - Kľúčové pre správne fungovanie prekladov na Windows herných serveroch/klientoch.
* **Unix/Linux (LF - `\n`)** - Priemyselný štandard pre moderné úložiská a Git.
* **Auto** - Automaticky určí najvhodnejší typ podľa vybraného kódovania.

### 💻 6. Plne Client-side (Rýchlosť, Súkromie, Bezpečnosť)
* **Bez serverov a uploadov**: Celé spracovanie (vrátane generovania ZIP archívu a načítavania gigabajtov textov) prebieha výhradne lokálne priamo v RAM pamäti vášho webového prehliadača prostredníctvom moderného JS enginu.
* **Maximálna ochrana dát**: Žiadne vaše herné texty, zdrojové kódy ani firemné materiály neopustia váš počítač.
* **Rýchlosť svetla**: Stovky až tisícky súborov zlúči či rozdelí za zlomok sekundy vďaka optimalizácii algoritmov bez zbytočnej sieťovej latencie.

### 📊 7. Diagnostické a UI rozhranie
* **Interaktívna konzola**: Integrovaný systém farebných Log hlásení (Info, Success, Error) informuje o každom kroku procesu a presnom dôvode chýb.
* **Dark Mode UI**: Profesionálne spracované prostredie nenamáhajúce oči s plynulými animáciami.
* **Indikátory priebehu**: Progress bary pri zlučovaní aj rozdeľovaní.

---

## 🛠️ Použité technológie

Aplikácia je postavená na moderných a efektívnych technológiách s čistým kódom:
- **React 19** & **TypeScript** (Komponentový model so striktnou typovou kontrolou)
- **Tailwind CSS** (Elegantný tmavý techno vizuál s flexibilným dizajnom)
- **JSZip** (Rýchla a natívna tvorba archívov priamo v prehliadači)
- **Lucide React** (Moderný balík ikon pre čisté používateľské rozhranie)

---

**Vytvoril Flego**
