export type PeerID = number

export class Peer {
    private _peerID: PeerID;
    private _connection: RTCPeerConnection;
    private _dataChannel?: RTCDataChannel;

    public constructor(peerID: PeerID, connection: RTCPeerConnection, dataChannel?: RTCDataChannel) {
        this._peerID = peerID;
        this._connection = connection;
        this._dataChannel = dataChannel;
    }

    public get connection() {
        return this._connection;
    }
    public get dataChannel() {
        return this._dataChannel;
    }
    public get peerID(): PeerID {
        return this._peerID;
    }
}