---
name: sincronizar
description: En la carpeta principal, tras trabajar en paralelo con worktrees: actualiza main, borra los worktrees ya fusionados, comprueba el main combinado y actualiza el progreso.
disable-model-invocation: true
---

Los commits de cada worktree ya llegan a `main` con el merge de su PR en GitHub: aquí no se juntan commits a mano. Esta skill trae `main`, limpia lo terminado y comprueba que los PR fusionados por separado funcionan juntos.

## Pasos

1. **Comprobar.** Debe ejecutarse en la carpeta principal (`git rev-parse --git-dir` = `git rev-parse --git-common-dir`); si no, para y dilo. Si hay cambios sin commitear, para y pregunta. Si la rama actual no es `main`, `git switch main`.
2. **Actualizar.** `git pull --ff-only && git fetch --prune`. Si cambió `package-lock.json`, `npm install`.
3. **Worktrees.** Recorre `git worktree list --porcelain`. Para cada worktree con rama `issue-N`, consulta `gh pr list --head issue-N --state all --json number,state`:
   - **MERGED**: si el worktree tiene cambios sin commitear, no lo borres y avisa. Si no, `git worktree remove <ruta>` y `git branch -d issue-N` (si `-d` se niega, informa en lugar de forzar).
   - **OPEN** o sin PR: déjalo y anota su estado.
   Al final, `git worktree prune`.
4. **Checks del main combinado.** `npm run lint`, `npm run typecheck` y `npm run test` una vez (solo el resumen). Si algo falla, no lo arregles aquí: para, explica qué PR lo provoca y propone un issue S de corrección.
5. **Progreso** (único commit directo en `main` además del de `/milestone`):
   - Línea **Estado** de `CLAUDE.md`: el siguiente issue abierto con sus dependencias cerradas (y los que pueden ir en paralelo).
   - Si un milestone tiene todos sus issues cerrados: actualiza `docs/milestones.md` y, tras el commit, para con el resumen de 5 líneas de `CLAUDE.md` (qué revisar en el navegador).
   - Commit `Sincroniza: siguiente #N` y `git push`. Si no cambió nada, no hay commit.
6. **Informar** en máx. 4 líneas: worktrees borrados, worktrees pendientes con su estado, resultado de los checks y siguiente issue.
