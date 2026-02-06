import { supabase } from '@/integrations/supabase/client';
import type { PricingOutput } from '@/lib/pricing';

export interface CreateTransactionParams {
  contentId: string;
  userId: string;
  creatorId: string;
  pricing: PricingOutput;
  currency?: string;
}

export interface Transaction {
  id: string;
  content_id: string;
  buyer_id: string;
  creator_id: string;
  base_price: number;
  sponsor_amount: number;
  user_paid: number;
  creator_earning: number;
  platform_fee: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  currency: string;
  created_at: string;
  updated_at: string;
}

/**
 * Creates a new transaction record with pending status
 * Calculates creator_earning (80%) and platform_fee (20%) from base_price
 */
export async function createTransaction(params: CreateTransactionParams): Promise<Transaction> {
  const { contentId, userId, creatorId, pricing, currency = 'HUF' } = params;

  // Calculate creator revenue and platform fee from base price
  const creatorRevenue = Math.round(pricing.basePrice * 0.80);
  const platformFee = Math.round(pricing.basePrice * 0.20);

  // Map to actual database schema
  const transactionData = {
    content_id: contentId,
    buyer_id: userId,
    creator_id: creatorId,
    amount: pricing.userPays, // What the user actually paid
    creator_revenue: creatorRevenue, // 80% of base price
    platform_fee: platformFee, // 20% of base price
    status: 'pending' as const,
    // Optional fields for tracking sponsor contribution
    sponsor_payment_amount: pricing.sponsorAmount > 0 ? pricing.sponsorAmount : null,
    member_payment_amount: pricing.userPays,
    gross_amount: pricing.basePrice,
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert(transactionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    throw new Error(`Failed to create transaction: ${error.message}`);
  }

  return data as Transaction;
}

/**
 * Completes a transaction by updating status and creating content_participations record
 */
export async function completeTransaction(transactionId: string): Promise<void> {
  // First, get the transaction details
  const { data: transaction, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (fetchError) {
    console.error('❌ Error fetching transaction:', fetchError);
    throw new Error(`Failed to fetch transaction: ${fetchError.message}`);
  }

  if (!transaction) {
    console.error('❌ Transaction not found');
    throw new Error('Transaction not found');
  }

  // Update transaction status to completed
  const { data: updatedData, error: updateError } = await supabase
    .from('transactions')
    .update({ 
      status: 'completed'
    })
    .eq('id', transactionId)
    .select();

  if (updateError) {
    console.error('❌ Error updating transaction:', updateError);
    throw new Error(`Failed to update transaction: ${updateError.message}`);
  }

  // Create content_participations record
  const { data: participationData, error: participationError } = await supabase
    .from('content_participations')
    .insert({
      content_id: transaction.content_id,
      user_id: transaction.buyer_id,
      status: 'active',
      access_granted_at: new Date().toISOString(),
    })
    .select();

  if (participationError) {
    console.error('❌ Error creating participation:', participationError);
    throw new Error(`Failed to create participation: ${participationError.message}`);
  }
}

/**
 * Fetches all transactions for a specific user
 */
export async function getTransactionsByUser(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user transactions:', error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data as Transaction[];
}

/**
 * Gets a single transaction by ID
 */
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }

  return data as Transaction;
}
