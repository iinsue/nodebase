"use server";

import { inngest } from "@/inngest/client";
import { getClientSubscriptionToken } from "inngest/react";
import { httpRequestChannel } from "@/inngest/channels/http-request";

export async function fetchHttpRequestRealtimeToken() {
  const token = getClientSubscriptionToken(inngest, {
    channel: httpRequestChannel,
    topics: ["status"],
  });

  return token;
}
