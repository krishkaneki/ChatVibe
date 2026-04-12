"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket } from "@/lib/socket";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocketContext = () => useContext(SocketContext);

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const activeRoomsRef = useRef<Set<string>>(new Set());
  const userId = (session?.user as { id?: string })?.id;

  // Expose active rooms so MessageList can register which room it's in
  // so we can rejoin after reconnect
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as { __chatActiveRooms?: Set<string> }).__chatActiveRooms =
        activeRoomsRef.current;
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const s = connectSocket(userId);
    if (!s) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    setSocket(s);

    const handleConnect = () => {
      setIsConnected(true);
      // Re-register user-online (handled inside connectSocket's connect handler)
      // Rejoin all active conversation rooms after reconnect
      activeRoomsRef.current.forEach((roomId) => {
        s.emit("join-room", roomId);
        console.log("Rejoined room after reconnect:", roomId);
      });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("Socket disconnected, will auto-reconnect...");
    };

    const handleReconnect = (attempt: number) => {
      console.log("Socket reconnected after", attempt, "attempts");
    };

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.io.on("reconnect", handleReconnect);

    // Set initial state
    setIsConnected(s.connected);

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.io.off("reconnect", handleReconnect);
      if (userId) disconnectSocket(userId);
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
