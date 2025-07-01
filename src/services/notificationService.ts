
import { supabase } from '@/integrations/supabase/client';

export interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'milestone' | 'opportunity' | 'pool';
  resource_id?: string;
  resource_type?: string;
  action_url?: string;
  read_at?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export class NotificationService {
  static async createNotification(data: NotificationData) {
    try {
      // Log the notification creation for audit purposes
      await supabase
        .from('audit_log')
        .insert({
          action_type: 'create',
          resource_type: 'notification',
          resource_id: data.resource_id,
          details_jsonb: {
            notification_type: data.type,
            title: data.title,
            priority: data.priority
          }
        });

      // In a real implementation, this would create a notification
      // For now, we'll just log it
      console.log('Notification created:', data);
      
      return { success: true };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error };
    }
  }

  static async sendPushNotification(data: NotificationData) {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        
        // In a real implementation, you would send this to your push service
        console.log('Push notification would be sent:', data);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { success: false, error };
    }
  }

  static async requestNotificationPermission() {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  static async subscribeToPush() {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'your-vapid-public-key' // Replace with actual VAPID key
        });
        
        // Send subscription to your server
        console.log('Push subscription:', subscription);
        
        return subscription;
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }

  // Notification types for different events
  static async notifyInvestmentOffer(entrepreneurId: string, opportunityId: string, amount: number) {
    return this.createNotification({
      user_id: entrepreneurId,
      title: 'New Investment Offer',
      message: `You have received a new investment offer of $${amount.toLocaleString()}`,
      type: 'opportunity',
      resource_id: opportunityId,
      resource_type: 'opportunity',
      action_url: `/entrepreneur/opportunities/${opportunityId}`,
      priority: 'high'
    });
  }

  static async notifyPaymentReceived(userId: string, amount: number, opportunityName: string) {
    return this.createNotification({
      user_id: userId,
      title: 'Payment Received',
      message: `Payment of $${amount.toLocaleString()} received for ${opportunityName}`,
      type: 'payment',
      priority: 'high'
    });
  }

  static async notifyMilestoneDeadline(userId: string, milestoneTitle: string, daysUntilDue: number) {
    return this.createNotification({
      user_id: userId,
      title: 'Milestone Deadline Approaching',
      message: `"${milestoneTitle}" is due in ${daysUntilDue} days`,
      type: 'milestone',
      priority: daysUntilDue <= 3 ? 'urgent' : 'medium'
    });
  }

  static async notifyPoolElection(poolId: string, memberIds: string[]) {
    const notifications = memberIds.map(memberId => 
      this.createNotification({
        user_id: memberId,
        title: 'Pool Election Started',
        message: 'Leadership elections have begun for your investment pool',
        type: 'pool',
        resource_id: poolId,
        resource_type: 'investment_pool',
        action_url: `/investor/pools/${poolId}`,
        priority: 'medium'
      })
    );

    return Promise.all(notifications);
  }
}
