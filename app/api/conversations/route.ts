import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ConversationModel from '@/models/Conversation';
import MessageModel from '@/models/Message';
import '@/models/User';
import '@/models/FriendRequest';

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as { id?: string })?.id;
    await dbConnect();

    const conversations = await ConversationModel.find({ participants: userId })
      .populate('participants', 'name email image isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name image' },
      })
      .sort({ lastMessageAt: -1 })
      .lean();

    // Compute unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await MessageModel.countDocuments({
          conversation: conv._id,
          sender: { $ne: userId },
          'readBy.user': { $ne: userId },
          isDeleted: false,
        });
        return { ...conv, unreadCount };
      })
    );

    return NextResponse.json(conversationsWithUnread);
  } catch (error) {
    console.error('GET conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as { id?: string })?.id;
    const { participantId, isGroup, groupName, groupDescription, groupImage, participants } = await req.json();

    await dbConnect();

    if (!isGroup) {
      const existing = await ConversationModel.findOne({
        isGroup: false,
        participants: { $all: [userId, participantId], $size: 2 },
      })
        .populate('participants', 'name email image isOnline lastSeen')
        .populate({
          path: 'lastMessage',
          populate: { path: 'sender', select: 'name image' },
        })
        .lean();

      if (existing) return NextResponse.json({ ...existing, unreadCount: 0 });

      const conv = await ConversationModel.create({
        participants: [userId, participantId],
        isGroup: false,
      });

      const populated = await ConversationModel.findById(conv._id)
        .populate('participants', 'name email image isOnline lastSeen')
        .lean();

      return NextResponse.json({ ...populated, unreadCount: 0 }, { status: 201 });
    } else {
      const allParticipants = [userId, ...(participants || [])];
      const conv = await ConversationModel.create({
        participants: allParticipants,
        isGroup: true,
        groupName,
        groupDescription,
        groupImage,
        groupAdmin: userId,
      });

      const populated = await ConversationModel.findById(conv._id)
        .populate('participants', 'name email image isOnline lastSeen')
        .lean();

      return NextResponse.json({ ...populated, unreadCount: 0 }, { status: 201 });
    }
  } catch (error) {
    console.error('POST conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
