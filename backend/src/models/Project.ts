import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  projectId: string;
  userId: mongoose.Types.ObjectId;
  walletAddress: string;
  name: string;
  description: string;
  ecosystemType: 'Mangrove' | 'Seagrass' | 'Salt Marsh' | 'Other';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  area: number;
  ipfsHash: string;
  ipfsUrl: string;
  blockchainTxHash?: string;
  status: 'draft' | 'submitted' | 'pending' | 'verified' | 'rejected' | 'active' | 'completed';
  estimatedCredits?: number;
  issuedCredits: number;
  images: string[];
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    ecosystemType: {
      type: String,
      enum: ['Mangrove', 'Seagrass', 'Salt Marsh', 'Other'],
      required: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    area: {
      type: Number,
      required: true,
    },
    ipfsHash: {
      type: String,
      required: true,
    },
    ipfsUrl: {
      type: String,
      required: true,
    },
    blockchainTxHash: {
      type: String,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'pending', 'verified', 'rejected', 'active', 'completed'],
      default: 'draft',
    },
    estimatedCredits: {
      type: Number,
    },
    issuedCredits: {
      type: Number,
      default: 0,
    },
    images: [{
      type: String,
    }],
    documents: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ userId: 1, createdAt: -1 });
ProjectSchema.index({ status: 1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
