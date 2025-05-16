import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import WebRTCService from '../services/WebRTCService';

interface CallScreenProps {
  callId: string;
  isCaller: boolean;
  onEndCall: () => void;
}

const CallScreen: React.FC<CallScreenProps> = ({ callId, isCaller, onEndCall }) => {
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    const init = async () => {
      try {
        WebRTCService.init();
        
        // Obtenir le stream local
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: 'user' }
        });
        setLocalStream(stream);

        if (isCaller) {
          const offer = await WebRTCService.createOffer();
          // Envoyer l'offer via votre système de messagerie (Firebase, Socket.io, etc.)
          setStatus('Calling...');
        } else {
          setStatus('Answering...');
        }
      } catch (error) {
        console.error('Call error:', error);
        onEndCall();
      }
    };

    init();

    return () => {
      WebRTCService.close();
      if (localStream) {
        localStream.getTracks().forEach((track: any) => track.stop());
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      )}
      
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.localVideo}
          objectFit="cover"
        />
      )}

      <View style={styles.controls}>
        <Text style={styles.status}>{status}</Text>
        <TouchableOpacity style={styles.endCallButton} onPress={onEndCall}>
          <Text style={styles.endCallText}>End Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideo: {
    flex: 1,
  },
  localVideo: {
    position: 'absolute',
    width: 100,
    height: 150,
    top: 20,
    right: 20,
    borderRadius: 10,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  status: {
    color: 'white',
    marginBottom: 20,
  },
  endCallButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 30,
  },
  endCallText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CallScreen;