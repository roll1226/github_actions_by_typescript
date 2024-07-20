import * as core from "@actions/core";
import axios from "axios";

async function run() {
  try {
    const slackToken = core.getInput("slack-token");
    const slackChannel = core.getInput("slack-channel");
    const status = core.getInput("status");
    const runId = core.getInput("run-id");
    const jobName = core.getInput("job-name");
    const repository = core.getInput("repository");
    const ref = core.getInput("ref");
    const eventName = core.getInput("event-name");
    const workflow = core.getInput("workflow");

    const message = `Job *${jobName}* with run ID *${runId}* has ${status}. Repository: ${repository}, Ref: ${ref}, Event: ${eventName}, Workflow: ${workflow}`;

    const response = await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: slackChannel,
        text: message,
      },
      {
        headers: {
          Authorization: `Bearer ${slackToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.ok) {
      core.setOutput("slack-thread-ts", response.data.ts);
      core.info("Message sent successfully");
    } else {
      core.setFailed(`Slack API error: ${response.data.error}`);
    }
  } catch (error) {
    core.setFailed(`Action failed with error: ${(error as Error).message}`);
  }
}

run();
