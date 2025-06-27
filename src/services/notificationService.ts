import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id?: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'milestone' | 'opportunity' | 'pool';
  read: boolean;
  resource_id?: string;
  resource_type?: string;
  action_url?: string;
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expires_at?: string;
  created_at?: string;
}

class NotificationService {
  private static instance: NotificationService;
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // For now, we'll store notifications in localStorage until the notifications table is created
  private getStorageKey(userId: string): string {
    return `notifications_${userId}`;
  }

  private getNotifications(userId: string): Notification[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(userId));
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting notifications from storage:', error);
      return [];
    }
  }

  private saveNotifications(userId: string, notifications: Notification[]): void {
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  }

  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<void> {
    try {
      // For now, use localStorage. In the future, this will use Supabase
      const notifications = this.getNotifications(notification.user_id);
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      
      notifications.unshift(newNotification);
      
      // Keep only the latest 100 notifications per user
      if (notifications.length > 100) {
        notifications.splice(100);
      }
      
      this.saveNotifications(notification.user_id, notifications);

      // TODO: When notifications table is available, replace with:
      // const { error } = await supabase
      //   .from('notifications')
      //   .insert({
      //     user_id: notification.user_id,
      //     title: notification.title,
      //     message: notification.message,
      //     type: notification.type,
      //     read: notification.read,
      //     resource_id: notification.resource_id,
      //     resource_type: notification.resource_type,
      //     action_url: notification.action_url,
      //     metadata: notification.metadata,
      //     priority: notification.priority,
      //     expires_at: notification.expires_at,
      //     created_at: new Date().toISOString()
      //   });

      // Send push notification if supported
      await this.sendPushNotification(newNotification);
      
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    try {
      // For now, use localStorage. In the future, this will use Supabase
      const notifications = this.getNotifications(userId);
      return notifications.slice(0, limit);

      // TODO: When notifications table is available, replace with:
      // const { data, error } = await supabase
      //   .from('notifications')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .order('created_at', { ascending: false })
      //   .limit(limit);

      // if (error) throw error;
      // return data || [];
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      // For now, use localStorage. In the future, this will use Supabase
      const notifications = this.getNotifications(userId);
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification) {
        notification.read = true;
        this.saveNotifications(userId, notifications);
      }

      // TODO: When notifications table is available, replace with:
      // const { error } = await supabase
      //   .from('notifications')
      //   .update({ read: true })
      //   .eq('id', notificationId)
      //   .eq('user_id', userId);

      // if (error) throw error;
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      // For now, use localStorage. In the future, this will use Supabase
      const notifications = this.getNotifications(userId);
      notifications.forEach(n => n.read = true);
      this.saveNotifications(userId, notifications);

      // TODO: When notifications table is available, replace with:
      // const { error } = await supabase
      //   .from('notifications')
      //   .update({ read: true })
      //   .eq('user_id', userId)
      //   .eq('read', false);

      // if (error) throw error;
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    try {
      // For now, use localStorage. In the future, this will use Supabase
      const notifications = this.getNotifications(userId);
      const filteredNotifications = notifications.filter(n => n.id !== notificationId);
      this.saveNotifications(userId, filteredNotifications);

      // TODO: When notifications table is available, replace with:
      // const { error } = await supabase
      //   .from('notifications')
      //   .delete()
      //   .eq('id', notificationId)
      //   .eq('user_id', userId);

      // if (error) throw error;
      
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      // For now, use localStorage. In the future, this will use Supabase
      const notifications = this.getNotifications(userId);
      return notifications.filter(n => !n.read).length;

      // TODO: When notifications table is available, replace with:
      // const { count, error } = await supabase
      //   .from('notifications')
      //   .select('*', { count: 'exact', head: true })
      //   .eq('user_id', userId)
      //   .eq('read', false);

      // if (error) throw error;
      // return count || 0;
      
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      // Check if push notifications are supported and permission is granted
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
      }

      // Check if service worker is available
      if (!('serviceWorker' in navigator)) {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Send push notification via service worker
      await registration.showNotification(notification.title, {
        body: notification.message,
        icon: '/logo-192.png',
        badge: '/logo-192.png',
        data: {
          id: notification.id,
          type: notification.type,
          resource_id: notification.resource_id,
          action_url: notification.action_url,
          ...notification.metadata
        },
        tag: `notification-${notification.id}`,
        requireInteraction: notification.priority === 'urgent',
        actions: notification.action_url ? [
          {
            action: 'view',
            title: 'View',
            icon: '/logo-192.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ] : []
      });
      
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    try {
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return 'denied';
      }

      if (Notification.permission === 'granted') {
        return 'granted';
      }

      if (Notification.permission === 'denied') {
        return 'denied';
      }

      const permission = await Notification.requestPermission();
      return permission;
      
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Helper methods for common notification types
  async notifyPaymentReceived(userId: string, amount: number, currency: string, from: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Payment Received',
      message: `You received ${currency} ${amount.toLocaleString()} from ${from}`,
      type: 'payment',
      read: false,
      priority: 'high'
    });
  }

  async notifyMilestoneCompleted(userId: string, milestoneName: string, opportunityName: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Milestone Completed',
      message: `Milestone "${milestoneName}" has been completed for ${opportunityName}`,
      type: 'milestone',
      read: false,
      priority: 'medium'
    });
  }

  async notifyNewOpportunity(userId: string, opportunityName: string, opportunityId: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'New Investment Opportunity',
      message: `New opportunity "${opportunityName}" is now available`,
      type: 'opportunity',
      read: false,
      resource_id: opportunityId,
      resource_type: 'opportunity',
      action_url: `/opportunities/${opportunityId}`,
      priority: 'medium'
    });
  }

  async notifyPoolUpdate(userId: string, poolName: string, updateType: string, poolId: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Pool Update',
      message: `${updateType} in investment pool "${poolName}"`,
      type: 'pool',
      read: false,
      resource_id: poolId,
      resource_type: 'investment_pool',
      action_url: `/pool/${poolId}`,
      priority: 'low'
    });
  }
}

export const notificationService = NotificationService.getInstance();
