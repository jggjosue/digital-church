import { redirect } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isFullAccessStaffRole } from '@/lib/pastor-church-access';

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
  const member = await db.collection('members').findOne(
    { email },
    { projection: { _id: 0, staffRole: 1 } }
  );

  const staffRole = member?.staffRole?.trim().toLowerCase();

  // Permitir si tiene acceso total (Admin) o si su rol contiene 'tesorero' o 'finanzas'
  const isAuthorized = 
    isFullAccessStaffRole(staffRole) || 
    staffRole?.includes('tesorero') || 
    staffRole?.includes('finanzas');

  if (!isAuthorized) {
    redirect('/');
  }

  return <>{children}</>;
}
