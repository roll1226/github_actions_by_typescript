import * as core from "@actions/core";
import axios from "axios";

async function notifySlack(message: string) {
  try {
    const webhookUrl = core.getInput("slack-webhook-url");
    if (!webhookUrl) {
      throw new Error("SLACK_WEBHOOK_URL is not set");
    }
    await axios.post(webhookUrl, { text: message });
  } catch (error) {
    core.setFailed(
      `Failed to send Slack notification: ${(error as Error).message}`
    );
  }
}

async function run() {
  try {
    const status = core.getInput("status");
    if (!status) {
      throw new Error("Status is not provided");
    }

    let message = "";
    switch (status) {
      case "start":
        message = "GitHub Actions workflow started :rocket:";
        break;
      case "success":
        message = "GitHub Actions workflow completed successfully :tada:";
        break;
      case "failure":
        message = "GitHub Actions workflow failed :x:";
        break;
      default:
        throw new Error(`Unknown status: ${status}`);
    }

    await notifySlack(message);
  } catch (error) {
    core.setFailed(`Action failed with error: ${(error as Error).message}`);
  }
}

run();
