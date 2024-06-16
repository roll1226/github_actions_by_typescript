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
      payload.thread_ts = threadTs;
    }

    console.log("Sending payload:", JSON.stringify(payload, null, 2)); // デバッグ用ログ

    const response = await axios.post(webhookUrl, payload);

    console.log("Slack API response status:", response.status); // ステータスコードの確認

    if (response.status === 200) {
      console.log("Slack API response data:", response.data); // デバッグ用ログ
      if (!threadTs) {
        // スレッドTSがない場合、新しいメッセージのTSを返す
        return response.data.ts;
      }
    } else {
      core.setFailed(
        `Slack API responded with status code: ${response.status}`
      );
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
      if (threadTs) {
        core.saveState("slack-thread-ts", threadTs);
      }
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
