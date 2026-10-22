---
name: ok
description: Visto bueno del usuario a un issue terminado: anota el progreso, hace merge del PR a main, cierra el issue y borra la rama.
argument-hint: "[número de issue] (por defecto, el de la rama actual issue-N)"
disable-model-invocation: true
---

El usuario da su visto bueno al issue. Invocar `/ok` ES la aprobación de merge que exige CLAUDE.md: no vuelvas a pedirla.

Issue: `$ARGUMENTS`. Si viene vacío, sácalo de la rama actual (`issue-N` → N). Si no hay número ni rama `issue-N`, pregunta cuál es.

## Pasos

1. **Comprobar.** `gh pr list --head issue-N --state open --json number,title,url` para localizar el PR. Para y explica qué pasa si:
   - no hay PR abierto para esa rama;
   - hay cambios sin commitear que no sabes de dónde vienen (pregunta si van en el PR);
   - lint, typecheck o tests fallan (`npm run lint && npm run typecheck && npm run test`).
2. **Anotar el progreso** en la rama `issue-N`, antes del merge, para que entre en el mismo PR:
   - `docs/milestones.md`: marca `[x]` los criterios del issue y añade `✅ PR #<pr>` al título del issue. Si con él se completa un milestone, márcalo también en la tabla resumen.
   - `CLAUDE.md`, línea **Estado**: issues cerrados y siguiente paso (`/issue <siguiente>` según el orden y las dependencias de `docs/milestones.md`).
   - Cualquier otro archivo que lleve el progreso (por ejemplo, `docs/plan.md` si cambió una decisión durante el issue).
   - Commit `Actualiza progreso (#N)` y `git push`.
3. **Merge.** `gh pr merge <pr> --merge --delete-branch` (borra la rama remota y la local y vuelve a `main`).
4. **Cerrar el issue.** Con `Closes #N` en el PR se cierra solo; compruébalo con `gh issue view N --json state`. Si sigue abierto, `gh issue close N --comment "Resuelto en #<pr>"`.
5. **Limpiar.** `git switch main && git pull --ff-only && git fetch --prune`. Si la rama local `issue-N` sigue existiendo, `git branch -d issue-N`.
6. **Informar** en máx. 3 líneas: PR mergeado, issue cerrado, rama borrada, archivos de progreso actualizados y siguiente issue recomendado.
