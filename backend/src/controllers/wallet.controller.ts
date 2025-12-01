import { Request, Response } from 'express';
import Wallet from '../models/Wallet';
import Notification from '../models/Notification';

// Get wallet balance
export const getWalletBalance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: { fiat: 0, crypto: 0 },
        carbonCredits: [],
        transactions: [],
      });
      await wallet.save();
    }

    res.json({ success: true, wallet });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get transaction history
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 20, type } = req.query;

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.json({ success: true, transactions: [], total: 0 });
    }

    let transactions = wallet.transactions;

    // Filter by type
    if (type) {
      transactions = transactions.filter((t: any) => t.type === type);
    }

    // Sort by date (newest first)
    transactions.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedTransactions = transactions.slice(skip, skip + Number(limit));

    res.json({
      success: true,
      transactions: paginatedTransactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: transactions.length,
        pages: Math.ceil(transactions.length / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deposit funds
export const depositFunds = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { amount, currency = 'USD', paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: { fiat: 0, crypto: 0 },
      });
    }

    // In production, integrate with payment gateway (Stripe, PayPal, etc.)
    const transactionId = `DEP${Date.now()}`;

    // Update balance
    if (currency === 'USD') {
      wallet.balance.fiat += amount;
    } else if (currency === 'ETH') {
      wallet.balance.crypto += amount;
    }

    // Add transaction
    wallet.transactions.push({
      transactionId,
      type: 'deposit',
      amount,
      currency,
      status: 'completed',
      description: `Deposit ${amount} ${currency} via ${paymentMethod}`,
      createdAt: new Date(),
    });

    await wallet.save();

    // Create notification
    await Notification.create({
      userId,
      type: 'system',
      title: 'Deposit Successful',
      message: `${amount} ${currency} has been added to your wallet`,
      data: { amount, currency, transactionId },
      priority: 'low',
    });

    res.json({
      success: true,
      message: 'Deposit successful',
      wallet,
      transaction: {
        transactionId,
        amount,
        currency,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Withdraw funds
export const withdrawFunds = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { amount, currency = 'USD', withdrawMethod, accountDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    // Check balance
    if (currency === 'USD' && wallet.balance.fiat < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient fiat balance' });
    } else if (currency === 'ETH' && wallet.balance.crypto < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient crypto balance' });
    }

    // In production, integrate with payment gateway for withdrawal processing
    const transactionId = `WTH${Date.now()}`;

    // Update balance
    if (currency === 'USD') {
      wallet.balance.fiat -= amount;
    } else if (currency === 'ETH') {
      wallet.balance.crypto -= amount;
    }

    // Add transaction
    wallet.transactions.push({
      transactionId,
      type: 'withdrawal',
      amount: -amount,
      currency,
      status: 'pending', // Would be 'completed' after payment gateway confirms
      description: `Withdraw ${amount} ${currency} via ${withdrawMethod}`,
      createdAt: new Date(),
    });

    await wallet.save();

    // Create notification
    await Notification.create({
      userId,
      type: 'system',
      title: 'Withdrawal Processing',
      message: `Your withdrawal of ${amount} ${currency} is being processed`,
      data: { amount, currency, transactionId },
      priority: 'medium',
    });

    res.json({
      success: true,
      message: 'Withdrawal request submitted',
      transaction: {
        transactionId,
        amount,
        currency,
        status: 'pending',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Transfer credits to another user
export const transferCredits = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { recipientEmail, creditId, quantity } = req.body;

    // TODO: Implement credit transfer logic
    // 1. Find recipient user
    // 2. Find credit in sender's wallet
    // 3. Transfer ownership
    // 4. Update both wallets
    // 5. Create blockchain transaction
    // 6. Send notifications

    res.json({
      success: true,
      message: 'Transfer functionality coming soon',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
