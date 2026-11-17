export type Attendance = 'yes' | 'maybe' | 'no';
export type RSVPInput = { name: string; email: string; attendance: Attendance; partySize: number; message: string };

export function validateRsvp(value: unknown): RSVPInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Please complete your RSVP.');
  const data = value as Record<string, unknown>;
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  if (name.length < 2 || name.length > 100) throw new Error('Enter a name between 2 and 100 characters.');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  if (!['yes', 'maybe', 'no'].includes(String(data.attendance))) throw new Error('Choose whether you plan to attend.');
  const attendance = data.attendance as Attendance;
  if (typeof data.partySize !== 'number' || !Number.isInteger(data.partySize)) throw new Error('The number attending must be a whole number.');
  if (attendance !== 'no' && (data.partySize < 1 || data.partySize > 50)) throw new Error('Enter between 1 and 50 people, including you.');
  if (attendance === 'no' && data.partySize !== 0) throw new Error('Choose zero guests when you cannot attend.');
  if (message.length > 1000) throw new Error('Please keep your message under 1,000 characters.');
  return { name, email, attendance, partySize: data.partySize, message };
}

export function readEditToken(request: Request): string | null {
  const raw = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
  return /^[a-f0-9]{64}$/.test(raw) ? raw : null;
}

export async function hashToken(token: string): Promise<string> {
  const result = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(result), b => b.toString(16).padStart(2, '0')).join('');
}

export function csvCell(value: string | number): string {
  let text = String(value);
  if (/^[=+@\-\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
