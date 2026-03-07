import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

const VideoCall = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [callState, setCallState] = useState('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState('');
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const pendingCandidatesRef = useRef([]);   // ← Queue for early ICE candidates

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ── Flush any queued ICE candidates ──
  const flushCandidates = useCallback(async (pc) => {
    for (const candidate of pendingCandidatesRef.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('Failed to add queued ICE candidate:', e);
      }
    }
    pendingCandidatesRef.current = [];
  }, []);

  // ── Create RTCPeerConnection ──
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice_candidate', {
          caseId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('📹 Remote track received!', event.streams[0]);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setRemoteConnected(true);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setRemoteConnected(true);
      }
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setRemoteConnected(false);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [caseId]);

  // ── Initialize everything ──
  const initializeMedia = async () => {
    try {
      setCallState('connecting');
      setError('');

      // 1. Get camera/mic FIRST
      console.log('📷 Requesting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log('📷 Camera OK! Tracks:', stream.getTracks().map(t => t.kind));

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // 2. Connect socket
      console.log('🔌 Connecting socket to:', API_URL);
      const socket = io(API_URL, {
        transports: ['websocket', 'polling'],   // ← fallback to polling if WS fails
        reconnectionAttempts: 5,
        timeout: 10000,
      });
      socketRef.current = socket;

      // 3. Create peer connection & add tracks
      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // 4. Socket events
      socket.on('connect', () => {
        console.log('🔌 Socket connected! ID:', socket.id);
        setSocketConnected(true);
        socket.emit('join_video', caseId);
      });

      socket.on('connect_error', (err) => {
        console.error('🔌 Socket connection error:', err.message);
        setError(`Cannot connect to server: ${err.message}. Check if the backend is running.`);
      });

      // Other user joined → we create offer
      socket.on('user_joined_video', async () => {
        console.log('👤 Other user joined! Creating offer...');
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('video_offer', { caseId, offer });
        } catch (err) {
          console.error('Error creating offer:', err);
        }
      });

      // We receive an offer → create answer
      socket.on('video_offer', async ({ offer }) => {
        console.log('📨 Received offer, creating answer...');
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          await flushCandidates(pc);    // ← flush queued candidates
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('video_answer', { caseId, answer });
        } catch (err) {
          console.error('Error handling offer:', err);
        }
      });

      // We receive an answer
      socket.on('video_answer', async ({ answer }) => {
        console.log('📨 Received answer');
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          await flushCandidates(pc);    // ← flush queued candidates
        } catch (err) {
          console.error('Error handling answer:', err);
        }
      });

      // ICE candidates — queue if remoteDescription not set yet
      socket.on('ice_candidate', async ({ candidate }) => {
        try {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            console.log('⏳ Queuing ICE candidate (no remote desc yet)');
            pendingCandidatesRef.current.push(candidate);   // ← QUEUE instead of drop
          }
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      });

      // Other user left
      socket.on('user_left_video', () => {
        console.log('👤 Other user left');
        setRemoteConnected(false);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      setCallState('connected');

      // Start timer
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('❌ Media error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera/mic access denied. Click the 🔒 icon in your browser address bar → allow Camera & Microphone → then retry.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera or microphone found. Please connect a device and try again.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is being used by another app. Close other apps using your camera and retry.');
      } else {
        setError(`Failed to start: ${err.message}`);
      }
      setCallState('idle');
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack && peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(camTrack);
      }
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false,
        });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          const camTrack = localStreamRef.current?.getVideoTracks()[0];
          if (camTrack && peerConnectionRef.current) {
            const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(camTrack);
          }
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          screenStreamRef.current = null;
          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error('Screen share error:', err);
      }
    }
  };

  const endCall = () => {
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
    if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach((t) => t.stop());
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (socketRef.current) {
      socketRef.current.emit('leave_video', caseId);
      socketRef.current.disconnect();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('ended');
  };

  useEffect(() => {
    return () => {
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach((t) => t.stop());
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (socketRef.current) {
        socketRef.current.emit('leave_video', caseId);
        socketRef.current.disconnect();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/50 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center">
            <i className="fas fa-gavel text-[#0D1B2A] text-xs"></i>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">JurisBridge Consultation</p>
            <p className="text-white/50 text-[10px]">Case: {caseId?.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {callState === 'connected' && (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${remoteConnected ? 'bg-[#2d8a5e]' : 'bg-[#C9A84C]'}`}></span>
            <span className="text-white/80 text-xs font-mono">{formatDuration(callDuration)}</span>
            {socketConnected && <span className="text-[9px] text-green-400/60">● online</span>}
          </div>
        )}

        <button
          onClick={() => { endCall(); navigate(`/cases/${caseId}`); }}
          className="text-white/50 hover:text-white text-xs transition-colors"
        >
          <i className="fas fa-xmark text-lg"></i>
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative flex items-center justify-center">
        {callState === 'idle' && !error && (
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-video text-white/30 text-3xl"></i>
            </div>
            <h2 className="text-white text-xl font-heading font-bold mb-2">Start Video Consultation</h2>
            <p className="text-white/40 text-sm mb-8 max-w-md">
              Connect face-to-face with your {user?.role === 'lawyer' ? 'client' : 'lawyer'} for a secure legal consultation.
            </p>
            <button
              onClick={initializeMedia}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#2d8a5e] hover:bg-[#236b4a] text-white rounded-2xl text-base font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#2d8a5e]/30 hover:scale-105"
            >
              <i className="fas fa-video"></i>
              Start Call
            </button>
          </div>
        )}

        {callState === 'connecting' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-[#C9A84C] animate-spin mx-auto mb-6"></div>
            <p className="text-white/60 text-sm">Setting up your camera...</p>
          </div>
        )}

        {error && (
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 rounded-full bg-[#c0392b]/20 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-video-slash text-[#c0392b] text-xl"></i>
            </div>
            <p className="text-white text-sm font-semibold mb-2">Unable to Start Call</p>
            <p className="text-white/40 text-xs mb-6">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => { setError(''); initializeMedia(); }} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-all">
                <i className="fas fa-rotate-right mr-2"></i>Retry
              </button>
              <button onClick={() => navigate(`/cases/${caseId}`)} className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl text-xs font-medium transition-all">
                Go Back
              </button>
            </div>
          </div>
        )}

        {callState === 'connected' && (
          <>
            <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" style={{ background: '#111' }} />

            {!remoteConnected && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0D1B2A] to-[#0a0a0a]">
                <div className="text-center">
                  <div className="w-28 h-28 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user-tie text-white/20 text-4xl"></i>
                  </div>
                  <p className="text-white/40 text-sm">Waiting for {user?.role === 'lawyer' ? 'client' : 'lawyer'} to join...</p>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: `${i * 200}ms` }}></span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="absolute bottom-28 right-6 w-48 h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black z-20 group">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {isVideoOff && (
                <div className="absolute inset-0 bg-[#0D1B2A] flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <i className="fas fa-video-slash text-white/30 text-sm"></i>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] text-white/70 font-medium">
                {isScreenSharing && <i className="fas fa-display mr-1 text-[#C9A84C]"></i>}
                You
              </div>
            </div>
          </>
        )}

        {callState === 'ended' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-phone-slash text-white/30 text-xl"></i>
            </div>
            <p className="text-white text-lg font-heading font-bold mb-1">Call Ended</p>
            <p className="text-white/40 text-sm mb-2">Duration: {formatDuration(callDuration)}</p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => { setCallState('idle'); setCallDuration(0); setError(''); setRemoteConnected(false); }} className="px-5 py-2.5 bg-[#2d8a5e] hover:bg-[#236b4a] text-white rounded-xl text-sm font-medium transition-all">
                <i className="fas fa-rotate-right mr-2"></i>Call Again
              </button>
              <button onClick={() => navigate(`/cases/${caseId}`)} className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-medium transition-all">
                Back to Case
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {callState === 'connected' && (
        <div className="relative z-20 flex items-center justify-center gap-4 py-6 bg-gradient-to-t from-black/80 to-transparent">
          <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${isMuted ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'}`} title={isMuted ? 'Unmute' : 'Mute'}>
            <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-sm`}></i>
          </button>

          <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${isVideoOff ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'}`} title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}>
            <i className={`fas ${isVideoOff ? 'fa-video-slash' : 'fa-video'} text-sm`}></i>
          </button>

          <button onClick={toggleScreenShare} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${isScreenSharing ? 'bg-[#C9A84C] text-[#0D1B2A]' : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'}`} title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
            <i className="fas fa-display text-sm"></i>
          </button>

          <button onClick={endCall} className="w-14 h-14 bg-[#c0392b] hover:bg-[#a93226] text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg shadow-[#c0392b]/30" title="End call">
            <i className="fas fa-phone-slash text-base"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;