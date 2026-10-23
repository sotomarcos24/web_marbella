---
name: issue
description: Implementa un issue de GitHub de principio a fin: tests primero, código, revisión con qa-reviewer, PR y merge.
argument-hint: <número de issue>
disable-model-invocation: true
---

Issue a implementar: #$ARGUMENTS

## Comunicación (ahorro de tokens)
- Entre pasos, como mucho 1–2 líneas: qué has hecho y qué sigue. Sin repetir lo ya dicho.
- Salida de comandos: solo el resumen (`tail`/`grep` de errores y totales), nunca la salida completa.
- Al delegar en subagentes, pídeles informes breves (formato fijo, sin repetir el diff ni lo verificado sin problemas).
- Informe final: máx. 4 líneas (PR, qué hace, estado de checks, puntos a revisar).

## Pasos

1. **Leer.** `gh issue view $ARGUMENTS` y crea la rama `issue-$ARGUMENTS` desde `main` actualizado. Lee el código afectado. Tamaño: el que indique el issue (S/M/L); si no lo indica, estímalo.
   - **Worktree** (`git rev-parse --git-dir` ≠ `git rev-parse --git-common-dir`): la rama ya existe (es la actual); no la crees ni cambies a `main`. En un worktree no toques la línea **Estado** de `CLAUDE.md` ni `docs/milestones.md`: lo hace `/sincronizar` en la carpeta principal.
2. **Plan (solo L o desvíos).** Entra en plan mode y espera aprobación solo si el issue es **L** o si vas a apartarte de los criterios de aceptación aprobados. En el resto, empieza directamente.
3. **Tests primero.** Convierte cada criterio en uno o más tests. Enseña al usuario la lista de casos (nombres, no código) **sin esperar respuesta**, ejecútalos y confirma en una línea que fallan por la razón correcta. Los documentos (`docs/`, README, CLAUDE.md) no se testean.
4. **Implementar** hasta que el código cumpla los criterios. No modifiques tests para que pasen salvo que el criterio estuviera mal; en ese caso, díselo al usuario.
5. **/simplify** solo en issues **M** y **L** (pide a sus agentes máx. 5 hallazgos, una línea cada uno). Resume en ≤2 líneas qué aplicaste y qué descartaste.
6. **Checks, una vez.** Commit y ejecuta `npm run lint`, `npm run typecheck` y `npm run test` sobre ese commit. Si algo falla, corrige y repite este paso.
7. **Revisión.** Lanza `qa-reviewer` con: el diff (`git diff main...HEAD`), los criterios de aceptación, el hash del commit y las líneas de resultado de lint, typecheck y test. No le pases tu razonamiento ni tu opinión del código.
   - En issues **S** de solo contenido o documentación, sáltate QA.
   - **FAIL**: corrige cada fallo, vuelve al paso 6 y relanza `qa-reviewer`. Máximo **3 rondas**; si sigue en FAIL, para y explica el bloqueo al usuario.
8. **PR.** `git fetch origin && git merge origin/main`: si entra algo nuevo, resuelve conflictos y vuelve al paso 6 (sin relanzar QA salvo que cambie tu código). Sube la rama y abre el PR con `gh pr create`. Cuerpo: `Closes #$ARGUMENTS`, resumen del diff en ≤5 puntos de una línea y "Qué debería revisar" con ≤3 puntos.
9. **Merge directo** con QA en PASS (o saltado) y checks en verde: sigue los pasos de `/ok` sin esperar al usuario. Para y pide aprobación en lugar de hacer merge solo si:
   - el issue cambia el modelo de datos (tipos de `src/types/`, forma de `src/content/`, interfaz `BookingProvider`);
   - va a gastar créditos de Pletor.
10. **Fin de milestone.** En un worktree, sáltate este paso (lo hace `/sincronizar`). Si con este issue se cierra el milestone, actualiza `docs/milestones.md` (en el mismo PR, antes del merge) y para: resume en 5 líneas qué se ha hecho y qué revisar en el navegador (rutas concretas).
