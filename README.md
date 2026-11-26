# Web integrea.sk (Integrea Works)

Statický web: Vite + TypeScript, pohyb GSAP + ScrollTrigger, plynulý scroll Lenis, písmo Schibsted Grotesk (@fontsource, lokálne).

## Prvé spustenie na Macu
1. `brew install node` a `corepack enable`
2. V tomto priečinku: `pnpm install`
3. `pnpm dev` → http://localhost:5173

## Build
- `pnpm build` → priečinok `dist/` (na hosting sa nahráva jeho OBSAH)
- `pnpm preview` → kontrola buildu (aj Lighthouse merať tu)

## Kde čo meniť
| Čo | Kde |
|---|---|
| Texty | `index.html` |
| Farby, rozostupy, mobil | `src/style.css` (premenné hore v `:root`) |
| Animácie | `src/main.ts` (každá sekcia má vlastný blok s nadpisom) |
| Odporúčania v dotazníku | `src/quiz.ts` |
| Favicony | `public/` (z Logo/03_Favicon) |

## Otvorené
- E-mail ahoj@integrea.sk a profil @integrea sú zatiaľ predpoklad, overiť.
- Dotazník: ostré AI odpovede a odoslanie do mailu potrebujú malý server (napr. Cloudflare Worker), API kľúč nikdy do webu.
- `<meta name="robots" content="noindex">` odstrániť pri ostrom spustení.
- Zákonné údaje do päty po založení firmy.

## Licencie
GSAP (zadarmo aj komerčne, licencia GreenSock), Lenis (MIT), Schibsted Grotesk (SIL OFL).
