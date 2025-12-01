import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'project_status' | 'verification' | 'purchase' | 'sale' | 'system' | 'credit_issued' | 'submission' | 'submission_review';
  title: string;
  message: string;
  data?: {
    projectId?: string;
    creditId?: string;
    transactionId?: string;
    amount?: number;
    relatedUserId?: mongoose.Types.ObjectId;
  };
  icon?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['project_status', 'verification', 'purchase', 'sale', 'system', 'credit_issued', 'submission', 'submission_review'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      projectId: String,
      creditId: String,
      transactionId: String,
      amount: Number,
      relatedUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    icon: String,
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    actionUrl: String,
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
