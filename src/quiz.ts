const tips: Record<string, { t: string; d: string }> = {
  faktury: { t: "Triedenie faktúr", d: "Faktúry z e-mailu sa uložia do priečinkov podľa mesiaca a dodávateľa a spárujú sa s výpisom z banky. Účtovníčka dostane každý týždeň hotový balík." },
  dl: { t: "Dodacie listy k zákazkám", d: "AI prečíta dodávateľa a zákazku na dodacom liste a uloží ho tam, kam patrí. Nič sa nestratí v schránke." },
  hodiny: { t: "Dochádzka a hodiny", d: "Hodiny sa zapisujú správou alebo podľa polohy a na konci mesiaca z nich vznikne výkaz pre každého pracovníka." },
  ponuky: { t: "Cenové ponuky", d: "Z vášho cenníka a krátkeho zadania vznikne návrh ponuky, ktorý len skontrolujete a pošlete." },
  prehlad: { t: "Prehľad zákazky", d: "Materiál a hodiny sa spočítajú do prehľadu, ktorý ukáže, či zákazka zarába, ešte kým beží." },
};

export function initQuiz() {
  const form = document.querySelector<HTMLFormElement>(".quiz");
  if (!form) return;
  const out = form.querySelector<HTMLElement>(".answer")!;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const picked = data.getAll("cas").map(String);
    const people = Number(data.get("ludia"));
    const list = (picked.length ? picked : ["faktury", "dl"]).slice(0, 3);
    const freq = people >= 50 ? "dvakrát denne" : people >= 10 ? "každý deň" : "raz týždenne, napríklad v piatok";
    out.innerHTML =
      `<h3>Odporúčanie pre začiatok</h3><ol>` +
      list.map((k) => `<li><b>${tips[k].t}.</b> ${tips[k].d}</li>`).join("") +
      `</ol><p>Pri vašej veľkosti firmy by sa úlohy mohli spúšťať ${freq}. ` +
      (picked.length ? "" : "Keďže ste nevybrali oblasť, uvádzame najčastejší začiatok. ") +
      `Presný návrh pripravíme po krátkom rozhovore.</p>`;
  });
}
