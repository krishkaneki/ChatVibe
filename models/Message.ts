import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'system';
  fileUrl?: string;
  fileName?: string;
  reactions: { emoji: string; user: mongoose.Types.ObjectId }[];
  readBy: { user: mongoose.Types.ObjectId; readAt: Date }[];
  replyTo?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    type: { type: String, enum: ['text', 'image', 'file', 'audio', 'system'], default: 'text' },
    fileUrl: { type: String },
    fileName: { type: String },
    reactions: [
      {
        emoji: { type: String },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    readBy: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MessageModel: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default MessageModel;
