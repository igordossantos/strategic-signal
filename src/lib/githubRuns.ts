const apiBase =
  "https://api.github.com/repos/igordossantos/strategic-signal/actions";

export interface WorkflowRun {
  id: number;
  displayTitle: string;
  status: "queued" | "in_progress" | "completed" | string;
  conclusion: string | null;
  createdAt: string;
  startedAt: string | null;
  updatedAt: string;
  url: string;
  attempt: number;
  headSha: string;
}

export interface WorkflowStep {
  name: string;
  status: string;
  conclusion: string | null;
  number: number;
}

export interface WorkflowJob {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  startedAt: string | null;
  completedAt: string | null;
  url: string;
  steps: WorkflowStep[];
}

export interface WorkflowRunsResult {
  runs: WorkflowRun[];
  rateLimitRemaining: number | null;
  rateLimitReset: string | null;
}

async function githubFetch(path: string): Promise<Response> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const reset = response.headers.get("x-ratelimit-reset");
    const resetText = reset
      ? ` Rate limit resets ${new Date(Number(reset) * 1000).toLocaleTimeString()}.`
      : "";
    throw new Error(
      `GitHub run status request failed (${response.status}).${resetText}`,
    );
  }
  return response;
}

export async function fetchWorkflowRuns(
  workflowFile: string,
): Promise<WorkflowRunsResult> {
  const response = await githubFetch(
    `/workflows/${encodeURIComponent(workflowFile)}/runs?event=workflow_dispatch&per_page=10`,
  );
  const body = await response.json();
  return {
    runs: (body.workflow_runs ?? []).map(
      (run: Record<string, unknown>): WorkflowRun => ({
        id: Number(run.id),
        displayTitle: String(run.display_title ?? run.name ?? "Collection run"),
        status: String(run.status ?? "unknown"),
        conclusion:
          run.conclusion == null ? null : String(run.conclusion),
        createdAt: String(run.created_at ?? ""),
        startedAt:
          run.run_started_at == null ? null : String(run.run_started_at),
        updatedAt: String(run.updated_at ?? ""),
        url: String(run.html_url ?? ""),
        attempt: Number(run.run_attempt ?? 1),
        headSha: String(run.head_sha ?? ""),
      }),
    ),
    rateLimitRemaining: response.headers.get("x-ratelimit-remaining")
      ? Number(response.headers.get("x-ratelimit-remaining"))
      : null,
    rateLimitReset: response.headers.get("x-ratelimit-reset")
      ? new Date(
          Number(response.headers.get("x-ratelimit-reset")) * 1000,
        ).toISOString()
      : null,
  };
}

export function fetchCollectionRuns(): Promise<WorkflowRunsResult> {
  return fetchWorkflowRuns("collect.yml");
}

export async function fetchWorkflowJobs(
  runId: number,
): Promise<WorkflowJob[]> {
  const response = await githubFetch(`/runs/${runId}/jobs?per_page=20`);
  const body = await response.json();
  return (body.jobs ?? []).map(
    (job: Record<string, unknown>): WorkflowJob => ({
      id: Number(job.id),
      name: String(job.name ?? "Job"),
      status: String(job.status ?? "unknown"),
      conclusion:
        job.conclusion == null ? null : String(job.conclusion),
      startedAt:
        job.started_at == null ? null : String(job.started_at),
      completedAt:
        job.completed_at == null ? null : String(job.completed_at),
      url: String(job.html_url ?? ""),
      steps: Array.isArray(job.steps)
        ? job.steps.map(
            (step: Record<string, unknown>): WorkflowStep => ({
              name: String(step.name ?? "Step"),
              status: String(step.status ?? "unknown"),
              conclusion:
                step.conclusion == null ? null : String(step.conclusion),
              number: Number(step.number ?? 0),
            }),
          )
        : [],
    }),
  );
}
