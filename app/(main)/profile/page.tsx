import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';
import '@/models/Message';
import '@/models/Conversation';
import '@/models/FriendRequest';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect('/login');
  const userId = (session.user as { id?: string })?.id;

  await dbConnect();
  const user = await UserModel.findById(userId).select('-password').lean();
  if (!user) redirect('/login');

  return <ProfileClient user={JSON.parse(JSON.stringify(user))} />;
}
