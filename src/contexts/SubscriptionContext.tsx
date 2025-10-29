import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { MockPaymentService, MockSubscriptionStatus } from '@/services/MockPaymentService';

interface SubscriptionContextType {
  subscription: MockSubscriptionStatus | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  createCheckout: (priceId: string) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  useCredits: (amount: number) => Promise<boolean>;
  packageTiers: typeof packageTiers;
}

const packageTiers = {
  bronze: {
    name: 'Bronz',
    priceHuf: 100000,
    priceEur: 250,
    currency: 'HUF/EUR',
    credits: 2,
    price_id: MockPaymentService.PRICE_IDS.small,
    product_id: MockPaymentService.PRODUCT_IDS.small,
    features: [
      '2 challenge kampány',
      '50-100 fő elérés kampányonként',
      'Logo megjelenítés challenge cardon',
      'Impact riportok',
      'Email támogatás'
    ]
  },
  silver: {
    name: 'Ezüst',
    priceHuf: 250000,
    priceEur: 625,
    currency: 'HUF/EUR',
    credits: 5,
    price_id: MockPaymentService.PRICE_IDS.medium,
    product_id: MockPaymentService.PRODUCT_IDS.medium,
    features: [
      '5 challenge kampány',
      '50-100 fő elérés kampányonként',
      'Kiterjesztett branding',
      'Impact riportok',
      'Prioritás email támogatás',
      'Social media említések',
      'Co-sponsorship lehetőség'
    ]
  },
  gold: {
    name: 'Arany',
    priceHuf: 500000,
    priceEur: 1250,
    currency: 'HUF/EUR',
    credits: 10,
    price_id: MockPaymentService.PRICE_IDS.large,
    product_id: MockPaymentService.PRODUCT_IDS.large,
    features: [
      '10 challenge kampány',
      '50-100 fő elérés kampányonként',
      'Prémium logo elhelyezés',
      'Dedikált account manager',
      'Co-branded challenge-ek',
      'Egyedi challenge létrehozás',
      'Haladó analytics dashboard',
      'Employee engagement program',
      'Stratégiai konzultáció'
    ]
  },
  diamond: {
    name: 'Gyémánt',
    priceHuf: 1000000,
    priceEur: 2500,
    currency: 'HUF/EUR',
    credits: 20,
    price_id: MockPaymentService.PRICE_IDS.enterprise,
    product_id: MockPaymentService.PRODUCT_IDS.enterprise,
    features: [
      '20+ challenge kampány',
      'Korlátlan elérés',
      'Teljes márka integráció',
      'Dedikált success team',
      'API hozzáférés',
      'White-label opciók',
      'Multi-country deployment',
      'Custom fejlesztések'
    ]
  }
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<MockSubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshSubscription = async () => {
    if (!user?.email) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const status = await MockPaymentService.checkSubscription(user.email);
      setSubscription(status);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (priceId: string) => {
    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    try {
      const result = await MockPaymentService.createCheckout(user.email, priceId);
      if (result.success && result.sessionUrl) {
        // In mock mode, simulate immediate payment completion
        await MockPaymentService.completePayment(user.email, priceId);
        await refreshSubscription();
        
        // Show success message
        alert('Mock fizetés sikeres! A szponzorálási csomag aktiválva.');
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    try {
      const result = await MockPaymentService.createCustomerPortal(user.email);
      if (result.success && result.sessionUrl) {
        // In mock mode, just show an alert
        alert('Mock ügyfélportál - Itt tudná kezelni az előfizetését.');
      } else {
        throw new Error(result.error || 'Portal creation failed');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  const useCredits = async (amount: number): Promise<boolean> => {
    if (!user?.email) {
      return false;
    }

    try {
      const success = await MockPaymentService.useCredits(user.email, amount);
      if (success) {
        await refreshSubscription();
      }
      return success;
    } catch (error) {
      console.error('Error using credits:', error);
      return false;
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [user]);

  const value: SubscriptionContextType = {
    subscription,
    loading,
    refreshSubscription,
    createCheckout,
    openCustomerPortal,
    useCredits,
    packageTiers,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;