"use server";

import { getClientSubscriptionToken } from "inngest/react";

import { inngest } from "@/inngest/client";
import { openAiChannel } from "@/inngest/channels/openai";

export async function fetchOpenAiRealtimeToken() {
  const token = getClientSubscriptionToken(inngest, {
    channel: openAiChannel,
    topics: ["status"],
  });

  return token;
}
