import * as core from "@actions/core";
import axios from "axios";
import { baseAttachment } from "./slack/baseAttachment";
import { JOB_STATUS } from "./slack/jobStatus";
import {
  SendOrUpdateSlackNotification,
  SlackApi,
  SlackAttachment,
  SlackPayload,
} from "./types/slack";

const SLACK_API = {
  POST: "https://slack.com/api/chat.postMessage",
  UPDATE: "https://slack.com/api/chat.update",
};

const slackApi: SlackApi = async ({ url, payload, token }) => {
  return await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};

const sendOrUpdateSlackNotification: SendOrUpdateSlackNotification = async (
  token,
  channel,
  attachments,
  threadTs
) => {
  try {
    const slackPayload: SlackPayload = {
      channel,
      attachments,
      token,
    };

    if (threadTs) slackPayload.ts = threadTs;

    const response = await slackApi({
      url: threadTs ? SLACK_API.UPDATE : SLACK_API.POST,
      payload: slackPayload,
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
    const env = process.env;
    const token = env.SLACK_TOKEN;
    const channel = env.SLACK_CHANNEL;
    const status = env.STATUS;
    const runId = env.RUN_ID;
    const jobName = env.JOB_NAME;
    const repository = env.REPOSITORY;
    const ref = env.REF;
    const eventName = env.EVENT_NAME;
    const workflow = env.WORKFLOW;
    const targetThreadTs = env.SLACK_THREAD_TS;

    const attachment = baseAttachment(
      status,
      repository,
      ref,
      eventName,
      workflow,
      runId
    );

    const attachments: SlackAttachment[] = [
      {
        pretext: ``,
        color: attachment.color,
        fields: attachment.fields,
      },
    ];

    attachments[0].pretext = `Job ${jobName} with run ID ${runId} has ${status}.`;

    const threadTs = await sendOrUpdateSlackNotification(
      token,
      channel,
      attachments,
      targetThreadTs
    );

    if (threadTs && status === JOB_STATUS.START)
      core.setOutput("SLACK_THREAD_TS", threadTs);
  } catch (error) {
    core.setFailed(`Action failed with error: ${(error as Error).message}`);
  }
};

run();
