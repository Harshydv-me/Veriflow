import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  submissionId: string;
  projectId: string;
  userId: mongoose.Types.ObjectId;
  fieldDataId: mongoose.Types.ObjectId;

  // Tree measurements
  measurements: {
    dbh?: number; // Diameter at Breast Height (cm)
    treeHeight?: number; // meters
    treeSpecies?: string;
    plotSize?: number; // square meters
    biomass?: number;
    carbonStock?: number;
    treeCount?: number;
  };

  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };

  // Images categorized
  images: {
    mangrove: string[];
    area: string[];
    monitoring: string[];
  };

  documents: Array<{
    name: string;
    url: string;
    type: string;
  }>;

  notes: string;

  // Submission status
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';

  // Admin review
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  adminFeedback?: string;

  // Blockchain
  ipfsHash?: string;
  blockchainTxHash?: string;

  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    submissionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fieldDataId: {
      type: Schema.Types.ObjectId,
      ref: 'FieldData',
    },
    measurements: {
      dbh: Number,
      treeHeight: Number,
      treeSpecies: String,
      plotSize: Number,
      biomass: Number,
      carbonStock: Number,
      treeCount: Number,
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
      accuracy: Number,
    },
    images: {
      mangrove: [String],
      area: [String],
      monitoring: [String],
    },
    documents: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revision_requested'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    adminFeedback: String,
    ipfsHash: String,
    blockchainTxHash: String,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

SubmissionSchema.index({ userId: 1, status: 1 });
SubmissionSchema.index({ projectId: 1, submittedAt: -1 });
SubmissionSchema.index({ status: 1, submittedAt: -1 });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);
