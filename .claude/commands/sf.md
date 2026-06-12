---
description: Commit + push de los cambios actuales en una rama feature y abrir PR hacia main
---

Eres responsable de guardar el trabajo actual siguiendo el flujo de Israel. Ejecuta estos pasos:

## Reglas
1. **NUNCA commitear directo a `main`.** Siempre trabajar sobre una rama feature.
2. **Nomenclatura de ramas:** `<tipo>/<descripcion-kebab-case>` (ej. `feat/perfil-edicion`, `fix/datepicker-ios`).
3. **Nomenclatura de commits (Conventional Commits + Gitmoji, en español):**
   - Formato: `<emoji> <tipo>(scope opcional): <descripción>`.
   - Mensaje en minúscula, conciso, que diga *qué* y *dónde*.
   - Emoji según el tipo (Gitmoji):
     | Tipo | Emoji | Cuándo |
     |------|-------|--------|
     | `feat` | ✨ | nueva funcionalidad |
     | `fix` | 🐛 | corrección de bug |
     | `refactor` | ♻️ | refactor sin cambiar comportamiento |
     | `docs` | 📝 | documentación |
     | `style` | 💄 | UI / estilos / formato visual |
     | `chore` (deps) | ⬆️ | actualizar/instalar dependencias |
     | `chore` (config) | 🔧 | configuración / tooling |
     | `test` | ✅ | pruebas |
     | `perf` | ⚡️ | rendimiento |
     | `security` | 🔒 | seguridad / secretos |
     | `remove` | 🔥 | eliminar código/archivos |
   - Ejemplos: `✨ feat(strapi): conectar pantalla de clases`, `🐛 fix: corregir datepicker en iOS`, `⬆️ chore(deps): alinear a Expo SDK 54`.
4. **Un commit = un cambio lógico.** Agrupa los archivos por intención y haz commits separados
   (deps, feature, refactor, docs van en commits distintos).
5. **División por feature:** si el trabajo abarca varias features independientes (archivos sin
   solapamiento y objetivos distintos), créalas en **ramas separadas** y abre **un PR por feature**.
   Si es un esfuerzo cohesivo, usa una sola rama con commits separados.
6. **Nunca** incluir `.env` ni secretos (verificar `.gitignore`). No subir `node_modules`.
7. **No** usar `--force` sobre ramas compartidas.

## Pasos
1. Revisa `git status` y `git diff` para entender qué cambió.
2. Decide: ¿una rama cohesiva o varias por feature? (ver regla 5).
3. Para cada rama:
   a. Crea la rama desde `main` actualizado: `git checkout main && git pull` (si aplica) y `git checkout -b <rama>`.
   b. Haz `git add` selectivo por grupo lógico y crea los commits separados con buena nomenclatura.
   c. Cada commit termina con la línea de co-autoría:
      `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
   d. `git push -u origin <rama>`.
   e. Abre el PR hacia `main`: `gh pr create --base main --head <rama> --title "<titulo>" --body "<resumen>"`.
      El body termina con: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
4. **Devuelve a Israel:** el/los nombres de rama y la(s) URL(s) del PR, para que él haga el merge.
   No hagas merge tú.

Si `$ARGUMENTS` trae texto, úsalo como pista para el título/descripción o el nombre de la rama.
