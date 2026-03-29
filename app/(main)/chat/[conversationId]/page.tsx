import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import ConversationModel from '@/models/Conversation';
// Import ALL models so Mongoose registers schemas before any .populate() call
// This is required on Vercel because each serverless function loads in isolation
import '@/models/Message';
import '@/models/User';
import '@/models/FriendRequest';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';

interface Props {
  params: { conversationId: string };
}

export default async function ConversationPage({ params }: Props) {
  const session = await auth();
  if (!session) notFound();

  await dbConnect();
  const conversation = await ConversationModel.findById(params.conversationId)
    .populate('participants', 'name email image isOnline lastSeen')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name image' },
    })
    .lean();

  if (!conversation) notFound();

  const userId = (session.user as { id?: string })?.id || '';
  const convPlain = JSON.parse(JSON.stringify(conversation));

  return (
    <div className="flex flex-col h-full bg-surface pt-14 md:pt-0">
      <ChatHeader conversation={convPlain} currentUserId={userId} />
      <MessageList conversationId={params.conversationId} currentUserId={userId} />
      <ChatInput conversationId={params.conversationId} currentUserId={userId} />
    </div>
  );
}
