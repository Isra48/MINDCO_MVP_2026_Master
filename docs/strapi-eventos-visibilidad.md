# Eventos — flag de visibilidad (`isVisible`) en Strapi

> ⚠️ **Fallback seguro:** mientras el campo `isVisible` **no exista** en Strapi, la app
> seguirá mostrando **todos** los items del carrusel. El filtro server-side se ignora si el
> campo no está creado y, en el cliente, los items sin `isVisible` se tratan como visibles
> (`isVisible === undefined` → `true`). Por eso crear el campo no rompe nada hasta que decidas
> empezar a ocultar items.

Este documento describe los pasos **manuales** para habilitar el control de visibilidad de la
"isla de eventos" (carrusel "Eventos presenciales") desde Strapi. La app ya está preparada para
usar este campo; solo falta configurarlo en el CMS.

## Resumen de lo que hace la app
- Pide a Strapi solo los items visibles usando el filtro `filters[isVisible][$eq]=true`.
- Como defensa, también filtra en el cliente cualquier item con `isVisible = false`.
- Si **no** queda ningún item visible, la sección completa (título "Eventos presenciales" +
  carrusel) **se oculta del Home**, en lugar de mostrar un título con lista vacía.

## Paso 1 — Crear el campo Boolean `isVisible`
1. En el panel de Strapi, ve a **Content-Type Builder**.
2. Abre la colección **Carrousel** (`api::carrousel`).
3. Pulsa **Add another field** → tipo **Boolean**.
4. Nombre del campo: **`isVisible`** (exactamente así, en camelCase).
5. En **Advanced settings**, pon **Default value = `true`**.
6. Guarda el campo y deja que Strapi reinicie/recompile.

> Nota: el default `true` asegura que los items existentes y los nuevos sean visibles por defecto.

## Paso 2 — Permisos de la API (rol Public y/o API Token read-only)
1. Ve a **Settings → Users & Permissions Plugin → Roles → Public**.
2. En **Carrousel**, confirma que estén marcados **`find`** y **`findOne`**
   (ya deberían estarlo, porque el carrusel ya se lee desde la app).
3. Guarda. Strapi expone automáticamente el nuevo campo `isVisible` en los campos que se piden
   (la app lo solicita explícitamente vía `fields=...,isVisible`).
4. Si la app usa un **API Token read-only** en lugar del rol Public, verifica que ese token
   tenga permiso de lectura (`find`/`findOne`) sobre **Carrousel**.

## Paso 3 — Ocultar un item del carrusel
1. Ve a **Content Manager → Carrousel**.
2. Abre la entrada que quieras ocultar.
3. Cambia **`isVisible` a `false`** (desmarca el toggle).
4. **Save** y, si tu flujo usa Draft & Publish, **Publish**.

El item dejará de aparecer en el Home de la app. Para volver a mostrarlo, pon `isVisible = true`.

## Nota sobre el filtro de API
La app consulta el endpoint con este filtro (estilo Strapi v4/v5):

```
GET /api/carrousels?fields[0]=title&fields[1]=link&fields[2]=isVisible&filters[isVisible][$eq]=true&populate[image][fields][0]=url&populate[image][fields][1]=formats
```

- `filters[isVisible][$eq]=true` → Strapi devuelve solo los items visibles.
- Si el campo no existe todavía, Strapi ignora el filtro y devuelve todo; la app lo cubre con su
  filtro de cliente y el fallback `undefined → visible`.
