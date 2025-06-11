import { 
  organizations, 
  members, 
  loans, 
  repayments, 
  monthlyContributions, 
  profits,
  type Organization,
  type Member,
  type Loan,
  type Repayment,
  type MonthlyContribution,
  type Profit,
  type InsertOrganization,
  type InsertMember,
  type InsertLoan,
  type InsertRepayment,
  type InsertMonthlyContribution,
  type InsertProfit,
  type MemberWithOrganization,
  type LoanWithMember,
  type RepaymentWithLoan
} from "@shared/schema";

export interface IStorage {
  // Organizations
  getOrganizations(): Promise<Organization[]>;
  getOrganization(id: number): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  updateOrganization(id: number, org: Partial<InsertOrganization>): Promise<Organization | undefined>;
  deleteOrganization(id: number): Promise<boolean>;

  // Members
  getMembers(): Promise<MemberWithOrganization[]>;
  getMember(id: number): Promise<MemberWithOrganization | undefined>;
  getMemberByEmail(email: string): Promise<MemberWithOrganization | undefined>;
  getMembersByOrganization(organizationId: number): Promise<MemberWithOrganization[]>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, member: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: number): Promise<boolean>;

  // Loans
  getLoans(): Promise<LoanWithMember[]>;
  getLoan(id: number): Promise<LoanWithMember | undefined>;
  getLoansByMember(memberId: number): Promise<LoanWithMember[]>;
  getLoansByOrganization(organizationId: number): Promise<LoanWithMember[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: number, loan: Partial<InsertLoan>): Promise<Loan | undefined>;
  deleteLoan(id: number): Promise<boolean>;

  // Repayments
  getRepayments(): Promise<RepaymentWithLoan[]>;
  getRepayment(id: number): Promise<RepaymentWithLoan | undefined>;
  getRepaymentsByLoan(loanId: number): Promise<Repayment[]>;
  getRepaymentsByMember(memberId: number): Promise<RepaymentWithLoan[]>;
  createRepayment(repayment: InsertRepayment): Promise<Repayment>;
  checkMonthlyRepaymentExists(loanId: number, month: string): Promise<boolean>;

  // Monthly Contributions
  getContributions(): Promise<MonthlyContribution[]>;
  getContributionsByMember(memberId: number): Promise<MonthlyContribution[]>;
  getContributionsByMonth(month: string): Promise<MonthlyContribution[]>;
  createContribution(contribution: InsertMonthlyContribution): Promise<MonthlyContribution>;

  // Profits
  getProfits(): Promise<Profit[]>;
  getProfitByYear(year: number): Promise<Profit | undefined>;
  createProfit(profit: InsertProfit): Promise<Profit>;

  // Statistics
  getStatistics(): Promise<{
    totalOrganizations: number;
    totalMembers: number;
    activeLoans: number;
    totalProfit: number;
    activeLoanAmount: number;
    pendingApplications: number;
    overduePayments: number;
  }>;
}

export class MemStorage implements IStorage {
  private organizations: Map<number, Organization>;
  private members: Map<number, Member>;
  private loans: Map<number, Loan>;
  private repayments: Map<number, Repayment>;
  private contributions: Map<number, MonthlyContribution>;
  private profits: Map<number, Profit>;
  private currentId: { [key: string]: number };

  constructor() {
    this.organizations = new Map();
    this.members = new Map();
    this.loans = new Map();
    this.repayments = new Map();
    this.contributions = new Map();
    this.profits = new Map();
    this.currentId = {
      organizations: 1,
      members: 1,
      loans: 1,
      repayments: 1,
      contributions: 1,
      profits: 1,
    };

    // Create super admin user
    this.createMember({
      name: "Super Administrator",
      email: "admin@cooploan.com",
      password: "admin123",
      organizationId: null,
      isAdmin: true,
      canAddMembers: true,
      isSuperAdmin: true,
      isActive: true,
    });
  }

  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values());
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const id = this.currentId.organizations++;
    const newOrg: Organization = {
      ...org,
      id,
      createdAt: new Date(),
    };
    this.organizations.set(id, newOrg);
    return newOrg;
  }

  async updateOrganization(id: number, org: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const existing = this.organizations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...org };
    this.organizations.set(id, updated);
    return updated;
  }

  async deleteOrganization(id: number): Promise<boolean> {
    return this.organizations.delete(id);
  }

  // Members
  async getMembers(): Promise<MemberWithOrganization[]> {
    const membersList = Array.from(this.members.values());
    return membersList.map(member => ({
      ...member,
      organization: member.organizationId 
        ? this.organizations.get(member.organizationId) 
        : undefined,
    }));
  }

  async getMember(id: number): Promise<MemberWithOrganization | undefined> {
    const member = this.members.get(id);
    if (!member) return undefined;
    
    return {
      ...member,
      organization: member.organizationId 
        ? this.organizations.get(member.organizationId) 
        : undefined,
    };
  }

  async getMemberByEmail(email: string): Promise<MemberWithOrganization | undefined> {
    const member = Array.from(this.members.values()).find(m => m.email === email);
    if (!member) return undefined;
    
    return {
      ...member,
      organization: member.organizationId 
        ? this.organizations.get(member.organizationId) 
        : undefined,
    };
  }

  async getMembersByOrganization(organizationId: number): Promise<MemberWithOrganization[]> {
    const membersList = Array.from(this.members.values())
      .filter(member => member.organizationId === organizationId);
    
    return membersList.map(member => ({
      ...member,
      organization: this.organizations.get(organizationId),
    }));
  }

  async createMember(member: InsertMember): Promise<Member> {
    const id = this.currentId.members++;
    const newMember: Member = {
      ...member,
      id,
      joinDate: new Date(),
    };
    this.members.set(id, newMember);
    return newMember;
  }

  async updateMember(id: number, member: Partial<InsertMember>): Promise<Member | undefined> {
    const existing = this.members.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...member };
    this.members.set(id, updated);
    return updated;
  }

  async deleteMember(id: number): Promise<boolean> {
    return this.members.delete(id);
  }

  // Loans
  async getLoans(): Promise<LoanWithMember[]> {
    const loansList = Array.from(this.loans.values());
    return loansList.map(loan => {
      const member = this.members.get(loan.memberId);
      const memberWithOrg: MemberWithOrganization = {
        ...member!,
        organization: member?.organizationId 
          ? this.organizations.get(member.organizationId) 
          : undefined,
      };
      return {
        ...loan,
        member: memberWithOrg,
      };
    });
  }

  async getLoan(id: number): Promise<LoanWithMember | undefined> {
    const loan = this.loans.get(id);
    if (!loan) return undefined;
    
    const member = this.members.get(loan.memberId);
    if (!member) return undefined;
    
    const memberWithOrg: MemberWithOrganization = {
      ...member,
      organization: member.organizationId 
        ? this.organizations.get(member.organizationId) 
        : undefined,
    };
    
    return {
      ...loan,
      member: memberWithOrg,
    };
  }

  async getLoansByMember(memberId: number): Promise<LoanWithMember[]> {
    const memberLoans = Array.from(this.loans.values())
      .filter(loan => loan.memberId === memberId);
    
    const member = this.members.get(memberId);
    if (!member) return [];
    
    const memberWithOrg: MemberWithOrganization = {
      ...member,
      organization: member.organizationId 
        ? this.organizations.get(member.organizationId) 
        : undefined,
    };
    
    return memberLoans.map(loan => ({
      ...loan,
      member: memberWithOrg,
    }));
  }

  async getLoansByOrganization(organizationId: number): Promise<LoanWithMember[]> {
    const orgMembers = Array.from(this.members.values())
      .filter(member => member.organizationId === organizationId);
    
    const orgMemberIds = orgMembers.map(m => m.id);
    const orgLoans = Array.from(this.loans.values())
      .filter(loan => orgMemberIds.includes(loan.memberId));
    
    return orgLoans.map(loan => {
      const member = orgMembers.find(m => m.id === loan.memberId)!;
      const memberWithOrg: MemberWithOrganization = {
        ...member,
        organization: this.organizations.get(organizationId),
      };
      return {
        ...loan,
        member: memberWithOrg,
      };
    });
  }

  async createLoan(loanData: InsertLoan): Promise<Loan> {
    const id = this.currentId.loans++;
    
    // Calculate loan details
    const monthlyRate = parseFloat(loanData.interestRate) / 100 / 12;
    const monthlyPayment = parseFloat(loanData.amount) * 
      (monthlyRate * Math.pow(1 + monthlyRate, loanData.termMonths)) / 
      (Math.pow(1 + monthlyRate, loanData.termMonths) - 1);
    const totalAmount = monthlyPayment * loanData.termMonths;
    
    const newLoan: Loan = {
      ...loanData,
      id,
      monthlyPayment: monthlyPayment.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      remainingBalance: loanData.amount,
      createdAt: new Date(),
      startDate: null,
    };
    
    this.loans.set(id, newLoan);
    return newLoan;
  }

  async updateLoan(id: number, loan: Partial<InsertLoan>): Promise<Loan | undefined> {
    const existing = this.loans.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...loan };
    this.loans.set(id, updated);
    return updated;
  }

  async deleteLoan(id: number): Promise<boolean> {
    return this.loans.delete(id);
  }

  // Repayments
  async getRepayments(): Promise<RepaymentWithLoan[]> {
    const repaymentsList = Array.from(this.repayments.values());
    return repaymentsList.map(repayment => {
      const loan = this.loans.get(repayment.loanId);
      const member = loan ? this.members.get(loan.memberId) : undefined;
      const memberWithOrg: MemberWithOrganization = member ? {
        ...member,
        organization: member.organizationId 
          ? this.organizations.get(member.organizationId) 
          : undefined,
      } : {} as MemberWithOrganization;
      
      const loanWithMember: LoanWithMember = {
        ...loan!,
        member: memberWithOrg,
      };
      
      return {
        ...repayment,
        loan: loanWithMember,
      };
    });
  }

  async getRepayment(id: number): Promise<RepaymentWithLoan | undefined> {
    const repayment = this.repayments.get(id);
    if (!repayment) return undefined;
    
    const loan = this.loans.get(repayment.loanId);
    if (!loan) return undefined;
    
    const member = this.members.get(loan.memberId);
    if (!member) return undefined;
    
    const memberWithOrg: MemberWithOrganization = {
      ...member,
      organization: member.organizationId 
        ? this.organizations.get(member.organizationId) 
        : undefined,
    };
    
    const loanWithMember: LoanWithMember = {
      ...loan,
      member: memberWithOrg,
    };
    
    return {
      ...repayment,
      loan: loanWithMember,
    };
  }

  async getRepaymentsByLoan(loanId: number): Promise<Repayment[]> {
    return Array.from(this.repayments.values())
      .filter(repayment => repayment.loanId === loanId);
  }

  async getRepaymentsByMember(memberId: number): Promise<RepaymentWithLoan[]> {
    const memberLoans = Array.from(this.loans.values())
      .filter(loan => loan.memberId === memberId);
    
    const loanIds = memberLoans.map(loan => loan.id);
    const memberRepayments = Array.from(this.repayments.values())
      .filter(repayment => loanIds.includes(repayment.loanId));
    
    const member = this.members.get(memberId);
    if (!member) return [];
    
    const memberWithOrg: MemberWithOrganization = {
      ...member,
      organization: member.organizationId 
        ? this.organizations.get(member.organizationId) 
        : undefined,
    };
    
    return memberRepayments.map(repayment => {
      const loan = memberLoans.find(l => l.id === repayment.loanId)!;
      const loanWithMember: LoanWithMember = {
        ...loan,
        member: memberWithOrg,
      };
      return {
        ...repayment,
        loan: loanWithMember,
      };
    });
  }

  async createRepayment(repayment: InsertRepayment): Promise<Repayment> {
    const id = this.currentId.repayments++;
    const newRepayment: Repayment = {
      ...repayment,
      id,
      paidAt: new Date(),
    };
    
    // Update loan remaining balance
    const loan = this.loans.get(repayment.loanId);
    if (loan) {
      const newBalance = parseFloat(loan.remainingBalance) - parseFloat(repayment.amount);
      const updatedLoan = {
        ...loan,
        remainingBalance: Math.max(0, newBalance).toFixed(2),
      };
      this.loans.set(repayment.loanId, updatedLoan);
    }
    
    this.repayments.set(id, newRepayment);
    return newRepayment;
  }

  async checkMonthlyRepaymentExists(loanId: number, month: string): Promise<boolean> {
    return Array.from(this.repayments.values())
      .some(repayment => repayment.loanId === loanId && repayment.paymentMonth === month);
  }

  // Monthly Contributions
  async getContributions(): Promise<MonthlyContribution[]> {
    return Array.from(this.contributions.values());
  }

  async getContributionsByMember(memberId: number): Promise<MonthlyContribution[]> {
    return Array.from(this.contributions.values())
      .filter(contrib => contrib.memberId === memberId);
  }

  async getContributionsByMonth(month: string): Promise<MonthlyContribution[]> {
    return Array.from(this.contributions.values())
      .filter(contrib => contrib.month === month);
  }

  async createContribution(contribution: InsertMonthlyContribution): Promise<MonthlyContribution> {
    const id = this.currentId.contributions++;
    const newContribution: MonthlyContribution = {
      ...contribution,
      id,
      paidAt: new Date(),
    };
    this.contributions.set(id, newContribution);
    return newContribution;
  }

  // Profits
  async getProfits(): Promise<Profit[]> {
    return Array.from(this.profits.values());
  }

  async getProfitByYear(year: number): Promise<Profit | undefined> {
    return Array.from(this.profits.values()).find(profit => profit.year === year);
  }

  async createProfit(profit: InsertProfit): Promise<Profit> {
    const id = this.currentId.profits++;
    const newProfit: Profit = {
      ...profit,
      id,
      calculationDate: new Date(),
    };
    this.profits.set(id, newProfit);
    return newProfit;
  }

  // Statistics
  async getStatistics(): Promise<{
    totalOrganizations: number;
    totalMembers: number;
    activeLoans: number;
    totalProfit: number;
    activeLoanAmount: number;
    pendingApplications: number;
    overduePayments: number;
  }> {
    const totalOrganizations = this.organizations.size;
    const totalMembers = Array.from(this.members.values()).filter(m => m.isActive).length;
    const activeLoans = Array.from(this.loans.values()).filter(l => l.status === 'active').length;
    const pendingApplications = Array.from(this.loans.values()).filter(l => l.status === 'pending').length;
    
    const activeLoanAmount = Array.from(this.loans.values())
      .filter(l => l.status === 'active')
      .reduce((sum, loan) => sum + parseFloat(loan.remainingBalance), 0);
    
    const profits = Array.from(this.profits.values());
    const totalProfit = profits.reduce((sum, profit) => sum + parseFloat(profit.totalProfit), 0);
    
    // For now, consider overdue as loans with no recent payments (simplified)
    const overduePayments = 0; // This would require more complex date logic

    return {
      totalOrganizations,
      totalMembers,
      activeLoans,
      totalProfit,
      activeLoanAmount,
      pendingApplications,
      overduePayments,
    };
  }
}

export const storage = new MemStorage();
