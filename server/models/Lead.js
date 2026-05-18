import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    value: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'negotiation', 'closed'],
      default: 'new',
    },
    source: { type: String, default: 'website' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
