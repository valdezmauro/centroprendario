// ---------- Utilidades de formato ---------- //
const money = (n) =>
  n == null || isNaN(n)
    ? "-"
    : n.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2,
      });

// Convierte texto con puntos de miles/coma decimal a número JS
const parseMoneyInput = (s) => {
  if (s == null || s === "") return 0;
  const clean = String(s)
    .replace(/\./g, "")   // quita miles
    .replace(/,/g, ".")   // coma -> punto
    .replace(/[^\d.]/g, ""); // sólo dígitos y punto
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
};

// Formatea un <input> con miles mientras escribís (es-AR)
function attachThousandsFormatter(input) {
  const format = () => {
    let v = input.value ?? "";
    v = v.replace(/[^\d,]/g, ""); // permitimos dígitos y UNA coma
    const parts = v.split(",");
    let intPart = parts[0] || "";
    const decPart = parts.length > 1 ? parts[1] : undefined;

    intPart = intPart.replace(/^0+(?=\d)/, ""); // 0001 -> 1
    const nInt = intPart ? parseInt(intPart, 10) : NaN;
    const formattedInt = isNaN(nInt) ? "" : nInt.toLocaleString("es-AR");

    input.value =
      decPart !== undefined && decPart !== ""
        ? `${formattedInt},${decPart}`
        : formattedInt;
  };

  input.addEventListener("input", format);
  input.addEventListener("blur", format);
}

// ---------- Render ---------- //
function makeCard(b) {
  const card = document.createElement("section");
  card.className = "card";
  card.innerHTML = `
    <div class="title">${b.titulo}</div>
    <div class="body">
      <div class="label">MONTO:</div>
      <div class="input">
        <input type="text" inputmode="numeric" placeholder="Ingrese monto" />
      </div>
      <div class="table">
        <table>
          <thead><tr><th>PLAZO</th><th>COEF. C/$1000</th><th>MONTO</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>`;

  const tbody = card.querySelector("tbody");
  const input = card.querySelector("input");

  // Formateo de miles en vivo
  attachThousandsFormatter(input);

  const render = () => {
    const base = parseMoneyInput(input.value);
    tbody.innerHTML = b.coeficientes
      .map((row) => {
        const monto = base ? (base / 1000) * row.coef : null;
        return `<tr>
          <td>${row.plazo}</td>
          <td class="currency">${money(row.coef)}</td>
          <td class="currency">${money(monto)}</td>
        </tr>`;
      })
      .join("");
  };

  input.addEventListener("input", render);
  render();
  return card;
}

function makeMaximos(m) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `<div class="row head">
      <div>MODELOS</div><div>VALOR INFO</div><div>MÁXIMO A FINANCIAR</div>
    </div>`;

  m.filas.forEach((f) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div>${f.rango}</div>
      <div><input type="text" inputmode="numeric" placeholder="Ingrese valor"/></div>
      <div class="currency" data-out>-</div>`;

    const input = row.querySelector("input");
    const out = row.querySelector("[data-out]");

    attachThousandsFormatter(input);

    const recalc = () => {
      const val = parseMoneyInput(input.value);
      const max = val ? (val * f.porcentaje) / 100 : null;
      out.textContent = money(max);
    };

    input.addEventListener("input", recalc);
    recalc();
    wrap.appendChild(row);
  });

  const note = document.createElement("div");
  note.className = "muted";
  note.style.padding = "10px 12px";
  note.textContent =
    "Tip: cambiá los porcentajes y coeficientes en data.json sin tocar el HTML.";
  wrap.appendChild(note);
  return wrap;
}

// ---------- Bootstrap ---------- //
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await fetch("data.json").then((r) => r.json());

    const root = document.querySelector("main.grid");
    const maximosEl = document.getElementById("maximos");
    const porcentajesTop = document.getElementById("porcentajes");
    const porcentajesFooter = document.getElementById("porcentajes-footer");

    // Banda porcentajes
    const items = Object.entries(data.porcentajes).map(
      ([r, p]) => `${r}: ${p}% de su valor`
    );
    if (porcentajesTop)
      porcentajesTop.innerHTML = items.map((t) => `<div>${t}</div>`).join("");
    if (porcentajesFooter)
      porcentajesFooter.innerHTML = items.map((t) => `<div>${t}</div>`).join("");

    // Tarjetas
    if (root) data.bloques.forEach((b) => root.appendChild(makeCard(b)));

    // Máximos
    if (maximosEl) maximosEl.appendChild(makeMaximos(data.maximos));
  } catch (err) {
    console.error("Error iniciando app:", err);
    // Mensaje visible si algo falla (e.g., data.json inválido)
    const cont = document.querySelector("main.grid");
    if (cont) {
      cont.innerHTML =
        '<div class="card"><div class="body">No se pudo cargar <b>data.json</b>. Revisá que exista y sea JSON válido.</div></div>';
    }
  }
});

