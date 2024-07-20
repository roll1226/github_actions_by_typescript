export const JOB_STATUS = {
  START: "started",
  SUCCESS: "succeeded",
  FAILURE: "failed",
  CANCELLED: "cancelled",
} as const;
export type JOB_STATUS = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const jobStatus: Record<JOB_STATUS, { color: string }> = {
  [JOB_STATUS.START]: {
    color: "#3ea8ff",
  },
  [JOB_STATUS.SUCCESS]: {
    color: "#2cbe4e",
  },
  [JOB_STATUS.FAILURE]: {
    color: "#cb2431",
  },
  [JOB_STATUS.CANCELLED]: {
    color: "#ffc107",
  },
};
