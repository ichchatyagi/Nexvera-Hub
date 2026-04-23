import axios from 'axios';
import { EventBridgeEvent } from 'aws-lambda';
import { S3Client, ListObjectsV2Command, CopyObjectCommand } from '@aws-sdk/client-s3';
import {
  VideoProcessingWebhookPayload,
  VIDEO_PROCESSING_WEBHOOK_VERSION,
} from '@nexvera/contracts';


// AWS MediaConvert Job State Change Event Detail
interface MediaConvertEventDetail {
  jobId: string;
  status: 'COMPLETE' | 'ERROR' | 'INPUT_INFORMATION' | 'STATUS_UPDATE';
  userMetadata: {
    videoId: string;
    baseKey: string;
  };
  outputGroupDetails?: Array<{
    outputDetails: Array<{
      durationInMs?: number;
    }>;
  }>;
  errorMessage?: string;
}

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;
const WEBHOOK_SECRET = process.env.VIDEO_PROCESSING_WEBHOOK_SECRET;
const BUCKET = process.env.AWS_S3_VIDEO_BUCKET;
const REGION = process.env.AWS_REGION || 'us-east-1';

const s3Client = new S3Client({ region: REGION });

export const handler = async (event: EventBridgeEvent<"MediaConvert Job State Change", MediaConvertEventDetail>) => {
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
      const listCmd = new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: `${baseKey}/`,
      });
      const listRes = await s3Client.send(listCmd);

      // Find first file matching 'thumbnail.#######.jpg'
      const thumbSource = listRes.Contents
        ?.map((obj: any) => obj.Key)
        .filter((key: any): key is string => !!key && /thumbnail\.\d+\.jpg$/.test(key))
        .sort()[0]; // Use the first one (lowest index)

      if (thumbSource) {
        console.log(`Normalizing thumbnail: copying ${thumbSource} -> ${baseKey}/thumbnail.jpg`);
        await s3Client.send(new CopyObjectCommand({
          Bucket: BUCKET,
          CopySource: `${BUCKET}/${thumbSource}`,
          Key: `${baseKey}/thumbnail.jpg`,
        }));
      } else {
        console.warn(`No indexed thumbnail source found for video ${videoId} in s3://${BUCKET}/${baseKey}/`);
      }
    } catch (s3Err: any) {
      console.error(`S3 error during thumbnail normalization for video ${videoId}: ${s3Err.message}`);
    }
  }

  const webhookUrl = `${BACKEND_BASE_URL}/videos/${videoId}/processing-complete`;
  
  // Extract duration from the first output if available
  let durationSeconds: number | undefined;
  if (status === 'COMPLETE' && outputGroupDetails?.[0]?.outputDetails?.[0]?.durationInMs) {
    durationSeconds = Math.floor(outputGroupDetails[0].outputDetails[0].durationInMs / 1000);
  }

  const payload: VideoProcessingWebhookPayload = {
    version: VIDEO_PROCESSING_WEBHOOK_VERSION,
    status: status === 'COMPLETE' ? 'completed' : 'failed',
    base_key: baseKey,
    duration_seconds: durationSeconds,
    error: errorMessage,
  };


  try {
    console.log(`Sending webhook to backend for video ${videoId}, status: ${payload.status}`);
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-internal-video-secret': WEBHOOK_SECRET
      }
    });
    console.log(`Backend responded with status: ${response.status}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to send webhook for video ${videoId}: ${message}`);
    // Optionally throw error to retry if EventBridge supports it (usually it doesn't retry like SQS)
  }
};
