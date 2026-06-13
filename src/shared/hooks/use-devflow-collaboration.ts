// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  createDevFlowCollaborationDocument,
  createDevFlowConversation,
  createDevFlowMessage,
  getDevFlowCollaborationDocuments,
  getDevFlowConversationMessages,
  getDevFlowConversations,
  reviewDevFlowCollaborationDocument,
  type CreateDevFlowCollaborationDocumentInput,
  type CreateDevFlowConversationInput,
  type DevFlowCollaborationDocument,
  type DevFlowConversation,
  type DevFlowMessage,
  type ReviewDevFlowCollaborationDocumentInput,
} from "@/shared/api/devflow-api";

export function useDevFlowConversations(projectId?: string | null) {
  const [conversations, setConversations] = useState<DevFlowConversation[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState("");

  const refresh = async () => {
    if (!projectId) {
      setConversations([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      setConversations(await getDevFlowConversations(projectId));
    } catch (nextError) {
      setConversations([]);
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (input: CreateDevFlowConversationInput) => {
    if (!projectId) return null;
    const conversation = await createDevFlowConversation(projectId, input);
    await refresh();
    return conversation;
  };

  useEffect(() => {
    void refresh();
  }, [projectId]);

  return { conversations, loading, error, refresh, createConversation };
}

export function useDevFlowConversationMessages(projectId?: string | null, conversationId?: string | null) {
  const [messages, setMessages] = useState<DevFlowMessage[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId && conversationId));
  const [error, setError] = useState("");

  const refresh = async () => {
    if (!projectId || !conversationId) {
      setMessages([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      setMessages(await getDevFlowConversationMessages(projectId, conversationId));
    } catch (nextError) {
      setMessages([]);
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (body: string) => {
    if (!projectId || !conversationId) return null;
    const message = await createDevFlowMessage(projectId, conversationId, { body });
    await refresh();
    return message;
  };

  useEffect(() => {
    void refresh();
  }, [projectId, conversationId]);

  return { messages, loading, error, refresh, sendMessage };
}

export function useDevFlowCollaborationDocuments(projectId?: string | null) {
  const [documents, setDocuments] = useState<DevFlowCollaborationDocument[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState("");

  const refresh = async () => {
    if (!projectId) {
      setDocuments([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      setDocuments(await getDevFlowCollaborationDocuments(projectId));
    } catch (nextError) {
      setDocuments([]);
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (input: CreateDevFlowCollaborationDocumentInput) => {
    if (!projectId) return null;
    const document = await createDevFlowCollaborationDocument(projectId, input);
    await refresh();
    return document;
  };

  const reviewDocument = async (documentId: string, input: ReviewDevFlowCollaborationDocumentInput) => {
    if (!projectId) return null;
    const document = await reviewDevFlowCollaborationDocument(projectId, documentId, input);
    await refresh();
    return document;
  };

  useEffect(() => {
    void refresh();
  }, [projectId]);

  return { documents, loading, error, refresh, createDocument, reviewDocument };
}
