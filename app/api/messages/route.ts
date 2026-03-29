import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import MessageModel from '@/models/Message';
import ConversationModel from '@/models/Conversation';
// Register all schemas so populate() works across isolated API routes
import '@/models/User';
import '@/models/FriendRequest';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    if (!conversationId) return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });

    await dbConnect();

    const messages = await MessageModel.find({ conversation: conversationId })
      .populate('sender', 'name email image')
      .populate('replyTo')
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(messages);
  } catch (error) {
    console.error('GET messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as { id?: string })?.id;
    const { conversationId, content, type = 'text', fileUrl, fileName } = await req.json();

    if (!conversationId) return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });

    await dbConnect();

    const message = await MessageModel.create({
      conversation: conversationId,
      sender: userId,
      content: content || '',
      type,
      fileUrl,
      fileName,
    });

    await ConversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    const populated = await MessageModel.findById(message._id)
      .populate('sender', 'name email image')
      .lean();

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error('POST message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
