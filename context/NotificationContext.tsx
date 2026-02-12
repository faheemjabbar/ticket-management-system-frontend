'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: 'ticket_assigned' | 'ticket_updated' | 'ticket_closed' | 'comment_added' | 'project_updated';
  title: string;
  message: string;
  userId: string;
  ticketId?: string;
  projectId?: string;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  socket: Socket | null;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    // Connect to WebSocket server
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5050';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      // Register user for notifications
      newSocket.emit('register', user.id);
    });

    // Listen to generic notification event (user-specific)
    newSocket.on('notification', (notification: Notification) => {
      console.log('New notification:', notification);
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      
      // Show toast notification
      toast.success(notification.message, {
        duration: 4000,
        icon: '🔔',
      });
      
      // Emit custom event for components to listen to
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    });

    // Listen to ticket assignment notifications
    newSocket.on('ticket:assigned', (data: { ticketId: string; ticketTitle: string; assignedTo: string }) => {
      console.log('Ticket assigned:', data);
      
      const notification: Notification = {
        id: `${Date.now()}-assigned`,
        type: 'ticket_assigned',
        title: 'Ticket Assigned',
        message: `You have been assigned to: ${data.ticketTitle}`,
        userId: user.id,
        ticketId: data.ticketId,
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      setNotifications(prev => [notification, ...prev]);
      toast.success(notification.message, { icon: '📋', duration: 5000 });
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    });

    // Listen to ticket status changes
    newSocket.on('ticket:status-changed', (data: { ticketId: string; ticketTitle: string; oldStatus: string; newStatus: string }) => {
      console.log('Ticket status changed:', data);
      
      const notification: Notification = {
        id: `${Date.now()}-status`,
        type: 'ticket_updated',
        title: 'Ticket Status Changed',
        message: `"${data.ticketTitle}" moved from ${data.oldStatus} to ${data.newStatus}`,
        userId: user.id,
        ticketId: data.ticketId,
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      setNotifications(prev => [notification, ...prev]);
      toast(notification.message, { icon: '🔄', duration: 4000 });
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    });

    // Listen to ticket updates
    newSocket.on('ticket:update', (data: { ticketId: string; ticketTitle: string; updatedBy: string }) => {
      console.log('Ticket updated:', data);
      
      const notification: Notification = {
        id: `${Date.now()}-update`,
        type: 'ticket_updated',
        title: 'Ticket Updated',
        message: `"${data.ticketTitle}" was updated by ${data.updatedBy}`,
        userId: user.id,
        ticketId: data.ticketId,
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      setNotifications(prev => [notification, ...prev]);
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    });

    // Listen to new ticket creation
    newSocket.on('ticket:created', (data: { ticketId: string; ticketTitle: string; createdBy: string }) => {
      console.log('New ticket created:', data);
      
      const notification: Notification = {
        id: `${Date.now()}-created`,
        type: 'ticket_updated',
        title: 'New Ticket',
        message: `New ticket created: "${data.ticketTitle}"`,
        userId: user.id,
        ticketId: data.ticketId,
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      setNotifications(prev => [notification, ...prev]);
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    });

    // Listen to comment additions
    newSocket.on('comment:added', (data: { ticketId: string; ticketTitle: string; commentBy: string; comment: string }) => {
      console.log('Comment added:', data);
      
      const notification: Notification = {
        id: `${Date.now()}-comment`,
        type: 'comment_added',
        title: 'New Comment',
        message: `${data.commentBy} commented on "${data.ticketTitle}"`,
        userId: user.id,
        ticketId: data.ticketId,
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      setNotifications(prev => [notification, ...prev]);
      toast(notification.message, { icon: '💬', duration: 4000 });
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    });

    // Listen to ticket closed
    newSocket.on('ticket:closed', (data: { ticketId: string; ticketTitle: string; closedBy: string }) => {
      console.log('Ticket closed:', data);
      
      const notification: Notification = {
        id: `${Date.now()}-closed`,
        type: 'ticket_closed',
        title: 'Ticket Closed',
        message: `"${data.ticketTitle}" was closed by ${data.closedBy}`,
        userId: user.id,
        ticketId: data.ticketId,
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      setNotifications(prev => [notification, ...prev]);
      toast.success(notification.message, { icon: '✅', duration: 4000 });
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    });

    // Listen to project updates
    newSocket.on('project:update', (data: { projectId: string; projectName: string; updatedBy: string }) => {
      console.log('Project updated:', data);
      
      const notification: Notification = {
        id: `${Date.now()}-project`,
        type: 'project_updated',
        title: 'Project Updated',
        message: `Project "${data.projectName}" was updated by ${data.updatedBy}`,
        userId: user.id,
        projectId: data.projectId,
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      setNotifications(prev => [notification, ...prev]);
      window.dispatchEvent(new CustomEvent('project-updated'));
    });

    // Listen to activity updates
    newSocket.on('activity:new', (data: { activity: string; user: string }) => {
      console.log('New activity:', data);
      window.dispatchEvent(new CustomEvent('activity-updated'));
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user?.id]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        socket,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
