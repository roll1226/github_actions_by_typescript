"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseAttachment = void 0;
const jobStatus_1 = require("./jobStatus");
const baseAttachment = (status, repository, ref, eventName, workflow, runId) => {
    const jobUrl = `https://github.com/${repository}/actions/runs/${runId}`;
    return {
        color: jobStatus_1.jobStatus[status].color,
        fields: [
            { title: "Repository", value: repository, short: true },
            { title: "Ref", value: ref, short: true },
            { title: "Event Name", value: eventName, short: true },
            { title: "Workflow", value: `<${jobUrl}|${workflow}>`, short: true },
        ],
    };
};
exports.baseAttachment = baseAttachment;
