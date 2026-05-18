import { connectDB } from '../db';
import { User } from '../db/models/User';
import { hashPassword } from './passwords';

let bootstrapped = false;

/**
 * On first run, if no users exist in Mongo and BOOTSTRAP_ADMIN_* env vars are
 * set, seed an initial admin so someone can actually log in. Idempotent and
 * safe to call from middleware / API routes — only runs once per process.
 */
export async function ensureBootstrapAdmin(): Promise<void> {
  if (bootstrapped) return;
  bootstrapped = true;

  const email = import.meta.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = import.meta.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) return;

  await connectDB();
  const count = await User.estimatedDocumentCount();
  if (count > 0) return;

  const passwordHash = await hashPassword(password);
  await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role: 'admin',
    disabled: false,
  });
  console.log(`[bootstrap] Seeded initial admin user ${email}`);
}
