# Digital Church — ICIAR

Sistema web de gestión ministerial para ICIAR. Centraliza miembros, templos, ministerios, asistencia, donaciones, ofrendas, campañas, inventario, roles y reportes en un portal protegido por autenticación Clerk. La portada, la documentación visual y las rutas de inicio/registro de sesión son públicas; el portal administrativo, el tutorial interno y las APIs requieren una sesión válida.

## Contenido

- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Configuración local](#configuración-local)
- [Variables de entorno](#variables-de-entorno)
- [Comandos](#comandos)
- [Arquitectura](#arquitectura)
- [Autenticación, roles y alcance](#autenticación-roles-y-alcance)
- [Páginas](#páginas)
- [API](#api)
- [Datos y colecciones](#datos-y-colecciones)
- [Importaciones Excel](#importaciones-excel)
- [Diseño y componentes](#diseño-y-componentes)
- [Despliegue](#despliegue)
- [Validación y solución de problemas](#validación-y-solución-de-problemas)
- [Convenciones de desarrollo](#convenciones-de-desarrollo)

## Tecnologías

| Área | Tecnología |
| --- | --- |
| Framework | Next.js 15 con App Router y Turbopack |
| Lenguaje | TypeScript estricto |
| UI | React 18, Tailwind CSS, shadcn/ui y Radix UI |
| Iconos | Lucide React |
| Autenticación | Clerk, localizado en español de México |
| Base de datos | MongoDB con el driver oficial |
| Validación | Zod |
| Formularios | React Hook Form y resolvers de Zod |
| Fechas | date-fns y React Day Picker |
| Gráficas | Recharts |
| Excel | SheetJS (`xlsx`) |
| PDF | jsPDF, AutoTable y html2canvas |
| Correo | Nodemailer mediante Gmail |
| IA | Genkit con Google AI; infraestructura preparada, sin flujos activos |
| Métricas | Vercel Analytics y Speed Insights |
| Hosting configurado | Firebase App Hosting; también compatible con Vercel/Node |

## Requisitos

- Node.js 20 o una versión compatible con Next.js 15.
- npm. El repositorio también contiene `yarn.lock`, pero `package-lock.json` es el lockfile usado por los comandos documentados.
- Una base de datos MongoDB accesible.
- Una aplicación Clerk con claves de servidor y cliente.
- Opcional: una cuenta Gmail con contraseña de aplicación para invitaciones y declaraciones de donación.

## Configuración local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea `.env` en la raíz. No lo confirmes en Git; `.gitignore` excluye `.env*`.

3. Configura al menos Clerk y MongoDB siguiendo la tabla de variables.

4. Inicia el servidor:

   ```bash
   npm run dev
   ```

5. Abre [http://localhost:9002](http://localhost:9002).

El servidor de desarrollo escucha en `0.0.0.0:9002`, por lo que también puede abrirse desde otro dispositivo de la red usando la IP local de la computadora.

## Variables de entorno

No incluyas secretos reales en este archivo. Ejemplo de estructura:

```dotenv
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# MongoDB
STORAGE_MONGODB_URI=mongodb+srv://usuario:password@cluster/base-de-datos
MONGO_DB_NAME=digital-church

# Correo opcional
GMAIL_USER=
GMAIL_APP_PASSWORD=
GMAIL_FROM_NAME=ICIAR
```

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sí | Clave pública de Clerk disponible en el cliente. |
| `CLERK_SECRET_KEY` | Sí | Operaciones de autenticación realizadas en el servidor. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Recomendada | Ruta de inicio de sesión; normalmente `/sign-in`. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Recomendada | Ruta de registro; normalmente `/sign-up`. |
| `STORAGE_MONGODB_URI` | Sí | Cadena de conexión principal de MongoDB. |
| `MONGO_DB` | Alternativa | Respaldo heredado cuando no existe `STORAGE_MONGODB_URI`. |
| `MONGO_DB_NAME` | Opcional | Sobrescribe el nombre de base de datos. Si falta, se toma de la URI o se usa `digital-church`. |
| `GMAIL_USER` | Opcional | Cuenta Gmail/Workspace que envía correos. |
| `GMAIL_APP_PASSWORD` | Opcional | Contraseña de aplicación de Gmail, no la contraseña normal. |
| `GMAIL_FROM_NAME` | Opcional | Nombre visible del remitente de declaraciones; tiene un valor predeterminado. |

Para Gmail se debe activar la verificación en dos pasos y generar una contraseña de aplicación. Las funciones que requieren correo responden con `503` si faltan las credenciales.

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Desarrollo con Turbopack en el puerto 9002. |
| `npm run typecheck` | Ejecuta TypeScript sin emitir archivos. Es la validación estática principal. |
| `npm run build` | Genera la compilación de producción. |
| `npm run db:migrate` | Crea colecciones e índices faltantes y copia documentos heredados a colecciones separadas; es idempotente y no elimina las colecciones antiguas. |
| `npm run start` | Sirve una compilación ya generada. |
| `npm run genkit:dev` | Inicia Genkit una vez. |
| `npm run genkit:watch` | Inicia Genkit en modo observación. |
| `npm run lint` | Script heredado basado en `next lint`; revisar su compatibilidad antes de usarlo con esta versión de Next.js. |

> Importante: `next.config.ts` contiene `ignoreBuildErrors: true` e `ignoreDuringBuilds: true`. Por eso una compilación puede terminar aunque existan errores de TypeScript o lint. Ejecuta siempre `npm run typecheck` de forma independiente.

## Arquitectura

```text
digital-church/
├── docs/
│   └── blueprint.md             # Idea inicial y lineamientos visuales
├── public/                       # Recursos públicos
├── src/
│   ├── ai/                       # Configuración de Genkit/Google AI
│   ├── app/
│   │   ├── api/                  # Route Handlers del backend
│   │   ├── attendance/           # Asistencia y reportes
│   │   ├── churches/             # Templos
│   │   ├── donations/            # Donaciones, ofrendas y campañas
│   │   ├── inventario/           # Inventario y taxonomías
│   │   ├── members/              # Miembros y pastoral
│   │   ├── ministries/           # Ministerios
│   │   ├── settings/             # Roles y usuarios del portal
│   │   ├── globals.css           # Variables y estilos globales
│   │   └── layout.tsx            # Providers y chrome global
│   ├── components/
│   │   ├── ui/                   # Componentes shadcn/ui
│   │   ├── dashboard/            # Componentes del panel
│   │   └── landing/              # Componentes públicos
│   ├── contexts/                 # Contextos cliente, incluido el menú filtrado
│   ├── hooks/                    # Hooks compartidos
│   ├── lib/                      # MongoDB, esquemas, permisos y utilidades
│   └── middleware.ts             # Protección de rutas con Clerk
├── apphosting.yaml               # Firebase App Hosting
├── components.json               # Configuración shadcn/ui
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### Flujo de una solicitud

1. `src/middleware.ts` determina si la ruta es pública o exige una sesión Clerk.
2. `src/app/layout.tsx` instala Clerk, tema, navegación autenticada, notificaciones y métricas.
3. `AuthenticatedChrome` coloca el menú lateral en páginas privadas y valida el estado del miembro.
4. `PortalNavProvider` consulta `/api/members/me-nav` y filtra módulos según el rol.
5. Las páginas cliente llaman endpoints en `src/app/api`.
6. Los endpoints validan entradas con Zod y acceden a MongoDB mediante `src/lib/mongodb.ts`.

### Alias de importación

TypeScript define `@/*` como alias de `src/*`. Ejemplos:

```ts
import { Button } from '@/components/ui/button';
import { getDb } from '@/lib/mongodb';
```

## Autenticación, roles y alcance

### Rutas públicas

- `/`
- `/sign-in/*`
- `/sign-up/*`
- `/documentacion/*`

Todas las demás páginas y rutas `/api` requieren sesión por medio de Clerk.

### Relación Clerk–miembro

La aplicación vincula la sesión Clerk con un documento de `members` usando el correo principal normalizado. Los endpoints `/api/members/me`, `/api/members/me-role` y `/api/members/me-nav` resuelven identidad, estado de alta, rol y navegación.

### Roles relevantes

- Acceso completo: `admin`, `super administrador`, `administrador general`, `consejo de pastores` y `director general`.
- Alcance pastoral: `pastor`, variantes que comienzan con `pastor ` y `ayuda pastoral`.
- Liderazgo equivalente: `directiva`, `presidente`, responsables de comisión y director de instituto.
- Onboarding: `nuevo` y `estudiante del instituto`.
- Congregante: navegación y lecturas limitadas; sus donaciones se restringen además por templo y donante.

La lógica central se encuentra en:

- `src/lib/pastor-church-access.ts`
- `src/lib/donations-scope.ts`
- `src/lib/portal-nav-data.tsx`
- `src/app/api/members/me-nav/route.ts`

Los templos asignados se toman de `members.churchIds`; `templeIds` existe como respaldo para datos heredados.

### Permisos del menú

Los permisos son etiquetas de módulos y subelementos. Las etiquetas de `staff_roles.modules` deben coincidir con `PORTAL_PERMISSIONS_BY_MODULE`. Al renombrar una opción del menú también se deben actualizar roles fijos o datos persistidos que dependan de esa etiqueta.

El módulo `Ofrendas` distingue además las acciones sensibles `Ver ofrendas`, `Registrar ofrendas`, `Editar registros históricos`, `Importar Excel`, `Descargar reportes` y `Eliminar categorías`. Los Route Handlers vuelven a validar cada acción; no se depende únicamente de ocultar controles. El rol fijo `Congregante` solo conserva `Añadir Donación` y no obtiene lectura financiera por defecto.

Super administrador, Administrador general, roles equivalentes y roles personalizados con permisos explícitos pueden ver Configuración. Las APIs validan por separado `Roles y Permisos`, `Lista de Roles` y `Usuarios`; el menú visible no sustituye la autorización del servidor. Los nombres de rol no pueden repetirse ignorando mayúsculas, las asignaciones comprueban que el miembro exista y las modificaciones de un rol compartido sincronizan a todos sus usuarios.

## Páginas

### Tutorial visual

La ruta `/tutorial` está disponible para cualquier usuario autenticado y aparece como acceso fijo en los menús de escritorio, tablet y móvil. Incluye nueve etapas con capturas visuales: perfil, panel, templos, miembros, ministerios, asistencia, ofrendas, inventario y roles. Cada etapa indica el botón de guardado y cómo comprobar que la operación terminó correctamente. Las capturas propias se almacenan en `public/tutorial`; las imágenes generales reutilizan `public/documentacion/screenshots`.

### Menú principal

| Módulo | Ruta | Propósito |
| --- | --- | --- |
| Panel | `/dashboard` | Métricas consolidadas del portal. |
| Directorio | `/members/new` | Alta inicial o “Mis datos”, según el rol. |
| Directorio | `/members/add` | Añadir miembro. |
| Directorio | `/members` | Listado y búsqueda de miembros. |
| Directorio | `/members/staff` | Directorio pastoral. |
| Iglesias | `/churches/new` | Añadir ubicación. |
| Iglesias | `/churches` | Buscar y administrar templos. |
| Ministerios | `/ministries/new` | Crear ministerio. |
| Ministerios | `/ministries` | Gestionar ministerios. |
| Ministerios | `/ministries/assign-members` | Asignar miembros. |
| Asistencia | `/attendance` | Servicios y eventos de asistencia. |
| Asistencia | `/attendance/registro` | Registro anual por categorías, días y meses. |
| Asistencia | `/attendance/report` | Reporte mensual y descarga PDF. |
| Ofrendas | `/donations/registro` | Registro anual monetario por categorías. |
| Ofrendas | `/donations/new` | Añadir donación individual. |
| Ofrendas | `/donations/fundraising/new` | Crear campaña. |
| Ofrendas | `/donations` | Listado de donaciones y ofrendas. |
| Ofrendas | `/donations/giving-statement` | Declaración anual y envío PDF. |
| Ofrendas | `/donations/fundraising` | Gestión de campañas. |
| Inventario | `/inventario` | Gestión de inventario. |
| Inventario | `/inventario/nuevo` | Alta de artículo. |
| Configuración | `/settings/new` | Configurar roles y permisos. |
| Configuración | `/settings/roles` | Lista de roles. |
| Configuración | `/settings/users` | Usuarios del portal. |

### Rutas de detalle y operación

- Miembros: `/members/[id]`, `/members/[id]/edit`, `/members/[id]/attendance`, `/members/[id]/donations`, `/members/send-email`, `/members/bulk-actions`.
- Iglesias: `/churches/[id]`, `/churches/[id]/edit`.
- Ministerios: `/ministries/[id]`, `/ministries/[id]/edit`.
- Asistencia: `/attendance/[id]`.
- Donaciones: `/donations/[id]`, `/donations/[id]/edit`, `/donations/pledges`.
- Campañas: `/donations/fundraising/[id]/edit`, `/donations/fundraising/[id]/report`.
- Inventario: `/inventario/categorias/nueva`, `/inventario/estados/nueva`, `/inventario/condiciones/nueva`, `/inventario/areas/[churchId]`.
- Configuración: `/settings`, `/settings/users/[id]/edit`.

### Módulos adicionales fuera del menú principal

- Eventos: `/events`, `/events/new`, `/events/[id]`, `/events/[id]/edit`, `/events/activities`.
- Ceremonias: `/ceremonies`, `/ceremonies/new`, `/ceremonies/[id]`, `/ceremonies/[id]/edit`, `/ceremonies/export`.
- Grupos: `/groups`, `/groups/new`, `/groups/[id]/edit`, `/groups/add-members`.
- Voluntarios: `/volunteers`, `/volunteers/new`, `/volunteers/[id]/edit`, `/volunteers/planning`, `/volunteers/tasks`.
- Finanzas: `/financial`, `/financial/budget`, `/financial/funds`, `/financial/income-expense`, `/financial/new-transaction`, `/financial/donations`.
- Reportes: `/reports`, `/reports/volunteers`.
- Instalaciones: `/facilities`, `/facilities/new`.
- Oración: `/prayer`, `/prayer/new`.
- Sermones: `/sermons`, `/sermons/new`, `/sermons/list`, `/sermons/audio`, `/sermons/images`, `/sermons/videos`.

Algunas páginas de estos módulos son prototipos de UI y no necesariamente cuentan con endpoints o persistencia completos. Verifica el flujo antes de considerarlo listo para producción.

## API

Todos los endpoints son Route Handlers de Next.js y, salvo las excepciones públicas del middleware, requieren sesión.

### Sesión y panel

| Métodos | Endpoint | Función |
| --- | --- | --- |
| `GET` | `/api/dashboard` | Métricas consolidadas con alcance por templo. |
| `GET` | `/api/members/me` | Miembro asociado a la sesión. |
| `GET` | `/api/members/me-role` | Rol y estado de alta. |
| `GET` | `/api/members/me-nav` | Módulos visibles según permisos. |
| `GET` | `/api/mongo/ping` | Verificación de conexión a MongoDB. |

### Miembros y pastoral

| Métodos | Endpoint |
| --- | --- |
| `GET, POST, PUT, DELETE` | `/api/members` |
| `GET, PATCH` | `/api/members/[id]` |
| `GET` | `/api/members/[id]/attendance` |
| `GET` | `/api/members/[id]/donations` |
| `GET` | `/api/staff/pastors` |
| `POST, DELETE` | `/api/member-photo-uploads` |

`/api/member-photo-uploads` guarda temporalmente una imagen como Data URL en MongoDB. El límite actual del cuerpo es aproximadamente 12 MB.

### Iglesias y asistencia

| Métodos | Endpoint |
| --- | --- |
| `GET, POST` | `/api/churches` |
| `GET, PATCH, DELETE` | `/api/churches/[id]` |
| `GET` | `/api/churches/created-by-me` |
| `GET, POST, DELETE` | `/api/churches/[id]/attendance` |
| `GET, PUT` | `/api/attendance/registro` |
| `GET` | `/api/attendance/registro/event-names` |

Parámetros importantes:

- `GET /api/churches?sessionChurchScope=1`: limita templos al alcance del miembro.
- `GET /api/attendance/registro?churchId=...&year=...`: recupera el registro anual.
- `PUT /api/attendance/registro`: crea o reemplaza el registro anual y su consolidado.

### Donaciones, ofrendas y campañas

| Métodos | Endpoint |
| --- | --- |
| `GET, POST` | `/api/donations` |
| `GET, PUT` | `/api/donations/[id]` |
| `GET` | `/api/donations/donors` |
| `GET` | `/api/donations/statement` |
| `POST` | `/api/donations/giving-statement/send-email` |
| `GET, PUT` | `/api/donations/registro` |
| `GET, POST` | `/api/fundraising` |
| `GET, PATCH` | `/api/fundraising/[id]` |

El registro anual de `/api/donations/registro` se guarda separado de las donaciones individuales. Usa `offering_registry`; no crea un documento en `donation` por cada celda.

### Ministerios

| Métodos | Endpoint |
| --- | --- |
| `GET, POST` | `/api/ministries` |
| `GET, PATCH, DELETE` | `/api/ministries/[id]` |
| `POST` | `/api/ministries/[id]/assign-members` |
| `DELETE` | `/api/ministries/[id]/roster` |
| `GET` | `/api/ministries/catalog` |

### Inventario y recursos

| Métodos | Endpoint |
| --- | --- |
| `GET, POST` | `/api/inventory` |
| `GET, POST` | `/api/inventory/categories` |
| `GET, POST` | `/api/inventory/church-areas` |
| `GET, POST, PUT` | `/api/inventory/taxonomy` |
| `GET` | `/api/resource` |
| `POST` | `/api/resource/seed-default-categories` |

Inventario usa documentos de tipo artículo y documentos auxiliares en la colección `inventory`, además de categorías personalizadas en `inventory_categories` y categorías base en `resource`.

### Configuración

| Métodos | Endpoint |
| --- | --- |
| `GET` | `/api/settings/portal-users` |
| `GET` | `/api/settings/portal-users/[id]` |
| `POST` | `/api/settings/portal-users/invite` |
| `GET, POST` | `/api/staff-roles` |
| `PATCH` | `/api/staff-roles/[id]` |

## Datos y colecciones

| Colección | Contenido principal |
| --- | --- |
| `members` | Perfil, correo, rol, permisos embebidos y templos asignados. |
| `churches` | Ubicaciones/templos. |
| `ministries` | Ministerios, líderes y asignaciones. |
| `attendance_events` | Servicios y eventos configurados para asistencia. |
| `attendance_registry` | Matriz anual de asistencia por templo, evento y categoría. |
| `member_attendance` | Historial de asistencia por miembro. |
| `donation` | Donaciones y ofrendas individuales. |
| `member_donations` | Historial resumido por miembro. |
| `offering_registry` | Matriz anual de ofrendas por templo, categoría y fecha. |
| `fundraising` | Campañas de recaudación. |
| `inventory_items` | Artículos y existencias de inventario. |
| `inventory_taxonomy` | Estados y condiciones configurables de inventario. |
| `inventory_church_areas` | Áreas de inventario separadas por templo. |
| `inventory_categories` | Categorías de inventario creadas por usuarios. |
| `resource` | Categorías base y recursos del sistema. |
| `staff_roles` | Roles configurables y permisos por módulo. |
| `member_photo_uploads` | Fotografías temporales previas al alta del miembro. |
| `events`, `ceremonies`, `groups` | Eventos generales, ceremonias y grupos. |
| `volunteers`, `volunteer_tasks`, `volunteer_schedules` | Voluntarios, tareas y planificación. |
| `prayer_requests` | Peticiones de oración y su privacidad/estado. |
| `sermons`, `sermon_media` | Sermones y metadatos de audio, imagen o video. |
| `facilities`, `facility_bookings` | Instalaciones y reservaciones. |
| `financial_transactions`, `budgets`, `funds`, `pledges` | Contabilidad, presupuestos, fondos y promesas. |
| `audit_log` | Historial cronológico de altas, cambios y eliminaciones con usuario, fecha y pantalla de origen. |
| `financial_record_versions` | Copias completas anteriores de donaciones, ofrendas, transacciones, presupuestos, fondos y promesas. |
| `annual_registry_versions` | Versiones anteriores de los registros anuales no financieros, como asistencia. |

Los documentos de negocio usan un campo `id` propio, generalmente UUID, además del `_id` interno de MongoDB. Los endpoints suelen excluir `_id` de las respuestas.

Las colecciones nuevas usan los Route Handlers autenticados `/api/data/[resource]` y `/api/data/[resource]/[id]` para listar, crear, consultar, actualizar y eliminar. Los esquemas están centralizados en `src/lib/persistence-schemas.ts` y el catálogo de recursos en `src/lib/resource-configs.ts`.

Las mutaciones auditadas guardan `actor`, `timestamp`, `sourceScreen`, colección, identificador, operación y estados anterior/posterior. Los usuarios con acceso global pueden consultar `/api/audit?collection=...&entityId=...` y las versiones históricas mediante `/api/audit/versions?collection=...&entityId=...`; añade `type=registry` para registros anuales no financieros.

Después de actualizar una instalación que todavía use `attendance` o `inventory` como colecciones mixtas, ejecuta `npm run db:migrate`. La migración conserva los documentos originales como respaldo y puede ejecutarse más de una vez.

### Conexión MongoDB

`src/lib/mongodb.ts` mantiene un pool reutilizable:

- En desarrollo lo almacena en `global._mongoClientPromise` para sobrevivir recargas.
- En producción conserva una promesa de cliente a nivel de módulo.
- Usa `maxIdleTimeMS: 60000` y `attachDatabasePool` para integración con Vercel Functions.

## Importaciones Excel

### Registro de asistencia

Ruta: `/attendance/registro`.

- Formatos aceptados: `.xlsx`, `.xls` y `.csv`.
- Columnas reconocidas: templo/iglesia, fecha, mes, semana, día, categoría y asistencia.
- Las categorías pueden ser distintas de Niños, Jóvenes, Adultos y Nuevos.
- Fechas admitidas: `dd/mm/aaaa` y `aaaa-mm-dd`.
- Las categorías personalizadas reciben identificadores estables.
- Los meses detectados se inicializan automáticamente.
- Si el archivo declara otro templo, la importación se cancela.
- La pantalla permite descargar una plantilla compatible.
- Antes de aplicar un archivo se muestra una vista previa con filas válidas e inválidas, duplicados, categorías nuevas y el total; el usuario decide si reemplaza o suma los valores existentes.
- El formulario avisa antes de cambiar de ruta, templo o año cuando hay cambios pendientes; permite deshacerlos, activar autoguardado y muestra la hora del último guardado de la sesión.

### Registro de ofrendas

Ruta: `/donations/registro`.

- Formatos aceptados: `.xlsx` y `.xls`.
- Columnas principales: `iglesia`, `fecha`, `categoria`, `monto`, `moneda` y `metodo_pago`.
- Alias admitidos incluyen `templo`, `church`, `category`, `concepto`, `ofrenda`, `amount` y `valor`.
- La importación presenta el mismo análisis previo y no modifica el registro hasta confirmar si los montos se suman o reemplazan.
- Comparte la misma protección contra pérdida de cambios, indicador de estado, restauración y autoguardado opcional del registro de asistencia.
- Las fechas pueden escribirse como `dd/mm/aaaa` o `aaaa-mm-dd`.
- Se aceptan categorías monetarias personalizadas.
- Los importes deben ser números no negativos y corresponder al año seleccionado.
- La moneda del registro es configurable entre MXN, USD y EUR; todos los totales, la importación y los depósitos usan la moneda seleccionada.
- La captura formatea el importe mientras se escribe y solicita confirmación para cantidades iguales o mayores a 100,000.
- Cada importe conserva su método de pago: efectivo, transferencia, cheque o tarjeta. La cuadrícula muestra además el subtotal diario.
- La conciliación bancaria registra depósitos con fecha, referencia e importe, y calcula lo depositado, lo pendiente y el estado conciliado.
- La pantalla permite descargar una plantilla.

La importación modifica primero el estado del navegador. Los datos quedan persistidos solamente al pulsar el botón de guardar correspondiente.

## Diseño y componentes

- Fuente global: PT Sans mediante `next/font/google`.
- Tema: claro, oscuro o sistema mediante `next-themes`.
- Colores: variables CSS consumidas por Tailwind y shadcn/ui.
- Navegación: `AppSidebar` en escritorio y `MobileSidebar` dentro de un Sheet.
- Encabezados: `AppHeader`, con soporte para controles apilados en páginas complejas.
- Notificaciones: `useToast` y `Toaster`.
- Diseño adaptable: usa `min-w-0`, cuadrículas responsivas y desplazamiento horizontal localizado para tablas anchas.
- Áreas seguras: el layout considera `safe-area-inset` para dispositivos móviles.

La configuración shadcn está en `components.json`; los componentes generados viven en `src/components/ui`.

## Despliegue

### Compilación Node

```bash
npm install
npm run typecheck
npm run build
npm run start
```

El entorno de producción debe contener las mismas variables de Clerk y MongoDB. Añade las variables Gmail solo si se habilita el envío de correos.

### Firebase App Hosting

`apphosting.yaml` define actualmente:

```yaml
runConfig:
  maxInstances: 1
```

Configura los secretos y variables desde Firebase App Hosting; no subas `.env`.

### Vercel

El proyecto incluye Analytics, Speed Insights y configuración de pool para Vercel Functions. Registra las variables desde Project Settings → Environment Variables.

### Imágenes remotas

`next.config.ts` autoriza imágenes desde:

- `placehold.co`
- `images.unsplash.com`
- `picsum.photos`
- `img.clerk.com`

Agrega cualquier dominio nuevo a `images.remotePatterns` antes de usarlo con `next/image`.

## Validación y solución de problemas

### Verificación recomendada antes de entregar cambios

```bash
npm test
npm run typecheck
npm run build
```

`npm test` ejecuta la suite con el runner nativo de Node y `tsx`. Las pruebas actuales cubren fechas del registro, categorías personalizadas y desconocidas, modos de importación, totales, restauración de datos persistidos, alcance financiero por rol y templo, y validación del catálogo de roles y permisos. Durante el desarrollo puede usarse `npm run test:watch`.

Además, prueba manualmente la ruta modificada en escritorio y móvil, revisa la consola del navegador y confirma que no exista desplazamiento horizontal global.

### MongoDB no conecta

1. Revisa `STORAGE_MONGODB_URI`.
2. Confirma que la IP o red esté permitida en MongoDB Atlas.
3. Abre `/api/mongo/ping` con una sesión iniciada.
4. Si la URI no incluye base, configura `MONGO_DB_NAME`.

### La aplicación redirige a `/members/new`

El chrome autenticado requiere un documento `members` asociado al correo Clerk. Completa el alta o verifica que el correo coincida exactamente después de normalizar mayúsculas y espacios.

### No aparece una opción del menú

1. Consulta `/api/members/me-nav`.
2. Revisa `staffRole`, `portalRoleId` y `staffRoleGrants` en el miembro.
3. Confirma que el texto del permiso coincida con `src/lib/portal-nav-data.tsx`.
4. Recuerda que Configuración solo aparece para roles globales autorizados.

### Gmail rechaza el acceso

- Usa una contraseña de aplicación.
- Elimina espacios de la contraseña al copiarla.
- Verifica que `GMAIL_USER` sea la misma cuenta que generó la contraseña.
- Confirma que la verificación en dos pasos esté activa.

### La compilación pasa pero TypeScript falla

Es consecuencia de los indicadores `ignoreBuildErrors` de Next. La fuente de verdad es `npm run typecheck`; no dependas únicamente de `npm run build`.

## Convenciones de desarrollo

- Usa TypeScript estricto y evita `any` cuando exista una forma concreta de modelar los datos.
- Valida cuerpos y parámetros de API con Zod.
- No accedas a MongoDB desde componentes cliente; usa Route Handlers y `getDb()`.
- Conserva el alcance por templo en consultas y mutaciones.
- Normaliza correos, roles y nombres antes de compararlos.
- Mantén sincronizados menú, permisos fijos, esquemas de roles y etiquetas persistidas.
- Usa rutas en español solo donde ya forman parte del contrato (`/inventario`); no mezcles variantes para un mismo módulo.
- Para formularios financieros, usa números no negativos y límites explícitos.
- No confirmes `.env`, credenciales, archivos de compilación ni datos reales exportados.
- Antes de cambiar un esquema persistido, contempla documentos heredados y migraciones.

## Estado conocido y trabajo futuro

- La suite automatizada inicial cubre la lógica crítica de los registros; todavía conviene añadir pruebas E2E autenticadas para comprobar MongoDB y recargas completas desde el navegador.
- El script de lint debe modernizarse para la versión actual de Next.js.
- La compilación ignora errores de TypeScript y lint; conviene retirar estas excepciones cuando el proyecto esté limpio.
- Algunas vistas de reportes secundarios todavía pueden ampliarse con filtros y exportaciones, aunque sus recursos ya cuentan con colecciones y CRUD persistente.
- La configuración de Genkit existe, pero `src/ai/dev.ts` no importa flujos activos.
- Los registros anuales ya comparten utilidades y componentes base; conviene seguir trasladando reglas específicas de pantalla a funciones puras cubiertas por pruebas.

## Referencias internas

- `docs/blueprint.md`: visión inicial y guía visual.
- `src/lib/portal-nav-data.tsx`: árbol del menú y catálogo de permisos.
- `src/middleware.ts`: protección de rutas.
- `src/lib/mongodb.ts`: conexión y pool de MongoDB.
- `src/components/authenticated-chrome.tsx`: chrome y redirecciones privadas.
- `src/contexts/portal-nav-context.tsx`: filtrado cliente del menú.
