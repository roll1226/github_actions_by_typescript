export const JOB_STATUS = {
  START: "start",
  SUCCESS: "success",
  FAILURE: "failure",
  CANCELLED: "cancelled",
} as const;
export type JOB_STATUS = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const jobStatus: Record<JOB_STATUS, { color: string; result: string }> =
  {
    start: {
      color: "#3ea8ff",
      result: "Start",
    },
    success: {
      color: "#2cbe4e",
      result: "Succeeded",
    },
    failure: {
      color: "#cb2431",
      result: "Failed",
    },
    cancelled: {
      color: "#ffc107",
      result: "Cancelled",
    },
  };
