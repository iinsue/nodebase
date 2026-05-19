"use server";

import { getClientSubscriptionToken } from "inngest/react";

import { inngest } from "@/inngest/client";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

export async function fetchStripeTriggerRealtimeToken() {
  const token = getClientSubscriptionToken(inngest, {
    channel: stripeTriggerChannel,
    topics: ["status"],
  });

  return token;
}
