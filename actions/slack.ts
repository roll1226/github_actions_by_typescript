import * as core from "@actions/core";
import axios from "axios";

async function notifySlack(message: string) {
  try {
    const webhookUrl = core.getInput("slack-webhook-url");
    if (!webhookUrl) {
      throw new Error("SLACK_WEBHOOK_URL is not set");
    }
    await axios.post(webhookUrl, {
      text: message,
    });
  } catch (error) {
    core.setFailed(
      `Failed to send Slack notification: ${(error as Error).message}`
    );
  }
}

async function run() {
  try {
    const status = core.getInput("status");
    let message = "";

    if (status === "start") {
      message = "GitHub Actions workflow started :rocket:";
    } else if (status === "success") {
      message = "GitHub Actions workflow completed successfully :tada:";
    } else if (status === "failure") {
      message = "GitHub Actions workflow failed :x:";
    } else {
      throw new Error(`Unknown status: ${status}`);
    }

    await notifySlack(message);
  } catch (error) {
    core.setFailed(`Action failed with error: ${(error as Error).message}`);
  }
}

run();
