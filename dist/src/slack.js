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
function sendOrUpdateSlackNotification(webhookUrl, message, threadTs) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const payload = {
                text: message,
            };
            if (threadTs) {
                payload.ts = threadTs;
                payload.text += `\n(Timestamp: ${threadTs})`; // Add the TS for reference if needed
            }
            const response = yield axios_1.default.post(webhookUrl, payload);
            if (response.status === 200) {
                return response.data.ts; // Return the thread_ts or message_ts
            }
            else {
                core.setFailed(`Slack API responded with status code ${response.status}`);
            }
        }
        catch (error) {
            core.setFailed(`Failed to send Slack notification: ${error.message}`);
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const webhookUrl = core.getInput("slack-webhook-url");
            const status = core.getInput("status");
            const runId = core.getInput("run-id");
            const jobName = core.getInput("job-name");
            let threadTs = core.getState("slack-thread-ts");
            const messageBase = `Job ${jobName} with run ID ${runId}`;
            let message;
            if (status === "start") {
                message = `${messageBase} has started.`;
                threadTs = yield sendOrUpdateSlackNotification(webhookUrl, message);
                core.saveState("slack-thread-ts", threadTs || "");
            }
            else if (status === "success") {
                message = `${messageBase} has succeeded.`;
                yield sendOrUpdateSlackNotification(webhookUrl, message, threadTs);
            }
            else if (status === "failure") {
                message = `${messageBase} has failed.`;
                yield sendOrUpdateSlackNotification(webhookUrl, message, threadTs);
            }
        }
        catch (error) {
            core.setFailed(`Action failed with error: ${error.message}`);
        }
    });
}
run();
