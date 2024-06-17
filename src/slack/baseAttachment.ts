import { JobStatus, jobStatus } from "./jobStatus";

export type BaseAttachmentFields = {
  title: string;
  value: string;
  short: boolean;
};

export type BaseAttachment = {
  color: string;
  fields: BaseAttachmentFields[];
};

export const baseAttachment = (
  status: JobStatus,
  repository: string,
  ref: string,
  eventName: string,
  workflow: string,
  runId: string
): BaseAttachment => {
  const jobUrl = `https://github.com/${repository}/actions/runs/${runId}`;

  return {
    color: jobStatus[status].color,
    fields: [
      { title: "Repository", value: repository, short: true },
      { title: "Ref", value: ref, short: true },
      { title: "Event Name", value: eventName, short: true },
      { title: "Workflow", value: `<${jobUrl}|${workflow}>`, short: true },
    ],
  };
};
