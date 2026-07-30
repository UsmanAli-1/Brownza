import mongoose, { Schema, type Model } from "mongoose";

/**
 * Admin login now lives in Mongo (hashed) instead of a static env-var
 * username/password pair, so the password can actually be changed. The
 * collection is bootstrapped from ADMIN_USERNAME/ADMIN_PASSWORD on first
 * login if empty — see lib/services/admin-user-service.ts.
 */
export interface AdminUserDoc {
  username: string;
  passwordHash: string;
}

const AdminUserSchema = new Schema<AdminUserDoc>({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
});

export const AdminUser: Model<AdminUserDoc> =
  (mongoose.models.AdminUser as Model<AdminUserDoc>) ||
  mongoose.model<AdminUserDoc>("AdminUser", AdminUserSchema);
