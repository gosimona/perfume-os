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
4. Guarda (ícono de disquete o Ctrl+S).

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
4. La clave/token ya viene prellenada — déjala como está.
5. Guarda. Debería decir "Conectado" y en unos segundos tus datos actuales suben a la hoja.

Repite el paso 4 en cada dispositivo (celular, computadora) usando la **misma URL**.

## Notas

- Esa URL funciona como una contraseña de acceso a tus datos: no la compartas públicamente.
- Los datos vivven en tu hoja de Google — puedes abrirla y verlos/exportarlos directamente ahí también.
- Si en el futuro la app recibe una actualización de diseño o funciones nuevas, tu hoja de cálculo
  no se toca para nada: el código de la app y tus datos están completamente separados.
- Si dos dispositivos editan lo mismo casi al mismo instante, gana el que se guarda último (no hay
  fusión automática) — para el uso normal de un negocio pequeño esto no debería ser un problema.
