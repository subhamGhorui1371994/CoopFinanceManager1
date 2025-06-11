import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id),
  isAdmin: boolean("is_admin").default(false).notNull(),
  canAddMembers: boolean("can_add_members").default(false).notNull(),
  isSuperAdmin: boolean("is_super_admin").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  joinDate: timestamp("join_date").defaultNow().notNull(),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  termMonths: integer("term_months").notNull(),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }).notNull(),
  purpose: text("purpose").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  startDate: timestamp("start_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const repayments = pgTable("repayments", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").references(() => loans.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at").defaultNow().notNull(),
  paymentMonth: varchar("payment_month", { length: 7 }).notNull(), // YYYY-MM format
});

export const monthlyContributions = pgTable("monthly_contributions", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at").defaultNow().notNull(),
});

export const profits = pgTable("profits", {
  id: serial("id").primaryKey(),
  totalProfit: decimal("total_profit", { precision: 10, scale: 2 }).notNull(),
  fixedPercent: decimal("fixed_percent", { precision: 5, scale: 2 }).notNull(),
  sharedPercentPerMember: decimal("shared_percent_per_member", { precision: 5, scale: 2 }).notNull(),
  calculationDate: timestamp("calculation_date").defaultNow().notNull(),
  year: integer("year").notNull(),
});

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  joinDate: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
  startDate: true,
  remainingBalance: true,
  monthlyPayment: true,
  totalAmount: true,
});

export const insertRepaymentSchema = createInsertSchema(repayments).omit({
  id: true,
  paidAt: true,
});

export const insertMonthlyContributionSchema = createInsertSchema(monthlyContributions).omit({
  id: true,
  paidAt: true,
});

export const insertProfitSchema = createInsertSchema(profits).omit({
  id: true,
  calculationDate: true,
});

// Types
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;

export type InsertRepayment = z.infer<typeof insertRepaymentSchema>;
export type Repayment = typeof repayments.$inferSelect;

export type InsertMonthlyContribution = z.infer<typeof insertMonthlyContributionSchema>;
export type MonthlyContribution = typeof monthlyContributions.$inferSelect;

export type InsertProfit = z.infer<typeof insertProfitSchema>;
export type Profit = typeof profits.$inferSelect;

// Extended types for API responses
export type MemberWithOrganization = Member & {
  organization?: Organization;
};

export type LoanWithMember = Loan & {
  member: MemberWithOrganization;
};

export type RepaymentWithLoan = Repayment & {
  loan: LoanWithMember;
};
