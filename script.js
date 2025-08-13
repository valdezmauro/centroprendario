
// Utility: format currency es-AR
const money = (n) => n==null || isNaN(n) ? '-' :
  n.toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2});

const root = document.querySelector('main.grid');
const maximosEl = document.getElementById('maximos');
const porcentajesTop = document.getElementById('porcentajes');
const porcentajesFooter = document.getElementById('porcentajes-footer');

async function boot(){
  const data = await fetch('data.json').then(r=>r.json());

  // porcentajes band
  const items = Object.entries(data.porcentajes).map(([r, p]) => `${r}: ${p}% de su valor`);
  porcentajesTop.innerHTML = items.map(t=>`<div>${t}</div>`).join('');
  porcentajesFooter.innerHTML = items.map(t=>`<div>${t}</div>`).join('');

  // cards
  data.bloques.forEach(b => root.appendChild(makeCard(b)));

  // maximos
  maximosEl.appendChild(makeMaximos(data.maximos));
}

function makeCard(b){
  const card = document.createElement('section');
  card.className='card';
  card.innerHTML = `
    <div class="title">${b.titulo}</div>
    <div class="body">
      <div class="label">MONTO:</div>
      <div class="input"><input type="number" min="0" placeholder="Ingrese monto" /></div>
      <div class="table">
        <table>
          <thead><tr><th>PLAZO</th><th>COEF. C/$1000</th><th>MONTO</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>`;

  const tbody = card.querySelector('tbody');
  const input = card.querySelector('input');

  const render = () => {
    const base = Number(input.value || 0);
    tbody.innerHTML = b.coeficientes.map(row => {
      const monto = base ? (base/1000)*row.coef : null;
      return `<tr>
        <td>${row.plazo}</td>
        <td class="currency">${money(row.coef)}</td>
        <td class="currency">${money(monto)}</td>
      </tr>`;
    }).join('');
  };
  input.addEventListener('input', render);
  render();
  return card;
}

function makeMaximos(m){
  const wrap = document.createElement('div');
  // head
  wrap.innerHTML = `<div class="row head">
      <div>MODELOS</div><div>VALOR INFO</div><div>MÁXIMO A FINANCIAR</div>
    </div>`;

  m.filas.forEach(f => {
    const row = document.createElement('div');
    row.className='row';
    row.innerHTML = `<div>${f.rango}</div>
      <div><input type="number" min="0" placeholder="Ingrese valor"/></div>
      <div class="currency" data-out>-</div>`;
    const input = row.querySelector('input');
    const out = row.querySelector('[data-out]');
    input.addEventListener('input', ()=>{
      const val = Number(input.value||0);
      const max = val ? val * (f.porcentaje/100) : null;
      out.textContent = money(max);
    });
    wrap.appendChild(row);
  });
  const note = document.createElement('div');
  note.className='muted';
  note.style.padding='10px 12px';
  note.textContent='Tip: cambiá los porcentajes y coeficientes en data.json sin tocar el HTML.';
  wrap.appendChild(note);
  return wrap;
}

boot();
