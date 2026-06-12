# Prompt para Claude (Chrome) — Preparar Strapi para MindCo

> Copia TODO el bloque de abajo y pégalo en Claude for Chrome con el panel de Strapi Admin abierto.
> Está construido a partir del modelo de datos exacto que consume la app MindCo (React Native / Expo).

---

## ⚠️ Antes de empezar (léelo tú, Israel)

1. **Versión de Strapi — ✅ ya no es problema.** La app ahora es **compatible con Strapi v4 y v5**
   gracias a la capa `src/lib/strapi/normalize.js` (`flattenEntity` / `flattenMedia`), que aplana
   automáticamente la respuesta. Puedes crear el proyecto en **Strapi Cloud v5** (lo que da el
   freemium hoy) sin tocar nada del código.
2. **Tras crear el Strapi nuevo**, pega 2 valores en el archivo **`.env`** (gitignored, NO en código):
   `STRAPI_URL` (la URL del proyecto, sin `/` final) y `STRAPI_API_TOKEN` (token read-only). Luego
   cambia `CONTENT_SOURCE=strapi` en `.env` y reinicia Expo (`npx expo start --clear`).
   La config se inyecta vía `app.config.js → expo.extra` (ver `.env.example`).
3. **Seguridad — ✅ ya resuelto.** Los secretos se leen de `.env` (no se commitean) y ya no hay token
   en el repo. Solo asegúrate de no compartir tu `.env`.
4. **Imágenes:** ya hay placeholders con la marca MindCo listos en **[assets/strapi-seed/](assets/strapi-seed/)**
   (ver su `README.md` para el mapeo imagen → entrada). Súbelos al Media Library de Strapi, o reemplázalos
   por fotos reales.

---

## PROMPT (copiar de aquí ↓)

Eres mi asistente operando el panel de administración de **Strapi**. Vas a configurar desde cero el
modelo de contenido y los datos semilla para una app llamada **MindCo**. Trabaja paso a paso usando
el **Content-Type Builder** y el **Content Manager**. Después de cada Content Type, **guarda y espera
el reinicio** de Strapi antes de continuar. Al final, crea un **API Token de solo lectura** y
**publica TODas las entradas** (si Draft & Publish está activo, lo no publicado NO se devuelve por la API).

### Reglas generales
- Zona horaria por defecto del contenido: `America/Mexico_City`.
- Todas las fechas (`startAt`, `endAt`) son tipo **DateTime**.
- Los nombres de API (singular/plural) deben coincidir EXACTAMENTE con los de abajo, porque la app
  llama a esos endpoints literalmente.
- Cuando termines un Content Type, **publica** sus entradas.

### 1) Collection Type: `Class`  → endpoint `/api/classes`
API ID singular: `class` · plural: `classes`. Campos:
| Campo | Tipo | Notas |
|-------|------|-------|
| `title` | Text (short) | requerido |
| `description` | Rich text (Blocks) | la app extrae el texto plano |
| `category` | Text (short) | ej. Mindfulness, Yoga, Respiración, Meditación |
| `instructor` | Text (short) | nombre del instructor |
| `startAt` | DateTime | requerido — se ordena y filtra por este campo |
| `endAt` | DateTime | opcional |
| `timezone` | Text (short) | default `America/Mexico_City` |
| `modality` | Text (short) | `Zoom` o `Presencial` |
| `materials` | Text (long) | |
| `durationMinutes` | Number (integer) | opcional |
| `zoomLink` | Text (short) | URL de Zoom |
| `isFeatured` | Boolean | default false |
| `isActive` | Boolean | default true |
| `image` | Media (single, images) | |

Crea estas **5 entradas** y publícalas (usa fechas FUTURAS para que se vean como próximas; ajusta el año al actual o siguiente):
1. title: "Meditación Mindfulness" · description: "Meditación guiada para cerrar el día con calma." · category: "Mindfulness" · instructor: "Ana Lore" · modality: "Zoom" · materials: "Tapete y manta" · durationMinutes: 50 · zoomLink: "https://zoom.us/j/987654321" · isFeatured: true · startAt: próximo viernes 20:30 (hora CDMX)
2. title: "Respiración Consciente" · description: "Sesión enfocada en respiración y presencia." · category: "Respiración" · instructor: "Carlos Ruiz" · modality: "Presencial" · materials: "Cojín de meditación" · durationMinutes: 40 · startAt: próximo viernes 21:00
3. title: "Yoga Matutino" · description: "Yoga suave para activar cuerpo y mente." · category: "Yoga" · instructor: "Pedro López" · modality: "Presencial" · materials: "Tapete y bloque" · durationMinutes: 55 · startAt: próximo sábado 08:00
4. title: "Encontrando tu centro" · description: "Sesión de mindfulness en horario CDMX." · category: "Mindfulness" · instructor: "Ana Lore" · modality: "Zoom" · materials: "Tapete de yoga, audífonos" · durationMinutes: 60 · zoomLink: "https://zoom.us/j/123456789" · startAt: próximo domingo 18:00
5. title: "Respiración y movimiento" · description: "Clase presencial enfocada en respiración consciente." · category: "Meditación" · instructor: "Carlos Ruiz" · modality: "Presencial" · materials: "Ropa cómoda, botella de agua" · durationMinutes: 45 · startAt: próximo lunes 16:30

Para `image` de cada clase, sube el archivo correspondiente de **`assets/strapi-seed/`**
(`clase-1-...jpg` → "Meditación Mindfulness", etc. — ver el README de esa carpeta).

### 2) Collection Type: `Home`  → endpoint `/api/homes`
API ID singular: `home` · plural: `homes`. (Es Collection, no Single Type, porque la app lee `data[0]`.) Campos:
| Campo | Tipo |
|-------|------|
| `tituloCarrousel` | Text (short) |
| `tituloDeListados` | Text (short) |

Crea **1 sola entrada** y publícala:
- tituloCarrousel: "Destinos destacados"
- tituloDeListados: "Próximas clases"

### 3) Collection Type: `Carrousel`  → endpoint `/api/carrousels`
API ID singular: `carrousel` · plural: `carrousels`. (Son las tarjetas de destinos/eventos del Home.) Campos:
| Campo | Tipo |
|-------|------|
| `title` | Text (short) |
| `link` | Text (short) — URL |
| `image` | Media (single, images) |

Crea **3 entradas** y publícalas:
1. title: "Baja Sur" · link: "https://mindco.app/baja-sur"
2. title: "Monterrey" · link: "https://mindco.app/monterrey"
3. title: "Mexico City" · link: "https://mindco.app/cdmx"

Sube la imagen de **`assets/strapi-seed/`** para cada una (`destino-baja-sur.jpg`, `destino-monterrey.jpg`, `destino-mexico-city.jpg`).

### 4) Single Type: `Login`  → endpoint `/api/login`
> Nota: el inicio de sesión/registro **real** ahora es con **Supabase**. Este single type solo
> aporta el **contenido visual** (título, descripción y fondo) de la pantalla de Login.

API ID: `login`. Campos:
| Campo | Tipo |
|-------|------|
| `title` | Text (short) |
| `description` | Text (long) |
| `backgroundImage` | Media (single, images o videos) |

Rellena y publica:
- title: "Bienvenido de nuevo"
- description: "Inicia sesión para continuar tu práctica."
- backgroundImage: sube `assets/strapi-seed/login-fondo.jpg` (o tu propia imagen/video).

### 5) Single Type: `Register`  → endpoint `/api/register`
API ID: `register`. Mismos campos que Login:
| Campo | Tipo |
|-------|------|
| `title` | Text (short) |
| `description` | Text (long) |
| `backgroundImage` | Media (single, images o videos) |

Rellena y publica:
- title: "Crea tu cuenta"
- description: "Únete a la comunidad MindCo."
- backgroundImage: sube `assets/strapi-seed/register-fondo.jpg` (o tu propia imagen/video).

### 6) Permisos / API Token
Ve a **Settings → API Tokens → Create new API Token**:
- Name: `mindco-app`
- Token type: **Read-only**
- Token duration: **Unlimited**
- Guarda y **copia el token** (solo se muestra una vez). Ese valor va en `STRAPI_API_TOKEN`.

(Alternativa sin token: Settings → Roles → **Public** → habilita `find` y `findOne` en class, home,
carrousel, login y register. Pero lo recomendado es el token read-only.)

### 7) Verificación final
Confirma que estos endpoints devuelven datos publicados (reemplaza `<URL>` por la URL del proyecto):
- `<URL>/api/classes?populate=image`
- `<URL>/api/homes`
- `<URL>/api/carrousels?populate=image`
- `<URL>/api/login?populate=*`
- `<URL>/api/register?populate=*`

Reporta: la URL base del proyecto, el API token read-only, y la versión de Strapi (v4 o v5).

## FIN DEL PROMPT
