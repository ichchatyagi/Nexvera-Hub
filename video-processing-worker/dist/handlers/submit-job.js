"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_mediaconvert_1 = require("@aws-sdk/client-mediaconvert");
const contracts_1 = require("@nexvera/contracts");
const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET = process.env.AWS_S3_VIDEO_BUCKET;
const ROLE_ARN = process.env.AWS_MEDIACONVERT_ROLE_ARN;
const QUEUE_ARN = process.env.AWS_MEDIACONVERT_QUEUE_ARN;
const handler = async (event) => {
    if (!BUCKET || !ROLE_ARN) {
        throw new Error("Missing required environment variables: AWS_S3_VIDEO_BUCKET or AWS_MEDIACONVERT_ROLE_ARN");
    }
    // 1. Get MediaConvert account endpoint
    const initialClient = new client_mediaconvert_1.MediaConvertClient({ region: REGION });
    const { Endpoints } = await initialClient.send(new client_mediaconvert_1.DescribeEndpointsCommand({}));
    const endpoint = Endpoints?.[0]?.Url;
    if (!endpoint) {
        throw new Error("Could not retrieve MediaConvert endpoint");
    }
    const mcClient = new client_mediaconvert_1.MediaConvertClient({
        region: REGION,
        endpoint: endpoint
    });
    for (const record of event.Records) {
        const body = JSON.parse(record.body);
        if (body.version !== contracts_1.VIDEO_PROCESSING_JOB_VERSION) {
            const errorMsg = `Incompatible job version. Expected ${contracts_1.VIDEO_PROCESSING_JOB_VERSION}, got ${body.version || 'none'}. Body: ${record.body}`;
            console.error(errorMsg);
            throw new Error(errorMsg); // This causes SQS to retry (or go to DLQ)
        }
        const { videoId, s3Key } = body;
        const baseKey = `videos/${videoId}`;
        const destination = `s3://${BUCKET}/${baseKey}/`;
        console.log(`Submitting MediaConvert job for video ${videoId}, input: s3://${BUCKET}/${s3Key}`);
        const params = {
            Role: ROLE_ARN,
            Queue: QUEUE_ARN,
            Settings: {
                Inputs: [
                    {
                        FileInput: `s3://${BUCKET}/${s3Key}`,
                        AudioSelectors: {
                            "Audio Selector 1": {
                                DefaultSelection: "DEFAULT"
                            }
                        },
                        VideoSelector: {},
                        TimecodeSource: "ZEROBASED"
                    }
                ],
                OutputGroups: [
                    {
                        Name: "HLS",
                        OutputGroupSettings: {
                            Type: "HLS_GROUP_SETTINGS",
                            HlsGroupSettings: {
                                SegmentLength: 10,
                                MinSegmentLength: 0,
                                Destination: destination,
                                MasterManifestPropertyName: "master"
                            }
                        },
                        Outputs: [
                            // 360p
                            {
                                VideoDescription: {
                                    CodecSettings: {
                                        Codec: "H_264",
                                        H264Settings: {
                                            RateControlMode: "QVBR",
                                            SceneChangeDetect: "TRANSITION_DETECTION",
                                            MaxBitrate: 800000,
                                            GopSize: 2,
                                            GopSizeUnits: "SECONDS",
                                            NumberBFramesBetweenReferenceFrames: 3
                                        }
                                    },
                                    Width: 640,
                                    Height: 360
                                },
                                AudioDescriptions: [
                                    {
                                        CodecSettings: {
                                            Codec: "AAC",
                                            AacSettings: {
                                                Bitrate: 96000,
                                                CodingMode: "CODING_MODE_2_0",
                                                SampleRate: 48000
                                            }
                                        }
                                    }
                                ],
                                OutputSettings: {
                                    HlsSettings: {
                                        NameModifier: "/360p/index"
                                    }
                                }
                            },
                            // 480p
                            {
                                VideoDescription: {
                                    CodecSettings: {
                                        Codec: "H_264",
                                        H264Settings: {
                                            RateControlMode: "QVBR",
                                            MaxBitrate: 1500000,
                                            GopSize: 2,
                                            GopSizeUnits: "SECONDS"
                                        }
                                    },
                                    Width: 854,
                                    Height: 480
                                },
                                OutputSettings: {
                                    HlsSettings: {
                                        NameModifier: "/480p/index"
                                    }
                                }
                            },
                            // 720p
                            {
                                VideoDescription: {
                                    CodecSettings: {
                                        Codec: "H_264",
                                        H264Settings: {
                                            RateControlMode: "QVBR",
                                            MaxBitrate: 2500000,
                                            GopSize: 2,
                                            GopSizeUnits: "SECONDS"
                                        }
                                    },
                                    Width: 1280,
                                    Height: 720
                                },
                                OutputSettings: {
                                    HlsSettings: {
                                        NameModifier: "/720p/index"
                                    }
                                }
                            },
                            // 1080p
                            {
                                VideoDescription: {
                                    CodecSettings: {
                                        Codec: "H_264",
                                        H264Settings: {
                                            RateControlMode: "QVBR",
                                            MaxBitrate: 5000000,
                                            GopSize: 2,
                                            GopSizeUnits: "SECONDS"
                                        }
                                    },
                                    Width: 1920,
                                    Height: 1080
                                },
                                OutputSettings: {
                                    HlsSettings: {
                                        NameModifier: "/1080p/index"
                                    }
                                }
                            }
                        ]
                    },
                    {
                        Name: "Thumbnails",
                        OutputGroupSettings: {
                            Type: "FILE_GROUP_SETTINGS",
                            FileGroupSettings: {
                                Destination: destination
                            }
                        },
                        Outputs: [
                            {
                                // Main thumbnail capture (at second 5)
                                ContainerSettings: {
                                    Container: "RAW"
                                },
                                VideoDescription: {
                                    CodecSettings: {
                                        Codec: "FRAME_CAPTURE",
                                        FrameCaptureSettings: {
                                            FramerateNumerator: 1,
                                            FramerateDenominator: 5,
                                            MaxCaptures: 1,
                                            Quality: 80
                                        }
                                    },
                                    Width: 640,
                                    Height: 360
                                },
                                NameModifier: "thumbnail"
                            }
                        ]
                    }
                ]
            },
            UserMetadata: {
                videoId: videoId,
                baseKey: baseKey
            }
        };
        try {
            const command = new client_mediaconvert_1.CreateJobCommand(params);
            const response = await mcClient.send(command);
            console.log(`MediaConvert job created: ${response.Job?.Id}`);
        }
        catch (err) {
            console.error(`Error submitting MediaConvert job: ${err instanceof Error ? err.message : String(err)}`);
            throw err; // Fail and retry via SQS
        }
    }
};
exports.handler = handler;
