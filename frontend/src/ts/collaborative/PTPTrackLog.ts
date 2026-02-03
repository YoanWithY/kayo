import { Identity } from "../../../../shared/messageTypes";

export type IncomingStream = { sourceIdentity: Identity, stream: MediaStream };
export type OutgoingStream = { stream: MediaStream, deviceID?: string };

export class PTPTrackLog {
    private _incommingStreams: IncomingStream[] = [];
    private _outgoingStreams: OutgoingStream[] = [];
    private _incommingListener: ((identifiedStream: IncomingStream) => void)[] = [];
    private _outgoingListener: ((outgoingStream: OutgoingStream) => void)[] = [];
    public incommingAudioMap: Map<number, HTMLAudioElement> = new Map();

    public prepConnection(peerConnection: RTCPeerConnection, identity: Identity) {
        const incommingTrackListener = (e: RTCTrackEvent) => {
            const isolatedStream = new MediaStream([e.track]);
            this._addIncomming(isolatedStream, identity);
        }
        peerConnection.addEventListener("track", incommingTrackListener);
        const outgoindListener = (outgoingStream: OutgoingStream) => {
            peerConnection.addTrack(outgoingStream.stream.getTracks()[0], outgoingStream.stream);
        };
        this.addOutgoingListener(outgoindListener);
    }

    public get incomingStreams() {
        return this._incommingStreams;
    }

    public get outgoingStreams() {
        return this._outgoingStreams;
    }

    private _addIncomming(mediaStream: MediaStream, identity: Identity) {
        const is: IncomingStream = { sourceIdentity: identity, stream: mediaStream };
        this._incommingStreams.push(is);
        for (const c of this._incommingListener)
            c(is);
    }

    private _addOutgoing(mediaStream: MediaStream) {
        const os: OutgoingStream = { stream: mediaStream };
        this._outgoingStreams.push(os);
        for (const c of this._outgoingListener)
            c(os);
    }

    private _outgoingStreamReadyCallback = (stream: MediaStream) => {
        for (const track of stream.getTracks()) {
            this._addOutgoing(new MediaStream([track]));
        }
    }

    public addOutgoingListener(callback: (outgoingStream: OutgoingStream) => void) {
        this._outgoingListener.push(callback);
    }

    public removeOutgoingListener(callback: (outgoingStream: OutgoingStream) => void) {
        // eslint-disable-next-line local/no-anonymous-arrow-function
        this._outgoingListener = this._outgoingListener.filter(c => { return c !== callback });
    }

    public addIncomingListener(callback: (incomingStreams: IncomingStream) => void) {
        this._incommingListener.push(callback);
    }

    public removeIncommingListener(callback: (incomingStreams: IncomingStream) => void) {
        // eslint-disable-next-line local/no-anonymous-arrow-function
        this._incommingListener = this._incommingListener.filter(c => { return c !== callback });
    }

    public requestUserMedia(constraints?: MediaStreamConstraints) {
        navigator.mediaDevices.getUserMedia(constraints).then(this._outgoingStreamReadyCallback);
    }

    public requestDisplayMedia(options?: DisplayMediaStreamOptions) {
        navigator.mediaDevices.getDisplayMedia(options).then(this._outgoingStreamReadyCallback);
    }
}