import express from 'express';
import { Task } from '../models/Task';
import { UserTask } from '../models/UserTask';
import { Currency } from '../models/Currency';
import { User } from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { sequelize } from '../config/database';

const router = express.Router();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get available tasks for user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 */
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const tasks = await Task.findAll({
      where: { isActive: true },
      include: [
        { model: Currency, as: 'rewardCurrency' }
      ]
    });

    // Get user's completed tasks
    const completedTasks = await UserTask.findAll({
      where: { userId: req.user!.id }
    });

    const completedTaskIds = completedTasks.map(ut => ut.taskId);

    // Filter out completed one-time tasks
    const availableTasks = tasks.filter(task => {
      if (task.taskType === 'one-time' && completedTaskIds.includes(task.id!)) {
        return false;
      }
      return true;
    });

    res.json({ tasks: availableTasks });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task (admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - taskType
 *               - rewardAmount
 *               - rewardCurrencyId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               taskType:
 *                 type: string
 *                 enum: [daily, weekly, monthly, one-time]
 *               rewardAmount:
 *                 type: number
 *               rewardCurrencyId:
 *                 type: integer
 *               requirements:
 *                 type: object
 *               maxCompletions:
 *                 type: integer
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post('/', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const {
      title,
      description,
      taskType,
      rewardAmount,
      rewardCurrencyId,
      requirements = {},
      maxCompletions,
      validUntil
    } = req.body;

    const task = await Task.create({
      title,
      description,
      taskType,
      rewardAmount,
      rewardCurrencyId,
      requirements,
      maxCompletions,
      validUntil,
      isActive: true // Default value for isActive
    });

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks/{id}/complete:
 *   post:
 *     summary: Complete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task completed successfully
 *       400:
 *         description: Task cannot be completed
 *       404:
 *         description: Task not found
 */
router.post('/:id/complete', authenticate, async (req: AuthRequest, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Currency, as: 'rewardCurrency' }]
    });

    if (!task || !task.isActive) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Task not found or not active' });
    }

    // Check if task is still valid
    if (task.validUntil && new Date() > task.validUntil) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Task has expired' });
    }

    // Check if user has already completed this task (for one-time tasks)
    if (task.taskType === 'one-time') {
      const existingCompletion = await UserTask.findOne({
        where: { userId: req.user!.id, taskId: task.id }
      });

      if (existingCompletion) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Task already completed' });
      }
    }

    // Check daily/weekly/monthly limits
    if (task.taskType !== 'one-time') {
      const now = new Date();
      let startDate: Date;

      switch (task.taskType) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          const dayOfWeek = now.getDay();
          startDate = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      const recentCompletion = await UserTask.findOne({
        where: {
          userId: req.user!.id,
          taskId: task.id,
          completedAt: {
            $gte: startDate
          }
        }
      });

      if (recentCompletion) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: `Task can only be completed once per ${task.taskType}` 
        });
      }
    }

    // Create task completion record
    await UserTask.create({
      userId: req.user!.id,
      taskId: task.id,
      completedAt: new Date(),
      rewardClaimed: false
    }, { transaction });

    // Add reward to user's wallet
    await User.increment('walletBalance', {
      by: task.rewardAmount,
      where: { id: req.user!.id },
      transaction
    });

    // Mark reward as claimed
    await UserTask.update(
      { rewardClaimed: true },
      {
        where: { userId: req.user!.id, taskId: task.id },
        transaction
      }
    );

    await transaction.commit();

    res.json({
      message: 'Task completed successfully',
      reward: {
        amount: task.rewardAmount,
        currency: task.rewardCurrencyId
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks/my-completions:
 *   get:
 *     summary: Get user's completed tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Completed tasks retrieved successfully
 */
router.get('/my-completions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const completions = await UserTask.findAll({
      where: { userId: req.user!.id },
      include: [
        {
          model: Task,
          as: 'Task',
          include: [{ model: Currency, as: 'rewardCurrency' }]
        }
      ],
      order: [['completedAt', 'DESC']]
    });

    res.json({ completions });
  } catch (error) {
    next(error);
  }
});

export default router;