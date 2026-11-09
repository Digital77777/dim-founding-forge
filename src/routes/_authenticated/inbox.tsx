/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, MessageCircle, Send, UserRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";

export const Route = createFileRoute("/_authenticated/inbox")({
  staticData: { sitemap: false },
  component: Inbox,
});

const db = supabase as any;

type Conversation = {
  id: string;
  otherId: string;
  name: string;
  preview: string;
  updatedAt: string;
};
type Request = {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  created_at: string;
  status: string;
  senderName: string;
};

function Inbox() {
  const { userId } = useMember();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"messages" | "requests">("messages");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const inbox = useQuery({
    queryKey: ["inbox", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: memberships, error } = await db
        .from("conversation_members")
        .select("conversation_id, user_id")
        .eq("user_id", userId);
      if (error) throw error;
      const ids = (memberships ?? []).map((item: any) => item.conversation_id);
      if (!ids.length) return { conversations: [] as Conversation[], requests: [] as Request[] };
      const { data: allMembers } = await db
        .from("conversation_members")
        .select("conversation_id, user_id")
        .in("conversation_id", ids);
      const otherIds = [
        ...new Set(
          (allMembers ?? [])
            .filter((item: any) => item.user_id !== userId)
            .map((item: any) => item.user_id),
        ),
      ];
      const [{ data: profiles }, { data: messages }, { data: requests }] = await Promise.all([
        otherIds.length
          ? db.from("profiles").select("id, full_name").in("id", otherIds)
          : { data: [] },
        db
          .from("messages")
          .select("conversation_id, body, created_at")
          .in("conversation_id", ids)
          .order("created_at", { ascending: false }),
        db
          .from("message_requests")
          .select("id, sender_id, recipient_id, message, created_at, status")
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .order("created_at", { ascending: false }),
      ]);
      const names = new Map(
        (profiles ?? []).map((profile: any) => [profile.id, profile.full_name ?? "DIM member"]),
      );
      const latest = new Map<string, any>();
      for (const message of messages ?? [])
        if (!latest.has(message.conversation_id)) latest.set(message.conversation_id, message);
      const conversations = ids
        .map((id: string) => {
          const otherId =
            (allMembers ?? []).find(
              (item: any) => item.conversation_id === id && item.user_id !== userId,
            )?.user_id ?? "";
          const last = latest.get(id);
          return {
            id,
            otherId,
            name: names.get(otherId) ?? "DIM member",
            preview: last?.body ?? "Start a conversation",
            updatedAt: last?.created_at ?? "",
          };
        })
        .sort((a: Conversation, b: Conversation) => b.updatedAt.localeCompare(a.updatedAt));
      const requestSenderIds = [
        ...new Set(
          (requests ?? [])
            .map((request: any) => request.sender_id)
            .filter((id: string) => id !== userId),
        ),
      ];
      const { data: requestProfiles } = requestSenderIds.length
        ? await db.from("profiles").select("id, full_name").in("id", requestSenderIds)
        : { data: [] };
      const requestNames = new Map(
        (requestProfiles ?? []).map((profile: any) => [
          profile.id,
          profile.full_name ?? "DIM member",
        ]),
      );
      return {
        conversations,
        requests: (requests ?? []).map((request: any) => ({
          ...request,
          senderName: requestNames.get(request.sender_id) ?? "DIM member",
        })),
      };
    },
  });

  const activeId = selectedId ?? inbox.data?.conversations[0]?.id ?? null;
  const messages = useQuery({
    queryKey: ["inbox-messages", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await db
        .from("messages")
        .select("id, sender_id, body, created_at")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!activeId || !userId || !draft.trim()) return;
      const { error } = await db
        .from("messages")
        .insert({ conversation_id: activeId, sender_id: userId, body: draft.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft("");
      void queryClient.invalidateQueries({ queryKey: ["inbox-messages", activeId] });
      void queryClient.invalidateQueries({ queryKey: ["inbox", userId] });
    },
    onError: () => toast.error("Your message could not be sent."),
  });

  const respondToRequest = useMutation({
    mutationFn: async ({ request, accept }: { request: Request; accept: boolean }) => {
      if (!userId) return;
      const { error } = await db
        .from("message_requests")
        .update({
          status: accept ? "accepted" : "declined",
          responded_at: new Date().toISOString(),
        })
        .eq("id", request.id);
      if (error) throw error;
      if (accept) {
        const { data: conversation, error: conversationError } = await db
          .from("conversations")
          .insert({})
          .select("id")
          .single();
        if (conversationError) throw conversationError;
        const { error: memberError } = await db.from("conversation_members").insert([
          { conversation_id: conversation.id, user_id: request.sender_id },
          { conversation_id: conversation.id, user_id: userId },
        ]);
        if (memberError) throw memberError;
        await db.from("messages").insert({
          conversation_id: conversation.id,
          sender_id: request.sender_id,
          body: request.message,
        });
      }
    },
    onSuccess: () => {
      toast.success("Request updated.");
      void queryClient.invalidateQueries({ queryKey: ["inbox", userId] });
    },
    onError: () => toast.error("We could not update this request."),
  });

  const pendingRequests = useMemo(
    () =>
      (inbox.data?.requests ?? []).filter(
        (request) => request.status === "pending" && request.recipient_id === userId,
      ),
    [inbox.data?.requests, userId],
  );
  const activeConversation = inbox.data?.conversations.find(
    (conversation) => conversation.id === activeId,
  );

  return (
    <AppShell>
      <PageHeader
        eyebrow="Private networking"
        title="My inbox"
        description="Connect privately with DIM members through thoughtful conversations and message requests."
      />
      <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <button
            onClick={() => setTab("messages")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "messages" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            Messages{" "}
            {inbox.data?.conversations.length ? `(${inbox.data.conversations.length})` : ""}
          </button>
          <button
            onClick={() => setTab("requests")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "requests" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            Requests {pendingRequests.length ? `(${pendingRequests.length})` : ""}
          </button>
        </div>

        {tab === "requests" ? (
          <div className="divide-y divide-border">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-start gap-3 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{request.senderName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{request.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Wants to start a conversation
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Decline request"
                    onClick={() => respondToRequest.mutate({ request, accept: false })}
                  >
                    <X className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    aria-label="Accept request"
                    onClick={() => respondToRequest.mutate({ request, accept: true })}
                  >
                    <Check className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            {!pendingRequests.length ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No message requests yet.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid min-h-[32rem] md:grid-cols-[18rem_1fr]">
            <div className="border-b border-border md:border-b-0 md:border-r">
              {(inbox.data?.conversations ?? []).map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedId(conversation.id)}
                  className={`flex w-full items-start gap-3 border-b border-border p-4 text-left ${activeId === conversation.id ? "bg-primary/10" : "hover:bg-muted/60"}`}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {conversation.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{conversation.name}</span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {conversation.preview}
                    </span>
                  </span>
                </button>
              ))}
              {!inbox.data?.conversations.length ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Your accepted conversations will appear here.
                </div>
              ) : null}
            </div>
            <div className="flex min-h-[32rem] flex-col">
              {activeConversation ? (
                <div className="border-b border-border p-4">
                  <p className="font-semibold">{activeConversation.name}</p>
                  <p className="text-xs text-muted-foreground">DIM community member</p>
                </div>
              ) : null}
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {messages.data?.map((message: any) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.sender_id === userId ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    {message.body}
                  </div>
                ))}
                {!activeConversation ? (
                  <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
                    <div>
                      <MessageCircle className="mx-auto mb-3 size-8 text-primary" />
                      <p>Select a conversation to start chatting.</p>
                      <p className="mt-1">Find members in Connect and send a message request.</p>
                    </div>
                  </div>
                ) : null}
              </div>
              {activeConversation ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage.mutate();
                  }}
                  className="flex gap-2 border-t border-border p-3"
                >
                  <Textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Write a message…"
                    rows={1}
                    className="min-h-10 resize-none"
                    aria-label="Message"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!draft.trim() || sendMessage.isPending}
                    aria-label="Send message"
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
