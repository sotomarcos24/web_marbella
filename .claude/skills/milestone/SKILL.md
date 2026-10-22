---
name: milestone
description: Planifica un milestone de GitHub: investiga el código, propone issues pequeños y, tras aprobación, los crea con gh.
argument-hint: <objetivo del milestone>
disable-model-invocation: true
---

Objetivo del milestone: $ARGUMENTS

## Pasos

1. **Contexto.** Lee `docs/SPEC.md`, `CLAUDE.md` y el código relevante. Ejecuta `gh issue list --state open --limit 100` para no duplicar trabajo existente.
2. **Investigación.** Lanza subagentes `Explore` en paralelo (una sola respuesta, varias llamadas) para las partes del código que haga falta entender. Pídeles conclusiones concisas con rutas de archivo.
3. **Propuesta.** Diseña issues pequeños: un PR cada uno. Para cada uno indica:
   - título y descripción;
   - criterios de aceptación como checklist (`- [ ]`), verificables con tests;
   - archivos probables;
   - dependencias (otros issues de la propuesta);
   - etiquetas;
   - tamaño S/M/L (si es L, pártelo).

   Preséntalos en una tabla (`#`, título, tamaño, etiquetas, depende de, archivos) con el orden recomendado y qué issues pueden hacerse en paralelo. Después de la tabla, incluye el detalle (descripción y criterios) de cada issue.
4. **Aprobación.** Para y espera la aprobación explícita del usuario. Aplica los cambios que pida y vuelve a presentar. No crees nada en GitHub antes.
5. **Creación.** Con la aprobación:
   - crea el milestone (`gh api repos/{owner}/{repo}/milestones -f title=... -f description=...`);
   - crea las etiquetas que falten (`gh label create`);
   - crea los issues en orden de dependencias con `gh issue create --milestone ... --label ...`, y enlaza las dependencias con "Depende de #N" en el cuerpo.
6. **Resumen.** Muestra la lista final de issues con su número y URL.
