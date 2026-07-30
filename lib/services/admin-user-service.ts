import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/mongoose";
import { AdminUser } from "@/lib/models/admin-user";

const SALT_ROUNDS = 10;

/**
 * Bootstraps the AdminUser collection from ADMIN_USERNAME/ADMIN_PASSWORD env
 * vars the first time anyone logs in, if no admin account exists yet — so
 * moving credentials into Mongo doesn't require a manual migration step.
 */
async function ensureBootstrapped(): Promise<void> {
  const count = await AdminUser.countDocuments();
  if (count > 0) return;

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    await AdminUser.create({ username, passwordHash });
  } catch (error) {
    // Two concurrent first-logins can both pass the count check above; the
    // unique index on `username` rejects the loser with E11000, which is
    // fine — it means another request already bootstrapped the account.
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      (error as { code?: number }).code !== 11000
    ) {
      throw error;
    }
  }
}

export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  await connectToDatabase();
  await ensureBootstrapped();

  const user = await AdminUser.findOne({ username }).lean();
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}

export async function changeAdminPassword(
  username: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  await connectToDatabase();

  const user = await AdminUser.findOne({ username });
  if (!user) return { ok: false, error: "Admin account not found." };

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) return { ok: false, error: "Current password is incorrect." };

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
  return { ok: true };
}
