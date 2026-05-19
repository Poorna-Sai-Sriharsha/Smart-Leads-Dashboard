import { Response, NextFunction } from 'express';
import Lead from '../models/Lead.model';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { IAuthRequest, ILeadQuery, IPaginationMeta } from '../types';
import { FilterQuery } from 'mongoose';
import { ILead } from '../types';

// get all leads with pagination, filtering, search, and sorting
export const getLeads = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      source,
      search,
      sortBy = 'latest',
    } = req.query as unknown as ILeadQuery;

    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit || '10', 10)));
    const skip = (pageNum - 1) * limitNum;

    // build filter object based on query params
    const filter: FilterQuery<ILead> = {};

    if (status) filter.status = status;
    if (source) filter.source = source;

    // regex search across name and email fields
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    const sortOrder = sortBy === 'oldest' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .populate('assignedTo', 'name email role')
        .lean(),
      Lead.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    const meta: IPaginationMeta = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    };

    ApiResponse.success(res, 200, 'Leads retrieved successfully', leads, meta);
  } catch (err) {
    next(err);
  }
};

// get a single lead by its ID
export const getLeadById = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .lean();

    if (!lead) throw ApiError.notFound('Lead not found');

    ApiResponse.success(res, 200, 'Lead retrieved', lead);
  } catch (err) {
    next(err);
  }
};

// create a new lead and assign it to the current user
export const createLead = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.create({
      ...req.body,
      assignedTo: req.user?.id,
    });

    ApiResponse.success(res, 201, 'Lead created successfully', lead.toJSON());
  } catch (err) {
    next(err);
  }
};

// update an existing lead
export const updateLead = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();

    if (!lead) throw ApiError.notFound('Lead not found');

    ApiResponse.success(res, 200, 'Lead updated successfully', lead);
  } catch (err) {
    next(err);
  }
};

// delete a lead (admin only — enforced at the route level)
export const deleteLead = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id).lean();
    if (!lead) throw ApiError.notFound('Lead not found');

    ApiResponse.success(res, 200, 'Lead deleted successfully', { id: lead._id });
  } catch (err) {
    next(err);
  }
};

// export leads as a CSV file with optional filters
export const exportLeadsCSV = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, source, search } = req.query as unknown as ILeadQuery;

    const filter: FilterQuery<ILead> = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email')
      .lean();

    const headers = ['Name', 'Email', 'Status', 'Source', 'Assigned To', 'Created At'];
    const rows = leads.map((lead) => {
      const assignee = lead.assignedTo as { name?: string } | undefined;
      return [
        `"${lead.name}"`,
        `"${lead.email}"`,
        lead.status,
        lead.source,
        `"${assignee?.name || 'Unassigned'}"`,
        new Date(lead.createdAt).toISOString(),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=leads_export_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};
