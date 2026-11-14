import { and, desc, eq, inArray } from "drizzle-orm";
import {
  type Db,
  agents,
  approvals,
  companies,
  goals,
  issueComments,
  issues,
  projects,
} from "@paperclipai/db";
import { addTelegramLog } from "./config.js";

export interface AtelierAgentInfo {
  id: string;
  name: string;
  role: string;
  description: string | null;
  status: string;
  key: string;
}

export interface AtelierTaskSummary {
  id: string;
  identifier: string;
  title: string;
  status: string;
  priority: string;
  assignedAgentName: string;
  assignedAgentId: string | null;
  createdAt: string;
  commentCount: number;
}

export class AtelierTelegramTaskManager {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  public async getCompanyAndProject(): Promise<{ companyId: string; projectId: string; companyPrefix: string }> {
    const [comp] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.issuePrefix, "ATL"))
      .limit(1);

    if (!comp) {
      // Fallback to first company
      const [firstComp] = await this.db.select().from(companies).limit(1);
      if (!firstComp) throw new Error("No company found in database");
      const [firstProj] = await this.db.select().from(projects).where(eq(projects.companyId, firstComp.id)).limit(1);
      return {
        companyId: firstComp.id,
        projectId: firstProj?.id || "",
        companyPrefix: firstComp.issuePrefix || "ATL",
      };
    }

    const [proj] = await this.db
      .select()
      .from(projects)
      .where(eq(projects.companyId, comp.id))
      .limit(1);

    return {
      companyId: comp.id,
      projectId: proj?.id || "",
      companyPrefix: comp.issuePrefix || "ATL",
    };
  }

  public async listAgents(): Promise<AtelierAgentInfo[]> {
    const { companyId } = await this.getCompanyAndProject();
    const rows = await this.db
      .select()
      .from(agents)
      .where(eq(agents.companyId, companyId));

    return rows.map((a) => {
      let key = (a.metadata as Record<string, unknown> | null)?.atelierAgentKey as string | undefined;
      if (!key) {
        const nameLower = a.name.toLowerCase();
        if (nameLower.includes("chief") || nameLower.includes("kts") || nameLower.includes("kiến trúc")) key = "agent_chief_architect";
        else if (nameLower.includes("floor") || nameLower.includes("mặt bằng")) key = "agent_floorplan";
        else if (nameLower.includes("geometry") || nameLower.includes("hình học") || nameLower.includes("bim")) key = "agent_geometry";
        else if (nameLower.includes("furniture") || nameLower.includes("nội thất")) key = "agent_furniture";
        else if (nameLower.includes("ceiling") || nameLower.includes("trần")) key = "agent_geometry";
        else if (nameLower.includes("material") || nameLower.includes("vật liệu")) key = "agent_material";
        else if (nameLower.includes("research") || nameLower.includes("nghiên cứu") || nameLower.includes("khảo sát")) key = "agent_research";
        else if (nameLower.includes("inventory") || nameLower.includes("bom") || nameLower.includes("danh mục")) key = "agent_inventory";
        else if (nameLower.includes("render") || nameLower.includes("phối cảnh")) key = "agent_render";
        else if (nameLower.includes("cost") || nameLower.includes("dự toán") || nameLower.includes("boq")) key = "agent_cost";
        else if (nameLower.includes("shopping") || nameLower.includes("mua sắm") || nameLower.includes("vật tư")) key = "agent_shopping";
        else if (nameLower.includes("qa") || nameLower.includes("kiểm định") || nameLower.includes("quy chuẩn")) key = "agent_qa";
        else if (nameLower.includes("style") || nameLower.includes("phong cách")) key = "agent_style";
        else key = "agent_general";
      }

      return {
        id: a.id,
        name: a.name,
        role: a.role || "Chuyên gia Thiết kế",
        description: a.description,
        status: a.status,
        key,
      };
    });
  }

  public async findAgentByQuery(query: string): Promise<AtelierAgentInfo | null> {
    const agentsList = await this.listAgents();
    const q = query.toLowerCase();

    // Direct matches
    for (const a of agentsList) {
      if (q.includes(a.name.toLowerCase()) || q.includes(a.key.replace("agent_", ""))) {
        return a;
      }
    }

    // Keyword heuristics
    if (q.includes("trần") || q.includes("đèn") || q.includes("downlight") || q.includes("ceiling")) {
      return agentsList.find((a) => a.key === "agent_geometry") || null;
    }
    if (q.includes("vật liệu") || q.includes("gạch") || q.includes("an cường") || q.includes("eurotile") || q.includes("đồng tâm") || q.includes("material")) {
      return agentsList.find((a) => a.key === "agent_material") || agentsList.find((a) => a.key === "agent_style") || null;
    }
    if (q.includes("khảo sát") || q.includes("tìm sản phẩm") || q.includes("sản phẩm thực tế") || q.includes("research") || q.includes("tra cứu giá")) {
      return agentsList.find((a) => a.key === "agent_research") || agentsList.find((a) => a.key === "agent_shopping") || null;
    }
    if (q.includes("bom") || q.includes("inventory") || q.includes("danh mục vật tư") || q.includes("bóc tách khối lượng")) {
      return agentsList.find((a) => a.key === "agent_inventory") || agentsList.find((a) => a.key === "agent_cost") || null;
    }
    if (q.includes("qa") || q.includes("kiểm định") || q.includes("quy chuẩn") || q.includes("thông thủy") || q.includes("va chạm") || q.includes("xung đột")) {
      return agentsList.find((a) => a.key === "agent_qa") || null;
    }
    if (q.includes("geometry") || q.includes("dựng phòng") || q.includes("căn phòng") || q.includes("tường") || q.includes("cửa sổ") || q.includes("bim")) {
      return agentsList.find((a) => a.key === "agent_geometry") || null;
    }
    if (q.includes("bản vẽ") || q.includes("mặt bằng") || q.includes("dxf") || q.includes("floorplan")) {
      return agentsList.find((a) => a.key === "agent_floorplan") || null;
    }
    if (q.includes("sofa") || q.includes("bàn") || q.includes("ghế") || q.includes("tủ") || q.includes("giường") || q.includes("nội thất") || q.includes("furniture")) {
      return agentsList.find((a) => a.key === "agent_furniture") || null;
    }
    if (q.includes("phong cách") || q.includes("sơn") || q.includes("gỗ") || q.includes("style") || q.includes("japandi")) {
      return agentsList.find((a) => a.key === "agent_style") || null;
    }
    if (q.includes("render") || q.includes("phối cảnh") || q.includes("ánh sáng") || q.includes("lighting") || q.includes("hình ảnh")) {
      return agentsList.find((a) => a.key === "agent_render") || null;
    }
    if (q.includes("dự toán") || q.includes("giá") || q.includes("chi phí") || q.includes("báo giá") || q.includes("boq") || q.includes("cost")) {
      return agentsList.find((a) => a.key === "agent_cost") || null;
    }
    if (q.includes("mua sắm") || q.includes("tìm nguồn") || q.includes("shopee") || q.includes("nhà cung cấp") || q.includes("shopping")) {
      return agentsList.find((a) => a.key === "agent_shopping") || null;
    }
    if (q.includes("chief") || q.includes("kiến trúc sư") || q.includes("kts") || q.includes("tổng thể") || q.includes("tư vấn")) {
      return agentsList.find((a) => a.key === "agent_chief_architect") || agentsList.find((a) => a.key === "agent_concierge") || null;
    }

    return null;
  }

  public async getChiefArchitect(): Promise<AtelierAgentInfo | null> {
    const list = await this.listAgents();
    return list.find((a) => a.key === "agent_chief_architect") || list[0] || null;
  }

  public async listActiveTasks(limit = 10): Promise<AtelierTaskSummary[]> {
    const { companyId } = await this.getCompanyAndProject();
    const rows = await this.db
      .select({
        id: issues.id,
        identifier: issues.identifier,
        title: issues.title,
        status: issues.status,
        priority: issues.priority,
        createdAt: issues.createdAt,
        assigneeAgentId: issues.assigneeAgentId,
      })
      .from(issues)
      .where(and(eq(issues.companyId, companyId), inArray(issues.status, ["backlog", "todo", "in_progress", "in_review"])))
      .orderBy(desc(issues.issueNumber))
      .limit(limit);

    const agentMap = new Map((await this.listAgents()).map((a) => [a.id, a.name]));

    return rows.map((r) => ({
      id: r.id,
      identifier: r.identifier || `ATL-${r.id.slice(0, 4)}`,
      title: r.title,
      status: r.status,
      priority: r.priority,
      assignedAgentName: (r.assigneeAgentId ? agentMap.get(r.assigneeAgentId) : null) || "Chưa phân công",
      assignedAgentId: r.assigneeAgentId,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      commentCount: 0,
    }));
  }

  public async getTaskByIdentifierOrId(identifierOrId: string): Promise<{
    issue: typeof issues.$inferSelect;
    comments: (typeof issueComments.$inferSelect)[];
    assignedAgentName: string;
  } | null> {
    const clean = identifierOrId.trim().toUpperCase();
    let [found] = await this.db
      .select()
      .from(issues)
      .where(eq(issues.identifier, clean))
      .limit(1);

    if (!found) {
      // Try by issueNumber if user wrote e.g. "1" or "ATL-1"
      const numMatch = clean.match(/(\d+)$/);
      if (numMatch) {
        const num = parseInt(numMatch[1], 10);
        [found] = await this.db
          .select()
          .from(issues)
          .where(eq(issues.issueNumber, num))
          .limit(1);
      }
    }

    if (!found) {
      // Try by UUID
      try {
        [found] = await this.db
          .select()
          .from(issues)
          .where(eq(issues.id, identifierOrId.trim()))
          .limit(1);
      } catch {
        // Not a UUID, ignore
      }
    }

    if (!found) return null;

    const commentsList = await this.db
      .select()
      .from(issueComments)
      .where(eq(issueComments.issueId, found.id))
      .orderBy(desc(issueComments.createdAt))
      .limit(10);

    const agentList = await this.listAgents();
    const assignedAgentName = found.assigneeAgentId
      ? agentList.find((a) => a.id === found.assigneeAgentId)?.name || "Agent"
      : "Chưa phân công";

    return {
      issue: found,
      comments: commentsList,
      assignedAgentName,
    };
  }

  public async createTaskFromTelegram(params: {
    title: string;
    description: string;
    targetAgentId?: string | null;
    telegramUserId: number;
    telegramUsername?: string;
  }): Promise<{ issueId: string; identifier: string; assignedAgentName: string }> {
    const { companyId, projectId, companyPrefix } = await this.getCompanyAndProject();
    const allAgents = await this.listAgents();

    const chief = allAgents.find((a) => a.key === "agent_chief_architect") || allAgents[0];
    const targetAgentId = params.targetAgentId || chief?.id;
    const targetAgent = allAgents.find((a) => a.id === targetAgentId);

    // Calculate next sequence issue number and update company counter
    const [comp] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    const existingIssues = await this.db
      .select({ issueNumber: issues.issueNumber })
      .from(issues)
      .where(eq(issues.companyId, companyId))
      .orderBy(desc(issues.issueNumber))
      .limit(1);

    const maxExisting = existingIssues[0]?.issueNumber ?? 8;
    const currentCounter = Math.max(comp?.issueCounter ?? 8, maxExisting);
    const nextNum = currentCounter + 1;
    const identifier = `${companyPrefix}-${nextNum}`;

    await this.db
      .update(companies)
      .set({ issueCounter: nextNum, updatedAt: new Date() })
      .where(eq(companies.id, companyId));

    const [created] = await this.db
      .insert(issues)
      .values({
        companyId,
        projectId,
        title: params.title.slice(0, 120),
        description: params.description,
        status: "in_progress",
        priority: "high",
        assigneeAgentId: targetAgentId,
        createdByUserId: `telegram:${params.telegramUserId}`,
        responsibleUserId: `telegram:${params.telegramUserId}`,
        issueNumber: nextNum,
        identifier,
        originKind: "manual",
      })
      .returning();

    // Insert user's Telegram message as the starting issue comment
    await this.db.insert(issueComments).values({
      companyId,
      issueId: created.id,
      authorUserId: `telegram:${params.telegramUserId}`,
      authorType: "user",
      body: `📩 **Yêu cầu khởi tạo qua Telegram** (Người gửi: @${params.telegramUsername || params.telegramUserId}):\n\n${params.description}`,
    });

    addTelegramLog("info", `Created Task ${identifier} via Telegram`, {
      identifier,
      targetAgent: targetAgent?.name,
      telegramUserId: params.telegramUserId,
    });

    return {
      issueId: created.id,
      identifier,
      assignedAgentName: targetAgent?.name || "Agent",
    };
  }

  public async addCommentToTask(params: {
    issueId: string;
    comment: string;
    telegramUserId: number;
    telegramUsername?: string;
  }): Promise<void> {
    const { companyId } = await this.getCompanyAndProject();

    await this.db.insert(issueComments).values({
      companyId,
      issueId: params.issueId,
      authorUserId: `telegram:${params.telegramUserId}`,
      authorType: "user",
      body: `💬 **Phản hồi qua Telegram** (@${params.telegramUsername || params.telegramUserId}):\n\n${params.comment}`,
    });

    addTelegramLog("info", `Appended Telegram comment to task ${params.issueId}`, {
      telegramUserId: params.telegramUserId,
    });
  }

  public async listPendingApprovals(): Promise<
    Array<{
      id: string;
      type: string;
      requestedByAgentName: string;
      payload: Record<string, unknown>;
      createdAt: string;
    }>
  > {
    const { companyId } = await this.getCompanyAndProject();
    const rows = await this.db
      .select()
      .from(approvals)
      .where(and(eq(approvals.companyId, companyId), eq(approvals.status, "pending")))
      .orderBy(desc(approvals.createdAt))
      .limit(10);

    const agentList = await this.listAgents();
    const agentMap = new Map(agentList.map((a) => [a.id, a.name]));

    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      requestedByAgentName: (r.requestedByAgentId ? agentMap.get(r.requestedByAgentId) : null) || "Agent",
      payload: (r.payload as Record<string, unknown>) || {},
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));
  }

  public async decideApproval(params: {
    approvalId: string;
    decision: "approved" | "rejected" | "revision_requested";
    decisionNote: string;
    telegramUserId: number;
    telegramUsername?: string;
  }): Promise<boolean> {
    const [existing] = await this.db
      .select()
      .from(approvals)
      .where(eq(approvals.id, params.approvalId))
      .limit(1);

    if (!existing) return false;

    const note = `${params.decisionNote} (bởi Telegram @${params.telegramUsername || params.telegramUserId})`;

    await this.db
      .update(approvals)
      .set({
        status: params.decision,
        decisionNote: note,
        decidedByUserId: `telegram:${params.telegramUserId}`,
        decidedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(approvals.id, params.approvalId));

    addTelegramLog("info", `Approval ${params.approvalId} decided as ${params.decision}`, {
      decision: params.decision,
      telegramUserId: params.telegramUserId,
    });

    return true;
  }

  public async cancelTask(issueIdOrIdentifier: string, telegramUserId: number): Promise<string | null> {
    const taskData = await this.getTaskByIdentifierOrId(issueIdOrIdentifier);
    if (!taskData) return null;

    const { issue } = taskData;
    await this.db
      .update(issues)
      .set({
        status: "canceled",
        updatedAt: new Date(),
      })
      .where(eq(issues.id, issue.id));

    await this.db.insert(issueComments).values({
      companyId: issue.companyId,
      issueId: issue.id,
      authorUserId: `telegram:${telegramUserId}`,
      authorType: "user",
      body: `🚫 **Công việc đã bị hủy** bởi người dùng qua Telegram.`,
    });

    return issue.identifier || issue.id;
  }

  public async getProjectProgress(): Promise<{
    totalTasks: number;
    doneTasks: number;
    inProgressTasks: number;
    pendingApprovals: number;
    percentDone: number;
  }> {
    const { companyId } = await this.getCompanyAndProject();

    const allIssues = await this.db
      .select({ status: issues.status })
      .from(issues)
      .where(eq(issues.companyId, companyId));

    const totalTasks = allIssues.length;
    const doneTasks = allIssues.filter((i) => i.status === "done").length;
    const inProgressTasks = allIssues.filter((i) => i.status === "in_progress").length;

    const pendingApprovalsList = await this.db
      .select({ id: approvals.id })
      .from(approvals)
      .where(and(eq(approvals.companyId, companyId), eq(approvals.status, "pending")));

    const percentDone = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      doneTasks,
      inProgressTasks,
      pendingApprovals: pendingApprovalsList.length,
      percentDone,
    };
  }
}
