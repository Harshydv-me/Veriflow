import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';

// Get all tasks for a user
export const getUserTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type, completed } = req.query;

    const filter: any = { userId };

    if (type) {
      filter.type = type;
    }

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create a new task
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, type, dueDate, priority, projectId } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required',
      });
    }

    const task = await Task.create({
      userId,
      title,
      description,
      type: type || 'custom',
      dueDate,
      priority: priority || 'medium',
      projectId,
    });

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update a task
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    // Update fields
    Object.assign(task, updates);

    // If marking as completed, set completedAt
    if (updates.completed === true && !task.completedAt) {
      task.completedAt = new Date();
    } else if (updates.completed === false) {
      task.completedAt = undefined;
    }

    await task.save();

    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete a task
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get task statistics
export const getTaskStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const total = await Task.countDocuments({ userId });
    const completed = await Task.countDocuments({ userId, completed: true });
    const pending = total - completed;

    const dailyTasks = await Task.countDocuments({ userId, type: 'daily' });
    const weeklyTasks = await Task.countDocuments({ userId, type: 'weekly' });
    const monthlyTasks = await Task.countDocuments({ userId, type: 'monthly' });

    res.json({
      success: true,
      data: {
        total,
        completed,
        pending,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        byType: {
          daily: dailyTasks,
          weekly: weeklyTasks,
          monthly: monthlyTasks,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
