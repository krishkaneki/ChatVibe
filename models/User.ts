import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  bio: string;
  username?: string;
  isOnline: boolean;
  lastSeen?: Date;
  provider?: string;
  friends: mongoose.Types.ObjectId[];
  blockedUsers: mongoose.Types.ObjectId[];
  settings: {
    theme: string;
    accentColor: string;
    showOnlineStatus: boolean;
    showReadReceipts: boolean;
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    image: { type: String },
    bio: { type: String, default: "Hey there! I'm using ChatVibe" },
    username: { type: String, unique: true, sparse: true },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date },
    provider: { type: String, default: 'credentials' },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    settings: {
      theme: { type: String, default: 'dark' },
      accentColor: { type: String, default: '#a8a4ff' },
      showOnlineStatus: { type: Boolean, default: true },
      showReadReceipts: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
