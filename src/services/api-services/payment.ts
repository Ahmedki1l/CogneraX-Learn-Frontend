import { BaseApiService } from './base';

export class PaymentApiService extends BaseApiService {
  // Payment Methods
  async getPaymentMethods(): Promise<any> {
    return this.request('/payments/methods');
  }

  async addPaymentMethod(paymentMethod: {
    type: 'card' | 'bank_account' | 'paypal';
    token: string;
    isDefault?: boolean;
  }): Promise<any> {
    return this.request('/payments/methods', {
      method: 'POST',
      body: JSON.stringify(paymentMethod),
    });
  }

  async updatePaymentMethod(methodId: string, updates: {
    isDefault?: boolean;
    nickname?: string;
  }): Promise<any> {
    return this.request(`/payments/methods/${methodId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deletePaymentMethod(methodId: string): Promise<void> {
    return this.request(`/payments/methods/${methodId}`, {
      method: 'DELETE',
    });
  }

  async setDefaultPaymentMethod(methodId: string): Promise<any> {
    return this.request(`/payments/methods/${methodId}/default`, {
      method: 'POST',
    });
  }

  // Course Payments
  async purchaseCourse(courseId: string, paymentMethodId: string, couponCode?: string): Promise<any> {
    return this.request('/payments/courses/purchase', {
      method: 'POST',
      body: JSON.stringify({ courseId, paymentMethodId, couponCode }),
    });
  }

  async getCoursePrice(courseId: string, couponCode?: string): Promise<any> {
    const params = new URLSearchParams();
    if (couponCode) params.append('coupon', couponCode);
    return this.request(`/payments/courses/${courseId}/price?${params.toString()}`);
  }

  async refundCourse(courseId: string, reason: string): Promise<any> {
    return this.request(`/payments/courses/${courseId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Subscription Management
  async getSubscriptions(): Promise<any> {
    return this.request('/payments/subscriptions');
  }

  async createSubscription(planId: string, paymentMethodId: string): Promise<any> {
    return this.request('/payments/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ planId, paymentMethodId }),
    });
  }

  async updateSubscription(subscriptionId: string, updates: {
    planId?: string;
    paymentMethodId?: string;
  }): Promise<any> {
    return this.request(`/payments/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async cancelSubscription(subscriptionId: string, reason?: string): Promise<any> {
    return this.request(`/payments/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async pauseSubscription(subscriptionId: string, pauseUntil?: string): Promise<any> {
    return this.request(`/payments/subscriptions/${subscriptionId}/pause`, {
      method: 'POST',
      body: JSON.stringify({ pauseUntil }),
    });
  }

  async resumeSubscription(subscriptionId: string): Promise<any> {
    return this.request(`/payments/subscriptions/${subscriptionId}/resume`, {
      method: 'POST',
    });
  }

  // Plans and Pricing
  async getPlans(): Promise<any> {
    return this.request('/payments/plans');
  }

  async getPlan(planId: string): Promise<any> {
    return this.request(`/payments/plans/${planId}`);
  }

  async createPlan(planData: {
    name: string;
    description: string;
    price: number;
    interval: 'month' | 'year';
    features: string[];
    maxUsers?: number;
    maxCourses?: number;
    maxStorage?: number;
  }): Promise<any> {
    return this.request('/payments/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updatePlan(planId: string, planData: Partial<{
    name: string;
    description: string;
    price: number;
    interval: string;
    features: string[];
    maxUsers: number;
    maxCourses: number;
    maxStorage: number;
    isActive: boolean;
  }>): Promise<any> {
    return this.request(`/payments/plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(planData),
    });
  }

  async deletePlan(planId: string): Promise<void> {
    return this.request(`/payments/plans/${planId}`, {
      method: 'DELETE',
    });
  }

  // Coupons and Discounts
  async getCoupons(filters?: {
    page?: number;
    limit?: number;
    active?: boolean;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/payments/coupons?${params.toString()}`);
  }

  async createCoupon(couponData: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    maxUses?: number;
    expiresAt?: string;
    applicableTo: 'courses' | 'subscriptions' | 'all';
    courseIds?: string[];
  }): Promise<any> {
    return this.request('/payments/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  }

  async updateCoupon(couponId: string, couponData: Partial<{
    code: string;
    type: string;
    value: number;
    maxUses: number;
    expiresAt: string;
    applicableTo: string;
    courseIds: string[];
    isActive: boolean;
  }>): Promise<any> {
    return this.request(`/payments/coupons/${couponId}`, {
      method: 'PATCH',
      body: JSON.stringify(couponData),
    });
  }

  async deleteCoupon(couponId: string): Promise<void> {
    return this.request(`/payments/coupons/${couponId}`, {
      method: 'DELETE',
    });
  }

  async validateCoupon(code: string, courseId?: string): Promise<any> {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    return this.request(`/payments/coupons/validate/${code}?${params.toString()}`);
  }

  // Transactions and Invoices
  async getTransactions(filters?: {
    page?: number;
    limit?: number;
    type?: 'purchase' | 'subscription' | 'refund';
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/payments/transactions?${params.toString()}`);
  }

  async getTransaction(transactionId: string): Promise<any> {
    return this.request(`/payments/transactions/${transactionId}`);
  }

  async getInvoices(filters?: {
    page?: number;
    limit?: number;
    status?: 'paid' | 'pending' | 'failed';
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/payments/invoices?${params.toString()}`);
  }

  async getInvoice(invoiceId: string): Promise<any> {
    return this.request(`/payments/invoices/${invoiceId}`);
  }

  async downloadInvoice(invoiceId: string): Promise<Blob> {
    const response = await fetch(`${this.constructor.prototype.API_BASE_URL || 'http://localhost:5000/api/v1'}/payments/invoices/${invoiceId}/download`, {
      method: 'GET',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Invoice download failed');
    }

    return response.blob();
  }

  // Cart Management
  async getCart(): Promise<any> {
    return this.request('/payments/cart');
  }

  async addToCart(item: {
    type: 'course' | 'subscription';
    itemId: string;
    quantity?: number;
  }): Promise<any> {
    return this.request('/payments/cart/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateCartItem(itemId: string, updates: {
    quantity?: number;
  }): Promise<any> {
    return this.request(`/payments/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async removeFromCart(itemId: string): Promise<void> {
    return this.request(`/payments/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<void> {
    return this.request('/payments/cart', {
      method: 'DELETE',
    });
  }

  async applyCouponToCart(couponCode: string): Promise<any> {
    return this.request('/payments/cart/coupon', {
      method: 'POST',
      body: JSON.stringify({ couponCode }),
    });
  }

  async removeCouponFromCart(): Promise<void> {
    return this.request('/payments/cart/coupon', {
      method: 'DELETE',
    });
  }

  async checkoutCart(paymentMethodId: string): Promise<any> {
    return this.request('/payments/cart/checkout', {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId }),
    });
  }

  // Payment Processing
  async createPaymentIntent(amount: number, currency: string = 'USD'): Promise<any> {
    return this.request('/payments/intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<any> {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, paymentMethodId }),
    });
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    return this.request(`/payments/${paymentId}/status`);
  }

  // Webhooks
  async getWebhookEvents(filters?: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/payments/webhooks/events?${params.toString()}`);
  }

  async getWebhookEvent(eventId: string): Promise<any> {
    return this.request(`/payments/webhooks/events/${eventId}`);
  }

  async retryWebhookEvent(eventId: string): Promise<any> {
    return this.request(`/payments/webhooks/events/${eventId}/retry`, {
      method: 'POST',
    });
  }
}
