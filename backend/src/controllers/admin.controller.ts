import { Request, Response } from 'express';
import FieldData from '../models/FieldData';
import Project from '../models/Project';
import CarbonCredit from '../models/CarbonCredit';
import Notification from '../models/Notification';
import Wallet from '../models/Wallet';

// Get pending verifications
export const getPendingVerifications = async (req: Request, res: Response) => {
  try {
    const { type = 'all', page = 1, limit = 20 } = req.query;

    const query: any = {};

    if (type === 'field_data') {
      const fieldData = await FieldData.find({ verified: false })
        .populate('userId', 'name email')
        .populate('projectId')
        .sort({ createdAt: -1 })
        .limit(Number(limit));

      return res.json({ success: true, submissions: fieldData, type: 'field_data' });
    }

    if (type === 'projects') {
      const projects = await Project.find({ status: 'submitted' })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(Number(limit));

      return res.json({ success: true, submissions: projects, type: 'projects' });
    }

    // Get both
    const [fieldData, projects] = await Promise.all([
      FieldData.find({ verified: false })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
      Project.find({ status: 'submitted' })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({
      success: true,
      submissions: {
        fieldData,
        projects,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify field data
export const verifyFieldData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approved, carbonCreditsIssued, rejectionReason } = req.body;
    const adminId = (req as any).user.id;

    const fieldData = await FieldData.findById(id).populate('userId projectId');

    if (!fieldData) {
      return res.status(404).json({ success: false, message: 'Field data not found' });
    }

    if (approved) {
      // Approve
      fieldData.verified = true;
      fieldData.verifiedBy = adminId;
      fieldData.verifiedAt = new Date();
      await fieldData.save();

      // Update project
      const project = await Project.findOne({ projectId: fieldData.projectId });
      if (project) {
        project.status = 'verified';
        if (carbonCreditsIssued) {
          project.issuedCredits += carbonCreditsIssued;
        }
        await project.save();

        // Create carbon credits
        if (carbonCreditsIssued > 0) {
          const creditId = `CC${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
          const serialNumber = `SN${Date.now()}`;

          await CarbonCredit.create({
            creditId,
            projectId: fieldData.projectId,
            userId: fieldData.userId,
            amount: carbonCreditsIssued,
            price: 25, // Default price per credit
            status: 'available',
            vintage: new Date().getFullYear(),
            verificationStandard: 'Verified Carbon Standard',
            serialNumber,
            metadata: {
              ecosystemType: (project as any).ecosystemType,
              location: {
                country: project.location.address.split(',').pop()?.trim() || 'Unknown',
                region: project.location.address,
                coordinates: {
                  latitude: project.location.latitude,
                  longitude: project.location.longitude,
                },
              },
              methodology: 'Blue Carbon MRV',
              cobenefits: ['Biodiversity', 'Community Development', 'Ocean Health'],
            },
          });
        }
      }

      // Create notification
      await Notification.create({
        userId: fieldData.userId,
        type: 'verification',
        title: 'Data Approved',
        message: `Your field data submission has been verified${
          carbonCreditsIssued ? ` and ${carbonCreditsIssued} carbon credits have been issued` : ''
        }`,
        data: {
          projectId: fieldData.projectId as any,
          amount: carbonCreditsIssued,
        },
        priority: 'high',
      });

      res.json({
        success: true,
        message: 'Field data approved successfully',
        creditsIssued: carbonCreditsIssued,
      });
    } else {
      // Reject
      await Notification.create({
        userId: fieldData.userId,
        type: 'verification',
        title: 'Data Rejected',
        message: rejectionReason || 'Your field data submission was rejected',
        data: {
          projectId: fieldData.projectId as any,
        },
        priority: 'high',
      });

      // Optionally delete or mark as rejected
      await fieldData.deleteOne();

      res.json({
        success: true,
        message: 'Field data rejected',
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify project
export const verifyProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approved, rejectionReason, estimatedCredits } = req.body;
    const adminId = (req as any).user.id;

    const project = await Project.findById(id).populate('userId');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (approved) {
      project.status = 'verified';
      if (estimatedCredits) {
        project.estimatedCredits = estimatedCredits;
      }
      await project.save();

      await Notification.create({
        userId: project.userId,
        type: 'project_status',
        title: 'Project Approved',
        message: `Your project "${project.name}" has been approved`,
        data: { projectId: project.projectId },
        priority: 'high',
      });

      res.json({ success: true, message: 'Project approved successfully', project });
    } else {
      project.status = 'rejected';
      await project.save();

      await Notification.create({
        userId: project.userId,
        type: 'project_status',
        title: 'Project Rejected',
        message: rejectionReason || `Your project "${project.name}" was rejected`,
        data: { projectId: project.projectId },
        priority: 'high',
      });

      res.json({ success: true, message: 'Project rejected' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard stats
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [
      pendingFieldData,
      pendingProjects,
      verifiedFieldData,
      totalCreditsIssued,
    ] = await Promise.all([
      FieldData.countDocuments({ verified: false }),
      Project.countDocuments({ status: 'submitted' }),
      FieldData.countDocuments({ verified: true }),
      CarbonCredit.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        pendingReview: pendingFieldData + pendingProjects,
        pendingFieldData,
        pendingProjects,
        totalVerified: verifiedFieldData,
        totalCreditsIssued: totalCreditsIssued[0]?.total || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
