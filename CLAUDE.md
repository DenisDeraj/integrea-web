# Web Integrea Works (integrea.sk)

Promo web novej firmy Integrea Works. Komunikácia s Denisom po slovensky.

## Git – vždy najprv stiahnuť aktuálne zmeny
- **Pred každou zmenou spusti `git pull`** (v cloude aj v kópii na Macu). Na projekte sa pracuje z viacerých miest (cloud, Mac cez GitHub Desktop), preto nikdy neupravuj starý stav.
- Po zmene: `pnpm build` (musí prejsť bez chýb), commit, `git push origin main`.
- Každý push na `main` sa sám nasadí na náhľad https://denisderaj.github.io/integrea-web/ (GitHub Actions → vetva `gh-pages`). Nasadenie over cez vetvu `gh-pages`, ak sa github.io nedá otvoriť.
- **Vždy a všade aj OneDrive** (Denis 27.11.2026): každá zmena sa musí dostať aj do kópie v OneDrive, nie až neskôr. Keď sa nedá použiť GitHub Desktop (Denis nie je pri Macu), zapíš súbory do OneDrive priamo cez prístup k priečinku.
- Nahrať „všade“ znamená: GitHub (push) + kópia v OneDrive na Macu
  `~/Library/CloudStorage/OneDrive-Osobný/Nová firma (AI)/Web integrea.sk/Projekt webu (zdrojový kód)/`
  (git repozitár, stiahnuť cez GitHub Desktop → Pull origin; `core.fileMode=false`).

## Stack
Vite + TypeScript (bez frameworku), GSAP + ScrollTrigger, Lenis, @fontsource/schibsted-grotesk.
- `src/main.ts` – animácie sekcií, úvod (štvorec ička pri scrolle spadne).
- `src/particles.ts` – galaxia z bodiek na pozadí, rozpad ička, logo na konci, diera pod kurzorom.
- `src/quiz.ts` – dotazník s odporúčaním.

## Pravidlá od Denisa
- **Rob len to, čo je v zadaní.** Hotové a schválené veci nemeň bez Denisovho príkazu (ani „vylepšenia“ navyše, ani zmeny vzhľadu, farieb či animácií mimo zadania). Ak niečo navyše považuješ za potrebné, najskôr to navrhni a počkaj na súhlas.
- Animácie musia byť plynulé a pôsobiť profesionálne, nikdy „dosekane“: žiadne náhle prepínanie stavov, mäkké prechody, efekt len tam, kde je kurzor. Pred odovzdaním skontrolovať sekvenciu snímok (Playwright) na počítači aj mobile.
- Logo pri načítaní vždy celé; pri scrolle iba spadne štvorec a potom sa znak rozpadne do galaxie; na konci sa galaxia zloží do plného loga.
- Texty profesionálne a spisovne: správne skloňovanie, väzby a slovosled, celé slová bez skratiek („umelá inteligencia“, nie „AI“; bez „č.“, „napr.“), žiadne archaizmy, slang, hovorové slová ani útržkovité vety. Po každej zmene textu prejsť všetky texty (aj meta popis, dotazník, ukážky). Podrobne: OneDrive `Nová firma (AI)/Nove_prompty/PRAVIDLA_Texty_spisovne.md`.
- Nezlomiteľné medzery po jednopísmenových predložkách (v, a, z, s, k, o, u, i) iba v texte, nie v atribútoch.
- Žiadne reálne údaje z Enesmy, ukážky len s vymyslenou firmou Vzor s.r.o. Bez telefónu a cien. Kontakt: Instagram @integrea a e-mail.
- `noindex` odstrániť až pri ostrom spustení na integrea.sk.
