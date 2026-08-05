import { redirect } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isFullAccessStaffRole, isLeadershipStaffRole } from '@/lib/pastor-church-access';
import PrayerRequestsPageClient from './prayer-client';

export default async function PrayerRequestsPage() {
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

  const isAuthorized = 
    isFullAccessStaffRole(staffRole) || 
    isLeadershipStaffRole(staffRole);

  if (!isAuthorized) {
    redirect('/');
  }

  return <PrayerRequestsPageClient />;
}
