import mongoose, { Document, Schema } from 'mongoose';

export interface ICarbonCredit extends Document {
  creditId: string;
  projectId: string;
  userId: mongoose.Types.ObjectId;
  amount: number; // in tons of CO2
  price: number; // price per credit in USD
  currency: string;
  status: 'available' | 'reserved' | 'sold' | 'retired';
  vintage: number; // year of carbon sequestration
  verificationStandard: string; // e.g., "Verified Carbon Standard", "Gold Standard"
  serialNumber: string;
  blockchainTokenId?: string;
  blockchainTxHash?: string;
  metadata: {
    ecosystemType: string;
    location: {
      country: string;
      region: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
    methodology: string;
    cobenefits: string[]; // e.g., ["Biodiversity", "Community Development"]
  };
  currentOwner?: mongoose.Types.ObjectId;
  purchaseHistory: Array<{
    buyer: mongoose.Types.ObjectId;
    seller: mongoose.Types.ObjectId;
    price: number;
    quantity: number;
    transactionDate: Date;
    txHash?: string;
  }>;
  retiredAt?: Date;
  retiredBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CarbonCreditSchema = new Schema<ICarbonCredit>(
  {
    creditId: {
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold', 'retired'],
      default: 'available',
      index: true,
    },
    vintage: {
      type: Number,
      required: true,
    },
    verificationStandard: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    blockchainTokenId: String,
    blockchainTxHash: String,
    metadata: {
      ecosystemType: {
        type: String,
        required: true,
      },
      location: {
        country: String,
        region: String,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
      methodology: String,
      cobenefits: [String],
    },
    currentOwner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    purchaseHistory: [
      {
        buyer: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        seller: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        price: Number,
        quantity: Number,
        transactionDate: Date,
        txHash: String,
      },
    ],
    retiredAt: Date,
    retiredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

CarbonCreditSchema.index({ status: 1, price: 1 });
CarbonCreditSchema.index({ vintage: 1 });
CarbonCreditSchema.index({ 'metadata.ecosystemType': 1 });
CarbonCreditSchema.index({ currentOwner: 1 });

export default mongoose.model<ICarbonCredit>('CarbonCredit', CarbonCreditSchema);
