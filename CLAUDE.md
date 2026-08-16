@AGENTS.md

# CLAUDE.md — MediAlerta

## 1. Proyecto

App móvil para recordar tomas de medicamentos/tratamientos ya indicados por un profesional de salud. **No prescribe, no recomienda, no diagnostica.**

## 2. Stack

React Native + Expo + TypeScript + SQLite local + notificaciones locales de Expo.
Sin backend, sin auth, sin sync en la nube. Local-first, funciona offline.
No agregar Firebase/Supabase/APIs remotas salvo solicitud explícita (ver §8 sobre extensibilidad futura).

## 3. Alcance del MVP

1. CRUD de medicamentos (registrar/editar).
2. Horarios: por intervalo (cada N horas) o por horas específicas — nunca ambos activos a la vez, salvo que el modelo actual ya lo permita.
3. Instrucciones especiales por medicamento.
4. Persistencia en SQLite.
5. Notificaciones locales programadas.
6. Vista "Hoy" con dosis del día.
7. Marcar dosis: tomada / omitida / pospuesta / perdida.
8. Historial local de dosis, consultable.

No agregar funcionalidad fuera de esto sin pedirlo explícitamente.

## 4. Arquitectura

Flujo: `UI → services (lógica) → repositories (persistencia) → SQLite`

- Components: presentación.
- Screens: coordinan casos de uso, sin SQL directo.
- Services: lógica de aplicación y notificaciones.
- Repositories: única capa que toca SQLite.
- Database: init/config/migraciones.
- Types/models: entidades de dominio.

Mantenerlo simple: evitar DI innecesaria, factories sin uso real, clases abstractas para una sola implementación, o patrones pensados solo para un backend futuro que aún no existe.

Antes de crear archivos nuevos: revisar estructura existente y extenderla. Respetar la organización por features si ya existe (`features/medications`, `features/schedules`, `features/doses`, `features/notifications`, etc.). No reorganizar carpetas por una tarea pequeña.

## 5. Entidades (prioridad: nombres/campos ya existentes en el proyecto sobre estos ejemplos)

**Medication**: id, name, type (tablet/capsule/syrup/injection/drops/insulin/other), dosage, instructions, startDate, endDate, active, createdAt, updatedAt.

**MedicationSchedule**: asociado a un Medication. Estrategia por intervalo (4/6/8/12/24h) o por horas específicas (ej. 08:00, 14:00, 20:00) — no simultáneas salvo que el modelo ya lo soporte.

**DoseLog**: medicamento relacionado, fecha/hora programada, fecha/hora real (si aplica), estado (pending/taken/skipped/postponed/missed), notas opcionales. El historial se conserva aunque el medicamento se edite después.

## 6. Notificaciones

Locales, sin backend. Deben mostrar nombre, dosis e instrucciones si existen (ej.: "Hora de tomar Metformina 850 mg. Instrucción: tomar después de comer").

Centralizar en un service dedicado: permisos, crear/cancelar/reprogramar, y relación notificación↔medicamento/horario. No dispersar llamadas a la API de notificaciones en componentes.

## 7. Seguridad médica (regla obligatoria)

MediAlerta NUNCA debe: recomendar medicamentos o dosis, modificar dosis automáticamente, sugerir suspender/aumentar/reducir tratamiento, diagnosticar, o sustituir indicaciones médicas.

Evitar textos como "debes aumentar la dosis" o "suspende este medicamento". Preferir: "Recordatorio configurado por el usuario.", "Sigue las indicaciones de tu profesional de salud.", "Consulta a tu médico antes de modificar un tratamiento."

Los datos que ingresa el usuario son información que ya recibió de su médico, no recomendaciones de la app. Esta regla aplica también a validaciones (§10): sin reglas médicas, solo integridad de datos (nombre vacío, intervalo ≤ 0, horario inválido, fecha fin < fecha inicio, etc.).

## 8. Extensibilidad futura hacia backend (sin implementar ahora)

Hoy no hay backend y no debe agregarse salvo pedido explícito. Pero el diseño debe dejar la puerta abierta a que, más adelante, un **proyecto aparte** exponga una API (por ejemplo con Django REST Framework) y esta app la consuma para sync/multi-dispositivo/cuidadores.

Para no bloquear esa evolución sin sobre-ingeniería hoy:

- Mantener la separación services/repositories real: los services no deben asumir que los repositories son SQLite; deben poder, a futuro, hablar con un repository que llame a una API en vez de a SQLite, sin tocar UI ni services.
- No usar IDs autoincrementales de SQLite como identidad "real" del dominio si eso complicaría luego mapearlos a IDs de servidor (usar la utilidad de IDs locales ya existente en el proyecto, si existe).
- No introducir código de sync, colas de reintentos, resolución de conflictos, ni cliente HTTP todavía — eso pertenece al proyecto de API futuro, no a este.
- Si una decisión de hoy haría significativamente más difícil ese cambio futuro (p. ej. acoplar SQL a un componente), señalarlo brevemente antes de implementar.

## 9. Reglas técnicas rápidas

**SQLite**: solo desde repositories; parámetros en queries (nunca concatenar); transacciones cuando una operación combinada (ej. Medication + MedicationSchedule) pueda quedar a medias; sin SQL en componentes.

**IDs**: reutilizar la utilidad existente de IDs locales; no crear una segunda estrategia.

**Fechas/horas**: distinguir fecha calendario, hora del día, timestamp, hora programada y hora real. No comparar fechas como strings formateados para UI (ej. "8:00 PM"); usar representaciones normalizadas. No introducir UTC/conversiones complejas si el modelo local actual no las necesita. Revisar cómo se almacenan antes de tocar esta lógica.

**TypeScript**: tipado estricto; evitar `any`, `as unknown as`, interfaces duplicadas; reutilizar tipos de dominio existentes; convención consistente para opcionales (no mezclar `undefined`/`null`/`""` sin criterio).

**React/RN**: componentes funcionales + hooks, tamaño razonable; extraer lógica solo si se reutiliza, complica el componente, o es claramente de persistencia/notificaciones/dominio (no por regla de longitud artificial); evitar `useEffect` con varias responsabilidades; no guardar en estado algo derivable de otro estado.

**Compatibilidad**: antes de usar una API nueva de Expo/RN, revisar dependencias y versión de Expo instaladas; no asumir versiones; no tocar `package.json` por conveniencia si ya se puede resolver con lo existente.

**Errores**: no fallar en silencio; devolver algo manejable por la UI; no mostrar SQL/stack traces/nombres de tablas al usuario.

**Logging**: sin `console.log` permanentes innecesarios; no loguear información médica del usuario salvo que sea necesario para diagnosticar.

**Verificación**: tras cambios TS relevantes, correr `npx tsc --noEmit`.

## 10. Pantallas

- **Hoy**: próximas/pendientes/atrasadas; acciones Tomado / Posponer / Omitir.
- **Mis medicamentos**: listar / agregar / editar.
- **Crear/editar medicamento**: nombre, tipo, dosis, instrucciones, fecha inicio/fin, horarios.
- **Historial**: por estado; filtros futuros por medicamento/fecha.
- **Configuración**: simple por ahora, sin sync/respaldo remoto todavía.

## 11. Fuera del MVP (no implementar sin pedirlo)

Backend/DRF/PostgreSQL, auth/JWT/cuentas, sync en la nube, familiares/cuidadores, múltiples pacientes, inventario, alertas de inventario, reconocimiento de medicamentos por foto, escaneo de recetas, integración con calendario, reportes PDF, portal médico. (El backend puede diseñarse pensando en no bloquearlo — ver §8 — pero no se construye aquí.)

## 12. Forma de trabajo

1. Revisar archivos relacionados y flujo actual antes de crear nada nuevo.
2. Reutilizar tipos/repositories/services existentes.
3. Cambios pequeños, coherentes, centrados en una sola funcionalidad — sin refactors ni renombres de código no relacionado.
4. Si hay deuda técnica fuera de alcance: mencionarla, no corregirla, salvo que bloquee la tarea.
5. Si la solicitud es clara, implementar directo, sin pedir confirmaciones innecesarias. Si una decisión es ambigua y afecta la arquitectura, explicarlo brevemente antes de continuar.
