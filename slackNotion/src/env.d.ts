declare module "process" {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        readonly SLACK_TOKEN: string;
        readonly SLACK_CHANNEL: string;
        readonly STATUS: "started" | "succeeded" | "failed" | "cancelled";
        readonly RUN_ID: string;
        readonly JOB_NAME: string;
        readonly REPOSITORY: string;
        readonly REF: string;
        readonly EVENT_NAME: string;
        readonly WORKFLOW: string;
        readonly SLACK_THREAD_TS: string | undefined;
      }
    }
  }
}
