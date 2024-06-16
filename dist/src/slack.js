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
function notifySlack(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const webhookUrl = core.getInput("slack-webhook-url");
            if (!webhookUrl) {
                throw new Error("SLACK_WEBHOOK_URL is not set");
            }
            yield axios_1.default.post(webhookUrl, { text: message });
        }
        catch (error) {
            core.setFailed(`Failed to send Slack notification: ${error.message}`);
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
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
            yield notifySlack(message);
        }
        catch (error) {
            core.setFailed(`Action failed with error: ${error.message}`);
        }
    });
}
run();
