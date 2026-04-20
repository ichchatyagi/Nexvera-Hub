import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:flutter/material.dart';
import 'package:nexvera_mobile/features/live_classes/live_class_models.dart';
import 'package:permission_handler/permission_handler.dart';

class AgoraCallPage extends StatefulWidget {
  final JoinPayload payload;
  const AgoraCallPage({super.key, required this.payload});

  @override
  State<AgoraCallPage> createState() => _AgoraCallPageState();
}

class _AgoraCallPageState extends State<AgoraCallPage> {
  late RtcEngine _engine;
  bool _localUserJoined = false;
  int? _remoteUid;
  bool _muted = false;
  bool _cameraOff = false;

  @override
  void initState() {
    super.initState();
    initAgora();
  }

  Future<void> initAgora() async {
    final isBroadcaster = widget.payload.role == 1;

    // Permission requests only if broadcaster
    if (isBroadcaster) {
      await [Permission.microphone, Permission.camera].request();
    }

    // Initialize Engine
    _engine = createAgoraRtcEngine();
    await _engine.initialize(RtcEngineContext(appId: widget.payload.appId));

    _engine.registerEventHandler(
      RtcEngineEventHandler(
        onJoinChannelSuccess: (RtcConnection connection, int elapsed) {
          debugPrint("local user ${connection.localUid} joined");
          if (mounted) setState(() { _localUserJoined = true; });
        },
        onUserJoined: (RtcConnection connection, int remoteUid, int elapsed) {
          debugPrint("remote user $remoteUid joined");
          if (mounted) setState(() { _remoteUid = remoteUid; });
        },
        onUserOffline: (RtcConnection connection, int remoteUid, UserOfflineReasonType reason) {
          debugPrint("remote user $remoteUid left channel");
          if (mounted) setState(() { _remoteUid = null; });
        },
        onError: (err, msg) {
          debugPrint("Agora Error: $err, $msg");
        },
      ),
    );

    // Configure role and media based on payload
    await _engine.setClientRole(
      role: isBroadcaster 
        ? ClientRoleType.clientRoleBroadcaster 
        : ClientRoleType.clientRoleAudience,
    );
    
    if (isBroadcaster) {
      await _engine.enableVideo();
      await _engine.startPreview();
    }

    // Join channel
    await _engine.joinChannel(
      token: widget.payload.rtcToken,
      channelId: widget.payload.channelName,
      uid: widget.payload.uid,
      options: ChannelMediaOptions(
        autoSubscribeVideo: true,
        autoSubscribeAudio: true,
        publishCameraTrack: isBroadcaster,
        publishMicrophoneTrack: isBroadcaster,
      ),
    );
  }

  @override
  void dispose() {
    _engine.leaveChannel();
    _engine.release();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(widget.payload.title, style: const TextStyle(color: Colors.white, fontSize: 16)),
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            onPressed: () => _engine.switchCamera(),
            icon: const Icon(Icons.switch_camera),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Remote Video (Main)
          Center(child: _remoteVideo()),
          
          // Local Preview (Overlay)
          if (widget.payload.role == 1)
            Positioned(
              top: 16,
              right: 16,
              child: Container(
                width: 110,
                height: 160,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white24, width: 2),
                  borderRadius: BorderRadius.circular(12),
                  color: Colors.black54,
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: _localUserJoined && !_cameraOff
                      ? AgoraVideoView(
                          controller: VideoViewController(
                            rtcEngine: _engine,
                            canvas: const VideoCanvas(uid: 0),
                          ),
                        )
                      : const Center(child: Icon(Icons.videocam_off, color: Colors.white54)),
                ),
              ),
            ),
            
          // Controls
          _toolbar(),
        ],
      ),
    );
  }

  Widget _remoteVideo() {
    if (_remoteUid != null) {
      return AgoraVideoView(
        controller: VideoViewController.remote(
          rtcEngine: _engine,
          canvas: VideoCanvas(uid: _remoteUid),
          connection: RtcConnection(channelId: widget.payload.channelName),
        ),
      );
    } else {
      return const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.person_outline, size: 80, color: Colors.white10),
          SizedBox(height: 16),
          Text(
            'Waiting for others to join...',
            style: TextStyle(color: Colors.white38, fontSize: 16, letterSpacing: 0.5),
            textAlign: TextAlign.center,
          ),
        ],
      );
    }
  }

  Widget _toolbar() {
    final isBroadcaster = widget.payload.role == 1;
    return Container(
      alignment: Alignment.bottomCenter,
      padding: const EdgeInsets.only(bottom: 40),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          // Mic Button
          if (isBroadcaster)
            _CircleActionButton(
              onPressed: () {
                setState(() => _muted = !_muted);
                _engine.muteLocalAudioStream(_muted);
              },
              icon: _muted ? Icons.mic_off : Icons.mic,
              color: _muted ? Colors.red : Colors.white24,
            ),
          
          // End Call Button
          _CircleActionButton(
            onPressed: () => Navigator.pop(context),
            icon: Icons.call_end,
            color: Colors.red,
            size: 64,
            iconSize: 32,
          ),
          
          // Camera Button
          if (isBroadcaster)
            _CircleActionButton(
              onPressed: () {
                setState(() => _cameraOff = !_cameraOff);
                _engine.muteLocalVideoStream(_cameraOff);
              },
              icon: _cameraOff ? Icons.videocam_off : Icons.videocam,
              color: _cameraOff ? Colors.red : Colors.white24,
            ),
        ],
      ),
    );
  }
}

class _CircleActionButton extends StatelessWidget {
  final VoidCallback onPressed;
  final IconData icon;
  final Color color;
  final double size;
  final double iconSize;

  const _CircleActionButton({
    required this.onPressed,
    required this.icon,
    this.color = Colors.white24,
    this.size = 56,
    this.iconSize = 28,
  });

  @override
  Widget build(BuildContext context) {
    return RawMaterialButton(
      onPressed: onPressed,
      shape: const CircleBorder(),
      elevation: 4.0,
      fillColor: color,
      padding: EdgeInsets.all((size - iconSize) / 2),
      constraints: BoxConstraints.tightFor(width: size, height: size),
      child: Icon(icon, color: Colors.white, size: iconSize),
    );
  }
}
