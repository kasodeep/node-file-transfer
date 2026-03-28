"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { WS_RECONNECT_BASE_MS, WS_RECONNECT_MAX_MS } from "@/lib/constants";

/**
 * Opens a WebSocket and automatically reconnects with exponential backoff
 * when the connection drops.
 *
 * @param {string}   url        WebSocket URL
 * @param {Function} onMessage  Called with the parsed JSON payload on every message
 * @returns {boolean} connected  Whether the socket is currently open
 */
export function useReconnectingWS(url, onMessage) {
    const [connected, setConnected] = useState(false);

    const wsRef = useRef(null);
    const retryMs = useRef(WS_RECONNECT_BASE_MS);
    const timerRef = useRef(null);
    const unmounted = useRef(false);
    // Keep a stable ref to onMessage so connect() closure never goes stale
    const onMsgRef = useRef(onMessage);
    useEffect(() => { onMsgRef.current = onMessage; }, [onMessage]);

    const connect = useCallback(() => {
        if (unmounted.current) return;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            retryMs.current = WS_RECONNECT_BASE_MS; // reset backoff on success
        };

        ws.onmessage = (e) => {
            try {
                onMsgRef.current(JSON.parse(e.data));
            } catch {
                /* silently ignore malformed frames */
            }
        };

        ws.onclose = () => {
            setConnected(false);
            if (unmounted.current) return;
            timerRef.current = setTimeout(() => {
                retryMs.current = Math.min(retryMs.current * 2, WS_RECONNECT_MAX_MS);
                connect();
            }, retryMs.current);
        };

        // onerror fires before onclose; closing here triggers the onclose handler
        ws.onerror = () => ws.close();
    }, [url]); // url is the only real dependency

    useEffect(() => {
        unmounted.current = false;
        connect();
        return () => {
            unmounted.current = true;
            clearTimeout(timerRef.current);
            wsRef.current?.close();
        };
    }, [connect]);

    return connected;
}