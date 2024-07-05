import { BaseAttachmentFields } from "../slack/baseAttachment";

export type SlackAttachment = {
  pretext: string;
  color: string;
  fields: BaseAttachmentFields[];
};

type SlackApiProp = {
  url: string;
  payload: {
    channel: string;
    attachments: SlackAttachment[];
    ts?: string;
    token: string;
  };
  token: string;
};

type SlackApiReturn = {
  data: {
    ok: boolean;
    error: string;
    ts: string;
  };
};

export type SlackApi = ({
  url,
  payload,
}: SlackApiProp) => Promise<SlackApiReturn>;

export type SendOrUpdateSlackNotification = (
  token: string,
  channel: string,
  attachments: SlackAttachment[],
  threadTs?: string
) => Promise<string | undefined>;

export type SlackPayload = {
  channel: string;
  token: string;
  attachments: SlackAttachment[];
  ts?: string;
};
