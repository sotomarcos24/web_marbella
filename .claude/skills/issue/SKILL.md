---
name: issue
description: Implementa un issue de GitHub de principio a fin: plan, tests primero, código, revisión con qa-reviewer y PR.
argument-hint: <número de issue>
disable-model-invocation: true
---

Issue a implementar: #$ARGUMENTS

## Pasos

1. **Leer.** `gh issue view $ARGUMENTS` y crea la rama `issue-$ARGUMENTS` (`git switch -c issue-$ARGUMENTS`). Lee `CLAUDE.md` y el código afectado.
2. **Plan.** Entra en plan mode (EnterPlanMode) y presenta un plan corto: enfoque, archivos a tocar y tests previstos. Espera la aprobación del usuario antes de continuar.
3. **Tests primero.** Convierte cada criterio de aceptación en uno o más tests. Enséñaselos al usuario, ejecútalos y confirma que fallan por la razón correcta (no por errores de sintaxis o imports).
4. **Implementar.** Escribe el código hasta que lint, typecheck y tests pasen. Muestra la salida real de los tres comandos. No modifiques los tests para que pasen salvo que el criterio estuviera mal; en ese caso, díselo al usuario.
5. **Revisión.** Lanza el subagente `qa-reviewer` con el diff (`git diff main...HEAD` más cambios sin commitear) y la lista de criterios de aceptación del issue. No le pases tu razonamiento ni tu opinión del código.
   - Si devuelve **FAIL**: corrige cada fallo, vuelve a ejecutar lint, typecheck y tests, y relanza `qa-reviewer`. Máximo **3 rondas** de corrección.
   - Si tras 3 rondas sigue en FAIL: para y explica al usuario el bloqueo (qué falla y por qué).
6. **Cierre (con PASS).**
   - Ejecuta `/simplify` y vuelve a pasar lint, typecheck y tests.
   - Haz commit con un mensaje que referencie el issue.
   - Sube la rama y abre el PR con `gh pr create`. El cuerpo debe incluir: `Closes #$ARGUMENTS`, un resumen del diff en 5 puntos y una sección "Qué debería revisar" con lo más delicado o dudoso.
7. **Merge.** No hagas merge: espera la aprobación del usuario.
