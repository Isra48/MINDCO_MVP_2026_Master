# Assets para subir a Strapi (seed de MindCo)

Imágenes placeholder con la marca MindCo, **listas para subir al Media Library de Strapi**
cuando crees el contenido (ver `../../STRAPI_SETUP_PROMPT.md`).

> Son marcadores con texto/colores de MindCo. Puedes **reemplazarlos por fotos reales**
> (yoga, meditación, ciudades) manteniendo el mismo nombre o subiendo las tuyas; lo importante
> es asociar cada imagen al campo `image`/`backgroundImage` de su entrada.

## Mapeo imagen → contenido

### Collection `Class` (campo `image`)
| Archivo | Entrada (title) |
|---------|-----------------|
| `clase-1-meditacion-mindfulness.jpg` | Meditación Mindfulness |
| `clase-2-respiracion-consciente.jpg` | Respiración Consciente |
| `clase-3-yoga-matutino.jpg` | Yoga Matutino |
| `clase-4-encontrando-tu-centro.jpg` | Encontrando tu centro |
| `clase-5-respiracion-y-movimiento.jpg` | Respiración y movimiento |

### Collection `Carrousel` (campo `image`) — destinos del Home
| Archivo | Entrada (title) |
|---------|-----------------|
| `destino-baja-sur.jpg` | Baja Sur |
| `destino-monterrey.jpg` | Monterrey |
| `destino-mexico-city.jpg` | Mexico City |

### Single Types (campo `backgroundImage`)
| Archivo | Single type |
|---------|-------------|
| `login-fondo.jpg` | Login |
| `register-fondo.jpg` | Register |

> El single type `Home` no lleva imagen (solo `tituloCarrousel` y `tituloDeListados`).
