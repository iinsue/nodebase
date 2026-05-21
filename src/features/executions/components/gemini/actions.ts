"use server";

import { inngest } from "@/inngest/client";
import { geminiChannel } from "@/inngest/channels/gemini";
import { getClientSubscriptionToken } from "inngest/react";

export async function fetchGeminiRealtimeToken() {
  const token = getClientSubscriptionToken(inngest, {
    channel: geminiChannel,
    topics: ["status"],
  });

  return token;
}
