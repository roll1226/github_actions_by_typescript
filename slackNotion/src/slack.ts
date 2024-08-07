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
      core.setOutput("slack-thread-ts", response.data.ts);
      core.info("Message sent successfully");
      return response.data.ts;
    } else {
      core.setFailed(`Slack API error: ${response.data.error}`);
    }
  } catch (error) {
    core.setFailed(
      `Failed to send Slack notification: ${(error as Error).message}`
    );
  }
};

async function run() {
  try {
    const slackToken = core.getInput("slack-token");
    const slackChannel = core.getInput("slack-channel");
    const status = core.getInput("status") as JOB_STATUS;
    const runId = core.getInput("run-id");
    const jobName = core.getInput("job-name");
    const repository = core.getInput("repository");
    const ref = core.getInput("ref");
    const eventName = core.getInput("event-name");
    const workflow = core.getInput("workflow");
    const targetThreadTs = core.getInput("slack-thread-ts");

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
        pretext: `Job ${jobName} with run ID ${runId} has ${status}.`,
        color: attachment.color,
        fields: attachment.fields,
      },
    ];

    const threadTs = await sendOrUpdateSlackNotification(
      slackToken,
      slackChannel,
      attachments,
      targetThreadTs
    );

    if (threadTs && status === JOB_STATUS.START)
      core.setOutput("slack-thread-ts", threadTs);
  } catch (error) {
    core.setFailed(`Action failed with error: ${(error as Error).message}`);
  }
}

run();
