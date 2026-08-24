import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.insight.deleteMany();
  await prisma.billingRecord.deleteMany();
  await prisma.deployment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");
  
  // Create Super Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.create({
    data: {
      name: "Krishan Goyal",
      email: "krishan@admin.com",
      passwordHash: adminPassword,
      role: "ADMIN"
    },
  });

  // Create Regular Users
  const userPassword = await bcrypt.hash("password123", 10);
  const user1 = await prisma.user.create({
    data: {
      name: "Alice Smith",
      email: "alice@example.com",
      passwordHash: userPassword,
      role: "USER"
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Bob Jones",
      email: "bob@example.com",
      passwordHash: userPassword,
      role: "USER"
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: "Charlie Brown",
      email: "charlie@example.com",
      passwordHash: userPassword,
      role: "USER"
    },
  });

  console.log("Creating organizations...");
  const org1 = await prisma.organization.create({
    data: {
      name: "TechFlow Solutions",
      ownerId: adminUser.id,
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: "OmniSys Inc",
      ownerId: user1.id,
    },
  });

  const org3 = await prisma.organization.create({
    data: {
      name: "QuantumHealth",
      ownerId: user2.id,
    },
  });

  const orgs = [org1, org2, org3];
  const projectsPerOrg = [
    [
      { name: "E-commerce Backend", repo: "acme/ecommerce-api" },
      { name: "Customer Portal", repo: "acme/customer-portal" },
      { name: "Inventory Service", repo: "acme/inventory-service" }
    ],
    [
      { name: "Data Pipeline", repo: "globex/data-pipeline" },
      { name: "Auth Service", repo: "globex/auth-service" },
      { name: "Billing API", repo: "globex/billing-api" }
    ],
    [
      { name: "Mobile App Backend", repo: "initech/mobile-backend" },
      { name: "Admin Dashboard", repo: "initech/admin-dashboard" }
    ],
  ];

  const now = new Date();

  for (let i = 0; i < orgs.length; i++) {
    const org = orgs[i];

    const projectList = projectsPerOrg[i];
    for (const projectData of projectList) {
      const project = await prisma.project.create({
        data: {
          name: projectData.name,
          organizationId: org.id,
          githubUrl: `https://github.com/${projectData.repo}`,
        },
      });

      // Generate 30 days of billing records
      const services = ["AmazonEC2", "AmazonRDS", "AmazonS3", "AWSLambda"];
      
      let baseEC2Cost = 50 + Math.random() * 20;
      let baseRDSCost = 100 + Math.random() * 30;
      
      // Determine spike day
      const spikeDayOffset = Math.floor(Math.random() * 15) + 5; // spike between day 5 and 20 ago
      const spikeDate = new Date(now);
      spikeDate.setDate(spikeDate.getDate() - spikeDayOffset);

      for (let day = 30; day >= 0; day--) {
        const recordDate = new Date(now);
        recordDate.setDate(recordDate.getDate() - day);
        
        const isSpikePeriod = day <= spikeDayOffset;
        
        // EC2 costs jump by 250% after spike day
        const ec2Cost = isSpikePeriod ? baseEC2Cost * (2.5 + Math.random() * 0.5) : baseEC2Cost + (Math.random() * 5 - 2.5);
        const rdsCost = baseRDSCost + (Math.random() * 10 - 5);
        const s3Cost = 15 + Math.random() * 2;
        const lambdaCost = isSpikePeriod ? 20 * 1.5 : 20 + Math.random() * 5;

        await prisma.billingRecord.createMany({
          data: [
            { projectId: project.id, service: "AmazonEC2", cost: ec2Cost, date: recordDate },
            { projectId: project.id, service: "AmazonRDS", cost: rdsCost, date: recordDate },
            { projectId: project.id, service: "AmazonS3", cost: s3Cost, date: recordDate },
            { projectId: project.id, service: "AWSLambda", cost: lambdaCost, date: recordDate },
          ],
        });
      }

      // Generate deployments
      const numDeployments = 5 + Math.floor(Math.random() * 10);
      for (let j = 0; j < numDeployments; j++) {
        const depDate = new Date(now);
        depDate.setDate(depDate.getDate() - Math.floor(Math.random() * 30));
        
        await prisma.deployment.create({
          data: {
            projectId: project.id,
            commitHash: crypto.randomBytes(20).toString('hex'),
            message: `chore: update dependencies for ${projectData.name}`,
            author: "dev-bot",
            createdAt: depDate,
          },
        });
      }

      // Add one specific deployment that correlates with the spike
      await prisma.deployment.create({
        data: {
          projectId: project.id,
          commitHash: crypto.randomBytes(20).toString('hex'),
          message: `feat: add background image processing workers`,
          author: "Demo Admin",
          createdAt: spikeDate,
        },
      });

      // Generate Insights
      await prisma.insight.create({
        data: {
          projectId: project.id,
          title: "High Confidence: EC2 Cost Spike",
          description: `The recent deployment "feat: add background image processing workers" likely caused the 250% increase in AmazonEC2 costs starting on ${spikeDate.toLocaleDateString()}. Consider optimizing worker counts or using spot instances.`,
          confidenceScore: 85 + Math.random() * 10,
          createdAt: new Date(spikeDate.getTime() + 1000 * 60 * 60 * 24), // 1 day after spike
        },
      });
    }
  }

  console.log("Seeding complete! You can log in with krishan@admin.com / admin123 or alice@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
