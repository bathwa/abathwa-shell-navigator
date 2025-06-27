
import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'payment' | 'milestone' | 'opportunity' | 'pool';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationData {
  id?: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  resource_id?: string;
  resource_type?: string;
  data?: Record<string, any>;
  read?: boolean;
  created_at?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private userId: string | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  async createNotification(notification: Omit<NotificationData, 'id' | 'created_at' | 'read'>): Promise<boolean> {
    try {
      // Since we don't have a notifications table, we'll store in audit_log for now
      const { error } = await supabase
        .from('audit_log')
        .insert({
          user_id: notification.user_id,
          action_type: 'notification_created',
          resource_type: notification.resource_type || 'notification',
          resource_id: notification.resource_id,
          details_jsonb: {
            title: notification.title,
            message: notification.message,
            type: notification.type,
            priority: notification.priority,
            data: notification.data
          }
        });

      if (error) {
        console.error('Error creating notification:', error);
        return false;
      }

      // Send push notification if supported
      await this.sendPushNotification(notification);
      
      return true;
    } catch (error) {
      console.error('Error in createNotification:', error);
      return false;
    }
  }

  async sendPushNotification(notification: NotificationData): Promise<void> {
    try {
      if ('serviceWorker' in navigator && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          
          if (registration.showNotification) {
            await registration.showNotification(notification.title, {
              body: notification.message,
              icon: '/logo-192.png',
              badge: '/logo-192.png',
              tag: notification.resource_id || 'general',
              data: {
                url: this.getNotificationUrl(notification),
                ...notification.data
              },
              requireInteraction: notification.priority === 'urgent',
              silent: notification.priority === 'low'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  private getNotificationUrl(notification: NotificationData): string {
    const baseUrl = window.location.origin;
    
    switch (notification.type) {
      case 'opportunity':
        return `${baseUrl}/opportunities/${notification.resource_id}`;
      case 'payment':
        return `${baseUrl}/investor/payments`;
      case 'milestone':
        return `${baseUrl}/entrepreneur/dashboard`;
      case 'pool':
        return `${baseUrl}/pool/${notification.resource_id}`;
      default:
        return `${baseUrl}/dashboard`;
    }
  }

  // Convenience methods for common notification types
  async notifyOpportunityStatus(userId: string, opportunityId: string, status: string, title: string): Promise<boolean> {
    return this.createNotification({
      user_id: userId,
      title: title,
      message: `Opportunity status changed to: ${status}`,
      type: 'opportunity',
      priority: 'medium',
      resource_id: opportunityId,
      resource_type: 'opportunity'
    });
  }

  async notifyPaymentReceived(userId: string, amount: number, currency: string): Promise<boolean> {
    return this.createNotification({
      user_id: userId,
      title: 'Payment Received',
      message: `You received a payment of ${currency} ${amount}`,
      type: 'payment',
      priority: 'high',
      resource_type: 'payment'
    });
  }

  async notifyMilestoneCompleted(userId: string, milestoneTitle: string, opportunityId: string): Promise<boolean> {
    return this.createNotification({
      user_id: userId,
      title: 'Milestone Completed',
      message: `Milestone "${milestoneTitle}" has been completed`,
      type: 'milestone',
      priority: 'medium',
      resource_id: opportunityId,
      resource_type: 'milestone'
    });
  }

  async notifyPoolActivity(userId: string, poolId: string, activity: string): Promise<boolean> {
    return this.createNotification({
      user_id: userId,
      title: 'Pool Activity',
      message: activity,
      type: 'pool',
      priority: 'medium',
      resource_id: poolId,
      resource_type: 'investment_pool'
    });
  }

  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async subscribeToPushNotifications(): Promise<boolean> {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        
        // Note: In a real implementation, you would need to set up VAPID keys
        // For now, we'll just return true to indicate the service is available
        return true;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
    return false;
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;
