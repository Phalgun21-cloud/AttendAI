import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import HomePageClient from '@/components/HomePageClient';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  return <HomePageClient isLoggedIn={!!session} />;
}
