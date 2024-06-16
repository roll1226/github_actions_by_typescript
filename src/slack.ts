import * as core from "@actions/core";
import axios from "axios";

async function sendOrUpdateSlackNotification(
  webhookUrl: string,
  message: string,
  threadTs?: string
): Promise<string | undefined> {
  try {
    const payload: any = {
      text: message,
    };

    if (threadTs) {
      payload.ts = threadTs;
      payload.text += `\n(Timestamp: ${threadTs})`; // Add the TS for reference if needed
    }

    const response = await axios.post(webhookUrl, payload);

    if (response.status === 200) {
      return response.data.ts; // Return the thread_ts or message_ts
    } else {
      core.setFailed(`Slack API responded with status code ${response.status}`);
    }
  } catch (error) {
    core.setFailed(
      `Failed to send Slack notification: ${(error as Error).message}`
    );
  }
}

async function run(): Promise<void> {
  try {
    const webhookUrl = core.getInput("slack-webhook-url");
    const status = core.getInput("status");
    const runId = core.getInput("run-id");
    const jobName = core.getInput("job-name");

    let threadTs: string | undefined = core.getState("slack-thread-ts");
    const messageBase = `Job ${jobName} with run ID ${runId}`;

    let message: string;
    if (status === "start") {
      message = `${messageBase} has started.`;
      threadTs = await sendOrUpdateSlackNotification(webhookUrl, message);
      core.saveState("slack-thread-ts", threadTs || "");
    } else if (status === "success") {
      message = `${messageBase} has succeeded.`;
      await sendOrUpdateSlackNotification(webhookUrl, message, threadTs);
    } else if (status === "failure") {
      message = `${messageBase} has failed.`;
      await sendOrUpdateSlackNotification(webhookUrl, message, threadTs);
    }
  } catch (error) {
    core.setFailed(`Action failed with error: ${(error as Error).message}`);
  }
}

run();
