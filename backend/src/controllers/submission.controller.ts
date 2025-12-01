import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Submission from '../models/Submission';
import Notification from '../models/Notification';

// Create a new submission
export const createSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      projectId,
      measurements,
      location,
      images,
      documents,
      notes,
    } = req.body;

    if (!projectId || !location) {
      return res.status(400).json({
        success: false,
        error: 'Project ID and location are required',
      });
    }

    // Generate submission ID
    const count = await Submission.countDocuments();
    const submissionId = `SUB-${String(count + 1).padStart(5, '0')}`;

    const submission = await Submission.create({
      submissionId,
      userId,
      projectId,
      measurements,
      location,
      images: images || { mangrove: [], area: [], monitoring: [] },
      documents: documents || [],
      notes: notes || '',
      status: 'pending',
      submittedAt: new Date(),
    });

    // Create notification for admin
    await Notification.create({
      userId, // Could be admin user ID
      type: 'submission',
      title: 'New Submission Received',
      message: `New field data submission ${submissionId} is pending review`,
      read: false,
    });

    res.status(201).json({
      success: true,
      data: submission,
      message: 'Submission created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get user's submissions
export const getUserSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    const filter: any = { userId };

    if (status) {
      filter.status = status;
    }

    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 })
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      data: submissions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get submission by ID
export const getSubmissionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found',
      });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Admin: Get all submissions
export const getAllSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const { status, projectId } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (projectId) {
      filter.projectId = projectId;
    }

    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 })
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      data: submissions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Admin: Review submission
export const reviewSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { id } = req.params;
    const { status, adminFeedback, blockchainTxHash } = req.body;

    if (!['approved', 'rejected', 'revision_requested'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    const submission = await Submission.findById(id).populate('userId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found',
      });
    }

    submission.status = status;
    submission.adminFeedback = adminFeedback;
    submission.reviewedBy = adminId;
    submission.reviewedAt = new Date();

    if (blockchainTxHash) {
      submission.blockchainTxHash = blockchainTxHash;
    }

    await submission.save();

    // Create notification for the submitter
    await Notification.create({
      userId: submission.userId,
      type: 'submission_review',
      title: `Submission ${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Needs Revision'}`,
      message: adminFeedback || `Your submission ${submission.submissionId} has been ${status}`,
      relatedId: submission._id.toString(),
      read: false,
    });

    res.json({
      success: true,
      data: submission,
      message: `Submission ${status} successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get submission statistics
export const getSubmissionStats = async (req: AuthRequest, res: Response) => {
  try {
    const total = await Submission.countDocuments();
    const pending = await Submission.countDocuments({ status: 'pending' });
    const approved = await Submission.countDocuments({ status: 'approved' });
    const rejected = await Submission.countDocuments({ status: 'rejected' });

    res.json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        approvalRate: total > 0 ? (approved / total) * 100 : 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
