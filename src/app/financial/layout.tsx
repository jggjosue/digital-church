import { redirect } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { auth, currentUser } from '@clerk/nextjs/server';
import { resolvePortalModules } from '@/lib/portal-permissions';

export default async function FinancialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase();

  if (!email) {
    redirect('/');
  }

  const db = await getDb();
  const modules = await resolvePortalModules(db);

  // Permitir si tiene acceso total (null = Admin/Liderazgo) o si su rol le otorga el módulo Finanzas
  const isAuthorized = 
    modules === null || 
    Object.keys(modules).some((k) => k.trim().toLowerCase() === 'finanzas');

  if (!isAuthorized) {
    redirect('/');
  }

  return <>{children}</>;
}
