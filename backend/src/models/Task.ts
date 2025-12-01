import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  completed: boolean;
  dueDate?: Date;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom'],
      default: 'custom',
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ userId: 1, completed: 1 });
TaskSchema.index({ userId: 1, type: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);
