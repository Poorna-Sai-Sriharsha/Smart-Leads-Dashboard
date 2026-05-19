import mongoose, { Schema } from 'mongoose';
import { ILead, LeadStatus, LeadSource } from '../types';

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Qualified', 'Lost'] as LeadStatus[],
        message: 'Status must be New, Contacted, Qualified, or Lost',
      },
      default: 'New',
    },
    source: {
      type: String,
      enum: {
        values: ['Website', 'Referral', 'Instagram'] as LeadSource[],
        message: 'Source must be Website, Referral, or Instagram',
      },
      required: [true, 'Lead source is required'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// indexes for faster filtering and search queries
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ status: 1, source: 1 });
leadSchema.index({ name: 'text', email: 'text' });

const Lead = mongoose.model<ILead>('Lead', leadSchema);
export default Lead;
