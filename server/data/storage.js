import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = process.env.VERCEL
  ? path.join(os.tmpdir(), 'requests.json')
  : path.join(__dirname, 'requests.json');

const INITIAL_REQUESTS = [
  {
    ticketId: 'CMP-1042',
    title: 'Science Block Wi-Fi Dropping Frequently',
    category: 'Wi-Fi & Network',
    description: 'The Wi-Fi access point in Science Block 2nd floor disconnects every 5 to 10 minutes, disrupting ongoing lab sessions and student submissions.',
    location: 'Science Block - 2nd Floor Corridor',
    contactName: 'Aarav Sharma',
    contactEmail: 'aarav.sharma@campus.edu',
    contactPhone: '+91 98765 43210',
    priority: 'High',
    status: 'In Progress',
    statusHistory: [
      { status: 'Open', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'Ticket created by student' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Network team dispatched to inspect router AP-04' }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    ticketId: 'CMP-1043',
    title: 'Projector HDMI port damaged in LH-301',
    category: 'Classroom Equipment',
    description: 'During morning lectures, the overhead projector keeps flickering green and loses audio connection when plugged into student laptops.',
    location: 'Lecture Hall Complex - Room 301',
    contactName: 'Prof. Meera Sen',
    contactEmail: 'm.sen@campus.edu',
    contactPhone: '+91 98111 22334',
    priority: 'Urgent',
    status: 'Open',
    statusHistory: [
      { status: 'Open', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), note: 'Ticket logged by faculty' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    ticketId: 'CMP-1044',
    title: 'RFID Turnstile Error at Girls Hostel Block B',
    category: 'ID Card & Access',
    description: 'Smart campus ID cards are failing to scan at the east entry gate turnstile. Students are having to enter manually in the physical register.',
    location: 'Hostel Block B - East Entrance Gate',
    contactName: 'Sneha Patel',
    contactEmail: 'sneha.p@campus.edu',
    contactPhone: '+91 98222 33445',
    priority: 'High',
    status: 'In Progress',
    statusHistory: [
      { status: 'Open', timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(), note: 'Reported by hostel warden' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), note: 'Security electronics technician notified' }
    ],
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    ticketId: 'CMP-1045',
    title: 'MATLAB Simulation License Error in CAD Lab',
    category: 'Lab Software & PC',
    description: 'Workstations 12 through 18 show "License Server Unreachable (Error -15)" when trying to start MATLAB for the Computational Fluid Dynamics assignment.',
    location: 'Mechanical Engineering Block - CAD Lab 2',
    contactName: 'Rohan Verma',
    contactEmail: 'rohan.v@campus.edu',
    contactPhone: '+91 98333 44556',
    priority: 'Medium',
    status: 'Open',
    statusHistory: [
      { status: 'Open', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), note: 'Logged by lab assistant' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    ticketId: 'CMP-1046',
    title: 'Library Central AC Not Cooling Reading Room',
    category: 'Hostel & Facility',
    description: 'Central HVAC air duct is blowing warm air in the quiet study area on the 3rd floor. Room temperature is exceeding 31°C making study difficult.',
    location: 'Central Library - 3rd Floor Quiet Study Hall',
    contactName: 'Devansh Kulkarni',
    contactEmail: 'devansh.k@campus.edu',
    contactPhone: '+91 98444 55667',
    priority: 'Medium',
    status: 'Resolved',
    statusHistory: [
      { status: 'Open', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), note: 'Reported by librarian' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), note: 'HVAC technician serviced chiller unit 2' },
      { status: 'Resolved', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'Cooling restored to 22°C. Verified by library staff.' }
    ],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_REQUESTS, null, 2), 'utf8');
      return INITIAL_REQUESTS;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error('Error reading requests.json, using fallback:', err.message);
    return INITIAL_REQUESTS;
  }
};

export const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to requests.json:', err.message);
    return false;
  }
};

export const getNextTicketId = () => {
  const data = readData();
  const maxNumber = data.reduce((max, item) => {
    const match = item.ticketId?.match(/CMP-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 1046);
  return `CMP-${maxNumber + 1}`;
};
