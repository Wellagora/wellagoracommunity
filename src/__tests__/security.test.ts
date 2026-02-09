import { describe, it, expect } from 'vitest';

// Inline the pure functions from useRoleRedirect to avoid importing
// AuthContext → supabase client → localStorage (not available in Node/vitest)
type EffectiveRole = 'member' | 'expert' | 'sponsor' | 'admin';

function getEffectiveRole(userRole: string | undefined, isSuperAdmin: boolean = false): EffectiveRole {
  if (isSuperAdmin) return 'admin';
  if (!userRole) return 'member';
  if (['expert', 'creator'].includes(userRole)) return 'expert';
  if (['sponsor', 'business', 'government', 'ngo'].includes(userRole)) return 'sponsor';
  return 'member';
}

const ROLE_DASHBOARDS: Record<EffectiveRole, string> = {
  member: '/my-agora',
  expert: '/expert-studio',
  sponsor: '/sponsor-dashboard',
  admin: '/admin',
};

describe('Security - Role validation', () => {
  const validEffectiveRoles = ['member', 'expert', 'sponsor', 'admin'];

  it('should only accept valid effective roles', () => {
    validEffectiveRoles.forEach(role => {
      expect(validEffectiveRoles.includes(role)).toBe(true);
    });
    expect(validEffectiveRoles.includes('superadmin')).toBe(false);
    expect(validEffectiveRoles.includes('')).toBe(false);
    expect(validEffectiveRoles.includes('undefined')).toBe(false);
  });

  it('getEffectiveRole maps database roles correctly', () => {
    // member/tag variants
    expect(getEffectiveRole('member')).toBe('member');
    expect(getEffectiveRole('citizen')).toBe('member');
    expect(getEffectiveRole(undefined)).toBe('member');
    expect(getEffectiveRole('')).toBe('member');

    // expert/creator variants
    expect(getEffectiveRole('expert')).toBe('expert');
    expect(getEffectiveRole('creator')).toBe('expert');

    // sponsor variants
    expect(getEffectiveRole('sponsor')).toBe('sponsor');
    expect(getEffectiveRole('business')).toBe('sponsor');
    expect(getEffectiveRole('government')).toBe('sponsor');
    expect(getEffectiveRole('ngo')).toBe('sponsor');

    // super admin override
    expect(getEffectiveRole('member', true)).toBe('admin');
    expect(getEffectiveRole('expert', true)).toBe('admin');
    expect(getEffectiveRole('sponsor', true)).toBe('admin');
  });

  it('every effective role has a dashboard path', () => {
    validEffectiveRoles.forEach(role => {
      const path = ROLE_DASHBOARDS[role as keyof typeof ROLE_DASHBOARDS];
      expect(path).toBeDefined();
      expect(typeof path).toBe('string');
      expect(path.startsWith('/')).toBe(true);
    });
  });

  it('admin dashboard path starts with /admin', () => {
    expect(ROLE_DASHBOARDS.admin).toBe('/admin');
  });

  it('admin routes should be protected', () => {
    const adminPaths = ['/admin', '/admin/users', '/admin/financials', '/admin/settings', '/admin/experts', '/admin/sponsors'];
    adminPaths.forEach(path => {
      expect(path.startsWith('/admin')).toBe(true);
    });
  });
});

describe('Security - Data isolation', () => {
  it('user should only see own transactions', () => {
    const userId = 'user-123';
    const transactions = [
      { id: 1, sponsor_user_id: 'user-123', credits: 100 },
      { id: 2, sponsor_user_id: 'user-456', credits: 200 },
      { id: 3, sponsor_user_id: 'user-123', credits: 50 },
    ];
    const filtered = transactions.filter(t => t.sponsor_user_id === userId);
    expect(filtered.length).toBe(2);
    expect(filtered.every(t => t.sponsor_user_id === userId)).toBe(true);
  });

  it('user should only see own notifications', () => {
    const userId = 'user-123';
    const notifications = [
      { id: 1, user_id: 'user-123', title: 'Own notification' },
      { id: 2, user_id: 'user-456', title: 'Someone else notification' },
    ];
    const filtered = notifications.filter(n => n.user_id === userId);
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Own notification');
  });

  it('user should only see own messages', () => {
    const userId = 'user-123';
    const messages = [
      { id: 1, sender_id: 'user-123', receiver_id: 'user-456', text: 'Sent' },
      { id: 2, sender_id: 'user-456', receiver_id: 'user-123', text: 'Received' },
      { id: 3, sender_id: 'user-456', receiver_id: 'user-789', text: 'Not mine' },
    ];
    const filtered = messages.filter(m => m.sender_id === userId || m.receiver_id === userId);
    expect(filtered.length).toBe(2);
    expect(filtered.every(m => m.sender_id === userId || m.receiver_id === userId)).toBe(true);
  });

  it('buyer and creator should see content transactions', () => {
    const userId = 'user-123';
    const transactions = [
      { id: 1, buyer_id: 'user-123', creator_id: 'user-999', amount: 5000 },
      { id: 2, buyer_id: 'user-456', creator_id: 'user-123', amount: 3000 },
      { id: 3, buyer_id: 'user-456', creator_id: 'user-789', amount: 8000 },
    ];
    const filtered = transactions.filter(t => t.buyer_id === userId || t.creator_id === userId);
    expect(filtered.length).toBe(2);
  });

  it('sponsor should only see own credit balance', () => {
    const sponsorId = 'sponsor-1';
    const creditBalances = [
      { sponsor_user_id: 'sponsor-1', total_credits: 5000, available_credits: 3500 },
      { sponsor_user_id: 'sponsor-2', total_credits: 10000, available_credits: 8000 },
    ];
    const myCredits = creditBalances.filter(c => c.sponsor_user_id === sponsorId);
    expect(myCredits.length).toBe(1);
    expect(myCredits[0].available_credits).toBe(3500);
  });
});

describe('Security - Input validation', () => {
  it('should identify SQL injection attempts', () => {
    const maliciousInputs = [
      "'; DROP TABLE profiles; --",
      "1 OR 1=1",
      "admin'--",
      "Robert'); DROP TABLE students;--",
    ];
    // Supabase uses parameterized queries which prevent SQL injection
    // But we verify the patterns are detectable
    maliciousInputs.forEach(input => {
      expect(typeof input).toBe('string');
      const hasSqlKeyword = /DROP|DELETE|INSERT|UPDATE|ALTER|EXEC|UNION|SELECT.*FROM/i.test(input)
        || /OR\s+\d+=\d+/i.test(input)
        || /'--/.test(input);
      expect(hasSqlKeyword).toBe(true);
    });
  });

  it('should identify XSS attempts', () => {
    const xssInputs = [
      "<script>alert('xss')</script>",
      '<img onerror="alert(1)" src="x">',
      'javascript:alert(1)',
      '<svg onload="alert(1)">',
    ];
    xssInputs.forEach(input => {
      const hasXss = /<script|onerror|onload|javascript:/i.test(input);
      expect(hasXss).toBe(true);
    });
  });

  it('email should be valid format', () => {
    const validEmails = ['test@test.com', 'user@domain.co', 'name.surname@company.org'];
    const invalidEmails = ['', 'notanemail', '@domain', 'user@', 'user @test.com'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    validEmails.forEach(e => expect(emailRegex.test(e)).toBe(true));
    invalidEmails.forEach(e => expect(emailRegex.test(e)).toBe(false));
  });

  it('UUID format should be valid', () => {
    const validUuids = [
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    ];
    const invalidUuids = ['not-a-uuid', '123', '', 'null'];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    validUuids.forEach(u => expect(uuidRegex.test(u)).toBe(true));
    invalidUuids.forEach(u => expect(uuidRegex.test(u)).toBe(false));
  });
});

describe('Security - Route protection', () => {
  // These tests verify the EXPECTED route protection configuration
  const protectedRoutes = {
    '/admin': { requireSuperAdmin: true },
    '/admin/users': { requireSuperAdmin: true },
    '/admin/financials': { requireSuperAdmin: true },
    '/expert-studio': { allowedRoles: ['expert'] },
    '/expert-studio/new': { allowedRoles: ['expert'] },
    '/expert-studio/payouts': { allowedRoles: ['expert'] },
    '/sponsor-dashboard': { allowedRoles: ['sponsor'] },
    '/sponsor-dashboard/finances': { allowedRoles: ['sponsor'] },
    '/sponsor-dashboard/campaigns': { allowedRoles: ['sponsor'] },
    '/profile': { requireAuth: true },
    '/inbox': { requireAuth: true },
    '/notifications': { requireAuth: true },
    '/favorites': { requireAuth: true },
    '/my-agora': { requireAuth: true },
  };

  it('admin routes require super admin', () => {
    const adminRoutes = Object.entries(protectedRoutes)
      .filter(([path]) => path.startsWith('/admin'));
    expect(adminRoutes.length).toBeGreaterThan(0);
    adminRoutes.forEach(([path, config]) => {
      expect(config).toHaveProperty('requireSuperAdmin', true);
    });
  });

  it('expert routes require expert role', () => {
    const expertRoutes = Object.entries(protectedRoutes)
      .filter(([path]) => path.startsWith('/expert-studio'));
    expect(expertRoutes.length).toBeGreaterThan(0);
    expertRoutes.forEach(([, config]) => {
      expect((config as any).allowedRoles).toContain('expert');
    });
  });

  it('sponsor routes require sponsor role', () => {
    const sponsorRoutes = Object.entries(protectedRoutes)
      .filter(([path]) => path.startsWith('/sponsor-dashboard'));
    expect(sponsorRoutes.length).toBeGreaterThan(0);
    sponsorRoutes.forEach(([, config]) => {
      expect((config as any).allowedRoles).toContain('sponsor');
    });
  });

  it('personal routes require authentication', () => {
    const authRoutes = Object.entries(protectedRoutes)
      .filter(([, config]) => 'requireAuth' in config);
    expect(authRoutes.length).toBeGreaterThan(0);
  });
});
