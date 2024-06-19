import * as core from "@actions/core";
import axios from "axios";
import { BaseAttachmentFields, baseAttachment } from "./slack/baseAttachment";
import { JobStatus } from "./slack/jobStatus";

const SLACK_API = {
  POST: "https://slack.com/api/chat.postMessage",
  UPDATE: "https://slack.com/api/chat.update",
};

type SlackAttachment = {
  pretext: string;
  color: string;
  fields: BaseAttachmentFields[];
};

type SlackApiProp = {
  url: string;
  data: {
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

type SlackApi = ({ url, data }: SlackApiProp) => Promise<SlackApiReturn>;

const slackApi: SlackApi = async ({ url, data, token }) => {
  return await axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};

const sendOrUpdateSlackNotification = async (
  token: string,
  channel: string,
  attachments: SlackAttachment[],
  threadTs?: string
): Promise<string | undefined> => {
  try {
    // console.log("Sending payload:", JSON.stringify(payload, null, 2)); // デバッグ用ログ

    const response = threadTs
      ? await slackApi({
          url: SLACK_API.UPDATE,
          data: {
            channel,
            attachments,
            ts: threadTs,
            token,
          },
          token,
        })
      : await slackApi({
          url: SLACK_API.POST,
          data: {
            channel,
            attachments,
            token,
          },
          token,
        });

    if (response.data.ok) {
      return response.data.ts;
    } else {
      core.setFailed(`Slack API responded with error: ${response.data.error}`);
    }
  } catch (error) {
    core.setFailed(
      `Failed to send Slack notification: ${(error as Error).message}`
    );
  }
};

const run = async (): Promise<void> => {
  try {
    const token = core.getInput("slack-token");
    const channel = core.getInput("slack-channel");
    const status = core.getInput("status") as JobStatus;
    const runId = core.getInput("run-id");
    const jobName = core.getInput("job-name");
    const repository = core.getInput("repository");
    const ref = core.getInput("ref");
    const eventName = core.getInput("event-name");
    const workflow = core.getInput("workflow");

    let threadTs: string | undefined = core.getInput("slack_thread_ts");

    const attachment = baseAttachment(
      status,
      repository,
      ref,
      eventName,
      workflow,
      runId
    );
    if (status === "start") {
      const attachments: SlackAttachment[] = [
        {
          pretext: `Job ${jobName} with run ID ${runId} has started.`,
          color: attachment.color,
          fields: attachment.fields,
        },
      ];
      threadTs = await sendOrUpdateSlackNotification(
        token,
        channel,
        attachments
      );
      if (threadTs) {
        core.setOutput("slack-thread-ts", threadTs);
      }
    } else if (status === "success") {
      const attachments = [
        {
          pretext: `Job ${jobName} with run ID ${runId} has succeeded.`,
          color: attachment.color,
          fields: attachment.fields,
        },
      ];
      await sendOrUpdateSlackNotification(
        token,
        channel,
        attachments,
        threadTs
      );
    } else if (status === "failure") {
      const attachments = [
        {
          pretext: `Job ${jobName} with run ID ${runId} has failed.`,
          color: attachment.color,
          fields: attachment.fields,
        },
      ];
      await sendOrUpdateSlackNotification(
        token,
        channel,
        attachments,
        threadTs
      );
    } else if (status === "cancelled") {
      const attachments = [
        {
          pretext: `Job ${jobName} with run ID ${runId} has cancelled.`,
          color: attachment.color,
          fields: attachment.fields,
        },
      ];
      await sendOrUpdateSlackNotification(
        token,
        channel,
        attachments,
        threadTs
      );
    }
  } catch (error) {
    core.setFailed(`Action failed with error: ${(error as Error).message}`);
  }
};

run();
