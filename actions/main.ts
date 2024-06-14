import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    // GitHubコンテキストからイベントペイロードを取得
    const payload = github.context.payload;

    // イベント情報をログに出力
    console.log(`Event: ${github.context.eventName}`);
    console.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

    // インプットパラメータを取得
    const whoToGreet = core.getInput("who-to-greet");
    console.log(`Hello ${whoToGreet}!`);

    // 現在の時間を出力として設定
    const time = new Date().toTimeString();
    core.setOutput("time", time);
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();
