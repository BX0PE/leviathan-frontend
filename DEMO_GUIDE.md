# LEVIATHAN — Demo Guide (Koordinators)

Demo fails without Railway backend running with `DEMO_MODE=True`.

## Demo files

| File | Lietojums |
|------|-----------|
| `demo_tame.xlsx` | LBN 501-17 smeta, 3 lapas, 28 pozīcijas |
| `demo_docs/DoP_LODE_KBB-400_*.pdf` | Keramzītbetona bloki (RS-3101/4101) |
| `demo_docs/DoP_CREATON_Melodie_*.pdf` | Jumta kārniņi (RS-7201) |
| `demo_docs/DoP_VELUX_GGL_FK06_*.pdf` | Mansarda logs (RS-7303) |
| `demo_docs/DoP_ISOVER_KT37_*.pdf` | Minerālvate (RS-7202) — manual link |

## Demo flow

1. **Login** → klikšķis "Demo" (apakšā zem "Pieteikties ar BIS")
2. **Lomas izvēle** → "Koordinators"
3. **Onboarding** → uzņēmuma nosaukums: `SIA Demo Būve` → "Sākt"
4. **Objekti** → abi demo objekti redzami
5. **Klikšķis uz "Dzīvojamā māja, Brīvības iela 45, Rīga"**
6. **"Augšupielādēt tāmi"** → augšupielādēt `demo_tame.xlsx`
   - Rezultāts: **28 pozīcijas izveidotas** (3 lapas: LT1-Pamati, LT2-Sienas, LT3-Jumts)
7. **Atgriezties** → **"Augšupielādēt dokumentus"** → izvēlēties visus 4 PDF
   - Rezultāts: **3 piesaistīti / 1 nav atrasts**
   - CREATON Melodie → EXACT → Keramikas kārniņi
   - VELUX GGL FK06 → EXACT → Mansarda logs Velux GGL
   - LODE KBB-400 → PARTIAL → Keramzītbetona bloki
   - ISOVER KT37 → nav atrasts (parādīt manuālo piesaisti)
8. **"Piesaistīt manuāli →"** → ISOVER → izvēlēties "Jumta siltumizolācija minerālvate 200mm"
9. **Atgriezties** → redzams progress (0% — nav logbook ierakstu vēl)

## Galvenais vēstījums koordinatoram

> "Tā vietā, lai manuāli ierakstītu katru materiālu BIS — vienkārši augšupielādē Excel smetu un PDF sertifikātus. Sistēma automātiski salīdzina un pievieno dokumentus pie pareizajām pozīcijām."

## Foreman demo (nākamais solis)

Pēc koordinatora demo — parādīt **praboraba pusi**:
- Pieteikties kā "Praborabs"
- Izvēlēties objektu
- Izvēlēties pozīciju → ievadīt izlietoto daudzumu → apstiprināt
- Rādīt: "Aiziet uz BIS automātiski"
