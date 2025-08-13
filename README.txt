# Calculadora Prendaria (estática)
1) Editá `data.json` con tus valores reales (podés exportar de Excel a CSV y luego copiar/pegar).
2) Abrí `index.html` para probar localmente.
3) Para publicarlo con un link estilo Vercel:
   - Creá una cuenta en https://vercel.com
   - `npm i -g vercel` (opcional, CLI)
   - Subí esta carpeta a un repo de GitHub y en Vercel -> New Project -> Importá el repo -> Framework: *Other* -> Build & Output: *Static* -> Output dir: `/`.
   - O desde la CLI: en esta carpeta ejecutar `vercel`.
4) Para actualizar datos sin tocar el diseño, solo reemplazá `data.json`.
5) Fórmula del cálculo por fila: `monto = (monto_ingresado / 1000) * coef`.
