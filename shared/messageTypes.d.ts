export type WSSharedMessageType = "string";
export type WSRole = "Leader" | "Follower";
export type Identity = { id: number, origin: String | undefined };

export type WSClientOffer = { originIdentity: Identity, targetIdentity: Identity, offer: RTCSessionDescription };
export type WSClientIceCandidate = { originIdentity: Identity, targetIdentity: Identity, candidate: RTCIceCandidate | null };
export type WSClientMessageType = WSSharedMessageType | "role assignment" | "new follower" | "offer" | "ice candidate" | "start of file" | "end of file";

export type WSClientFileInfo = { fileName: string };
export abstract type WSClientMessage = { type: WSClientMessageType; content: any; };
export type WSStringMessage = WSClientMessage & { type: "string"; content: string; };
export type WSRoleAssignementMessage = WSClientMessage & { type: "role assignment"; content: WSRole; };
export type WSNewFollower = WSClientMessage & { type: "new follower", content: Identity }
export type WSClientRTCOfferMessage = WSClientMessage & { type: "offer"; content: WSClientOffer; };
export type WSClientStartOfFileMessage = WSServerMessage & { type: "start of file", content: WSClientFileInfo };
export type WSClientEndOfFileMessage = WSServerMessage & { type: "end of file", content: WSClientFileInfo };
export type WSClientIceCandidateMessage = WSServerMessage & { type: "ice candidate"; content: WSClientIceCandidate };


export type WSServerOffer = { targetIdentity: Identity, offer: RTCSessionDescription };
export type WSServerIceCandidate = { targetIdentity: Identity, candidate: RTCIceCandidate | null };
export type WSServerMessageType = WSSharedMessageType | "follower ready" | "leader ready" | "offer" | "ice candidate" | "start of file" | "end of file";

export type WSTarget = "Leader" | "All" | "All but Me";
export type WSServerFileInfo = { fileName: string, target: WSTarget };
export abstract type WSServerMessage = { type: WSServerMessageType; content: any; };
export type WSFollowerReady = WSServerMessage & { type: "follower ready"; content: null; };
export type WSLeaderReady = WSServerMessage & { type: "leader ready"; content: null; };
export type WSServerStartOfFileMessage = WSServerMessage & { type: "start of file", content: WSServerFileInfo };
export type WSServerEndOfFileMessage = WSServerMessage & { type: "end of file", content: WSServerFileInfo };
export type WSServerRTCOfferMessage = WSServerMessage & { type: "offer"; content: WSServerOffer; };
export type WSServerIceCandidateMessage = WSServerMessage & { type: "ice candidate"; content: WSServerIceCandidate };

export type RTMessageType = "string" | "start of file" | "end of file";
export abstract type RTMessage = { type: RTMessageType, content: any }
export type RTString = RTMessage & { type: "string", content: string };
export type RTStartOfFile = RTMessage & { type: "start of file", content: string };
export type RTEndOfFile = RTMessage & { type: "end of file", content: null };