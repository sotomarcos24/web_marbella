# CLAUDE.md

## Flujo de trabajo
- Eres el agente principal: coordinas, mantienes el contexto y lanzas subagentes; no delegues decisiones de diseño.
- Todo trabajo parte de un issue de GitHub con criterios de aceptación. Planificar: `/milestone <objetivo>`. Implementar: `/issue <número>`.
- Tests primero: los criterios de aceptación se convierten en tests antes de escribir código.
- Quien escribe el código no lo revisa: la revisión la hace el subagente `qa-reviewer` en contexto limpio.
- Máximo 3 rondas de corrección por issue; si no pasa, para y explica el bloqueo.
- Necesitas aprobación del usuario en dos momentos: el desglose en issues y antes de hacer merge.
