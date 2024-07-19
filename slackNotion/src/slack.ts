import * as core from "@actions/core";
import axios from "axios";
import {
  SendOrUpdateSlackNotification,
  SlackApi,
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
  console.log("test");
};

run();
