import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nexvera_mobile/features/video/video_providers.dart';
import 'package:video_player/video_player.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

class VideoPlayerPage extends ConsumerStatefulWidget {
  final String id;
  const VideoPlayerPage({super.key, required this.id});

  @override
  ConsumerState<VideoPlayerPage> createState() => _VideoPlayerPageState();
}

class _VideoPlayerPageState extends ConsumerState<VideoPlayerPage> {
  VideoPlayerController? _videoPlayerController;
  ChewieController? _chewieController;
  String? _currentUrl;
  bool _isInitializing = false;

  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();
  }

  @override
  void dispose() {
    WakelockPlus.disable();
    _chewieController?.dispose();
    _videoPlayerController?.dispose();
    super.dispose();
  }

  Future<void> _setupPlayer(String url) async {
    if (_currentUrl == url || _isInitializing) return;
    _isInitializing = true;
    _currentUrl = url;

    // Clean up old controllers
    final oldChewie = _chewieController;
    final oldVideo = _videoPlayerController;
    
    _videoPlayerController = VideoPlayerController.networkUrl(Uri.parse(url));
    
    try {
      await _videoPlayerController!.initialize();
      
      if (!mounted) return;

      _chewieController = ChewieController(
        videoPlayerController: _videoPlayerController!,
        aspectRatio: _videoPlayerController!.value.aspectRatio,
        autoPlay: true,
        looping: false,
        errorBuilder: (context, errorMessage) {
          return Center(
            child: Text(
              errorMessage,
              style: const TextStyle(color: Colors.white),
            ),
          );
        },
      );

      setState(() {
        _isInitializing = false;
      });

      // Dispose old ones after new one is ready to avoid flicker
      oldChewie?.dispose();
      oldVideo?.dispose();
    } catch (e) {
      debugPrint('Error initializing video player: $e');
      if (mounted) {
        setState(() {
           _isInitializing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final payloadAsync = ref.watch(playerPayloadProvider(widget.id));

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Lesson Player', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Center(
        child: payloadAsync.when(
          loading: () => const CircularProgressIndicator(color: Colors.white),
          error: (err, stack) => Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.white, size: 48),
              const SizedBox(height: 16),
              Text(
                'Playback Error: $err',
                style: const TextStyle(color: Colors.white),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => ref.invalidate(playerPayloadProvider(widget.id)),
                child: const Text('Try Again'),
              ),
            ],
          ),
          data: (payload) {
            if (_currentUrl != payload.manifestUrl && !_isInitializing) {
              Future.microtask(() => _setupPlayer(payload.manifestUrl));
            }

            if (_chewieController != null && _chewieController!.videoPlayerController.value.isInitialized) {
              return AspectRatio(
                aspectRatio: _chewieController!.aspectRatio ?? 16 / 9,
                child: Chewie(controller: _chewieController!),
              );
            }

            return const CircularProgressIndicator(color: Colors.white);
          },
        ),
      ),
    );
  }
}
