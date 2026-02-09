import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 
  | 'new_enrollment'
  | 'new_payment'
  | 'program_full'
  | 'enrollment_confirmed'
  | 'payment_confirmed'
  | 'event_reminder'
  | 'nudge_ready_for_paid'
  | 'nudge_almost_full';

interface NotifyParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export async function createNotification({ userId, type, title, message, data }: NotifyParams) {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    data: data || {},
    read: false,
  });
  if (error) console.error('Notification error:', error);
}

export async function notifyExpertOnEnrollment(
  expertId: string,
  tagName: string,
  programTitle: string,
  amount?: number
) {
  if (amount && amount > 0) {
    const expertAmount = Math.round(amount * 0.80);
    await createNotification({
      userId: expertId,
      type: 'new_payment',
      title: 'Fizetés érkezett',
      message: `${tagName} megvásárolta: "${programTitle}" — ${amount.toLocaleString()} Ft (bevételed: ${expertAmount.toLocaleString()} Ft)`,
      data: { amount, expertAmount, programTitle, tagName },
    });
  } else {
    await createNotification({
      userId: expertId,
      type: 'new_enrollment',
      title: 'Új regisztráció',
      message: `${tagName} regisztrált a "${programTitle}" programodra`,
      data: { programTitle, tagName },
    });
  }
}

export async function notifyTagOnEnrollment(
  tagId: string,
  programTitle: string,
  amount?: number
) {
  await createNotification({
    userId: tagId,
    type: amount ? 'payment_confirmed' : 'enrollment_confirmed',
    title: amount ? 'Sikeres vásárlás' : 'Sikeres regisztráció',
    message: amount 
      ? `Fizetésed sikeres: ${amount.toLocaleString()} Ft — "${programTitle}"` 
      : `Sikeresen regisztráltál: "${programTitle}"`,
    data: { programTitle, amount },
  });
}
