# Sincronización con Google Sheets

Estos pasos los haces UNA sola vez, en tu cuenta de Google. Después de esto, PERFUME OS
guarda todo en esa hoja de cálculo y se sincroniza solo entre tu celular y tu computadora.

## 1. Crea la hoja de cálculo

1. Entra a [sheets.google.com](https://sheets.google.com) con la cuenta de Google que quieres usar.
2. Crea una hoja nueva en blanco. Ponle el nombre que quieras, por ejemplo "PERFUME OS — Datos".

## 2. Pega el código de sincronización

1. En la hoja, ve a **Extensiones > Apps Script**.
2. Borra el contenido de `Code.gs` que aparece por defecto.
3. Pega todo el contenido del archivo [`Code.gs`](Code.gs) de esta carpeta.
4. Reemplaza `PON_AQUI_TU_TOKEN` por una clave propia (cualquier texto largo al azar que
   tú elijas — piensa en ella como la contraseña de tus datos). Vas a usar esa misma clave
   en el paso 4 de la siguiente sección.
5. Guarda (ícono de disquete o Ctrl+S).

### Si "Extensiones > Apps Script" te da un error de Google Drive

A veces Google Sheets falla al abrir el editor desde el menú Extensiones (error tipo
"No se pudo abrir el archivo en este momento"). Si te pasa:

1. Primero prueba lo simple: recarga la hoja (F5), espera a que diga el nombre del archivo
   arriba a la izquierda (no "Hoja de cálculo sin título" con el reloj de sincronización), y
   vuelve a intentar Extensiones > Apps Script. Si sigue fallando, prueba en una ventana de
   incógnito (por si una extensión del navegador está interfiriendo).
2. Si sigue sin funcionar, usa esta alternativa:
   - Entra a **[script.new](https://script.new)** — esto crea un proyecto de Apps Script nuevo
     directamente, sin pasar por el menú de la hoja.
   - Pega el código de `Code.gs` igual que antes.
   - Copia el **ID de tu hoja**: es la parte de la URL de tu Sheet entre `/d/` y `/edit`,
     por ejemplo en `https://docs.google.com/spreadsheets/d/1AbC...XYZ/edit` el ID es `1AbC...XYZ`.
   - En el código, pon ese ID en la línea `var SHEET_ID = '';` (entre las comillas).
   - Continúa con el paso 3 (publicar como Web App) normalmente.

## 3. Publica el script como Web App

1. Arriba a la derecha, clic en **Implementar > Nueva implementación**.
2. En "Selecciona el tipo", elige **Aplicación web**.
3. Configura:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
4. Clic en **Implementar**.
5. Google te pedirá autorizar el script (es tuyo, así que es seguro). Sigue el flujo: "Autorizar acceso" → elige tu cuenta → "Avanzado" → "Ir a [nombre del proyecto] (no seguro)" → "Permitir". Este aviso sale porque el script no está verificado por Google, pero es el mismo script que tú pegaste.
6. Copia la **URL de la aplicación web** que te da (algo como `https://script.google.com/macros/s/AKfycb.../exec`).

## 4. Conéctala en PERFUME OS

1. Abre PERFUME OS en tu celular o computadora.
2. Toca el ícono de engranaje (⚙) junto al logo.
3. Pega la URL del paso anterior en "URL de sincronización".
4. Pega la misma clave que pusiste en `Code.gs` en el campo "Clave/token".
5. Guarda. Debería decir "Conectado" y en unos segundos tus datos actuales suben a la hoja.

Repite el paso 4 en cada dispositivo (celular, computadora) usando la **misma URL**.

## Notas

- Esa URL funciona como una contraseña de acceso a tus datos: no la compartas públicamente.
- Los datos vivven en tu hoja de Google — puedes abrirla y verlos/exportarlos directamente ahí también.
- Si en el futuro la app recibe una actualización de diseño o funciones nuevas, tu hoja de cálculo
  no se toca para nada: el código de la app y tus datos están completamente separados.
- Si dos dispositivos editan lo mismo casi al mismo instante, gana el que se guarda último (no hay
  fusión automática) — para el uso normal de un negocio pequeño esto no debería ser un problema.
