import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import FieldData from '../models/FieldData';
import Project from '../models/Project';
import ipfsService from '../services/ipfs.service';
import { MRVService } from '../services/mrv.service';

export const submitFieldData = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, measurements, location, images, notes } = req.body;

    // Verify project exists
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Generate unique data ID
    const dataId = `DATA-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Validate field data
    const validation = MRVService.validateFieldData({ measurements, location, images });
    if (!validation.valid) {
      return res.status(400).json({ error: 'Invalid field data', details: validation.errors });
    }

    // Prepare data for IPFS
    const fieldDataPayload = {
      dataId,
      projectId,
      measurements,
      location,
      images,
      notes,
      timestamp: new Date().toISOString(),
      collector: req.user.email,
    };

    // Pin to IPFS
    const { ipfsHash, ipfsUrl } = await ipfsService.pinJSON(fieldDataPayload, `fielddata-${dataId}`);

    // Create field data in database
    const fieldData = await FieldData.create({
      dataId,
      projectId,
      userId: req.user.id,
      collector: req.user.email,
      measurements,
      location,
      images,
      ipfsHash,
      ipfsUrl,
      notes: notes || '',
      verified: false,
    });

    res.status(201).json({
      success: true,
      fieldData,
    });
  } catch (error: any) {
    console.error('Submit field data error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getFieldDataByProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const fieldData = await FieldData.find({ projectId })
      .populate('userId', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: fieldData.length,
      fieldData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFieldDataById = async (req: AuthRequest, res: Response) => {
  try {
    const fieldData = await FieldData.findOne({ dataId: req.params.dataId })
      .populate('userId', 'name email')
      .populate('verifiedBy', 'name email');

    if (!fieldData) {
      return res.status(404).json({ error: 'Field data not found' });
    }

    res.json({
      success: true,
      fieldData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyFieldData = async (req: AuthRequest, res: Response) => {
  try {
    const { approved, blockchainTxHash } = req.body;

    const fieldData = await FieldData.findOne({ dataId: req.params.dataId });

    if (!fieldData) {
      return res.status(404).json({ error: 'Field data not found' });
    }

    fieldData.verified = approved;
    fieldData.verifiedBy = req.user.id;
    fieldData.verifiedAt = new Date();
    if (blockchainTxHash) {
      fieldData.blockchainTxHash = blockchainTxHash;
    }

    await fieldData.save();

    res.json({
      success: true,
      fieldData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllFieldData = async (req: AuthRequest, res: Response) => {
  try {
    const { verified } = req.query;
    const filter: any = {};

    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    const fieldData = await FieldData.find(filter)
      .populate('userId', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: fieldData.length,
      fieldData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
