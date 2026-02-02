import * as WS from "ws";
import { Identity, WSClientEndOfFileMessage, WSClientIceCandidateMessage, WSClientRTCOfferMessage, WSClientStartOfFileMessage, WSNewFollower, WSRole, WSServerFileInfo, WSServerIceCandidate, WSServerMessageType, WSServerOffer, WSTarget } from "../../shared/messageTypes";
import { parsRaw, send } from "./utility";
import { SignaligServer } from "./SignalingServer";

let guidCounter = 0;

export class KayoUser {
    private _guid: number;
    private _webSocket: WS.WebSocket;
    private _origin?: string;
    private _role: WSRole;
    private _kayoInstance: KayoInstance;
    public constructor(kayoInstance: KayoInstance, webSocket: WS.WebSocket, role: WSRole, origin?: string,) {
        this._guid = guidCounter++;
        this._webSocket = webSocket;
        this._origin = origin;
        this._kayoInstance = kayoInstance;
        this._role = role;
        console.log("Client connected:", origin, "\n");
    }
    public get guid() {
        return this._guid;
    }
    public get webSocket() {
        return this._webSocket;
    }
    public get origin() {
        return this._origin;
    }
    public get kayoInstance() {
        return this._kayoInstance;
    }
    public getIdentity(): Identity {
        return { id: this._guid, origin: this._origin };
    }

    public onWebSocketClose(code: number, readon: Buffer) {
        console.log("Close:", this._origin, "with code:", code);
        this._kayoInstance.close(this);
    }
    public onWebSocketError(error: Error) {
        console.log(error);
    }

    private pendingFilename: string | undefined = undefined;
    private pendingTarget: WSTarget | undefined = undefined;
    private funcMap: { [K in WSServerMessageType]: (content: any) => void } = {
        "string": (content: any) => {
            console.log(content);
        },

        "follower ready": (content: any) => {
            if (!this._kayoInstance.leader) {
                console.error("No leader.");
                return;
            }
            send<WSNewFollower>(this._kayoInstance.leader.webSocket, { type: "new follower", content: this.getIdentity() });
        },

        "leader ready": (content: any) => {
            this._kayoInstance.leader = this;
            console.log(`Set leader for ${this.kayoInstance.projectID} to user ${this._guid} (${this._origin}).`)
        },

        "offer": (content: any) => {
            const wsOffer = content as WSServerOffer;
            const targetIdentity = wsOffer.targetIdentity;
            const targetUser = this.kayoInstance.getUserByID(targetIdentity.id);
            if (!targetUser) {
                console.error(`Identity id ${targetIdentity.id} unknown.`);
                return;
            }
            send<WSClientRTCOfferMessage>(targetUser.webSocket, {
                type: "offer",
                content: {
                    targetIdentity: wsOffer.targetIdentity,
                    originIdentity: this.getIdentity(),
                    offer: wsOffer.offer
                }
            });
        },

        "ice candidate": (content: any) => {
            const wsCandidate = content as unknown as WSServerIceCandidate;
            const targetIdentity = wsCandidate.targetIdentity;
            const targetUser = this.kayoInstance.getUserByID(targetIdentity.id);
            if (!targetUser) {
                console.error(`Identity id ${targetIdentity.id} unknown.`);
                return;
            }
            send<WSClientIceCandidateMessage>(targetUser.webSocket, {
                type: "ice candidate",
                content: {
                    targetIdentity: wsCandidate.targetIdentity,
                    originIdentity: this.getIdentity(),
                    candidate: wsCandidate.candidate
                }
            });
        },

        "start of file": (content: any) => {
            const c = content as WSServerFileInfo;
            this.pendingFilename = c.fileName;
            this.pendingTarget = c.target;
            switch (this.pendingTarget) {
                case "Leader": {
                    if (this.kayoInstance.leader)
                        send<WSClientStartOfFileMessage>(this.kayoInstance.leader.webSocket, { type: "start of file", content: { fileName: c.fileName } });
                    break;
                };
                case "All": {
                    for (let user of this.kayoInstance.users)
                        send<WSClientStartOfFileMessage>(user.webSocket, { type: "start of file", content: { fileName: c.fileName } });

                    break;
                };
                case "All but Me": {
                    for (let user of this.kayoInstance.users)
                        if (user !== this)
                            send<WSClientStartOfFileMessage>(user.webSocket, { type: "start of file", content: { fileName: c.fileName } });
                    break;
                };
            }
        },

        "end of file": (content: any) => {
            const c = content as WSServerFileInfo;
            this.pendingFilename = c.fileName;
            this.pendingTarget = c.target;
            switch (this.pendingTarget) {
                case "Leader": {
                    if (this.kayoInstance.leader)
                        send<WSClientEndOfFileMessage>(this.kayoInstance.leader.webSocket, { type: "end of file", content: { fileName: c.fileName } });
                    break;
                };
                case "All": {
                    for (let user of this.kayoInstance.users)
                        send<WSClientEndOfFileMessage>(user.webSocket, { type: "end of file", content: { fileName: c.fileName } });

                    break;
                };
                case "All but Me": {
                    for (let user of this.kayoInstance.users)
                        if (user !== this)
                            send<WSClientEndOfFileMessage>(user.webSocket, { type: "end of file", content: { fileName: c.fileName } });
                    break;
                };
            }
        }
    };

    public onWebSocketMessage(data: WS.RawData, isBinary: Boolean) {
        if (isBinary) {
            console.log("Got Binary from", this.getIdentity(), "| size", (data as Buffer).byteLength / 1024, "kiB");
            switch (this.pendingTarget) {
                case "Leader": {
                    this.kayoInstance.leader?.webSocket?.send(data);
                    break;
                };
                case "All": {
                    for (let user of this.kayoInstance.users)
                        user.webSocket.send(data);

                    break;
                };
                case "All but Me": {
                    for (let user of this.kayoInstance.users)
                        if (user !== this)
                            user.webSocket.send(data);
                    break;
                };
            }
        } else {
            const messageObj = parsRaw(data);
            console.log("Recived: ", messageObj, "\nfrom", this.getIdentity(), "\n");
            const func = this.funcMap[messageObj.type as WSServerMessageType];
            if (func)
                func(messageObj.content);
        }
    }
};

export class KayoInstance {
    private _signalingServer: SignaligServer;
    private _projectID: string;
    public leader?: KayoUser;
    private _users: Set<KayoUser>;
    public constructor(projectID: string, signalingServer: SignaligServer) {
        this._projectID = projectID;
        this._signalingServer = signalingServer;
        this._users = new Set<KayoUser>();
    }

    public get projectID() {
        return this._projectID;
    }
    public get users() {
        return this._users;
    }

    public close(user: KayoUser) {
        if (!this._users.has(user)) {
            console.log(`user ${user.origin} is not registered under KayoInstance ${this._projectID}`);
            return;
        }

        this._users.delete(user);
        if (this.leader === user)
            this.leader = undefined;

        if (this.users.size === 0)
            this._signalingServer.deleteKayoInstance(this);
    }

    public getUserByID(guid: number): KayoUser | undefined {
        for (const user of this.users)
            if (user.guid === guid)
                return user;
        return undefined;
    }
}