import { z } from "zod";

export const correlationIdSchema = z.uuid({ error: "Correlation ID is not a valid UUID" });
export type CorrelationIdString = z.infer<typeof correlationIdSchema>;

export type NextClientRquestHeaders = {
  accept: "application/json";
  "content-type": "application/json";
  "cache-control": "no-store";
  pragma: "no-cache";
  correlationId: CorrelationIdString;
  "X-CSRF-Token": string;
};

export type NextServerRquestHeaders = {
  accept: "application/json";
  "content-type": "application/json";
  "cache-control": "no-store";
  pragma: "no-cache";
  correlationId: CorrelationIdString;
};

export type CorrelationIdObject = {
  correlationId?: CorrelationIdString;
};
