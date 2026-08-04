# Build Fix Notes

## Problema: EISDIR error en vite build 7.1.9

El error `EISDIR: illegal operation on a directory, read` ocurría cuando el `index.html` contenía:
- `<link rel="canonical" href="/" />` — vite intentaba resolver `/` como archivo y encontraba un directorio
- `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` — mismo problema con favicon.svg

## Solución:
- Usar `<meta name="canonical" content="/" />` en vez de `<link rel="canonical">` (vite no procesa meta tags)
- Eliminar el favicon.svg del public/ (causaba EISDIR en vite 7.1.9)
- Todos los demás meta tags (OG, Twitter, etc.) funcionan correctamente como `<meta>` tags
