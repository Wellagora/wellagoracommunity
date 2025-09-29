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
  
  // Mock price IDs from our Stripe products
  static readonly PRICE_IDS = {
    bronze: "price_mock_bronze_149",
    silver: "price_mock_silver_299", 
    gold: "price_mock_gold_499"
  };

  static readonly PRODUCT_IDS = {
    bronze: "prod_mock_bronze",
    silver: "prod_mock_silver",
    gold: "prod_mock_gold"
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
      case this.PRICE_IDS.bronze:
        productId = this.PRODUCT_IDS.bronze;
        packageLevel = 'bronze';
        credits = 500;
        break;
      case this.PRICE_IDS.silver:
        productId = this.PRODUCT_IDS.silver;
        packageLevel = 'silver';
        credits = 1500;
        break;
      case this.PRICE_IDS.gold:
        productId = this.PRODUCT_IDS.gold;
        packageLevel = 'gold';
        credits = 3000;
        break;
      default:
        throw new Error('Invalid price ID');
    }
    
    // Set subscription
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