import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
} from '../controllers/lead.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createLeadSchema, updateLeadSchema } from '../validators';

const router = Router();

// All lead routes require authentication
router.use(authenticate);

// CSV export (must come BEFORE /:id to avoid route conflict)
router.get('/export/csv', exportLeadsCSV);

// CRUD
router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', validate(createLeadSchema), createLead);
router.put('/:id', validate(updateLeadSchema), updateLead);
router.delete('/:id', authorize('admin'), deleteLead);

export default router;
