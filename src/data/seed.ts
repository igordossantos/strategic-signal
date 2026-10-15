import type { Guidance, Signal, Source } from "../types";

export const seedSources: Source[] = [
  {
    id: "fabric-updates-rss",
    name: "Microsoft Fabric Updates",
    url: "https://community.fabric.microsoft.com/t5/s/yrjkf47658/rss/boardmessages?board.id=fbc_fabricupdatesblogs",
    kind: "rss",
    tier: "official",
    method: "RSS / Atom",
    enabled: true,
    platforms: ["Microsoft Fabric"],
    tags: ["release", "availability", "fabric"],
    notes: "Primary ground-truth feed for Fabric releases and exact publication dates.",
    health: "healthy",
    lastChecked: "2026-10-06",
  },
  {
    id: "fabric-blog",
    name: "Microsoft Fabric Blog",
    url: "https://www.microsoft.com/en-us/microsoft-fabric/blog/",
    kind: "blog",
    tier: "official",
    method: "Public web",
    enabled: true,
    platforms: ["Microsoft Fabric"],
    tags: ["strategy", "announcement", "fabric"],
    notes: "Official strategy and announcement posts.",
    health: "healthy",
    lastChecked: "2026-10-06",
  },
  {
    id: "fabric-learn",
    name: "What's new in Microsoft Fabric",
    url: "https://learn.microsoft.com/en-us/fabric/get-started/whats-new",
    kind: "documentation",
    tier: "official",
    method: "Public web",
    enabled: true,
    platforms: ["Microsoft Fabric"],
    tags: ["verification", "availability", "documentation"],
    notes: "Used to corroborate availability claims.",
    health: "healthy",
    lastChecked: "2026-10-06",
  },
  {
    id: "azure-sql-blog",
    name: "Azure SQL Blog",
    url: "https://techcommunity.microsoft.com/category/azuresql/blog/azuresqlblog",
    kind: "blog",
    tier: "official",
    method: "Public web",
    enabled: true,
    platforms: ["Microsoft SQL"],
    tags: ["sql", "database", "release"],
    notes: "Official Azure SQL announcements and engineering guidance.",
    health: "healthy",
    lastChecked: "2026-10-06",
  },
  {
    id: "foundry-docs",
    name: "Microsoft Foundry documentation",
    url: "https://learn.microsoft.com/en-us/azure/ai-foundry/",
    kind: "documentation",
    tier: "official",
    method: "Public web",
    enabled: true,
    platforms: ["Microsoft Foundry"],
    tags: ["foundry", "agents", "models"],
    notes: "Official product documentation and release guidance.",
    health: "healthy",
    lastChecked: "2026-10-06",
  },
  {
    id: "databricks-release-notes",
    name: "Azure Databricks release notes",
    url: "https://learn.microsoft.com/en-us/azure/databricks/release-notes/",
    kind: "documentation",
    tier: "official",
    method: "Public web",
    enabled: true,
    platforms: ["Azure Databricks"],
    tags: ["databricks", "release", "lakehouse"],
    notes: "Official Azure Databricks release notes.",
    health: "healthy",
    lastChecked: "2026-10-06",
  },
  {
    id: "kim-manis-linkedin",
    name: "Kim Manis on LinkedIn",
    url: "https://www.linkedin.com/in/kimmanis/",
    kind: "linkedin",
    tier: "social",
    method: "User-triggered capture",
    enabled: true,
    platforms: ["Microsoft Fabric"],
    tags: ["platform", "admin", "monthly-roundup"],
    notes: "Leadership framing. Capture manually; corroborate customer-facing claims.",
    health: "manual",
  },
  {
    id: "bogdan-crivat-linkedin",
    name: "Bogdan Crivat on LinkedIn",
    url: "https://www.linkedin.com/in/bogdanc/",
    kind: "linkedin",
    tier: "social",
    method: "User-triggered capture",
    enabled: true,
    platforms: ["Microsoft Fabric", "Microsoft Foundry"],
    tags: ["engineering", "warehouse", "fabric-iq"],
    notes: "High-value engineering amplifier. Capture manually.",
    health: "manual",
  },
  {
    id: "james-serra",
    name: "James Serra",
    url: "https://www.jamesserra.com/",
    kind: "blog",
    tier: "expert",
    method: "Public web",
    enabled: true,
    platforms: ["Microsoft Fabric", "Azure Databricks"],
    tags: ["architecture", "decision-guidance", "performance"],
    notes: "Practical architecture analysis and trade-off guidance.",
    health: "healthy",
    lastChecked: "2026-09-01",
  },
];

export const seedGuidance: Guidance[] = [
  {
    id: "farmers-data-products",
    title: "Governed data product management",
    audience: "Farmers Insurance",
    need: "Explore ways to manage data products with clear ownership, reusable controls, discoverability, and an auditable lifecycle.",
    priority: "critical",
    effectiveDate: "2026-10-01",
    tags: ["data products", "governance", "ownership", "catalog", "lifecycle"],
    matchTerms: ["data product", "catalog", "policy", "governance", "ownership", "lineage"],
    active: true,
  },
  {
    id: "zig-global-governance",
    title: "Reusable global guardrails",
    audience: "Zurich Insurance Group",
    need: "Prioritize capabilities that can establish consistent global guardrails while allowing regional teams to deliver independently.",
    priority: "high",
    effectiveDate: "2026-10-01",
    tags: ["governance", "security", "global", "self-service"],
    matchTerms: ["policy", "security", "workspace", "admin", "audit", "deployment"],
    active: true,
  },
  {
    id: "zurich-brazil-ai",
    title: "Grounded AI delivery",
    audience: "Zurich Brazil",
    need: "Surface practical AI capabilities that can be grounded in governed enterprise data and evaluated through a bounded pilot.",
    priority: "normal",
    effectiveDate: "2026-10-01",
    tags: ["ai", "agents", "grounding", "pilot", "semantic model"],
    matchTerms: ["agent", "mcp", "semantic model", "vector", "grounded"],
    active: true,
  },
];

export const seedSignals: Signal[] = [
  {
    id: "fabric-iq-mcp-ga",
    title: "Fabric IQ MCP Server reaches general availability",
    platform: "Microsoft Fabric",
    section: "AI & Agents",
    product: "Fabric IQ · Model Context Protocol",
    summary:
      "Approved development tools and external MCP clients can use governed conversational analytics, while administrators control which semantic models are exposed.",
    details: [
      "The September feature summary lists the Fabric IQ MCP Server as generally available.",
      "Governance controls let organizations decide which semantic models participate.",
    ],
    status: "Generally available",
    evidence: "confirmed",
    verifiedAt: "2026-10-06",
    sourceIds: ["fabric-blog", "fabric-learn"],
    links: [
      {
        label: "Fabric IQ MCP connector",
        url: "https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp",
      },
    ],
    tags: ["mcp", "semantic model", "agents", "governance"],
    nextStep: "Test with a non-sensitive semantic model and review the exposure controls before a broader pilot.",
    relevance: [
      {
        audience: "Zurich Brazil",
        reason:
          "Creates a practical path to ground agent experiences in governed semantic models instead of duplicating business logic.",
        score: 96,
        guidanceId: "zurich-brazil-ai",
      },
      {
        audience: "Zurich Insurance Group",
        reason:
          "Central exposure controls may support a consistent guardrail for agent access across independently delivered solutions.",
        score: 88,
        guidanceId: "zig-global-governance",
      },
    ],
    protected: ["security"],
    customerSafe: true,
  },
  {
    id: "policies-in-fabric",
    title: "Policies in Fabric introduce attribute-based governance controls",
    platform: "Microsoft Fabric",
    section: "Admin & Governance",
    product: "Fabric Admin · OneLake Catalog",
    summary:
      "Policy Set items define who may perform an action, what the policy covers, and where it applies instead of relying only on broad tenant switches.",
    details: [
      "Initial scenarios include item-creation and workspace-security policies.",
      "Policy lifecycle events are auditable and policy definitions can participate in CI/CD.",
    ],
    status: "Public preview",
    evidence: "confirmed",
    verifiedAt: "2026-10-06",
    sourceIds: ["fabric-blog", "fabric-updates-rss", "fabric-learn"],
    links: [
      {
        label: "OneLake catalog overview",
        url: "https://learn.microsoft.com/en-us/fabric/governance/onelake-catalog-overview",
      },
    ],
    tags: ["policy", "governance", "workspace", "security", "audit"],
    nextStep: "Pilot one narrowly scoped item-creation policy on a non-production capacity.",
    relevance: [
      {
        audience: "Farmers Insurance",
        reason:
          "Could give a data-product operating model reusable policy controls for creation, placement, and delegated ownership.",
        score: 98,
        guidanceId: "farmers-data-products",
      },
      {
        audience: "Zurich Insurance Group",
        reason:
          "The policy-as-an-item model may help establish global guardrails that remain reviewable and deployable through CI/CD.",
        score: 97,
        guidanceId: "zig-global-governance",
      },
    ],
    protected: ["security"],
    customerSafe: true,
  },
  {
    id: "materialized-lake-views-ga",
    title: "Materialized Lake Views become generally available",
    platform: "Microsoft Fabric",
    section: "Data Engineering",
    product: "Fabric Lakehouse",
    summary:
      "Teams can define reliable, reusable transformations as declarative materialized views in a lakehouse and use them as governed data-product building blocks.",
    details: [
      "The capability is listed as generally available in Microsoft Learn for September 2026.",
    ],
    status: "Generally available",
    evidence: "confirmed",
    verifiedAt: "2026-10-06",
    sourceIds: ["fabric-updates-rss", "fabric-learn"],
    links: [
      {
        label: "Materialized Lake Views",
        url: "https://learn.microsoft.com/en-us/fabric/data-engineering/materialized-lake-views/overview",
      },
    ],
    tags: ["data product", "lakehouse", "declarative", "quality"],
    nextStep: "Evaluate one reusable silver or gold transformation with explicit ownership and quality expectations.",
    relevance: [
      {
        audience: "Farmers Insurance",
        reason:
          "Provides a concrete implementation primitive for managed data products with reusable definitions and a clearer operational boundary.",
        score: 95,
        guidanceId: "farmers-data-products",
      },
    ],
    protected: [],
    customerSafe: true,
  },
  {
    id: "onelake-table-apis",
    title: "OneLake Table APIs open governed tables to agents and applications",
    platform: "Microsoft Fabric",
    section: "Interoperability",
    product: "OneLake · Apache Iceberg · Delta Lake",
    summary:
      "A serverless table-read API gives applications and agents access to Delta Lake and Iceberg tables while OneLake security continues to enforce table, row, and column access.",
    details: [
      "The read path is built on Apache Arrow.",
      "Microsoft Learn lists the OneLake table-read API as a preview capability.",
    ],
    status: "Public preview",
    evidence: "confirmed",
    verifiedAt: "2026-10-06",
    sourceIds: ["fabric-blog", "fabric-updates-rss", "fabric-learn"],
    links: [
      {
        label: "OneLake Table APIs overview",
        url: "https://learn.microsoft.com/en-us/fabric/onelake/table-apis/table-apis-overview",
      },
    ],
    tags: ["api", "iceberg", "delta lake", "agent", "security"],
    nextStep: "Pilot with a non-sensitive table and verify row- and column-level enforcement.",
    relevance: [
      {
        audience: "Zurich Brazil",
        reason:
          "Could simplify a grounded AI pilot by giving an application governed table access without first creating another data copy.",
        score: 91,
        guidanceId: "zurich-brazil-ai",
      },
      {
        audience: "Farmers Insurance",
        reason:
          "A stable table interface may help publish a data product to multiple consumers while retaining centralized access controls.",
        score: 86,
        guidanceId: "farmers-data-products",
      },
    ],
    protected: ["security"],
    customerSafe: true,
  },
  {
    id: "data-engineering-agent",
    title: "Fabric data engineering agent takes on bounded engineering projects",
    platform: "Microsoft Fabric",
    section: "Development",
    product: "Fabric Data Engineering · Project Osmos",
    summary:
      "An agent can plan, execute, validate, and refine long-running migration, modernization, optimization, ETL, and data-preparation work within engineer-defined guardrails.",
    details: [
      "Tasks execute on Fabric Spark and inherit workspace permissions.",
      "Authorized team members can monitor and contribute while work is in progress.",
    ],
    status: "Public preview",
    evidence: "confirmed",
    publishedAt: "2026-09-28",
    verifiedAt: "2026-10-06",
    sourceIds: ["fabric-blog", "fabric-updates-rss", "fabric-learn"],
    links: [
      {
        label: "Data engineering overview",
        url: "https://learn.microsoft.com/en-us/fabric/data-engineering/data-engineering-overview",
      },
    ],
    tags: ["agent", "spark", "migration", "optimization", "guardrails"],
    nextStep: "Use a bounded non-production remediation task with human validation and measurable acceptance criteria.",
    relevance: [
      {
        audience: "Zurich Brazil",
        reason:
          "Offers a controlled way to evaluate agentic engineering on a bounded task while retaining human review.",
        score: 92,
        guidanceId: "zurich-brazil-ai",
      },
    ],
    protected: ["security"],
    customerSafe: true,
  },
  {
    id: "surge-protection",
    title: "Workspace-level surge protection isolates runaway workloads",
    platform: "Microsoft Fabric",
    section: "Admin & Capacity",
    product: "Fabric Capacity",
    summary:
      "Capacity administrators can set workspace consumption limits to reduce the impact of runaway or non-critical workloads on mission-critical workloads.",
    details: [
      "Microsoft Learn listed workspace-level surge protection as preview at the research cutoff.",
      "A platform blog described general availability as coming soon.",
    ],
    status: "Public preview",
    evidence: "confirmed",
    verifiedAt: "2026-10-06",
    sourceIds: ["fabric-blog", "fabric-learn"],
    links: [
      {
        label: "Surge protection",
        url: "https://learn.microsoft.com/en-us/fabric/enterprise/surge-protection",
      },
    ],
    tags: ["capacity", "workspace", "reliability", "cost control"],
    nextStep: "Pilot on a non-critical workspace and confirm current availability before planning production use.",
    relevance: [
      {
        audience: "Zurich Insurance Group",
        reason:
          "Workspace-level isolation could complement global platform guardrails while preserving regional delivery autonomy.",
        score: 89,
        guidanceId: "zig-global-governance",
      },
    ],
    protected: ["source-conflict", "pricing"],
    conflict:
      "The platform blog said generally available soon; Microsoft Learn still listed preview at the research cutoff.",
    customerSafe: true,
  },
  {
    id: "deployment-plans-preview",
    title: "Deployment plans make solution promotion explicit and reviewable",
    platform: "Microsoft Fabric",
    section: "DevOps",
    product: "Fabric CI/CD",
    summary:
      "A visual deployment plan backed by YAML defines ordering plus pre- and post-deployment steps such as notebook execution and data validation.",
    details: [
      "The plan follows a solution through branch-out, Git synchronization, deployment pipelines, and bulk import.",
    ],
    status: "Public preview",
    evidence: "confirmed",
    verifiedAt: "2026-10-06",
    sourceIds: ["fabric-blog", "fabric-updates-rss", "fabric-learn"],
    links: [
      {
        label: "Fabric CI/CD best practices",
        url: "https://learn.microsoft.com/en-us/fabric/fundamentals/understand-best-practices-fabric-cicd",
      },
    ],
    tags: ["deployment", "yaml", "cicd", "validation", "audit"],
    nextStep: "Pilot with a non-production solution that has clear pre- and post-deployment validation.",
    relevance: [
      {
        audience: "Zurich Insurance Group",
        reason:
          "A reviewable deployment definition may help standardize promotion controls without forcing every region into one delivery team.",
        score: 93,
        guidanceId: "zig-global-governance",
      },
      {
        audience: "Farmers Insurance",
        reason:
          "Could make the lifecycle of a data product more explicit from source control through controlled promotion.",
        score: 84,
        guidanceId: "farmers-data-products",
      },
    ],
    protected: [],
    customerSafe: true,
  },
  {
    id: "copyjob-scd2-ga",
    title: "Copy job adds built-in Slowly Changing Dimension Type 2",
    platform: "Microsoft Fabric",
    section: "Data Factory",
    product: "Data Factory Copy Job",
    summary:
      "Built-in SCD Type 2 handling retains history by writing a new row version when source data changes, reducing custom orchestration for common analytical patterns.",
    details: [
      "The September 2026 Fabric feature summary lists the capability as generally available.",
    ],
    status: "Generally available",
    evidence: "confirmed",
    verifiedAt: "2026-10-06",
    sourceIds: ["fabric-updates-rss", "fabric-learn"],
    links: [
      {
        label: "CDC in Copy job",
        url: "https://learn.microsoft.com/en-us/fabric/data-factory/cdc-copy-job",
      },
    ],
    tags: ["scd2", "history", "data factory", "copy job"],
    nextStep: "Compare the built-in behavior with one representative historical-dimension pipeline.",
    relevance: [
      {
        audience: "Farmers Insurance",
        reason:
          "May simplify the implementation of historical data products while keeping change history available to downstream consumers.",
        score: 82,
        guidanceId: "farmers-data-products",
      },
    ],
    protected: [],
    customerSafe: true,
  },
  {
    id: "diskann-vector-indexes-ga",
    title: "DiskANN vector indexes become generally available in Microsoft SQL",
    platform: "Microsoft SQL",
    section: "AI & Operational Data",
    product: "Azure SQL · SQL Database in Fabric",
    summary:
      "The database engine can serve high-performance vector search for semantic retrieval, recommendations, and RAG scenarios without requiring a separate vector store.",
    details: [
      "The announcing SQL blog describes full DML support and indexes that remain updated as operational data changes.",
    ],
    status: "Generally available",
    evidence: "confirmed",
    publishedAt: "2026-09-28",
    verifiedAt: "2026-10-06",
    sourceIds: ["azure-sql-blog", "fabric-learn"],
    links: [
      {
        label: "SQL database in Fabric overview",
        url: "https://learn.microsoft.com/en-us/fabric/database/sql/overview",
      },
    ],
    tags: ["vector search", "rag", "sql", "operational data"],
    nextStep: "Prototype retrieval over a non-sensitive operational dataset and compare quality, latency, and operational complexity.",
    relevance: [
      {
        audience: "Zurich Brazil",
        reason:
          "Creates an additional grounded-AI architecture option when the relevant source data already belongs in Microsoft SQL.",
        score: 94,
        guidanceId: "zurich-brazil-ai",
      },
    ],
    protected: [],
    customerSafe: true,
  },
  {
    id: "git-item-permissions-change",
    title: "Fabric Git and deployment pipelines tighten item-level permission behavior",
    platform: "Microsoft Fabric",
    section: "DevOps",
    product: "Git Integration · Deployment Pipelines",
    summary:
      "A permission-model change affects how protected items participate in Git and deployment operations, creating a dated readiness action for existing delivery processes.",
    details: [
      "This signal is intentionally protected from preference-based suppression because it combines a breaking behavior change with a hard date.",
      "Teams should verify the final product documentation and scope before acting.",
    ],
    status: "Changed",
    evidence: "confirmed",
    verifiedAt: "2026-09-01",
    sourceIds: ["fabric-updates-rss", "fabric-learn"],
    links: [
      {
        label: "Fabric Git integration overview",
        url: "https://learn.microsoft.com/en-us/fabric/cicd/git-integration/intro-to-git-integration",
      },
    ],
    tags: ["git", "deployment", "permissions", "breaking change"],
    nextStep: "Inventory protected items in active delivery paths and validate behavior before the documented enforcement date.",
    relevance: [
      {
        audience: "Zurich Insurance Group",
        reason:
          "A permission-model change can affect standardized delivery controls across multiple regional workspaces and should be validated centrally.",
        score: 99,
        guidanceId: "zig-global-governance",
      },
    ],
    protected: ["breaking-change", "hard-date", "security"],
    customerSafe: true,
  },
  {
    id: "fabric-data-agent-assistants-retirement",
    title: "Fabric Data Agent Assistants API retires in favor of the Responses API",
    platform: "Microsoft Foundry",
    section: "Agent Development",
    product: "Fabric Data Agents · Microsoft Foundry",
    summary:
      "Existing integrations that use the Assistants API need a migration path to the supported Responses API and MCP-based pattern.",
    details: [
      "This is a protected retirement signal and remains visible regardless of topic preference.",
      "The exact applicability and migration sequence should be confirmed against current documentation.",
    ],
    status: "Retiring",
    evidence: "confirmed",
    publishedAt: "2026-08-26",
    verifiedAt: "2026-09-01",
    sourceIds: ["fabric-updates-rss", "foundry-docs"],
    links: [
      {
        label: "Microsoft Foundry documentation",
        url: "https://learn.microsoft.com/en-us/azure/ai-foundry/",
      },
    ],
    tags: ["assistants api", "responses api", "mcp", "retirement"],
    nextStep: "Identify integrations that use the retiring API and validate the supported migration path.",
    relevance: [
      {
        audience: "Zurich Brazil",
        reason:
          "Any agent pilot should start on the supported API pattern rather than inherit an integration path already moving toward retirement.",
        score: 98,
        guidanceId: "zurich-brazil-ai",
      },
    ],
    protected: ["breaking-change", "hard-date"],
    customerSafe: true,
  },
];

export const platformOrder = [
  "Microsoft Fabric",
  "Microsoft Foundry",
  "Azure Databricks",
  "Microsoft SQL",
  "Azure AI",
  "Data & AI Strategy",
];
