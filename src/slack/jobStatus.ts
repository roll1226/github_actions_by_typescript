export type JobStatus = "start" | "success" | "failure" | "cancelled";
export const jobStatus: Record<JobStatus, { color: string; result: string }> = {
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
