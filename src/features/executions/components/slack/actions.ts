"use server";

import { getClientSubscriptionToken } from "inngest/react";

import { inngest } from "@/inngest/client";
import { slackChannel } from "@/inngest/channels/slack";

export async function fetchSlackRealtimeToken() {
  const token = getClientSubscriptionToken(inngest, {
    channel: slackChannel,
    topics: ["status"],
  });

  return token;
}
