export const JOB_STATUS = {
  START: "started",
  SUCCESS: "succeeded",
  FAILURE: "failed",
  CANCELLED: "cancelled",
} as const;
export type JOB_STATUS = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const jobStatus: Record<JOB_STATUS, { color: string; result: string }> =
  {
    started: {
      color: "#3ea8ff",
      result: "Start",
    },
    succeeded: {
      color: "#2cbe4e",
      result: "Succeeded",
    },
    failed: {
      color: "#cb2431",
      result: "Failed",
    },
    cancelled: {
      color: "#ffc107",
      result: "Cancelled",
    },
  };
