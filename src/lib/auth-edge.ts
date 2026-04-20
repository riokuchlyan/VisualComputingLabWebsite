import { AdminUser } from './auth';

// Edge Runtime compatible JWT verification using Web Crypto API
// Kept separate from auth.ts to avoid pulling bcryptjs/jsonwebtoken into Edge bundles
export async function verifyAdminTokenEdge(token: string): Promise<AdminUser | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureInput = `${parts[0]}.${parts[1]}`;
    const signatureBytes = Uint8Array.from(
      atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      new TextEncoder().encode(signatureInput)
    );

    if (!valid) return null;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    if (!payload.id || !payload.email || !payload.role || payload.role !== 'admin') return null;

    return { id: payload.id, email: payload.email, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}
