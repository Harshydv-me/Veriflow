import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  walletAddress?: string;
  role: 'farmer' | 'marketplace' | 'admin';
  organization?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: {
    country?: string;
    region?: string;
  };
  preferences?: {
    language?: string;
    currency?: string;
    notifications?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['farmer', 'marketplace', 'admin'],
      default: 'farmer',
    },
    organization: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
      trim: true,
    },
    location: {
      country: String,
      region: String,
    },
    preferences: {
      language: {
        type: String,
        default: 'en',
      },
      currency: {
        type: String,
        default: 'USD',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
