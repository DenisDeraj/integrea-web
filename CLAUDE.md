# Web Integrea Works (integrea.sk)

Promo web novej firmy Integrea Works. Komunikácia s Denisom po slovensky.

## Git – vždy najprv stiahnuť aktuálne zmeny
- **Pred každou zmenou spusti `git pull`** (v cloude aj v kópii na Macu). Na projekte sa pracuje z viacerých miest (cloud, Mac cez GitHub Desktop), preto nikdy neupravuj starý stav.
- Po zmene: `pnpm build` (musí prejsť bez chýb), commit, `git push origin main`.
- Každý push na `main` sa sám nasadí na náhľad https://denisderaj.github.io/integrea-web/ (GitHub Actions → vetva `gh-pages`). Nasadenie over cez vetvu `gh-pages`, ak sa github.io nedá otvoriť.
- Nahrať „všade“ znamená: GitHub (push) + kópia v OneDrive na Macu
  `~/Library/CloudStorage/OneDrive-Osobný/Nová firma (AI)/Web integrea.sk/Projekt webu (zdrojový kód)/`
  (git repozitár, stiahnuť cez GitHub Desktop → Pull origin; `core.fileMode=false`).

## Stack
Vite + TypeScript (bez frameworku), GSAP + ScrollTrigger, Lenis, @fontsource/schibsted-grotesk.
- `src/main.ts` – animácie sekcií, úvod (štvorec ička pri scrolle spadne).
- `src/particles.ts` – galaxia z bodiek na pozadí, rozpad ička, logo na konci, diera pod kurzorom.
- `src/quiz.ts` – dotazník s odporúčaním.

## Pravidlá od Denisa
- Animácie musia byť plynulé a pôsobiť profesionálne, nikdy „dosekane“: žiadne náhle prepínanie stavov, mäkké prechody, efekt len tam, kde je kurzor. Pred odovzdaním skontrolovať sekvenciu snímok (Playwright) na počítači aj mobile.
- Logo pri načítaní vždy celé; pri scrolle iba spadne štvorec a potom sa znak rozpadne do galaxie; na konci sa galaxia zloží do plného loga.
- Texty spisovne: správne skloňovanie, väzby a slovosled, žiadne útržkovité vety ani hovorové slová. Po každej zmene textu prejsť všetky vety.
- Nezlomiteľné medzery po jednopísmenových predložkách (v, a, z, s, k, o, u, i) iba v texte, nie v atribútoch.
- Žiadne reálne údaje z Enesmy, ukážky len s vymyslenou firmou Vzor s.r.o. Bez telefónu a cien. Kontakt: Instagram @integrea a e-mail.
- `noindex` odstrániť až pri ostrom spustení na integrea.sk.
