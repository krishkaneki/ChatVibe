import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-surface text-center p-8 pt-16 md:pt-8">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/20"
        style={{ background: "var(--signature-gradient)" }}
      >
        <MessageSquare className="w-10 h-10 text-white" />
      </div>
      <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
        Your messages
      </h2>
      <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">
        Select a conversation from the sidebar or start a new one to begin
        vibing.
      </p>
    </div>
  );
}
