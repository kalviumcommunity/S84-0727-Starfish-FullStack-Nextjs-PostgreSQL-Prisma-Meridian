# **Product Requirements Document (PRD)**

## **CloudLens AI**

### **Cloud Cost Attribution & Deployment Intelligence Platform**

---

# **1\. Executive Summary**

CloudLens AI is an intelligent cloud cost attribution and deployment analysis platform designed to help engineering teams understand changes in cloud spending.

Modern cloud platforms provide billing information separately from deployment systems and monitoring tools. Because of this separation, teams struggle to identify:

* Why cloud costs increased.  
* Which deployment caused a cost spike.  
* Which applications or teams are responsible for spending.

CloudLens AI solves this problem by combining:

* Cloud billing data.  
* GitHub deployment history.  
* Application metadata.  
* AI-powered analysis.

The platform automatically detects cost anomalies, correlates them with engineering activities, and provides actionable recommendations.

---

# **2\. Problem Statement**

Cloud infrastructure costs are becoming increasingly difficult to manage.

Companies face several challenges:

## **Finance Challenges**

* Unexpected cloud bills are difficult to explain.  
* Cost ownership cannot be accurately identified.  
* Manual investigation takes significant time.

## **Engineering Challenges**

* Developers cannot easily understand the financial impact of deployments.  
* Multiple tools are required to investigate cost problems.  
* Identifying the cause of cost spikes is slow.

## **Management Challenges**

Engineering managers and leaders lack visibility into:

* Application-level cloud spending.  
* Deployment impact.  
* Infrastructure efficiency.

---

# **3\. Product Vision**

Build:

**"GitHub \+ Cloud Cost Explorer \+ AI Assistant for FinOps"**

CloudLens AI should answer:

**"Why did my cloud bill increase?"**

within seconds.

---

# **4\. Goals and Objectives**

## **Primary Goals**

The platform should:

* Import cloud billing data.  
* Analyze cloud spending patterns.  
* Connect GitHub deployment activities with cost changes.  
* Detect abnormal spending behavior.  
* Generate AI-powered explanations.  
* Provide analytics dashboards.

---

# **5\. MVP Scope**

The first version of CloudLens AI will focus on:

## **Included Features**

* User authentication.  
* Organization management.  
* GitHub repository connection.  
* Billing CSV upload.  
* Cost analysis.  
* Deployment correlation.  
* AI-generated insights.  
* Dashboard visualization.

## **Excluded Features**

The MVP will not include:

* Multi-cloud live billing APIs.  
* Enterprise SSO.  
* Kubernetes cost allocation.  
* Real-time infrastructure monitoring.  
* Advanced enterprise billing rules.

---

# **6\. Target Users**

## **Developers**

Needs:

* Understand deployment cost impact.  
* Identify expensive changes.  
* Optimize infrastructure usage.

---

## **Engineering Managers**

Needs:

* Project-level cost visibility.  
* Release impact analysis.  
* Cloud spending insights.

---

## **FinOps Learners**

Needs:

* Understand cloud cost management.  
* Learn infrastructure optimization.

---

# **7\. Product Modules**

## **Module 1: Authentication**

### **Features**

* User registration.  
* User login.  
* Logout.  
* JWT authentication.  
* Password encryption.

### **Future Enhancements**

* Google OAuth.  
* Microsoft OAuth.  
* Multi-factor authentication.  
* Single Sign-On.

---

# **Module 2: Organization Management**

Users can create:

Organization

↓

Projects

↓

Repositories

### **Features**

* Create organizations.  
* Create projects.  
* Manage project ownership.

---

# **Module 3: GitHub Integration**

## **Purpose**

Track engineering activities and deployment history.

## **Features**

The system will fetch:

* Repository information.  
* Commits.  
* Commit messages.  
* Authors.  
* Commit timestamps.

Example:

Deployment Event:

Commit:  
 "Added background workers"

Author:  
 Developer

Date:  
 10 February 2026

---

# **Module 4: Cloud Billing Import**

## **MVP Approach**

Instead of direct cloud provider APIs, users upload billing CSV files.

Example:

| Date | Service | Cost |
| ----- | ----- | ----- |
| 10 Feb | EC2 | $50 |
| 11 Feb | EC2 | $150 |
| 12 Feb | S3 | $30 |

The system stores and analyzes billing records.

---

# **Module 5: Cost Analysis Engine**

## **Purpose**

Detect unusual cloud spending patterns.

## **Features**

### **Cost Spike Detection**

Example:

Previous Cost:

$50/day

Current Cost:

$200/day

Result:

Cost increased by 300%.

---

### **Service Analysis**

The system identifies:

* Expensive services.  
* Increasing costs.  
* Abnormal usage patterns.

---

# **Module 6: Deployment Correlation Engine**

## **Purpose**

Connect cost changes with engineering activities.

Example:

Billing Data:

12 February

EC2 Cost increased by 250%

Deployment:

12 February

Added 10 background workers

System Output:

Possible Cause:

The deployment increased compute workload.

Confidence Score:

85%

---

# **Module 7: AI Insights Engine**

## **Purpose**

Provide natural language explanations.

Example Input:

Cloud cost increased by 200%.

Deployment:  
 Added image processing workers.

Service:  
 EC2

AI Output:

"The recent deployment likely increased compute usage. Consider reducing worker count or enabling autoscaling."

---

# **Module 8: Dashboard**

## **Overview Dashboard**

Displays:

* Total cloud cost.  
* Cost increase percentage.  
* Active projects.  
* Detected issues.

---

## **Cost Explorer**

Features:

* Cost graphs.  
* Service breakdown.  
* Date filtering.

---

## **Deployment Timeline**

Shows:

Deployment → Cost Change → Possible Cause

---

## **AI Insights**

Displays:

* Root cause analysis.  
* Recommendations.  
* Confidence score.

---

## **Reports**

Features:

* CSV export.  
* PDF export.

---

# **8\. Database Design**

## **User Table**

Fields:

* id  
* name  
* email  
* passwordHash  
* createdAt

---

## **Organization Table**

Fields:

* id  
* name  
* ownerId  
* createdAt

---

## **Project Table**

Fields:

* id  
* organizationId  
* name  
* githubUrl  
* createdAt

---

## **Deployment Table**

Fields:

* id  
* projectId  
* commitHash  
* message  
* author  
* createdAt

---

## **Billing Record Table**

Fields:

* id  
* projectId  
* service  
* cost  
* date

---

## **Insight Table**

Fields:

* id  
* projectId  
* title  
* description  
* confidenceScore  
* createdAt

---

# **9\. API Design**

## **Authentication APIs**

POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

## **Organization APIs**

POST /api/organizations

GET /api/organizations

## **Project APIs**

POST /api/projects

GET /api/projects/:id

## **GitHub APIs**

POST /api/github/connect

GET /api/github/commits

## **Billing APIs**

POST /api/billing/upload

GET /api/billing

GET /api/billing/analysis

## **AI APIs**

GET /api/insights

POST /api/insights/generate

---

# **10\. System Architecture**

User

↓

Next.js Frontend

↓

Node.js Backend

↓

---

PostgreSQL Database

GitHub API

CSV Processor

AI API

---

↓

Correlation Engine

↓

Dashboard Insights

---

# **11\. Technology Stack**

## **Frontend**

* Next.js  
* React  
* TypeScript  
* Tailwind CSS  
* Recharts

## **Backend**

* Node.js  
* Express.js  
* Prisma ORM  
* JWT

## **Database**

* PostgreSQL  
* Supabase Free Tier

## **Storage**

* Supabase Storage

## **AI**

* Gemini API  
* Groq API

## **Deployment**

Frontend:

Vercel

Backend:

Render

---

# **12\. Security Requirements**

The MVP will implement:

* JWT authentication.  
* Password hashing.  
* API validation.  
* Environment variable protection.  
* Rate limiting.  
* Input sanitization.

Future:

* OAuth.  
* MFA.  
* SSO.

---

# **13\. Non-Functional Requirements**

## **Performance**

* Dashboard load time: Less than 3 seconds.  
* API response time: Less than 500ms.

## **Scalability**

The system should support:

* Multiple users.  
* Multiple organizations.  
* Multiple projects.

## **Reliability**

Requirements:

* Error logging.  
* Database backup strategy.

---

# **14\. Development Roadmap**

## **Phase 1: Foundation**

Duration: 1 week

Tasks:

* Backend setup.  
* Database setup.  
* Authentication.  
* Organization system.

## **Phase 2: GitHub Integration**

Duration: 1 week

Tasks:

* Repository connection.  
* Commit fetching.  
* Deployment timeline.

## **Phase 3: Billing Engine**

Duration: 1 week

Tasks:

* CSV upload.  
* Cost storage.  
* Cost visualization.

## **Phase 4: Correlation Engine**

Duration: 2 weeks

Tasks:

* Cost spike detection.  
* Deployment matching.  
* Confidence scoring.

## **Phase 5: AI Insights**

Duration: 1 week

Tasks:

* AI integration.  
* Recommendations.

## **Phase 6: Dashboard**

Duration: 2 weeks

Tasks:

* Analytics UI.  
* Reports.  
* Deployment.

---

# **15\. Future Enhancements**

Future versions may include:

* AWS Cost Explorer integration.  
* Azure Cost Management.  
* Google Cloud Billing.  
* Kubernetes cost allocation.  
* Terraform integration.  
* Prometheus monitoring.  
* Slack alerts.  
* LLM chatbot assistant.  
* Mobile application.

---

# **16\. Success Metrics**

The MVP will be successful when users can:

* Upload billing data.  
* Connect GitHub repositories.  
* Detect cost spikes.  
* Identify possible deployment causes.  
* Receive AI recommendations.  
* Analyze cloud spending through dashboards.

---

# **17\. Final Product Statement**

CloudLens AI connects engineering activity with cloud spending.

It helps teams understand cost changes, identify inefficient usage, and make better infrastructure decisions through automated cost attribution, deployment correlation, and AI-powered insights.

