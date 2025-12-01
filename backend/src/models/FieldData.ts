import mongoose, { Document, Schema } from 'mongoose';

export interface IFieldData extends Document {
  dataId: string;
  projectId: string;
  userId: mongoose.Types.ObjectId;
  collector: string;
  measurements: {
    biomass?: number;
    carbonStock?: number;
    treeCount?: number;
    averageHeight?: number;
    coveragePercentage?: number;
    soilDepth?: number;
    waterQuality?: number;
    biodiversityIndex?: number;
    customMetrics?: Map<string, number>;
  };
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  images: {
    before: string[];
    after: string[];
    progress: string[];
  };
  ipfsHash: string;
  ipfsUrl: string;
  blockchainTxHash?: string;
  notes: string;
  verified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FieldDataSchema = new Schema<IFieldData>(
  {
    dataId: {
      type: String,
      required: true,
      unique: true,
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
    },
    collector: {
      type: String,
      required: true,
    },
    measurements: {
      biomass: Number,
      carbonStock: Number,
      treeCount: Number,
      averageHeight: Number,
      coveragePercentage: Number,
      soilDepth: Number,
      waterQuality: Number,
      biodiversityIndex: Number,
      customMetrics: {
        type: Map,
        of: Number,
      },
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
      before: [String],
      after: [String],
      progress: [String],
    },
    ipfsHash: {
      type: String,
      required: true,
    },
    ipfsUrl: {
      type: String,
      required: true,
    },
    blockchainTxHash: String,
    notes: {
      type: String,
      default: '',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

FieldDataSchema.index({ projectId: 1, createdAt: -1 });
FieldDataSchema.index({ verified: 1 });

export default mongoose.model<IFieldData>('FieldData', FieldDataSchema);
