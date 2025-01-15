import * as OS from "os";
import * as Path from "path";
import { fileURLToPath } from 'url';
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = Path.dirname(__filename);
export const hostname = getWlanIPAddress();
export const port = 4401;
export const staticDirectory = Path.join(__dirname, '../../frontend/dist');
export const wsUUID = new Map();
function getWlanIPAddress() {
    const interfaces = OS.networkInterfaces();
    for (const iface of interfaces.WLAN || []) {
        if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('192.168.')) {
            return iface.address;
        }
    }
    return '127.0.0.1';
}
export function findKeyByValue(map, value) {
    for (let [key, val] of map.entries()) {
        if (val === value) {
            return key;
        }
    }
    return undefined;
}
export function listeningListener() {
    console.log(`HTTP Server running at \t\thttp://${hostname}:${port}/`);
    console.log(`WebSocket server is running at \tws://${hostname}:${port}/\n`);
}
export function parsRaw(data) {
    return JSON.parse(data.toString());
}
export function send(ws, message) {
    const key = findKeyByValue(wsUUID, ws);
    console.log("Send to", key, ":", message, "\n");
    ws.send(JSON.stringify(message));
}
