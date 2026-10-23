---
name: ok
description: Fuerza el merge de un issue terminado: hace merge del PR a main, cierra el issue y borra la rama.
argument-hint: "[número de issue] (por defecto, el de la rama actual issue-N)"
disable-model-invocation: true
---

`/issue` ya hace merge directo cuando QA da PASS y los checks están en verde. `/ok` sirve para que el usuario fuerce el merge (p. ej., de un issue que cambia el modelo de datos o que quedó parado). Invocar `/ok` ES la aprobación de merge: no vuelvas a pedirla.

Issue: `$ARGUMENTS`. Si viene vacío, sácalo de la rama actual (`issue-N` → N). Si no hay número ni rama `issue-N`, pregunta cuál es.

## Pasos

1. **Comprobar.** `gh pr list --head issue-N --state open --json number,title,url` para localizar el PR. Para y explica qué pasa si:
   - no hay PR abierto para esa rama;
   - hay cambios sin commitear que no sabes de dónde vienen (pregunta si van en el PR);
   - lint, typecheck o tests fallan (`npm run lint && npm run typecheck && npm run test`).
2. **Progreso.** GitHub es la fuente de verdad: no hay commits solo de progreso. Si el issue cierra un milestone, actualiza `docs/milestones.md` en la rama antes del merge. Si cambia el siguiente issue, actualiza la línea **Estado** de `CLAUDE.md` en el mismo PR.
3. **Merge.** `gh pr merge <pr> --merge --delete-branch` (borra la rama remota y la local y vuelve a `main`).
4. **Cerrar el issue.** Con `Closes #N` en el PR se cierra solo; compruébalo con `gh issue view N --json state`. Si sigue abierto, `gh issue close N --comment "Resuelto en #<pr>"`.
5. **Limpiar.** `git switch main && git pull --ff-only && git fetch --prune`. Si la rama local `issue-N` sigue existiendo, `git branch -d issue-N`.
6. **Informar** en máx. 2 líneas: PR mergeado, issue cerrado y siguiente issue recomendado.
