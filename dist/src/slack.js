"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const axios_1 = __importDefault(require("axios"));
const baseAttachment_1 = require("./slack/baseAttachment");
const SLACK_API = {
    POST: "https://slack.com/api/chat.postMessage",
    UPDATE: "https://slack.com/api/chat.update",
};
const slackApi = (_a) => __awaiter(void 0, [_a], void 0, function* ({ url, data, token }) {
    return yield axios_1.default.post(url, data, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=utf-8",
        },
    });
});
const sendOrUpdateSlackNotification = (token, channel, attachments, threadTs) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("Sending payload:", JSON.stringify(payload, null, 2)); // デバッグ用ログ
        const response = threadTs
            ? yield slackApi({
                url: SLACK_API.UPDATE,
                data: {
                    channel,
                    attachments,
                    ts: threadTs,
                    token,
                },
                token,
            })
            : yield slackApi({
                url: SLACK_API.POST,
                data: {
                    channel,
                    attachments,
                    token,
                },
                token,
            });
        if (response.data.ok) {
            return response.data.ts;
        }
        else {
            core.setFailed(`Slack API responded with error: ${response.data.error}`);
        }
    }
    catch (error) {
        core.setFailed(`Failed to send Slack notification: ${error.message}`);
    }
});
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = core.getInput("slack-token");
        const channel = core.getInput("slack-channel");
        const status = core.getInput("status");
        const runId = core.getInput("run-id");
        const jobName = core.getInput("job-name");
        const repository = core.getInput("repository");
        const ref = core.getInput("ref");
        const eventName = core.getInput("event-name");
        const workflow = core.getInput("workflow");
        let threadTs = core.getInput("slack_thread_ts");
        const attachment = (0, baseAttachment_1.baseAttachment)(status, repository, ref, eventName, workflow, runId);
        if (status === "start") {
            const attachments = [
                {
                    pretext: `Job ${jobName} with run ID ${runId} has started.`,
                    color: attachment.color,
                    fields: attachment.fields,
                },
            ];
            threadTs = yield sendOrUpdateSlackNotification(token, channel, attachments);
            if (threadTs) {
                core.setOutput("slack-thread-ts", threadTs);
            }
        }
        else if (status === "success") {
            const attachments = [
                {
                    pretext: `Job ${jobName} with run ID ${runId} has succeeded.`,
                    color: attachment.color,
                    fields: attachment.fields,
                },
            ];
            yield sendOrUpdateSlackNotification(token, channel, attachments, threadTs);
        }
        else if (status === "failure") {
            const attachments = [
                {
                    pretext: `Job ${jobName} with run ID ${runId} has failed.`,
                    color: attachment.color,
                    fields: attachment.fields,
                },
            ];
            yield sendOrUpdateSlackNotification(token, channel, attachments, threadTs);
        }
        console.log(core.getState("slack-thread-ts"));
    }
    catch (error) {
        core.setFailed(`Action failed with error: ${error.message}`);
    }
});
run();
