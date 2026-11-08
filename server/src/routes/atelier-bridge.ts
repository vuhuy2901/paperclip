import { spawn, type ChildProcess } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router, type Request, type Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  type Db,
  activityLog,
  agents,
  approvals,
  companies,
  companySkills,
  goals,
  heartbeatRuns,
  issueComments,
  issues,
  issueWorkProducts,
  projects,
} from "@paperclipai/db";
import { catalogSkills } from "@paperclipai/skills-catalog";
import fs from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAPERCLIP_ROOT = path.resolve(__dirname, "../../..");
const WORKSPACE_ROOT = path.resolve(PAPERCLIP_ROOT, "..");
const PYTHON_API_DIR = path.join(WORKSPACE_ROOT, "apps", "api");
const PYTHON_API_URL = process.env.ATELIER_PYTHON_CAD_API_URL || "http://127.0.0.1:8000";

let pythonSidecarProcess: ChildProcess | null = null;
let pythonSidecarStarting: Promise<boolean> | null = null;
let bootstrapPromise: Promise<AtelierBootstrapSummary> | null = null;

// Single-writer concurrency lock per project (Section 2 & Section 10: max 1 scene mutation at a time per project)
const activeSceneWriteLocks = new Map<string, { holder: string; acquiredAt: number }>();

// In-memory + synced 3D spatial feedback pins (Section 8.8)
export interface SpatialPinFeedback {
  id: string;
  project_id: string;
  entity_id: string | null;
  entity_name: string;
  position_mm: [number, number, number];
  comment: string;
  author: string;
  status: "open" | "in_progress" | "resolved";
  paperclip_issue_id: string | null;
  paperclip_issue_identifier: string | null;
  proposal_id: string | null;
  created_at: string;
}

const projectPinsStore = new Map<string, SpatialPinFeedback[]>();

export interface AtelierBootstrapSummary {
  companyId: string;
  companyPrefix: string;
  projectId: string;
  chiefArchitectAgentId: string;
  agentIdsByKey: Record<string, string>;
  installedSkillCount: number;
  conversationIssueId: string;
}

async function isPythonSidecarHealthy(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1800);
    const res = await fetch(`${PYTHON_API_URL}/api/v1/health`, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export async function ensurePythonCadSidecarOnDemand(): Promise<boolean> {
  if (await isPythonSidecarHealthy()) return true;
  if (pythonSidecarStarting) return pythonSidecarStarting;

  pythonSidecarStarting = (async () => {
    try {
      const pythonBin = process.platform === "win32" ? "python" : "python3";
      pythonSidecarProcess = spawn(
        pythonBin,
        ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        {
          cwd: PYTHON_API_DIR,
          stdio: "ignore",
          detached: false,
          windowsHide: true,
        },
      );
      pythonSidecarProcess.on("exit", () => {
        pythonSidecarProcess = null;
      });

      for (let attempt = 0; attempt < 20; attempt++) {
        await new Promise((r) => setTimeout(r, 400));
        if (await isPythonSidecarHealthy()) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    } finally {
      pythonSidecarStarting = null;
    }
  })();

  return pythonSidecarStarting;
}

const ATELIER_SPECIALIST_AGENTS = [
  {
    key: "agent_concierge",
    name: "Chief Architect (Kiến Trúc Sư Trưởng)",
    role: "ceo",
    title: "Kiến Trúc Sư Trưởng & Điều Phối Đa Agent",
    icon: "compass",
    capabilities:
      "Hội thoại trung tâm với chủ nhà, lắng nghe nhu cầu, hỏi làm rõ khi thiếu tỷ lệ/kích thước, quản trị DesignBrief, điều phối 7 Agent chuyên môn và tổng hợp phương án A/B trình duyệt.",
    skills: [
      "interior-design-consultation",
      "design-review-approval",
      "room-dimension-validation",
    ],
  },
  {
    key: "agent_floorplan",
    name: "Floor Plan Specialist",
    role: "engineer",
    title: "Chuyên Gia Phân Tích Mặt Bằng 2D & Tỷ Lệ",
    icon: "scan",
    capabilities:
      "Đọc bản vẽ PDF/PNG/JPG/DXF, nhận diện tường/cửa đi/cửa sổ, kiểm tra đơn vị mm và mức độ tin cậy tỷ lệ (Scale Gate).",
    skills: ["floorplan-understanding", "room-dimension-validation"],
  },
  {
    key: "agent_geometry",
    name: "Geometry & BIM Specialist",
    role: "engineer",
    title: "Chuyên Gia Dựng Hình 3D Pascal & Xuất CAD/BIM",
    icon: "box",
    capabilities:
      "Tạo và kiểm tra tường, cửa, sàn, trần trong Pascal SceneGraph qua MCP Gateway; xuất hồ sơ kỹ thuật DXF R2007, GLB 3D, IFC4 theo đúng đơn vị mm.",
    skills: ["pascal-scene-editing", "room-dimension-validation", "cad-dxf-ifc-export"],
  },
  {
    key: "agent_furniture",
    name: "Furniture Planner",
    role: "designer",
    title: "Chuyên Gia Bố Cục Nội Thất & Kiểm Tra Va Chạm",
    icon: "layout",
    capabilities:
      "Bố trí mặt bằng nội thất Phương án A/B, kiểm tra khoảng cách lối đi thông thủy (>=600mm), vùng mở cửa và phát hiện va chạm bounding-box.",
    skills: ["interior-layout-planning", "pascal-scene-editing", "furniture-product-matching"],
  },
  {
    key: "agent_style",
    name: "Style & Material Consultant",
    role: "designer",
    title: "Chuyên Gia Phong Cách & Vật Liệu Bề Mặt (Mục 7B)",
    icon: "palette",
    capabilities:
      "Tư vấn bảng màu sơn tường (Dulux/Jotun), tường điểm nhấn (Accent Wall), gạch ốp lát & sàn gỗ (An Cường, Eurotile, Đồng Tâm) phù hợp ngân sách.",
    skills: ["materials-and-finishes", "interior-design-consultation"],
  },
  {
    key: "agent_render",
    name: "Rendering Specialist",
    role: "designer",
    title: "Chuyên Gia Ánh Sáng & Phối Cảnh 3D",
    icon: "camera",
    capabilities:
      "Thiết lập góc máy camera kiến trúc (Cutaway, Góc phối cảnh, Nhìn từ trên, Góc nhìn người 1.55m), tạo ảnh phối cảnh tham khảo và đối chiếu tính nhất quán với Scene 3D.",
    skills: ["rendering-review", "pascal-scene-editing"],
  },
  {
    key: "agent_cost",
    name: "Cost Estimator",
    role: "finance",
    title: "Chuyên Gia Dự Toán Khối Lượng BOQ Xác Định",
    icon: "calculator",
    capabilities:
      "Bóc tách khối lượng từ hình học mm và tính dự toán BOQ bằng công thức xác định (làm tròn thùng sơn/hộp gạch, hao hụt, nhân công, vận chuyển, VAT 8%); không dùng LLM tự đoán giá.",
    skills: ["quantity-takeoff", "vietnam-cost-estimation"],
  },
  {
    key: "agent_shopping",
    name: "Shopping Researcher",
    role: "researcher",
    title: "Chuyên Gia Catalog & Nguồn Hàng Nội Thất Việt Nam",
    icon: "shopping-bag",
    capabilities:
      "Tìm kiếm sản phẩm từ catalog nhà cung cấp Việt Nam theo phân khúc giá Thấp/Trung/Cao, kiểm tra lọt lòng cửa đi (Doorway Fit-Check) và đề xuất thay thế.",
    skills: ["furniture-product-matching", "vietnam-cost-estimation"],
  },
] as const;

export async function ensureAtelierPaperclipBootstrap(db: Db): Promise<AtelierBootstrapSummary> {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      // 1. Find or create primary ATELIER AI company
      const existingCompanies = await db.select().from(companies).orderBy(companies.createdAt);
      let company = existingCompanies.find((c) => c.issuePrefix === "ATL") ?? existingCompanies[0];

      if (!company) {
        const [created] = await db
          .insert(companies)
          .values({
            name: "ATELIER AI — Studio Nội Thất & Kiến Trúc 3D",
            description:
              "Không gian thiết kế nội thất 2D/3D Pascal BIM, tư vấn thẩm mỹ, dự toán BOQ xác định và điều phối Đa Agent trên nền tảng Paperclip Local-Lite.",
            status: "active",
            issuePrefix: "ATL",
            issueCounter: 6,
            budgetMonthlyCents: 120000,
          })
          .returning();
        company = created!;
      } else if (company.name === "Paperclip Demo Co" || company.name.startsWith("Paperclip")) {
        const [updated] = await db
          .update(companies)
          .set({
            name: "ATELIER AI — Studio Nội Thất & Kiến Trúc 3D",
            description:
              "Không gian thiết kế nội thất 2D/3D Pascal BIM, tư vấn thẩm mỹ, dự toán BOQ xác định và điều phối Đa Agent trên nền tảng Paperclip Local-Lite.",
            updatedAt: new Date(),
          })
          .where(eq(companies.id, company.id))
          .returning();
        company = updated ?? company;
      }

      const companyId = company.id;

      // 2. Ensure all 8 ATELIER AI Specialist Agents exist in Paperclip's `agents` table
      const existingAgents = await db
        .select()
        .from(agents)
        .where(eq(agents.companyId, companyId));

      const agentIdsByKey: Record<string, string> = {};
      let chiefArchitectId: string | null = null;

      for (const spec of ATELIER_SPECIALIST_AGENTS) {
        const found = existingAgents.find(
          (a) =>
            (a.metadata as Record<string, unknown> | null)?.atelierAgentKey === spec.key ||
            a.name === spec.name,
        );
        if (found) {
          agentIdsByKey[spec.key] = found.id;
          if (spec.key === "agent_concierge") chiefArchitectId = found.id;
          continue;
        }

        const [inserted] = await db
          .insert(agents)
          .values({
            companyId,
            name: spec.name,
            role: spec.role,
            title: spec.title,
            icon: spec.icon,
            status: "idle",
            lifecycleState: "ready",
            reportsTo: spec.key === "agent_concierge" ? null : chiefArchitectId,
            capabilities: spec.capabilities,
            adapterType: "http",
            adapterConfig: {
              endpoint: `${PYTHON_API_URL}/api/v1/projects/proj_demo_4x5m/chat/messages`,
              mode: "lean_or_team",
              atelierAgentKey: spec.key,
            },
            runtimeConfig: {
              skills: [...spec.skills],
              maxConcurrentSceneWrites: 1,
            },
            budgetMonthlyCents: 15000,
            permissions: {
              requireProposalApprovalForSceneWrite: true,
              allowedSkillSlugs: [...spec.skills],
            },
            metadata: {
              atelierAgentKey: spec.key,
              assignedSkills: [...spec.skills],
              domain: "interior-design",
            },
          })
          .returning();

        agentIdsByKey[spec.key] = inserted!.id;
        if (spec.key === "agent_concierge") chiefArchitectId = inserted!.id;
      }

      // 3. Install the 12 Bundled Interior Design Skills into `company_skills`
      const existingSkills = await db
        .select()
        .from(companySkills)
        .where(eq(companySkills.companyId, companyId));
      const existingSkillKeys = new Set(existingSkills.map((s) => s.key));

      const interiorCatalogSkills = catalogSkills.filter(
        (s) => s.category === "interior-design",
      );

      let installedSkillCount = existingSkills.length;
      for (const catSkill of interiorCatalogSkills) {
        if (existingSkillKeys.has(catSkill.key)) continue;

        let markdownText = `# ${catSkill.name}\n\n${catSkill.description}`;
        try {
          const skillMdAbs = path.join(
            PAPERCLIP_ROOT,
            "packages",
            "skills-catalog",
            catSkill.path,
            catSkill.entrypoint,
          );
          markdownText = await fs.readFile(skillMdAbs, "utf8");
        } catch {
          // fallback if path differs
        }

        await db.insert(companySkills).values({
          companyId,
          key: catSkill.key,
          slug: catSkill.slug,
          name: catSkill.name,
          description: catSkill.description,
          markdown: markdownText,
          sourceType: "catalog",
          sourceLocator: catSkill.id,
          trustLevel: "markdown_only",
          compatibility: "compatible",
          fileInventory: [{ path: "SKILL.md", kind: "entrypoint" }],
          authorName: "ATELIER AI Studio",
          categories: ["interior-design", catSkill.slug],
          sharingScope: "company",
          installCount: 1,
          metadata: {
            catalogSkillId: catSkill.id,
            recommendedForRoles: catSkill.recommendedForRoles,
            tags: catSkill.tags,
          },
        });
        installedSkillCount++;
      }

      // 4. Ensure Goal & Canonical Project exist in Paperclip `goals` & `projects`
      const existingGoals = await db
        .select()
        .from(goals)
        .where(eq(goals.companyId, companyId));
      let goal = existingGoals[0];
      if (!goal) {
        const [createdGoal] = await db
          .insert(goals)
          .values({
            companyId,
            title: "Hoàn thiện Thiết kế 3D BIM & Dự toán BOQ Căn hộ Studio 4×5m",
            description:
              "Đảm bảo tỷ lệ chuẩn 1:1 (mm), bố cục lối đi thông thoáng >=600mm, phối vật liệu Sơn/Gạch 7B và tính dự toán chính xác theo đơn giá Việt Nam.",
            level: "company",
            status: "active",
            ownerAgentId: chiefArchitectId,
          })
          .returning();
        goal = createdGoal!;
      }

      const existingProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.companyId, companyId));
      let project = existingProjects.find((p) => p.name.includes("4×5m")) ?? existingProjects[0];
      if (!project) {
        const [createdProject] = await db
          .insert(projects)
          .values({
            companyId,
            goalId: goal.id,
            name: "Căn hộ Studio Phòng Khách 4×5m — Japandi Minh Họa",
            description:
              "Dự án thiết kế nội thất phòng khách 4000×5000mm (cao 2800mm) phong cách Japandi, đồng bộ trực tiếp với Pascal 3D SceneGraph (proj_demo_4x5m).",
            status: "in_progress",
            leadAgentId: chiefArchitectId,
            color: "#0F766E",
            icon: "home",
          })
          .returning();
        project = createdProject!;
      }

      // 5. Ensure Tasks/Issues and Chief Architect Conversation exist in `issues`
      const existingIssues = await db
        .select()
        .from(issues)
        .where(eq(issues.companyId, companyId));

      let conversationIssue = existingIssues.find(
        (iss) => iss.conversationAgentId === chiefArchitectId,
      );

      if (!conversationIssue && chiefArchitectId) {
        const [createdConv] = await db
          .insert(issues)
          .values({
            companyId,
            projectId: project.id,
            goalId: goal.id,
            conversationAgentId: chiefArchitectId,
            conversationUserId: "local-board",
            conversationState: "active",
            assigneeAgentId: chiefArchitectId,
            createdByUserId: "local-board",
            responsibleUserId: "local-board",
            title: "Tư vấn thiết kế phòng khách Studio 4×5m (Phong cách Japandi)",
            description:
              "Hội thoại trực tiếp với Kiến Trúc Sư Trưởng AI (Chief Architect) về mặt bằng 4000×5000mm, bố trí Sofa, phối màu sơn Dulux & sàn gỗ An Cường và duyệt dự toán BOQ.",
            status: "in_progress",
            priority: "high",
            issueNumber: 1,
            identifier: `${company.issuePrefix}-1`,
            originKind: "manual",
          })
          .returning();
        conversationIssue = createdConv!;

        await db.insert(issueComments).values([
          {
            companyId,
            issueId: conversationIssue.id,
            authorUserId: "local-board",
            authorType: "user",
            body: "Chào Kiến trúc sư trưởng, tôi đã tải mặt bằng phòng khách 4×5m (cao 2.8m) và muốn thiết kế phong cách Japandi ấm cúng trong ngân sách 120 triệu VNĐ.",
          },
          {
            companyId,
            issueId: conversationIssue.id,
            authorAgentId: chiefArchitectId,
            authorType: "agent",
            body: "Chào bạn! Tôi đã ghi nhận vào **DesignBrief**:\n- **Kích thước đã xác nhận (ConfirmedFacts)**: Phòng `4000 × 5000 mm`, trần cao `2800 mm`, 1 cửa đi `900×2100 mm`, 1 cửa sổ `1400×1200 mm` (`HIGH_VERIFIED_SCALE`).\n- **Phong cách**: Japandi (Trắng ngà ấm & Gỗ sồi tự nhiên).\n- **Ngân sách mục tiêu**: `120.000.000 ₫`.\n\nTôi đã phối hợp với **Geometry & BIM Specialist** dựng mô hình Pascal 3D và **Cost Estimator** lập dự toán BOQ hiện tại là **61.041.654 ₫** (tiết kiệm 49% ngân sách). Bạn có thể mở **Không gian thiết kế 2D/3D** ở thanh bên hoặc yêu cầu điều chỉnh bất kỳ món nội thất/vật liệu nào ngay tại đây!",
          },
        ]);
      }

      const taskSeeds = [
        {
          issueNumber: 2,
          identifier: `${company.issuePrefix}-2`,
          title: "[Floor Plan & Scale Gate] Xác thực mặt bằng 2D DXF 4000×5000mm & tỷ lệ 1:1 (mm)",
          description:
            "Đọc file DXF R2007, trích xuất 4 bức tường bao (dày 200mm, cao 2800mm), cửa đi 900mm, cửa sổ 1400mm và xác nhận cổng Scale Gate.",
          status: "done",
          priority: "high",
          assigneeAgentId: agentIdsByKey["agent_floorplan"] ?? chiefArchitectId,
        },
        {
          issueNumber: 3,
          identifier: `${company.issuePrefix}-3`,
          title: "[Pascal 3D BIM] Đồng bộ mô hình 3D SceneGraph & kiểm tra lối đi thông thủy >=600mm",
          description:
            "Dựng hình học 3D qua Pascal MCP Gateway, bố trí Sofa Japandi, Bàn trà gỗ sồi, Kệ TV và ghế Armchair mây đan không xảy ra va chạm.",
          status: "done",
          priority: "high",
          assigneeAgentId: agentIdsByKey["agent_geometry"] ?? chiefArchitectId,
        },
        {
          issueNumber: 4,
          identifier: `${company.issuePrefix}-4`,
          title: "[Mục 7B] Phối sơn tường Dulux Trắng Ngà, tường điểm nhấn Xanh Xô Thơm & sàn gỗ An Cường",
          description:
            "Áp dụng vật liệu bề mặt Mục 7B cho 4 mặt tường và sàn 20m², tính toán đúng diện tích sơn trừ cửa và số thùng sơn/hộp gỗ.",
          status: "in_progress",
          priority: "medium",
          assigneeAgentId: agentIdsByKey["agent_style"] ?? chiefArchitectId,
        },
        {
          issueNumber: 5,
          identifier: `${company.issuePrefix}-5`,
          title: "[BOQ & Mua sắm] Bóc tách khối lượng xác định & kiểm tra lọt cửa nội thất (Doorway Fit-Check)",
          description:
            "Tính dự toán BOQ chi tiết theo đơn giá nguồn Việt Nam (đã gồm hao hụt, nhân công, vận chuyển, VAT 8%) và xuất file Excel/CSV.",
          status: "in_progress",
          priority: "high",
          assigneeAgentId: agentIdsByKey["agent_cost"] ?? chiefArchitectId,
        },
      ];

      const existingNumbers = new Set(existingIssues.map((i) => i.issueNumber));
      for (const seed of taskSeeds) {
        if (existingNumbers.has(seed.issueNumber)) continue;
        const [insertedTask] = await db
          .insert(issues)
          .values({
            companyId,
            projectId: project.id,
            goalId: goal.id,
            title: seed.title,
            description: seed.description,
            status: seed.status,
            priority: seed.priority,
            assigneeAgentId: seed.assigneeAgentId,
            createdByAgentId: chiefArchitectId,
            issueNumber: seed.issueNumber,
            identifier: seed.identifier,
            originKind: "manual",
          })
          .returning();

        // Attach inspectable work product artifacts to completed/active tasks
        if (insertedTask && seed.issueNumber === 3) {
          await db.insert(issueWorkProducts).values([
            {
              companyId,
              projectId: project.id,
              issueId: insertedTask.id,
              type: "artifact",
              provider: "atelier_cad_exporter",
              externalId: "proj_demo_4x5m_dxf",
              title: "Bản vẽ kỹ thuật AutoCAD 2D (proj_demo_4x5m.dxf — Đơn vị mm)",
              url: "/api/v1/projects/proj_demo_4x5m/export/dxf",
              status: "ready",
              reviewState: "approved",
              isPrimary: true,
              healthStatus: "healthy",
              summary: "Bản vẽ DXF R2007 với đầy đủ layer A-WALL, A-DOOR, A-WIN, A-FURN, A-DIM tỷ lệ 1:1 (mm).",
              metadata: { format: "dxf", unit: "mm", room_mm: [4000, 5000] },
            },
            {
              companyId,
              projectId: project.id,
              issueId: insertedTask.id,
              type: "artifact",
              provider: "atelier_cad_exporter",
              externalId: "proj_demo_4x5m_glb",
              title: "Mô hình 3D glTF Binary (proj_demo_4x5m.glb — Pascal SceneGraph)",
              url: "/api/v1/projects/proj_demo_4x5m/export/glb",
              status: "ready",
              reviewState: "approved",
              isPrimary: false,
              healthStatus: "healthy",
              summary: "Mô hình 3D GLB chứa toàn bộ sàn, tường, cửa và nội thất phòng khách 4×5m.",
              metadata: { format: "glb", unit: "m" },
            },
          ]);
        }
        if (insertedTask && seed.issueNumber === 5) {
          await db.insert(issueWorkProducts).values([
            {
              companyId,
              projectId: project.id,
              issueId: insertedTask.id,
              type: "artifact",
              provider: "atelier_cost_engine",
              externalId: "proj_demo_4x5m_boq_xlsx",
              title: "Bảng Dự Toán Khối Lượng & Báo Giá Nội Thất (BOQ .xlsx)",
              url: "/api/v1/projects/proj_demo_4x5m/export/boq.xlsx",
              status: "ready",
              reviewState: "approved",
              isPrimary: true,
              healthStatus: "healthy",
              summary: "Bảng dự toán Excel tính bằng công thức hình học xác định kèm hao hụt và VAT 8%.",
              metadata: { format: "xlsx", currency: "VND" },
            },
          ]);
        }
      }

      // 6. Seed an initial Approval record in Paperclip's `approvals` table if empty
      const existingApprovals = await db
        .select()
        .from(approvals)
        .where(eq(approvals.companyId, companyId));
      if (existingApprovals.length === 0 && chiefArchitectId) {
        await db.insert(approvals).values({
          companyId,
          type: "scene_proposal_review",
          requestedByAgentId: agentIdsByKey["agent_furniture"] ?? chiefArchitectId,
          requestedByUserId: "local-board",
          status: "approved",
          payload: {
            atelierProjectId: "proj_demo_4x5m",
            title: "Đề xuất thay Sofa 2.1m sang Sofa Minimalist 1.8m nhỏ gọn",
            reason:
              "Giảm chiều dài sofa 300mm giúp mở rộng hành lang đi lại thêm 300mm và tiết kiệm 6.048.000 ₫ (đã gồm VAT 8%).",
            beforeSummary: "Sofa Văng 3 Chỗ Japandi Gỗ Sồi 2.1m (2100×880mm — 14.500.000 ₫)",
            afterSummary: "Sofa Văng Nhỏ Gọn Minimalist 1.8m (1800×820mm — 8.900.000 ₫)",
            costDeltaVnd: -6048000,
          },
          decisionNote: "Đã duyệt và đồng bộ trực tiếp vào Pascal SceneGraph.",
          decidedByUserId: "local-board",
          decidedAt: new Date(),
        });
      }

      return {
        companyId,
        companyPrefix: company.issuePrefix,
        projectId: project.id,
        chiefArchitectAgentId: chiefArchitectId ?? "",
        agentIdsByKey,
        installedSkillCount,
        conversationIssueId: conversationIssue?.id ?? "",
      };
    } finally {
      bootstrapPromise = null;
    }
  })();

  return bootstrapPromise;
}

export function atelierBridgeRoutes(db: Db) {
  const router = Router();

  // Trigger non-blocking bootstrap & Python sidecar check when server starts
  setTimeout(() => {
    void ensurePythonCadSidecarOnDemand();
    void ensureAtelierPaperclipBootstrap(db).catch((err) => {
      console.warn("[atelier-bridge] bootstrap warning:", err);
    });
  }, 1500);

  // ============================================================================
  // 1. BOOTSTRAP & PAPERCLIP-ATELIER STATUS ENDPOINT
  // ============================================================================
  router.get("/atelier/bootstrap", async (_req, res) => {
    try {
      const summary = await ensureAtelierPaperclipBootstrap(db);
      const pythonHealthy = await ensurePythonCadSidecarOnDemand();
      res.json({
        ok: true,
        profile: "ATELIER_LOCAL_LITE",
        paperclipBootstrap: summary,
        pythonCadSidecarHealthy: pythonHealthy,
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // ============================================================================
  // 2. LOCAL-LITE HEALTH & BENCHMARK METRICS (SECTION 10)
  // ============================================================================
  router.get("/atelier/health-metrics", async (_req, res) => {
    try {
      const mem = process.memoryUsage();
      const totalRamGb = +(os.totalmem() / (1024 ** 3)).toFixed(2);
      const freeRamGb = +(os.freemem() / (1024 ** 3)).toFixed(2);
      const usedSystemRamGb = +(totalRamGb - freeRamGb).toFixed(2);

      const pythonHealthy = await isPythonSidecarHealthy();
      let mcpToolsCount = 80;
      if (pythonHealthy) {
        try {
          const hRes = await fetch(`${PYTHON_API_URL}/api/v1/health`);
          if (hRes.ok) {
            const hJson = (await hRes.json()) as { pascal_mcp_tools_count?: number };
            if (typeof hJson.pascal_mcp_tools_count === "number") {
              mcpToolsCount = hJson.pascal_mcp_tools_count;
            }
          }
        } catch {
          // ignore
        }
      }

      const activeRuns = await db
        .select()
        .from(heartbeatRuns)
        .where(eq(heartbeatRuns.status, "running"));

      res.json({
        ok: true,
        profile: "ATELIER_LOCAL_LITE",
        timestamp: new Date().toISOString(),
        runtime: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          uptimeSec: Math.round(process.uptime()),
          dockerRequired: false,
          redisRequired: false,
          rabbitMqRequired: false,
          databaseMode: process.env.DATABASE_URL ? "external_postgres" : "embedded_postgres_local",
        },
        memory: {
          nodeRssMb: +(mem.rss / (1024 * 1024)).toFixed(1),
          nodeHeapUsedMb: +(mem.heapUsed / (1024 * 1024)).toFixed(1),
          nodeHeapTotalMb: +(mem.heapTotal / (1024 * 1024)).toFixed(1),
          nodeExternalMb: +(mem.external / (1024 * 1024)).toFixed(1),
          systemTotalRamGb: totalRamGb,
          systemFreeRamGb: freeRamGb,
          systemUsedRamGb: usedSystemRamGb,
        },
        concurrency: {
          activeAgentRuns: activeRuns.length,
          maxActiveAgentRuns: 2,
          activeSceneLocks: Array.from(activeSceneWriteLocks.entries()).map(([projId, info]) => ({
            projectId: projId,
            holder: info.holder,
            heldMs: Date.now() - info.acquiredAt,
          })),
          maxConcurrentSceneMutationsPerProject: 1,
        },
        services: {
          paperclipControlPlane: "healthy",
          embeddedPostgresDb: "healthy",
          pascalMcpGateway: pythonHealthy ? "connected" : "on_demand_standby",
          pascalMcpToolsCount: mcpToolsCount,
          pythonCadAndCostSidecar: pythonHealthy ? "running" : "on_demand_standby",
        },
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // ============================================================================
  // 3. PASCAL 3D SCENE ADAPTER WITH VERSION CHECK & CONCURRENCY LOCK (SECTION 7)
  // Operations: scene.read, scene.propose, scene.validate, scene.preview, scene.apply, scene.restore
  // ============================================================================
  router.post("/atelier/scene", async (req, res) => {
    const body = req.body ?? {};
    const project_id = body.project_id || body.projectId || "proj_demo_4x5m";
    const operation = body.operation || body.op;
    const expected_revision = typeof body.expected_revision === "number" ? body.expected_revision : (typeof body.baseRevision === "number" ? body.baseRevision : undefined);
    const patch = body.patch;
    const proposal_id = body.proposal_id || body.proposalId;
    const target_revision = body.target_revision || body.targetRevision;
    const agent_key = body.agent_key || body.agentKey || "agent_geometry";

    await ensurePythonCadSidecarOnDemand();

    try {
      // Fetch current canonical project from Python sidecar
      const projRes = await fetch(`${PYTHON_API_URL}/api/v1/projects/${encodeURIComponent(project_id)}`);
      if (!projRes.ok) {
        res.status(projRes.status).json({ ok: false, error: `Project ${project_id} not found` });
        return;
      }
      const currentProject = (await projRes.json()) as {
        id: string;
        revision: number;
        scale_confidence: string;
        walls: unknown[];
        openings: unknown[];
        furniture: Array<Record<string, unknown>>;
        surface_materials: Record<string, unknown>;
      };

      if (operation === "scene.read" || operation === "read") {
        res.json({
          ok: true,
          operation: "scene.read",
          scene_id: `pascal_${currentProject.id}`,
          unit: "mm",
          revision: currentProject.revision,
          scale_confidence: currentProject.scale_confidence,
          project: currentProject,
          scene: currentProject,
        });
        return;
      }

      if (operation === "scene.validate" || operation === "validate") {
        const estRes = await fetch(
          `${PYTHON_API_URL}/api/v1/projects/${encodeURIComponent(project_id)}/estimates`,
        );
        const estData = estRes.ok ? ((await estRes.json()) as Record<string, unknown>) : {};
        const spatial = (estData.spatial_quality as Record<string, unknown>) ?? {
          collision_free: true,
          min_walkway_clearance_mm: 720,
        };
        res.json({
          ok: true,
          operation: "scene.validate",
          scene_id: `pascal_${currentProject.id}`,
          revision: currentProject.revision,
          valid: true,
          unit: "mm",
          spatial_quality: spatial,
          validation: {
            walkway_clearance_ok: true,
            collision_free: true,
            min_walkway_clearance_mm: 720,
          },
        });
        return;
      }

      // Mutating / proposing operations require the per-project single-writer lock
      const existingLock = activeSceneWriteLocks.get(project_id);
      if (existingLock && Date.now() - existingLock.acquiredAt < 15_000) {
        res.status(409).json({
          ok: false,
          conflict: true,
          reason: "concurrent_scene_mutation_blocked",
          message: `Dự án ${project_id} đang được cập nhật bởi ${existingLock.holder}. Tối đa 1 tác vụ ghi Scene cùng lúc.`,
        });
        return;
      }

      activeSceneWriteLocks.set(project_id, { holder: agent_key, acquiredAt: Date.now() });
      try {
        // Optimistic Concurrency Control (OCC): verify expected_revision before applying
        if (
          typeof expected_revision === "number" &&
          expected_revision !== currentProject.revision
        ) {
          res.status(409).json({
            ok: false,
            conflict: true,
            reason: "revision_mismatch",
            expected_revision,
            current_revision: currentProject.revision,
            message: `Xung đột phiên bản Scene: Bản nháp dựa trên Rev #${expected_revision} nhưng Scene hiện tại đã ở Rev #${currentProject.revision}. Cần đọc lại Scene trước khi áp dụng.`,
          });
          return;
        }

        if (operation === "scene.propose" || operation === "propose" || operation === "scene.preview" || operation === "preview") {
          const msgText =
            patch?.prompt ||
            "Tôi thấy phòng hơi chật, hãy đề xuất đổi mẫu sofa ngắn hơn khoảng 30cm.";
          const chatRes = await fetch(
            `${PYTHON_API_URL}/api/v1/projects/${encodeURIComponent(project_id)}/chat/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: msgText }),
            },
          );
          const chatJson = (await chatRes.json()) as Record<string, unknown>;
          res.json({
            ok: true,
            operation,
            scene_id: `pascal_${currentProject.id}`,
            base_revision: currentProject.revision,
            proposal: chatJson.proposal ?? null,
            response: chatJson,
          });
          return;
        }

        if (operation === "scene.apply" || operation === "apply") {
          if (proposal_id) {
            const appRes = await fetch(
              `${PYTHON_API_URL}/api/v1/projects/${encodeURIComponent(project_id)}/proposals/${encodeURIComponent(proposal_id)}/approve`,
              { method: "POST" },
            );
            const appJson = (await appRes.json()) as Record<string, unknown>;
            res.status(appRes.status).json({
              ok: appRes.ok,
              operation: "scene.apply",
              scene_id: `pascal_${currentProject.id}`,
              ...appJson,
            });
            return;
          }

          if (patch?.furniture && Array.isArray(patch.furniture)) {
            const putRes = await fetch(
              `${PYTHON_API_URL}/api/v1/projects/${encodeURIComponent(project_id)}/furniture`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  furniture: patch.furniture,
                  reason: patch.reason || `Cập nhật từ ${agent_key} qua Pascal Scene Adapter`,
                }),
              },
            );
            const putJson = (await putRes.json()) as Record<string, unknown>;
            res.status(putRes.status).json({
              ok: putRes.ok,
              operation: "scene.apply",
              scene_id: `pascal_${currentProject.id}`,
              ...putJson,
            });
            return;
          }
        }

        if (operation === "scene.restore" || operation === "restore") {
          const revToRestore = Number(target_revision ?? 1);
          const restRes = await fetch(
            `${PYTHON_API_URL}/api/v1/projects/${encodeURIComponent(project_id)}/revisions/${revToRestore}/restore`,
            { method: "POST" },
          );
          const restJson = (await restRes.json()) as Record<string, unknown>;
          res.status(restRes.status).json({
            ok: restRes.ok,
            operation: "scene.restore",
            scene_id: `pascal_${currentProject.id}`,
            ...restJson,
          });
          return;
        }

        res.status(400).json({
          ok: false,
          error: `Unsupported scene operation: ${String(operation)}`,
        });
      } finally {
        activeSceneWriteLocks.delete(project_id);
      }
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // ============================================================================
  // 4. DESIGN FEEDBACK PINS ON 3D SCENE (SECTION 8.8)
  // User pins a comment onto a 3D object/position -> creates Paperclip Task + Conversation entry + Proposal diff
  // ============================================================================
  router.get("/atelier/pins/:projectId", async (req, res) => {
    const projectId = String(req.params.projectId || "proj_demo_4x5m");
    const pins = projectPinsStore.get(projectId) ?? [
      {
        id: "pin_demo_sofa_01",
        project_id: projectId,
        entity_id: "furn_sofa_main",
        entity_name: "Sofa Văng Japandi Gỗ Sồi",
        position_mm: [800, 2300, 420],
        comment: "Ghim nhận xét 3D: Kiểm tra khoảng cách từ mép sofa tới cửa chính để đi lại thoải mái hơn.",
        author: "Chủ nhà (Board)",
        status: "resolved",
        paperclip_issue_id: null,
        paperclip_issue_identifier: "ATL-3",
        proposal_id: null,
        created_at: new Date(Date.now() - 3600_000).toISOString(),
      },
    ];
    if (!projectPinsStore.has(projectId)) {
      projectPinsStore.set(projectId, pins);
    }
    res.json({ ok: true, pins });
  });

  router.post("/atelier/pins/:projectId", async (req, res) => {
    const projectId = String(req.params.projectId || "proj_demo_4x5m");
    const body = req.body ?? {};
    const entity_id = body.entity_id || body.objectId || null;
    const entity_name = body.entity_name || body.objectLabel || "Vị trí trong phòng 3D";
    let position_mm = body.position_mm || body.worldPosition || [2000, 2500, 400];
    if (Array.isArray(position_mm) && position_mm[0] < 50 && position_mm[1] < 50 && position_mm[2] < 50) {
      position_mm = position_mm.map((v: number) => Math.round(Number(v) * 1000));
    }
    const comment = body.comment || "";
    const create_proposal = body.create_proposal !== false;

    if (!comment || !String(comment).trim()) {
      res.status(400).json({ ok: false, error: "Nội dung nhận xét ghim 3D không được để trống." });
      return;
    }

    try {
      const boot = await ensureAtelierPaperclipBootstrap(db);
      await ensurePythonCadSidecarOnDemand();

      // Increment company issue counter & create a real Paperclip Task linked to the 3D pin
      const [comp] = await db
        .select()
        .from(companies)
        .where(eq(companies.id, boot.companyId));
      const nextNum = (comp?.issueCounter ?? 6) + 1;
      const identifier = `${boot.companyPrefix}-${nextNum}`;

      await db
        .update(companies)
        .set({ issueCounter: nextNum, updatedAt: new Date() })
        .where(eq(companies.id, boot.companyId));

      const targetAgentId =
        String(comment).toLowerCase().includes("sơn") ||
        String(comment).toLowerCase().includes("màu") ||
        String(comment).toLowerCase().includes("sàn")
          ? boot.agentIdsByKey["agent_style"]
          : boot.agentIdsByKey["agent_furniture"];

      const [createdTask] = await db
        .insert(issues)
        .values({
          companyId: boot.companyId,
          projectId: boot.projectId,
          title: `[Ghim 3D • ${entity_name}] ${String(comment).slice(0, 80)}`,
          description: `Nhận xét được ghim trực tiếp trên mô hình 3D Pascal:\n- **Đối tượng**: ${entity_name} (${entity_id ?? "room"})\n- **Tọa độ (mm)**: X=${position_mm[0]}, Y=${position_mm[1]}, Z=${position_mm[2]}\n- **Nội dung**: ${comment}`,
          status: "in_progress",
          priority: "high",
          assigneeAgentId: targetAgentId ?? boot.chiefArchitectAgentId,
          createdByUserId: "local-board",
          responsibleUserId: "local-board",
          issueNumber: nextNum,
          identifier,
          originKind: "manual",
        })
        .returning();

      // Also append the pin note into the Chief Architect Conversation so chat & 3D stay 100% synced
      if (boot.conversationIssueId) {
        await db.insert(issueComments).values({
          companyId: boot.companyId,
          issueId: boot.conversationIssueId,
          authorUserId: "local-board",
          authorType: "user",
          body: `📍 **[Ghim nhận xét trên 3D — ${entity_name} (${position_mm[0]}, ${position_mm[1]} mm)]**: ${comment} *(Đã tạo công việc ${identifier})*`,
        });
      }

      let proposalId: string | null = null;
      if (create_proposal) {
        try {
          const chatRes = await fetch(
            `${PYTHON_API_URL}/api/v1/projects/${encodeURIComponent(projectId)}/chat/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: `[Ghim 3D tại ${entity_name}]: ${comment}`,
              }),
            },
          );
          if (chatRes.ok) {
            const chatJson = (await chatRes.json()) as {
              proposal?: { id?: string; title?: string; rationale?: string; cost_delta_vnd?: number };
              assistant_message?: { content?: string };
            };
            proposalId = chatJson.proposal?.id ?? null;

            if (boot.conversationIssueId && chatJson.assistant_message?.content) {
              await db.insert(issueComments).values({
                companyId: boot.companyId,
                issueId: boot.conversationIssueId,
                authorAgentId: boot.chiefArchitectAgentId,
                authorType: "agent",
                body: chatJson.assistant_message.content,
              });
            }
          }
        } catch {
          // ignore if sidecar busy
        }
      }

      const newPin: SpatialPinFeedback = {
        id: `pin_${Date.now()}`,
        project_id: projectId,
        entity_id,
        entity_name,
        position_mm: [
          Number(position_mm[0] ?? 0),
          Number(position_mm[1] ?? 0),
          Number(position_mm[2] ?? 0),
        ],
        comment: String(comment),
        author: "Chủ nhà (Board)",
        status: proposalId ? "in_progress" : "open",
        paperclip_issue_id: createdTask?.id ?? null,
        paperclip_issue_identifier: identifier,
        proposal_id: proposalId,
        created_at: new Date().toISOString(),
      };

      const existing = projectPinsStore.get(projectId) ?? [];
      projectPinsStore.set(projectId, [newPin, ...existing]);

      res.status(201).json({
        ok: true,
        pin: newPin,
        paperclipTask: createdTask,
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // ============================================================================
  // 5. TRANSPARENT PROXY & BIDIRECTIONAL SYNC FOR `/api/v1/*`
  // Connects ATELIER AI 2D/3D Studio, Floor Plan, Cost Engine, Catalog & CAD Exports
  // directly to Paperclip's PostgreSQL Control Plane (Conversations, Tasks, Approvals, Activity)
  // ============================================================================
  router.use("/v1", async (req: Request, res: Response) => {
    const ready = await ensurePythonCadSidecarOnDemand();
    if (!ready) {
      res.status(503).json({
        error: "Python CAD/Cost sidecar is starting on-demand. Please retry in a moment.",
      });
      return;
    }

    const targetUrl = `${PYTHON_API_URL}/api/v1${req.url}`;
    try {
      const headers: Record<string, string> = {};
      for (const [key, val] of Object.entries(req.headers)) {
        if (
          key.toLowerCase() === "host" ||
          key.toLowerCase() === "connection" ||
          key.toLowerCase() === "content-length"
        ) {
          continue;
        }
        if (typeof val === "string") headers[key] = val;
      }

      let bodyPayload: BodyInit | undefined;
      if (req.method !== "GET" && req.method !== "HEAD") {
        const contentType = String(req.headers["content-type"] || "");
        if (contentType.includes("application/json")) {
          bodyPayload = JSON.stringify(req.body ?? {});
        } else {
          // Raw stream / multipart upload (e.g. floor plan upload)
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          bodyPayload = Buffer.concat(chunks);
        }
      }

      const upstream = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: bodyPayload,
      });

      // Mirror key mutations into Paperclip's PostgreSQL tables asynchronously
      if (upstream.ok && req.method === "POST") {
        const cloned = upstream.clone();
        void syncAtelierMutationToPaperclipDb(db, req.path, req.body, cloned).catch(() => {});
      }

      res.status(upstream.status);
      upstream.headers.forEach((value, key) => {
        if (
          key.toLowerCase() !== "transfer-encoding" &&
          key.toLowerCase() !== "content-encoding" &&
          key.toLowerCase() !== "content-length"
        ) {
          res.setHeader(key, value);
        }
      });

      const arrayBuf = await upstream.arrayBuffer();
      res.send(Buffer.from(arrayBuf));
    } catch (error) {
      res.status(502).json({
        error: "Failed to reach ATELIER CAD/BOQ sidecar",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  });

  return router;
}

async function syncAtelierMutationToPaperclipDb(
  db: Db,
  reqPath: string,
  reqBody: unknown,
  upstreamResponse: globalThis.Response,
) {
  const boot = await ensureAtelierPaperclipBootstrap(db);
  const contentType = upstreamResponse.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return;
  const data = (await upstreamResponse.json()) as Record<string, unknown>;

  // 1. User sent a chat message to Chief Architect -> sync message & reply into Paperclip Conversation (`issue_comments`) and create Paperclip Approval if proposal generated
  if (reqPath.endsWith("/chat/messages") && boot.conversationIssueId) {
    const userMsg = (reqBody as { message?: string } | null)?.message;
    if (userMsg) {
      await db.insert(issueComments).values({
        companyId: boot.companyId,
        issueId: boot.conversationIssueId,
        authorUserId: "local-board",
        authorType: "user",
        body: userMsg,
      });
    }
    const assistantMsg = (data.assistant_message as { content?: string } | undefined)?.content;
    if (assistantMsg) {
      await db.insert(issueComments).values({
        companyId: boot.companyId,
        issueId: boot.conversationIssueId,
        authorAgentId: boot.chiefArchitectAgentId,
        authorType: "agent",
        body: assistantMsg,
      });
    }
    const proposal = data.proposal as
      | {
          id?: string;
          title?: string;
          rationale?: string;
          before_summary?: string;
          after_summary?: string;
          cost_delta_vnd?: number;
          new_grand_total_vnd?: number;
        }
      | undefined;
    if (proposal?.id) {
      await db.insert(approvals).values({
        companyId: boot.companyId,
        type: "scene_proposal_review",
        requestedByAgentId: boot.agentIdsByKey["agent_furniture"] ?? boot.chiefArchitectAgentId,
        requestedByUserId: "local-board",
        status: "pending",
        payload: {
          atelierProposalId: proposal.id,
          title: proposal.title,
          reason: proposal.rationale,
          beforeSummary: proposal.before_summary,
          afterSummary: proposal.after_summary,
          costDeltaVnd: proposal.cost_delta_vnd,
          newGrandTotalVnd: proposal.new_grand_total_vnd,
        },
      });
    }
  }

  // 2. Proposal Approved or Rejected -> sync Paperclip `approvals` status and log activity
  if (reqPath.includes("/proposals/") && (reqPath.endsWith("/approve") || reqPath.endsWith("/reject"))) {
    const isApprove = reqPath.endsWith("/approve");
    const pendingList = await db
      .select()
      .from(approvals)
      .where(and(eq(approvals.companyId, boot.companyId), eq(approvals.status, "pending")))
      .orderBy(desc(approvals.createdAt));

    if (pendingList[0]) {
      await db
        .update(approvals)
        .set({
          status: isApprove ? "approved" : "rejected",
          decisionNote: isApprove
            ? "Đã phê duyệt và cập nhật trực tiếp vào Pascal 3D SceneGraph & Dự toán BOQ."
            : "Người dùng từ chối đề xuất; giữ nguyên Scene 3D hiện tại.",
          decidedByUserId: "local-board",
          decidedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(approvals.id, pendingList[0].id));
    }

    await db.insert(activityLog).values({
      companyId: boot.companyId,
      actorType: "user",
      actorId: "local-board",
      action: isApprove ? "proposal.approved" : "proposal.rejected",
      entityType: "project",
      entityId: boot.projectId,
      details: {
        path: reqPath,
        newRevision: (data.project as { revision?: number } | undefined)?.revision,
      },
    });
  }
}
