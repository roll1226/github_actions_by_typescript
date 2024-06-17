import * as core from "@actions/core";
import axios from "axios";

const SLACK_API = {
  POST: "https://slack.com/api/chat.postMessage",
  UPDATE: "https://slack.com/api/chat.update",
};

type SlackApiProp = {
  url: string;
  data: {
    channel: string;
    text: string;
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
  message: string,
  threadTs?: string
): Promise<string | undefined> => {
  try {
    const payload: any = {
      channel: channel,
      text: message + `ThreadTs: ${threadTs ?? ""}`,
      token: token,
    };

    if (threadTs) {
      payload.thread_ts = threadTs;
    }

    console.log("Sending payload:", JSON.stringify(payload, null, 2)); // デバッグ用ログ

    let response;
    if (threadTs) {
      // Update existing message in the thread
      response = await slackApi({
        url: SLACK_API.UPDATE,
        data: {
          channel: channel,
          text: message,
          ts: threadTs,
          token: token,
        },
        token,
      });
    } else {
      // Send new message to the thread
      response = await slackApi({
        url: SLACK_API.POST,
        data: {
          channel: channel,
          text: message,
          token: token,
        },
        token,
      });
    }

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
    const status = core.getInput("status");
    const runId = core.getInput("run-id");
    const jobName = core.getInput("job-name");

    let threadTs: string | undefined = core.getInput("slack_thread_ts");
    const messageBase = `Job ${jobName} with run ID ${runId}`;

    let message: string;
    if (status === "start") {
      message = `${messageBase} has started.`;
      threadTs = await sendOrUpdateSlackNotification(token, channel, message);
      if (threadTs) {
        // core.saveState("slack-thread-ts", threadTs);
        core.setOutput("slack-thread-ts", threadTs);
      }
    } else if (status === "success") {
      message = `${messageBase} has succeeded.`;
      await sendOrUpdateSlackNotification(token, channel, message, threadTs);
    } else if (status === "failure") {
      message = `${messageBase} has failed.`;
      await sendOrUpdateSlackNotification(token, channel, message, threadTs);
    }
    console.log(core.getState("slack-thread-ts"));
  } catch (error) {
    core.setFailed(`Action failed with error: ${(error as Error).message}`);
  }
};

run();
