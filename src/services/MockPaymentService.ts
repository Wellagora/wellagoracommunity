// Mock Payment Service for testing without Stripe integration
export interface MockPaymentResult {
  success: boolean;
  sessionUrl?: string;
  error?: string;
}

export interface MockSubscriptionStatus {
  subscribed: boolean;
  product_id?: string;
  subscription_end?: string;
  credits_remaining?: number;
  package_level?: string;
}

export class MockPaymentService {
  private static subscriptions = new Map<string, MockSubscriptionStatus>();
  
  // Mock price IDs from our Stripe products (Wellagora Credit System)
  // 1 credit = 50,000 HUF = 1 full challenge campaign sponsorship
  static readonly PRICE_IDS = {
    small: "price_mock_small_100k",      // 100,000 HUF = 2 credits
    medium: "price_mock_medium_250k",    // 250,000 HUF = 5 credits
    large: "price_mock_large_500k",      // 500,000 HUF = 10 credits
    enterprise: "price_mock_enterprise"  // Custom pricing = 20+ credits
  };

  static readonly PRODUCT_IDS = {
    small: "prod_mock_small",
    medium: "prod_mock_medium",
    large: "prod_mock_large",
    enterprise: "prod_mock_enterprise"
  };

  // Mock checkout creation
  static async createCheckout(userEmail: string, priceId: string): Promise<MockPaymentResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock success
    return {
      success: true,
      sessionUrl: `/mock-checkout?price=${priceId}&email=${encodeURIComponent(userEmail)}`
    };
  }

  // Mock subscription check
  static async checkSubscription(userEmail: string): Promise<MockSubscriptionStatus> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existing = this.subscriptions.get(userEmail);
    if (existing) {
      return existing;
    }
    
    // Default unsubscribed state
    return { subscribed: false };
  }

  // Mock payment completion (simulates Stripe webhook)
  static async completePayment(userEmail: string, priceId: string): Promise<void> {
    let productId: string;
    let packageLevel: string;
    let credits: number;
    
    switch (priceId) {
      case this.PRICE_IDS.small:
        productId = this.PRODUCT_IDS.small;
        packageLevel = 'small';
        credits = 2; // 2 challenge campaigns
        break;
      case this.PRICE_IDS.medium:
        productId = this.PRODUCT_IDS.medium;
        packageLevel = 'medium';
        credits = 5; // 5 challenge campaigns
        break;
      case this.PRICE_IDS.large:
        productId = this.PRODUCT_IDS.large;
        packageLevel = 'large';
        credits = 10; // 10 challenge campaigns
        break;
      case this.PRICE_IDS.enterprise:
        productId = this.PRODUCT_IDS.enterprise;
        packageLevel = 'enterprise';
        credits = 20; // 20+ challenge campaigns
        break;
      default:
        throw new Error('Invalid price ID');
    }
    
    // Set subscription (1 credit = 50,000 HUF = 1 challenge campaign)
    this.subscriptions.set(userEmail, {
      subscribed: true,
      product_id: productId,
      package_level: packageLevel,
      credits_remaining: credits,
      subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });
  }

  // Mock usage of credits
  static async useCredits(userEmail: string, amount: number): Promise<boolean> {
    const subscription = this.subscriptions.get(userEmail);
    if (!subscription || !subscription.subscribed || !subscription.credits_remaining) {
      return false;
    }
    
    if (subscription.credits_remaining < amount) {
      return false;
    }
    
    subscription.credits_remaining -= amount;
    this.subscriptions.set(userEmail, subscription);
    return true;
  }

  // Mock customer portal
  static async createCustomerPortal(userEmail: string): Promise<MockPaymentResult> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      sessionUrl: `/mock-portal?email=${encodeURIComponent(userEmail)}`
    };
  }

  // Helper to get all mock subscriptions (for testing)
  static getAllSubscriptions(): Map<string, MockSubscriptionStatus> {
    return new Map(this.subscriptions);
  }

  // Helper to reset all subscriptions (for testing)
  static resetAllSubscriptions(): void {
    this.subscriptions.clear();
  }
}