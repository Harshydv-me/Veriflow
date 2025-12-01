import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: {
    fiat: number; // USD balance
    crypto: number; // ETH or stablecoin balance
  };
  carbonCredits: Array<{
    creditId: string;
    amount: number;
    purchasePrice: number;
    purchaseDate: Date;
  }>;
  walletAddress?: string; // Web3 wallet address
  transactions: Array<{
    transactionId: string;
    type: 'deposit' | 'withdrawal' | 'purchase' | 'sale' | 'transfer';
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    description: string;
    relatedCreditId?: string;
    relatedUserId?: mongoose.Types.ObjectId;
    txHash?: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      fiat: {
        type: Number,
        default: 0,
        min: 0,
      },
      crypto: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    carbonCredits: [
      {
        creditId: String,
        amount: Number,
        purchasePrice: Number,
        purchaseDate: Date,
      },
    ],
    walletAddress: {
      type: String,
      sparse: true,
    },
    transactions: [
      {
        transactionId: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['deposit', 'withdrawal', 'purchase', 'sale', 'transfer'],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        currency: {
          type: String,
          default: 'USD',
        },
        status: {
          type: String,
          enum: ['pending', 'completed', 'failed', 'cancelled'],
          default: 'pending',
        },
        description: String,
        relatedCreditId: String,
        relatedUserId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        txHash: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

WalletSchema.index({ userId: 1 });
WalletSchema.index({ 'transactions.status': 1 });
WalletSchema.index({ 'transactions.type': 1 });

export default mongoose.model<IWallet>('Wallet', WalletSchema);
