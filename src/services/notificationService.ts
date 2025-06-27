import { supabase } from '../integrations/supabase/client';
import { useAuthStore } from '../store/authStore';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'milestone' | 'opportunity' | 'pool';
  resource_type?: string;
  resource_id?: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface EmailNotification {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

class NotificationService {
  private static instance: NotificationService;
  private realtimeSubscription: any = null;
  private emailQueue: EmailNotification[] = [];
  private isProcessingEmail = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(userId: string) {
    // Subscribe to real-time notifications
    this.realtimeSubscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          this.handleNewNotification(payload.new as Notification);
        }
      )
      .subscribe();

    // Request notification permissions for PWA
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Push notifications enabled');
      }
    }

    // Start email processing
    this.processEmailQueue();
  }

  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Send push notification if enabled
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        this.sendPushNotification(notification);
      }

      // Queue email notification for high priority items
      if (notification.priority === 'high' || notification.priority === 'urgent') {
        await this.queueEmailNotification(notification);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  private async handleNewNotification(notification: Notification) {
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      });
    }

    // Update UI (this would be handled by the notification store)
    this.updateNotificationCount();
  }

  private async sendPushNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'notification',
        requireInteraction: notification.priority === 'urgent',
        data: {
          url: notification.action_url || '/notifications'
        }
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  private async queueEmailNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
    // Get user email
    const { data: user } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', notification.user_id)
      .single();

    if (!user?.email) return;

    const emailNotification: EmailNotification = {
      to: user.email,
      subject: notification.title,
      template: this.getEmailTemplate(notification.type),
      data: {
        title: notification.title,
        message: notification.message,
        action_url: notification.action_url,
        priority: notification.priority
      }
    };

    this.emailQueue.push(emailNotification);
  }

  private getEmailTemplate(type: string): string {
    const templates = {
      payment: 'payment-notification',
      milestone: 'milestone-notification',
      opportunity: 'opportunity-notification',
      pool: 'pool-notification',
      default: 'general-notification'
    };

    return templates[type as keyof typeof templates] || templates.default;
  }

  private async processEmailQueue() {
    if (this.isProcessingEmail || this.emailQueue.length === 0) {
      return;
    }

    this.isProcessingEmail = true;

    while (this.emailQueue.length > 0) {
      const email = this.emailQueue.shift();
      if (email) {
        try {
          await this.sendEmail(email);
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('Error sending email:', error);
          // Re-queue for retry
          this.emailQueue.push(email);
        }
      }
    }

    this.isProcessingEmail = false;
  }

  private async sendEmail(email: EmailNotification) {
    // In production, this would integrate with a service like SendGrid, Mailgun, etc.
    // For now, we'll simulate email sending
    console.log('Sending email:', email);
    
    // Simulate API call to email service
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private updateNotificationCount() {
    // This would update a global notification count
    // Implementation depends on your state management
  }

  // Specific notification creators
  async notifyPaymentReceived(paymentData: any) {
    await this.createNotification({
      user_id: paymentData.receiver_id,
      title: 'Payment Received',
      message: `You have received $${paymentData.amount} for opportunity: ${paymentData.opportunity_name}`,
      type: 'payment',
      resource_type: 'payment',
      resource_id: paymentData.id,
      is_read: false,
      priority: 'high',
      action_url: `/payments/${paymentData.id}`
    });
  }

  async notifyMilestoneCompleted(milestoneData: any) {
    await this.createNotification({
      user_id: milestoneData.entrepreneur_id,
      title: 'Milestone Completed',
      message: `Milestone "${milestoneData.title}" has been completed successfully`,
      type: 'milestone',
      resource_type: 'milestone',
      resource_id: milestoneData.id,
      is_read: false,
      priority: 'medium',
      action_url: `/opportunities/${milestoneData.opportunity_id}/milestones`
    });
  }

  async notifyOpportunityPublished(opportunityData: any) {
    // Notify all investors
    const { data: investors } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'investor');

    if (investors) {
      for (const investor of investors) {
        await this.createNotification({
          user_id: investor.id,
          title: 'New Investment Opportunity',
          message: `New opportunity: ${opportunityData.name} - ${opportunityData.description.substring(0, 100)}...`,
          type: 'opportunity',
          resource_type: 'opportunity',
          resource_id: opportunityData.id,
          is_read: false,
          priority: 'medium',
          action_url: `/opportunities/${opportunityData.id}`
        });
      }
    }
  }

  async notifyPoolElection(poolData: any, electionType: 'nomination' | 'voting') {
    const { data: members } = await supabase
      .from('pool_members')
      .select('member_id')
      .eq('pool_id', poolData.id)
      .eq('is_active', true);

    if (members) {
      const title = electionType === 'nomination' ? 'Pool Leadership Nominations Open' : 'Pool Leadership Voting Open';
      const message = electionType === 'nomination' 
        ? `Nominations are now open for ${poolData.name} leadership position`
        : `Voting is now open for ${poolData.name} leadership position`;

      for (const member of members) {
        await this.createNotification({
          user_id: member.member_id,
          title,
          message,
          type: 'pool',
          resource_type: 'pool',
          resource_id: poolData.id,
          is_read: false,
          priority: 'high',
          action_url: `/pools/${poolData.id}/elections`
        });
      }
    }
  }

  async notifyHighRiskOpportunity(opportunityData: any, riskScore: number) {
    // Notify admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'super_admin']);

    if (admins) {
      for (const admin of admins) {
        await this.createNotification({
          user_id: admin.id,
          title: 'High Risk Opportunity Alert',
          message: `Opportunity "${opportunityData.name}" has a risk score of ${riskScore}% and requires review`,
          type: 'warning',
          resource_type: 'opportunity',
          resource_id: opportunityData.id,
          is_read: false,
          priority: 'urgent',
          action_url: `/admin/opportunities/${opportunityData.id}`
        });
      }
    }
  }

  cleanup() {
    if (this.realtimeSubscription) {
      supabase.removeChannel(this.realtimeSubscription);
    }
  }
}

export const notificationService = NotificationService.getInstance(); 