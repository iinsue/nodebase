import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

import type { NodeExecutor } from "@/features/executions/types";

type HttpRequestData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // TODO: Publish "loading" state for http request

  if (!data.endpoint) {
    // TODO: Publish "error" state for http request
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }

  if (!data.variableName) {
    // TODO: Publish "error" state for http request
    throw new NonRetriableError(
      "HTTP Request node: Variable name not configured",
    );
  }

  if (!data.method) {
    // TODO: Publish "error" state for http request
    throw new NonRetriableError("HTTP Request node: Method not configured");
  }

  const result = await step.run("http-request", async () => {
    // http://.../{{todo.httpResponse.data.userId}}
    const endpoint = Handlebars.compile(data.endpoint, { noEscape: true })(
      context,
    );
    const method = data.method;

    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      let resolved: string;

      try {
        resolved = Handlebars.compile(data.body || "{}", {
          noEscape: true,
        })(context);
      } catch (error) {
        throw new NonRetriableError(
          `HTTP Request node: Failed to render body template: ${(error as Error).message}`,
        );
      }

      try {
        JSON.parse(resolved);
      } catch (error) {
        throw new NonRetriableError(
          `HTTP Request node: Rendered body is not valid JSON: ${(error as Error).message}`,
        );
      }

      options.body = resolved;
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };

    return {
      ...context,
      [data.variableName]: responsePayload,
    };
  });
  // TODO: Publish "success" state for http request
  return result;
};
