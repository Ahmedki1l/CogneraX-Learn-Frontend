export interface Announcement {
  id: string;
  title: string;
  content: string;
  recipients: string | string[]; // 'all' | 'courseId' | 'studentId'
  priority: 'low' | 'medium' | 'high';
  readCount: number;
  totalStudents: number;
  createdAt: string;
  isPinned: boolean;
  tags: string[];
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  recipients: string | string[];
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  isPinned?: boolean;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  priority?: 'low' | 'medium' | 'high';
  isPinned?: boolean;
  tags?: string[];
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin' | 'parent';
  online?: boolean;
  lastSeen?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: 'student' | 'instructor' | 'admin' | 'parent';
  avatar?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string | { _id: string; id: string; name: string; avatar?: string };
  createdAt: string;
  type: 'text' | 'image' | 'file';
  attachments?: string[];
  readBy?: string[];
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string; // For group chats
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface CreateConversationRequest {
  recipients: string[];
  type: 'direct' | 'group';
  name?: string;
}

export interface SendMessageRequest {
  content: string;
  type?: 'text' | 'image' | 'file';
  attachments?: File[];
}

export interface OfficeHour {
  id: string;
  instructorId: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'recurring' | 'one-time';
  status: 'active' | 'cancelled';
  maxSlots?: number;
  bookedSlots: number;
}

export interface Session {
  id: string;
  officeHourId?: string;
  title: string;
  type: 'individual' | 'group';
  startTime: string;
  duration: number; // in minutes
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  topic: string;
  participants: Participant[]; // Students
  instructor?: Participant;
}

export interface BookSessionRequest {
  officeHourId: string;
  topic: string;
  type: 'individual' | 'group';
}
