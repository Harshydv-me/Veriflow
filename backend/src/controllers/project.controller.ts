import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import Project from '../models/Project';
import ipfsService from '../services/ipfs.service';
import { MRVService } from '../services/mrv.service';

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, ecosystemType, location, area, images, documents } = req.body;

    // Generate unique project ID
    const projectId = `PROJ-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Prepare data for IPFS
    const projectData = {
      projectId,
      name,
      description,
      ecosystemType,
      location,
      area,
      timestamp: new Date().toISOString(),
      submittedBy: req.user.email,
    };

    // Pin to IPFS
    const { ipfsHash, ipfsUrl } = await ipfsService.pinJSON(projectData, `project-${projectId}`);

    // Calculate estimated credits
    const mrvCalculation = MRVService.calculateCarbonCredits(area, ecosystemType);

    // Create project in database
    const project = await Project.create({
      projectId,
      userId: req.user.id,
      walletAddress: req.user.walletAddress || req.user.email,
      name,
      description,
      ecosystemType,
      location,
      area,
      ipfsHash,
      ipfsUrl,
      status: 'submitted',
      estimatedCredits: mrvCalculation.estimatedCarbonCredits,
      images: images || [],
      documents: documents || [],
    });

    res.status(201).json({
      success: true,
      project,
      mrvCalculation,
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findOne({
      projectId: req.params.projectId,
    }).populate('userId', 'name email organization');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllProjects = async (req: AuthRequest, res: Response) => {
  try {
    const { status, ecosystemType } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (ecosystemType) filter.ecosystemType = ecosystemType;

    const projects = await Project.find(filter)
      .populate('userId', 'name email organization')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProjectStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, estimatedCredits, blockchainTxHash } = req.body;

    const project = await Project.findOne({ projectId: req.params.projectId });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (status) project.status = status;
    if (estimatedCredits !== undefined) project.estimatedCredits = estimatedCredits;
    if (blockchainTxHash) project.blockchainTxHash = blockchainTxHash;

    await project.save();

    res.json({
      success: true,
      project,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
