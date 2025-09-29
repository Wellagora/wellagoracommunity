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
    name: 'Bronze Sponsor',
    price: 149,
    currency: 'EUR',
    credits: 500,
    price_id: MockPaymentService.PRICE_IDS.bronze,
    product_id: MockPaymentService.PRODUCT_IDS.bronze,
    features: [
      'Alacsony kreditkeret',
      'Alapvető jelentések',
      'Email támogatás'
    ]
  },
  silver: {
    name: 'Silver Sponsor',
    price: 299,
    currency: 'EUR',
    credits: 1500,
    price_id: MockPaymentService.PRICE_IDS.silver,
    product_id: MockPaymentService.PRODUCT_IDS.silver,
    features: [
      'Közepes kreditkeret',
      'Részletes jelentések',
      'Prioritás támogatás',
      'Branding lehetőségek'
    ]
  },
  gold: {
    name: 'Gold Sponsor',
    price: 499,
    currency: 'EUR',
    credits: 3000,
    price_id: MockPaymentService.PRICE_IDS.gold,
    product_id: MockPaymentService.PRODUCT_IDS.gold,
    features: [
      'Nagy kreditkeret',
      'Teljes körű riportok',
      'Dedikált ügyfélszolgálat',
      'Teljes branding kontroll',
      'Korai hozzáférés új funkciókhoz'
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