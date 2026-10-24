import express from 'express';
import { Ticket } from '../models/Ticket.js';
import { getStorageMode } from '../config/db.js';
import { readData, writeData, getNextTicketId } from '../data/storage.js';

const router = express.Router();

const VALID_CATEGORIES = [
  'Wi-Fi & Network',
  'Classroom Equipment',
  'ID Card & Access',
  'Lab Software & PC',
  'Hostel & Facility',
  'Other',
];

const VALID_STATUSES = ['Open', 'In Progress', 'Resolved'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

// Validation helper
const validateTicketInput = (body) => {
  const errors = [];
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long.');
  }
  if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (!body.description || typeof body.description !== 'string' || body.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long.');
  }
  if (!body.location || typeof body.location !== 'string' || body.location.trim().length < 2) {
    errors.push('Location is required (e.g., Science Block, Room 204).');
  }
  if (!body.contactName || typeof body.contactName !== 'string' || body.contactName.trim().length < 2) {
    errors.push('Contact name is required.');
  }
  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  return errors;
};

// 1. GET /api/tickets - List all tickets with optional search, filter, and sort
router.get('/', async (req, res) => {
  try {
    const { q, category, status, priority, sortBy = 'newest' } = req.query;
    const mode = getStorageMode();

    let tickets = [];

    if (mode === 'mongodb') {
      const filter = {};
      if (category && category !== 'All') filter.category = category;
      if (status && status !== 'All') filter.status = status;
      if (priority && priority !== 'All') filter.priority = priority;
      if (q) {
        filter.$or = [
          { ticketId: { $regex: q, $options: 'i' } },
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } },
          { contactName: { $regex: q, $options: 'i' } },
        ];
      }
      const sort = sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
      tickets = await Ticket.find(filter).sort(sort).lean();
    } else {
      // File-storage mode
      tickets = readData();

      // Filter by search query
      if (q && q.trim()) {
        const queryLower = q.trim().toLowerCase();
        tickets = tickets.filter(
          (t) =>
            t.ticketId.toLowerCase().includes(queryLower) ||
            t.title.toLowerCase().includes(queryLower) ||
            t.description.toLowerCase().includes(queryLower) ||
            t.location.toLowerCase().includes(queryLower) ||
            t.contactName.toLowerCase().includes(queryLower)
        );
      }

      // Filter by category
      if (category && category !== 'All') {
        tickets = tickets.filter((t) => t.category === category);
      }

      // Filter by status
      if (status && status !== 'All') {
        tickets = tickets.filter((t) => t.status === status);
      }

      // Filter by priority
      if (priority && priority !== 'All') {
        tickets = tickets.filter((t) => t.priority === priority);
      }

      // Sort
      tickets.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
      });
    }

    res.json({
      success: true,
      storageMode: mode,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching tickets', error: error.message });
  }
});

// 2. GET /api/stats - Statistics summary
router.get('/stats', async (req, res) => {
  try {
    const mode = getStorageMode();
    let tickets = [];

    if (mode === 'mongodb') {
      tickets = await Ticket.find().lean();
    } else {
      tickets = readData();
    }

    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'Open').length;
    const inProgress = tickets.filter((t) => t.status === 'In Progress').length;
    const resolved = tickets.filter((t) => t.status === 'Resolved').length;

    const byCategory = VALID_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = tickets.filter((t) => t.category === cat).length;
      return acc;
    }, {});

    res.json({
      success: true,
      storageMode: mode,
      stats: {
        total,
        open,
        inProgress,
        resolved,
        byCategory,
      },
    });
  } catch (error) {
    console.error('Error computing stats:', error);
    res.status(500).json({ success: false, message: 'Server error calculating stats' });
  }
});

// 3. GET /api/tickets/:id - Single ticket by ticketId
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mode = getStorageMode();
    let ticket = null;

    if (mode === 'mongodb') {
      ticket = await Ticket.findOne({ $or: [{ ticketId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    } else {
      const tickets = readData();
      ticket = tickets.find((t) => t.ticketId === id || t._id === id);
    }

    if (!ticket) {
      return res.status(404).json({ success: false, message: `Ticket ${id} not found.` });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving ticket', error: error.message });
  }
});

// 4. POST /api/tickets - Create a new ticket
router.post('/', async (req, res) => {
  try {
    const validationErrors = validateTicketInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    const {
      title,
      category,
      description,
      location,
      contactName,
      contactEmail = '',
      contactPhone = '',
      priority = 'Medium',
    } = req.body;

    const mode = getStorageMode();
    const newTicketId = getNextTicketId();
    const now = new Date();

    const ticketData = {
      ticketId: newTicketId,
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      priority,
      status: 'Open',
      statusHistory: [
        {
          status: 'Open',
          timestamp: now.toISOString(),
          note: `Ticket submitted by ${contactName.trim()}`,
        },
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    let createdTicket;

    if (mode === 'mongodb') {
      createdTicket = await Ticket.create(ticketData);
    } else {
      const currentList = readData();
      currentList.unshift(ticketData);
      writeData(currentList);
      createdTicket = ticketData;
    }

    console.log(`[Tickets] New ticket created: ${newTicketId} - ${title}`);

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully',
      data: createdTicket,
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support request',
      error: error.message,
    });
  }
});

// 5. PATCH /api/tickets/:id/status - Update ticket status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note = '' } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const mode = getStorageMode();
    const now = new Date();

    if (mode === 'mongodb') {
      const ticket = await Ticket.findOne({
        $or: [{ ticketId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });

      if (!ticket) {
        return res.status(404).json({ success: false, message: `Ticket ${id} not found.` });
      }

      ticket.status = status;
      ticket.updatedAt = now;
      ticket.statusHistory.push({
        status,
        timestamp: now,
        note: note || `Status updated to ${status}`,
      });

      await ticket.save();
      return res.json({
        success: true,
        message: `Status updated to ${status}`,
        data: ticket,
      });
    } else {
      const tickets = readData();
      const index = tickets.findIndex((t) => t.ticketId === id || t._id === id);

      if (index === -1) {
        return res.status(404).json({ success: false, message: `Ticket ${id} not found.` });
      }

      tickets[index].status = status;
      tickets[index].updatedAt = now.toISOString();
      if (!tickets[index].statusHistory) tickets[index].statusHistory = [];
      tickets[index].statusHistory.push({
        status,
        timestamp: now.toISOString(),
        note: note || `Status updated to ${status}`,
      });

      writeData(tickets);

      return res.json({
        success: true,
        message: `Status updated to ${status}`,
        data: tickets[index],
      });
    }
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
});

// 6. DELETE /api/tickets/:id - Delete ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mode = getStorageMode();

    if (mode === 'mongodb') {
      const result = await Ticket.findOneAndDelete({
        $or: [{ ticketId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });
      if (!result) {
        return res.status(404).json({ success: false, message: 'Ticket not found.' });
      }
    } else {
      const tickets = readData();
      const filtered = tickets.filter((t) => t.ticketId !== id && t._id !== id);
      if (filtered.length === tickets.length) {
        return res.status(404).json({ success: false, message: 'Ticket not found.' });
      }
      writeData(filtered);
    }

    res.json({ success: true, message: `Ticket ${id} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting ticket', error: error.message });
  }
});

export default router;
