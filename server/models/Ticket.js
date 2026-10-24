import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Wi-Fi & Network',
      'Classroom Equipment',
      'ID Card & Access',
      'Lab Software & PC',
      'Hostel & Facility',
      'Other',
    ],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
  },
  location: {
    type: String,
    required: [true, 'Campus location is required'],
    trim: true,
  },
  contactName: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
  },
  contactEmail: {
    type: String,
    trim: true,
    default: '',
  },
  contactPhone: {
    type: String,
    trim: true,
    default: '',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open',
  },
  statusHistory: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Ticket = mongoose.model('Ticket', ticketSchema);
