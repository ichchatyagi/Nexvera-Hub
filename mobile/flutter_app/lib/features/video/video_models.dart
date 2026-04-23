class PlayerPayload {
  final String videoId;
  final String manifestUrl;
  final List<VideoQuality> qualities;
  final String? thumbnailUrl;
  final int? durationSeconds;

  PlayerPayload({
    required this.videoId,
    required this.manifestUrl,
    required this.qualities,
    this.thumbnailUrl,
    this.durationSeconds,
  });

  factory PlayerPayload.fromJson(Map<String, dynamic> json) {
    return PlayerPayload(
      videoId: json['video_id']?.toString() ?? '',
      manifestUrl: json['manifest_url'] ?? '',
      qualities: (json['qualities'] as List?)
              ?.map((q) => VideoQuality.fromJson(q))
              .toList() ??
          [],
      thumbnailUrl: json['thumbnail_url'],
      durationSeconds: json['duration_seconds'],
    );
  }
}

class VideoQuality {
  final String resolution;
  final int bitrate;
  final String url;

  VideoQuality({
    required this.resolution,
    required this.bitrate,
    required this.url,
  });

  factory VideoQuality.fromJson(Map<String, dynamic> json) {
    return VideoQuality(
      resolution: json['resolution'] ?? '',
      bitrate: json['bitrate'] ?? 0,
      url: json['url'] ?? '',
    );
  }
}
