import { supabase } from '@/integrations/supabase/client';

interface AuditLogEntry {
  action: string;
  tableName: string;
  recordId: string;
  userId: string;
  userEmail?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: Record<string, any>;
}

/**
 * Write an entry to the audit_log table.
 * Called after every admin action (role change, suspend, approve, reject, etc.)
 */
export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const { error } = await supabase.from('audit_log').insert({
      action: entry.action,
      table_name: entry.tableName,
      record_id: entry.recordId,
      user_id: entry.userId,
      user_email: entry.userEmail || null,
      old_values: entry.oldValues || null,
      new_values: entry.newValues || null,
      changes: entry.changes || null,
    });

    if (error) {
      console.error('[auditLog] Failed to write audit log:', error);
    }
  } catch (err) {
    console.error('[auditLog] Exception writing audit log:', err);
  }
}
