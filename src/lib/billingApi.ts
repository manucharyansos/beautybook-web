// src/lib/billingApi.ts
import { api } from "./api";

export async function pauseBilling() {
  const r = await api.post("/billing/pause");
  return r.data;
}

export async function resumeBilling() {
  const r = await api.post("/billing/resume");
  return r.data;
}

export async function cancelSubscription() {
  const r = await api.post("/billing/cancel-subscription");
  return r.data;
}