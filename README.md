# PERFUME OS

PWA para llevar el control de ventas de perfumes: quién compró, quién pagó y quién debe. Interfaz futurista con neones, instalable y funciona sin conexión.

## Uso local

```powershell
./serve.ps1
```

Luego abre `http://localhost:8792/` en el navegador. Para instalarla como app, usa la opción "Instalar" / "Agregar a pantalla de inicio" del navegador.

## Datos

Todos los registros se guardan en el `localStorage` del navegador (solo en este dispositivo). Usa los botones **Exportar** / **Importar** en la barra de herramientas para respaldar o restaurar tus datos en un archivo JSON.

## Campos por venta

- Cliente, perfume, cantidad, precio unitario (editables en la tabla)
- Monto pagado — el sistema calcula automáticamente el total y lo pendiente por cobrar
- Estado (Pagado / Parcial / Debe) — toca la píldora de estado para alternar rápido entre pagado y debe
- Fecha y notas
