import { z } from 'zod';

export const ReminderSchema = z.object({
  invoice_code: z.string(),
  invoice_id: z.number(),
  customer_id: z.number(),
  customer_code: z.string(),
  customer_name: z.string(),
  phone: z.string(),
  purchase_date: z.string(),
  due_date: z.string(),
  total: z.number(),
  products: z.array(z.object({
    name: z.string(),
    quantity: z.number()
  })),
  sent: z.boolean(),
  sent_at: z.string().nullable()
});

export const OilProductSchema = z.object({
  product_id: z.number(),
  product_name: z.string(),
  category_name: z.string()
});

export const UserRoleSchema = z.enum(['admin', 'staff']);

export const CreateUserSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  role: UserRoleSchema.optional().default('staff'),
});

export const UpdatePasswordSchema = z.object({
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});

export const UpdateRoleSchema = z.object({
  role: UserRoleSchema,
});
