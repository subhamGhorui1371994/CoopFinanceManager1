import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertOrganizationSchema,
  insertMemberSchema,
  insertLoanSchema,
  insertRepaymentSchema,
  insertMonthlyContributionSchema,
  insertProfitSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      const member = await storage.getMemberByEmail(email);
      
      if (!member || member.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      if (!member.isActive) {
        return res.status(401).json({ error: "Account is inactive" });
      }
      
      // In a real app, you'd generate a JWT token here
      const { password: _, ...memberData } = member;
      res.json({ 
        user: memberData,
        token: `fake-jwt-token-${member.id}` // This would be a real JWT
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Statistics endpoint
  app.get("/api/statistics", async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Organization routes
  app.get("/api/organizations", async (req, res) => {
    try {
      const organizations = await storage.getOrganizations();
      res.json(organizations);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/organizations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const organization = await storage.getOrganization(id);
      
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }
      
      res.json(organization);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/organizations", async (req, res) => {
    try {
      const validatedData = insertOrganizationSchema.parse(req.body);
      const organization = await storage.createOrganization(validatedData);
      res.status(201).json(organization);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/organizations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertOrganizationSchema.partial().parse(req.body);
      const organization = await storage.updateOrganization(id, validatedData);
      
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }
      
      res.json(organization);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/organizations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteOrganization(id);
      
      if (!success) {
        return res.status(404).json({ error: "Organization not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Member routes
  app.get("/api/members", async (req, res) => {
    try {
      const { organizationId } = req.query;
      
      let members;
      if (organizationId) {
        members = await storage.getMembersByOrganization(parseInt(organizationId as string));
      } else {
        members = await storage.getMembers();
      }
      
      // Remove password from response
      const safemembers = members.map(({ password, ...member }) => member);
      res.json(safemembers);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const member = await storage.getMember(id);
      
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      const { password, ...safeMember } = member;
      res.json(safeMember);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const validatedData = insertMemberSchema.parse(req.body);
      const member = await storage.createMember(validatedData);
      const { password, ...safeMember } = member;
      res.status(201).json(safeMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMemberSchema.partial().parse(req.body);
      const member = await storage.updateMember(id, validatedData);
      
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      const { password, ...safeMember } = member;
      res.json(safeMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMember(id);
      
      if (!success) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Loan routes
  app.get("/api/loans", async (req, res) => {
    try {
      const { memberId, organizationId } = req.query;
      
      let loans;
      if (memberId) {
        loans = await storage.getLoansByMember(parseInt(memberId as string));
      } else if (organizationId) {
        loans = await storage.getLoansByOrganization(parseInt(organizationId as string));
      } else {
        loans = await storage.getLoans();
      }
      
      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/loans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const loan = await storage.getLoan(id);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      res.json(loan);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/loans", async (req, res) => {
    try {
      const validatedData = insertLoanSchema.parse(req.body);
      const loan = await storage.createLoan(validatedData);
      res.status(201).json(loan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/loans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLoanSchema.partial().parse(req.body);
      const loan = await storage.updateLoan(id, validatedData);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      res.json(loan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/loans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLoan(id);
      
      if (!success) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Approve/Reject loan
  app.patch("/api/loans/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['approved', 'rejected', 'active'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updateData: any = { status };
      if (status === 'active') {
        updateData.startDate = new Date();
      }
      
      const loan = await storage.updateLoan(id, updateData);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      res.json(loan);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Repayment routes
  app.get("/api/repayments", async (req, res) => {
    try {
      const { loanId, memberId } = req.query;
      
      let repayments;
      if (loanId) {
        repayments = await storage.getRepaymentsByLoan(parseInt(loanId as string));
      } else if (memberId) {
        repayments = await storage.getRepaymentsByMember(parseInt(memberId as string));
      } else {
        repayments = await storage.getRepayments();
      }
      
      res.json(repayments);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/repayments", async (req, res) => {
    try {
      const validatedData = insertRepaymentSchema.parse(req.body);
      
      // Check if repayment for this month already exists
      const monthExists = await storage.checkMonthlyRepaymentExists(
        validatedData.loanId, 
        validatedData.paymentMonth
      );
      
      if (monthExists) {
        return res.status(400).json({ error: "Repayment for this month already exists" });
      }
      
      const repayment = await storage.createRepayment(validatedData);
      res.status(201).json(repayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Monthly contribution routes
  app.get("/api/contributions", async (req, res) => {
    try {
      const { memberId, month } = req.query;
      
      let contributions;
      if (memberId) {
        contributions = await storage.getContributionsByMember(parseInt(memberId as string));
      } else if (month) {
        contributions = await storage.getContributionsByMonth(month as string);
      } else {
        contributions = await storage.getContributions();
      }
      
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/contributions", async (req, res) => {
    try {
      const validatedData = insertMonthlyContributionSchema.parse(req.body);
      const contribution = await storage.createContribution(validatedData);
      res.status(201).json(contribution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Profit routes
  app.get("/api/profits", async (req, res) => {
    try {
      const { year } = req.query;
      
      let profits;
      if (year) {
        const profit = await storage.getProfitByYear(parseInt(year as string));
        profits = profit ? [profit] : [];
      } else {
        profits = await storage.getProfits();
      }
      
      res.json(profits);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/profits", async (req, res) => {
    try {
      const validatedData = insertProfitSchema.parse(req.body);
      const profit = await storage.createProfit(validatedData);
      res.status(201).json(profit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
