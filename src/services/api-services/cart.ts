import { BaseApiService } from './base';

export class CartApiService extends BaseApiService {
  // Get cart - GET /cart
  async getCart(): Promise<any> {
    return this.request('/cart');
  }

  // Add to cart - POST /cart/add
  async addToCart(courseId: string): Promise<any> {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  }

  // Remove from cart - DELETE /cart/remove/:courseId
  async removeFromCart(courseId: string): Promise<any> {
    return this.request(`/cart/remove/${courseId}`, {
      method: 'DELETE',
    });
  }

  // Clear cart
  async clearCart(): Promise<any> {
    return this.request('/cart', {
      method: 'DELETE',
    });
  }

  // Apply coupon
  async applyCoupon(code: string): Promise<any> {
    return this.request('/cart/coupon', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Remove coupon
  async removeCoupon(): Promise<any> {
    return this.request('/cart/coupon', {
      method: 'DELETE',
    });
  }

  // Get cart summary
  async getCartSummary(): Promise<any> {
    return this.request('/cart/summary');
  }

  // Validate cart
  async validateCart(): Promise<any> {
    return this.request('/cart/validate');
  }

  // Save cart for later
  async saveCartForLater(): Promise<any> {
    return this.request('/cart/save', {
      method: 'POST',
    });
  }

  // Restore saved cart
  async restoreSavedCart(): Promise<any> {
    return this.request('/cart/restore', {
      method: 'POST',
    });
  }

  // Get cart history
  async getCartHistory(filters?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return this.request(`/cart/history?${params.toString()}`);
  }

  // Get available coupons
  async getAvailableCoupons(filters?: {
    courseId?: string;
    category?: string;
    search?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    return this.request(`/cart/coupons?${params.toString()}`);
  }

  // Check coupon validity
  async checkCouponValidity(code: string): Promise<any> {
    return this.request(`/cart/coupons/validate?code=${code}`);
  }

  // Get cart analytics
  async getCartAnalytics(filters?: {
    timeRange?: string;
    groupBy?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.timeRange) params.append('timeRange', filters.timeRange);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);

    return this.request(`/cart/analytics?${params.toString()}`);
  }

  // Abandoned cart recovery
  async getAbandonedCarts(filters?: {
    timeRange?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.timeRange) params.append('timeRange', filters.timeRange);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request(`/cart/abandoned?${params.toString()}`);
  }

  // Send cart recovery email
  async sendCartRecoveryEmail(cartId: string): Promise<any> {
    return this.request(`/cart/${cartId}/recovery`, {
      method: 'POST',
    });
  }

  // Get cart recommendations
  async getCartRecommendations(): Promise<any> {
    return this.request('/cart/recommendations');
  }

  // Add recommendation to cart
  async addRecommendationToCart(courseId: string): Promise<any> {
    return this.request('/cart/recommendations', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  }
}
