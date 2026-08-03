import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, Database, Save, ShieldCheck } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TutorialImage } from '@/components/tutorial-image';

const STEPS = [
  { id: 'perfil', number: 1, title: 'Completa tu perfil', image: '/documentacion/screenshots/members-new-page.png', route: '/members/new', action: 'Guardar información', text: 'Registra nombre, contacto, templo y datos ministeriales. Los campos obligatorios aparecen marcados; revisa el correo antes de guardar.', verify: 'Al terminar serás enviado al portal y tu perfil aparecerá en el directorio según tus permisos.' },
  { id: 'panel', number: 2, title: 'Conoce el panel', image: '/documentacion/screenshots/dashboard-page.png', route: '/dashboard', action: 'No requiere guardado', text: 'Usa el panel para consultar métricas, actividad reciente y accesos rápidos. Cambiar un filtro solo modifica la vista.', verify: 'Los indicadores se calculan desde los registros persistidos de cada módulo.' },
  { id: 'templos', number: 3, title: 'Registra un templo', image: '/tutorial/nuevo-templo.png', route: '/churches/new', action: 'Guardar ubicación', text: 'Completa nombre, dirección, ciudad, responsable y datos de contacto. Esta ubicación será utilizada después por miembros, ministerios, asistencia e inventario.', verify: 'Confirma el mensaje de éxito y busca el templo en Iglesias → Buscar.' },
  { id: 'miembros', number: 4, title: 'Agrega y consulta miembros', image: '/documentacion/screenshots/members-directory-area.png', route: '/members/add', action: 'Guardar miembro', text: 'Captura los datos personales y asigna los templos correctos. Usa el buscador del directorio para localizar y editar un perfil existente.', verify: 'Después de guardar, abre el perfil desde Directorio → Miembros y verifica sus templos.' },
  { id: 'ministerios', number: 5, title: 'Crea un ministerio', image: '/tutorial/nuevo-ministerio.png', route: '/ministries/new', action: 'Crear ministerio', text: 'Selecciona el tipo de ministerio, el templo y agrega una descripción. Los líderes y miembros pueden asignarse después.', verify: 'El nuevo ministerio debe aparecer en Ministerios → Gestionar.' },
  { id: 'asistencia', number: 6, title: 'Captura asistencia', image: '/tutorial/registro-asistencia.png', route: '/attendance/registro', action: 'Guardar registro', text: 'Selecciona templo, año y evento. Captura cada categoría o agrega una nueva. El indicador “Cambios pendientes” avisa cuando aún no se ha guardado.', verify: 'Espera el mensaje de guardado y confirma que el indicador cambie a “Sin cambios pendientes”.' },
  { id: 'ofrendas', number: 7, title: 'Registra ofrendas', image: '/tutorial/registro-ofrendas.png', route: '/donations/registro', action: 'Guardar registro', text: 'Selecciona templo, año y moneda. Escribe importes, elige método de pago y registra depósitos para conciliación. También puedes revisar un Excel antes de aplicarlo.', verify: 'Comprueba el total del mes, el estado de conciliación y la hora del último guardado.' },
  { id: 'inventario', number: 8, title: 'Guarda recursos de inventario', image: '/tutorial/nuevo-inventario.png', route: '/inventario/nuevo', action: 'Guardar recurso', text: 'Indica recurso, templo, área, cantidad, condición y estado. Si una opción no existe, créala desde el enlace correspondiente.', verify: 'Localiza el artículo en Inventario y confirma ubicación, cantidad y condición.' },
  { id: 'permisos', number: 9, title: 'Configura roles y permisos', image: '/tutorial/roles-permisos.png', route: '/settings/new', action: 'Crear rol', text: 'Solo administradores autorizados deben crear roles. Selecciona únicamente los módulos necesarios y asigna el rol al miembro correcto.', verify: 'Revisa Configuración → Lista de Roles y luego Usuarios para confirmar la asignación.' },
] as const;

export default function TutorialPage() {
  return <div className="flex flex-1 flex-col">
    <AppHeader title="Tutorial del portal" description="Guía visual para capturar, guardar y comprobar la información de cada área." />
    <main className="flex-1 bg-muted/20 px-3 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 text-white sm:p-10">
          <Badge className="bg-white/10 text-white hover:bg-white/10"><BookOpen className="mr-2 h-4 w-4" />Guía de inicio</Badge>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold sm:text-5xl">Aprende el flujo completo paso a paso</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-lg">Avanza en orden la primera vez. En cada etapa encontrarás qué completar, qué botón guarda la información y cómo comprobar que el registro quedó disponible.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-white/10 p-4"><Save className="h-6 w-6 text-sky-300" /><p className="mt-2 font-semibold">Guarda antes de salir</p></div><div className="rounded-2xl bg-white/10 p-4"><Database className="h-6 w-6 text-emerald-300" /><p className="mt-2 font-semibold">Confirma el mensaje de éxito</p></div><div className="rounded-2xl bg-white/10 p-4"><ShieldCheck className="h-6 w-6 text-amber-300" /><p className="mt-2 font-semibold">Solo verás áreas permitidas</p></div></div>
        </section>

        <nav aria-label="Etapas del tutorial" className="flex gap-2 overflow-x-auto pb-2">{STEPS.map((step) => <a key={step.id} href={`#${step.id}`} className="shrink-0 rounded-full border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{step.number}. {step.title}</a>)}</nav>

        <div className="space-y-8">{STEPS.map((step) => <Card id={step.id} key={step.id} className="scroll-mt-28 overflow-hidden"><CardContent className="p-0"><div className="grid lg:grid-cols-[1.08fr_.92fr]"><div className="border-b bg-slate-100 lg:border-b-0 lg:border-r"><TutorialImage src={step.image} alt={`Pantalla de ejemplo: ${step.title}`} /></div><div className="flex flex-col justify-center p-5 sm:p-8"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{step.number}</span><h2 className="text-2xl font-bold sm:text-3xl">{step.title}</h2></div><p className="mt-5 leading-relaxed text-muted-foreground">{step.text}</p><div className="mt-5 rounded-xl border bg-muted/30 p-4"><p className="flex items-center gap-2 text-sm font-semibold"><Save className="h-4 w-4 text-primary" />Botón para guardar</p><p className="mt-1 text-lg font-bold">{step.action}</p></div><div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950"><p className="flex items-start gap-2 text-sm leading-relaxed"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span><strong>Cómo verificar:</strong> {step.verify}</span></p></div><Button asChild className="mt-5 w-full sm:w-fit"><Link href={step.route}>Abrir esta área <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div></div></CardContent></Card>)}</div>

        <section className="rounded-2xl border bg-background p-6 text-center sm:p-8"><h2 className="text-2xl font-bold">Regla general de guardado</h2><p className="mx-auto mt-3 max-w-3xl text-muted-foreground">Si ves “Cambios pendientes”, todavía no has terminado. Pulsa el botón de guardar, espera la confirmación y verifica el registro en la lista o reporte correspondiente antes de cambiar de templo, año o página.</p><Button asChild variant="outline" className="mt-5"><Link href="/dashboard">Volver al panel</Link></Button></section>
      </div>
    </main>
  </div>;
}
