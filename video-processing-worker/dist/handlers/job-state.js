"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const axios_1 = __importDefault(require("axios"));
const client_s3_1 = require("@aws-sdk/client-s3");
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;
const WEBHOOK_SECRET = process.env.VIDEO_PROCESSING_WEBHOOK_SECRET;
const BUCKET = process.env.AWS_S3_VIDEO_BUCKET;
const REGION = process.env.AWS_REGION || 'us-east-1';
const s3Client = new client_s3_1.S3Client({ region: REGION });
const handler = async (event) => {
    const { status, userMetadata, outputGroupDetails, errorMessage } = event.detail;
    let { videoId, baseKey } = userMetadata || {};
    if (!videoId) {
        console.error("Missing videoId in userMetadata. Cannot process webhook.");
        return;
    }
    if (!baseKey) {
        console.warn(`Missing baseKey for video ${videoId}. Deriving fallback: videos/${videoId}`);
        baseKey = `videos/${videoId}`;
    }
    if (!BACKEND_BASE_URL || !WEBHOOK_SECRET) {
        console.error("Missing BACKEND_BASE_URL or VIDEO_PROCESSING_WEBHOOK_SECRET");
        return;
    }
    if (status !== 'COMPLETE' && status !== 'ERROR') {
        console.log(`Ignoring EventBridge status: ${status}`);
        return;
    }
    // ── Thumbnail Normalization ───────────────────────────────────────────────
    if (status === 'COMPLETE' && BUCKET) {
        try {
            const listCmd = new client_s3_1.ListObjectsV2Command({
                Bucket: BUCKET,
                Prefix: `${baseKey}/`,
            });
            const listRes = await s3Client.send(listCmd);
            // Find first file matching 'thumbnail.#######.jpg'
            const thumbSource = listRes.Contents
                ?.map((obj) => obj.Key)
                .filter((key) => !!key && /thumbnail\.\d+\.jpg$/.test(key))
                .sort()[0]; // Use the first one (lowest index)
            if (thumbSource) {
                console.log(`Normalizing thumbnail: copying ${thumbSource} -> ${baseKey}/thumbnail.jpg`);
                await s3Client.send(new client_s3_1.CopyObjectCommand({
                    Bucket: BUCKET,
                    CopySource: `${BUCKET}/${thumbSource}`,
                    Key: `${baseKey}/thumbnail.jpg`,
                }));
            }
            else {
                console.warn(`No indexed thumbnail source found for video ${videoId} in s3://${BUCKET}/${baseKey}/`);
            }
        }
        catch (s3Err) {
            console.error(`S3 error during thumbnail normalization for video ${videoId}: ${s3Err.message}`);
        }
    }
    const webhookUrl = `${BACKEND_BASE_URL}/videos/${videoId}/processing-complete`;
    // Extract duration from the first output if available
    let durationSeconds;
    if (status === 'COMPLETE' && outputGroupDetails?.[0]?.outputDetails?.[0]?.durationInMs) {
        durationSeconds = Math.floor(outputGroupDetails[0].outputDetails[0].durationInMs / 1000);
    }
    const payload = {
        base_key: baseKey,
        status: status === 'COMPLETE' ? 'completed' : 'failed',
        duration_seconds: durationSeconds,
        error: errorMessage
    };
    try {
        console.log(`Sending webhook to backend for video ${videoId}, status: ${payload.status}`);
        const response = await axios_1.default.post(webhookUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-internal-video-secret': WEBHOOK_SECRET
            }
        });
        console.log(`Backend responded with status: ${response.status}`);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Failed to send webhook for video ${videoId}: ${message}`);
        // Optionally throw error to retry if EventBridge supports it (usually it doesn't retry like SQS)
    }
};
exports.handler = handler;
