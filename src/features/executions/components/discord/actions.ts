"use server";

import { getClientSubscriptionToken } from "inngest/react";

import { inngest } from "@/inngest/client";
import { discordChannel } from "@/inngest/channels/discord";

export async function fetchDiscordRealtimeToken() {
  const token = getClientSubscriptionToken(inngest, {
    channel: discordChannel,
    topics: ["status"],
  });

  return token;
}
