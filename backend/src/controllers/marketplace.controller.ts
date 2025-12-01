import { Request, Response } from 'express';
import CarbonCredit from '../models/CarbonCredit';
import Wallet from '../models/Wallet';
import Notification from '../models/Notification';

// Get all available carbon credits
export const getBrowseCredits = async (req: Request, res: Response) => {
  try {
    const {
      ecosystem,
      minPrice,
      maxPrice,
      vintage,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query: any = { status: 'available' };

    // Filters
    if (ecosystem && ecosystem !== 'all') {
      query['metadata.ecosystemType'] = ecosystem;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (vintage) {
      query.vintage = Number(vintage);
    }

    if (search) {
      query.$or = [
        { 'metadata.ecosystemType': { $regex: search, $options: 'i' } },
        { 'metadata.location.country': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [credits, total] = await Promise.all([
      CarbonCredit.find(query)
        .populate('userId', 'name organization')
        .populate('currentOwner', 'name organization')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      CarbonCredit.countDocuments(query),
    ]);

    res.json({
      success: true,
      credits,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get credit details
export const getCreditDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const credit = await CarbonCredit.findById(id)
      .populate('userId', 'name email organization')
      .populate('currentOwner', 'name email organization')
      .populate('purchaseHistory.buyer', 'name organization')
      .populate('purchaseHistory.seller', 'name organization');

    if (!credit) {
      return res.status(404).json({ success: false, message: 'Credit not found' });
    }

    res.json({ success: true, credit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Purchase carbon credits
export const purchaseCredits = async (req: Request, res: Response) => {
  try {
    const { creditId, quantity, paymentMethod } = req.body;
    const userId = (req as any).user.id;

    // Find credit
    const credit = await CarbonCredit.findById(creditId);
    if (!credit) {
      return res.status(404).json({ success: false, message: 'Credit not found' });
    }

    if (credit.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Credit not available' });
    }

    if (credit.amount < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient credits available' });
    }

    const totalPrice = credit.price * quantity;

    // Get or create buyer wallet
    let buyerWallet = await Wallet.findOne({ userId });
    if (!buyerWallet) {
      buyerWallet = new Wallet({ userId, balance: { fiat: 0, crypto: 0 } });
    }

    // Check balance (simplified - in production, integrate payment gateway)
    if (paymentMethod === 'fiat' && buyerWallet.balance.fiat < totalPrice) {
      return res.status(400).json({ success: false, message: 'Insufficient fiat balance' });
    }

    // Process purchase
    const transactionId = `TXN${Date.now()}`;

    // Update credit
    credit.amount -= quantity;
    if (credit.amount === 0) {
      credit.status = 'sold';
    }
    credit.currentOwner = userId as any;
    credit.purchaseHistory.push({
      buyer: userId as any,
      seller: credit.userId,
      price: credit.price,
      quantity,
      transactionDate: new Date(),
      txHash: transactionId, // In production, this would be blockchain tx hash
    });
    await credit.save();

    // Update buyer wallet
    buyerWallet.balance.fiat -= totalPrice;
    buyerWallet.carbonCredits.push({
      creditId: credit.creditId,
      amount: quantity,
      purchasePrice: credit.price,
      purchaseDate: new Date(),
    });
    buyerWallet.transactions.push({
      transactionId,
      type: 'purchase',
      amount: -totalPrice,
      currency: 'USD',
      status: 'completed',
      description: `Purchased ${quantity} carbon credits`,
      relatedCreditId: credit.creditId,
      createdAt: new Date(),
    });
    await buyerWallet.save();

    // Update seller wallet
    const sellerWallet = await Wallet.findOne({ userId: credit.userId });
    if (sellerWallet) {
      sellerWallet.balance.fiat += totalPrice;
      sellerWallet.transactions.push({
        transactionId,
        type: 'sale',
        amount: totalPrice,
        currency: 'USD',
        status: 'completed',
        description: `Sold ${quantity} carbon credits`,
        relatedCreditId: credit.creditId,
        relatedUserId: userId as any,
        createdAt: new Date(),
      });
      await sellerWallet.save();
    }

    // Create notifications
    await Notification.create([
      {
        userId,
        type: 'purchase',
        title: 'Purchase Successful',
        message: `You purchased ${quantity} carbon credits for $${totalPrice}`,
        data: { creditId: credit.creditId, amount: quantity, transactionId },
        priority: 'medium',
      },
      {
        userId: credit.userId,
        type: 'sale',
        title: 'Credits Sold',
        message: `Your ${quantity} carbon credits were sold for $${totalPrice}`,
        data: { creditId: credit.creditId, amount: quantity, transactionId, relatedUserId: userId },
        priority: 'medium',
      },
    ]);

    res.json({
      success: true,
      message: 'Purchase completed successfully',
      transaction: {
        transactionId,
        creditId: credit.creditId,
        quantity,
        totalPrice,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get trending projects
export const getTrendingProjects = async (req: Request, res: Response) => {
  try {
    const credits = await CarbonCredit.find({ status: 'available' })
      .populate('userId', 'name organization')
      .sort({ 'purchaseHistory.length': -1, createdAt: -1 })
      .limit(10);

    res.json({ success: true, credits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
