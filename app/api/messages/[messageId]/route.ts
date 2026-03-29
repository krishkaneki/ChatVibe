import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import MessageModel from '@/models/Message';
import '@/models/User';
import '@/models/Conversation';

export async function DELETE(req: NextRequest, { params }: { params: { messageId: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as { id?: string })?.id;
    await dbConnect();

    const message = await MessageModel.findById(params.messageId);
    if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (message.sender.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    message.isDeleted = true;
    message.content = '';
    await message.save();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { messageId: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as { id?: string })?.id;
    const { action, emoji } = await req.json();

    await dbConnect();
    const message = await MessageModel.findById(params.messageId);
    if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (action === 'react' && emoji) {
      const existing = message.reactions.findIndex(
        (r) => r.user.toString() === userId && r.emoji === emoji
      );
      if (existing > -1) {
        message.reactions.splice(existing, 1);
      } else {
        message.reactions.push({ emoji, user: userId as unknown as import('mongoose').Types.ObjectId });
      }
      await message.save();
    }

    if (action === 'read') {
      const alreadyRead = message.readBy.some((r) => r.user.toString() === userId);
      if (!alreadyRead) {
        message.readBy.push({ user: userId as unknown as import('mongoose').Types.ObjectId, readAt: new Date() });
        await message.save();
      }
    }

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
