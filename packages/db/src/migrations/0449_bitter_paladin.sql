CREATE TABLE "atelier_workflow_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"workflow_run_id" uuid NOT NULL,
	"stage_execution_id" uuid,
	"event_type" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"source_agent_id" uuid,
	"target_agent_id" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "atelier_workflow_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"workflow_definition_id" uuid NOT NULL,
	"workflow_version" integer NOT NULL,
	"root_issue_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"decision_ledger" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "atelier_workflow_stage_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"workflow_run_id" uuid NOT NULL,
	"stage_key" text NOT NULL,
	"issue_id" uuid,
	"agent_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"blocker_reason" text,
	"approval_state" text DEFAULT 'pending' NOT NULL,
	"decision_ledger" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"output_references" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "scope" text DEFAULT 'company' NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "definition" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "atelier_workflow_events" ADD CONSTRAINT "atelier_workflow_events_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_events" ADD CONSTRAINT "atelier_workflow_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_events" ADD CONSTRAINT "atelier_workflow_events_workflow_run_id_atelier_workflow_runs_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."atelier_workflow_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_events" ADD CONSTRAINT "atelier_workflow_events_stage_execution_id_atelier_workflow_stage_executions_id_fk" FOREIGN KEY ("stage_execution_id") REFERENCES "public"."atelier_workflow_stage_executions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_events" ADD CONSTRAINT "atelier_workflow_events_source_agent_id_agents_id_fk" FOREIGN KEY ("source_agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_events" ADD CONSTRAINT "atelier_workflow_events_target_agent_id_agents_id_fk" FOREIGN KEY ("target_agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_runs" ADD CONSTRAINT "atelier_workflow_runs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_runs" ADD CONSTRAINT "atelier_workflow_runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_runs" ADD CONSTRAINT "atelier_workflow_runs_workflow_definition_id_workflows_id_fk" FOREIGN KEY ("workflow_definition_id") REFERENCES "public"."workflows"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_runs" ADD CONSTRAINT "atelier_workflow_runs_root_issue_id_issues_id_fk" FOREIGN KEY ("root_issue_id") REFERENCES "public"."issues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_stage_executions" ADD CONSTRAINT "atelier_workflow_stage_executions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_stage_executions" ADD CONSTRAINT "atelier_workflow_stage_executions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_stage_executions" ADD CONSTRAINT "atelier_workflow_stage_executions_workflow_run_id_atelier_workflow_runs_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."atelier_workflow_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_stage_executions" ADD CONSTRAINT "atelier_workflow_stage_executions_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atelier_workflow_stage_executions" ADD CONSTRAINT "atelier_workflow_stage_executions_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "atelier_workflow_events_idempotency_uq" ON "atelier_workflow_events" USING btree ("company_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "atelier_workflow_events_run_idx" ON "atelier_workflow_events" USING btree ("workflow_run_id","created_at");--> statement-breakpoint
CREATE INDEX "atelier_workflow_runs_company_project_idx" ON "atelier_workflow_runs" USING btree ("company_id","project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "atelier_workflow_runs_project_workflow_version_uq" ON "atelier_workflow_runs" USING btree ("company_id","project_id","workflow_definition_id","workflow_version");--> statement-breakpoint
CREATE UNIQUE INDEX "atelier_workflow_stage_executions_run_stage_uq" ON "atelier_workflow_stage_executions" USING btree ("workflow_run_id","stage_key");--> statement-breakpoint
CREATE INDEX "atelier_workflow_stage_executions_company_project_idx" ON "atelier_workflow_stage_executions" USING btree ("company_id","project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workflows_company_definition_version_uq" ON "workflows" USING btree ("company_id","name","version");