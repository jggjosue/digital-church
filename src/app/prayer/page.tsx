import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
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

  return <PrayerRequestsPageClient />;
}
