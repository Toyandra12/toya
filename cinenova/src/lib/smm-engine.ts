/**
 * SMM engine: orchestrates provider connections, service import, order
 * forwarding, status sync, retries. All vendor I/O is logged to SmmApiLog.
 */
import { prisma } from "./prisma";
import { SmmClient, SmmServiceDTO, SmmStatusDTO, SmmAddOrderDTO } from "./smm-client";
import { SmmOrderStatus } from "@prisma/client";

async function logCall(
  providerId: string,
  action: string,
  call: { ok: boolean; statusCode: number; durationMs: number; request: unknown; response: unknown },
) {
  await prisma.smmApiLog.create({
    data: {
      providerId,
      action,
      request: call.request as object,
      response: (call.response ?? null) as object | null,
      statusCode: call.statusCode,
      durationMs: call.durationMs,
      ok: call.ok,
    },
  });
}

export async function getProviderClient(providerId: string) {
  const provider = await prisma.smmProvider.findUnique({ where: { id: providerId } });
  if (!provider) throw new Error("Provider not found");
  if (!provider.isActive) throw new Error("Provider is disabled");
  return { provider, client: new SmmClient(provider.apiUrl, provider.apiKey) };
}

export async function testConnection(providerId: string) {
  const { client } = await getProviderClient(providerId);
  const call = await client.balance();
  await logCall(providerId, "balance", call);
  if (call.ok && call.data && "balance" in call.data) {
    await prisma.smmProvider.update({
      where: { id: providerId },
      data: {
        balance: Number((call.data as { balance: string | number }).balance) || 0,
        lastSyncAt: new Date(),
      },
    });
  }
  return call;
}

/**
 * Pull services from vendor and upsert into SmmService.
 * Default sellRate = vendorRate * 1.35 (35% margin) — admin can edit later.
 */
export async function importServices(providerId: string, marginPct = 35) {
  const { client } = await getProviderClient(providerId);
  const call = await client.services();
  await logCall(providerId, "services", call);
  if (!call.ok || !Array.isArray(call.data)) {
    return { imported: 0, error: "Vendor returned no services" };
  }
  const services = call.data as SmmServiceDTO[];
  let imported = 0;

  for (const s of services) {
    const vendorRate = Number(s.rate) || 0;
    const sellRate = +(vendorRate * (1 + marginPct / 100)).toFixed(4);

    await prisma.smmService.upsert({
      where: {
        providerId_vendorServiceId: {
          providerId,
          vendorServiceId: String(s.service),
        },
      },
      update: {
        name: s.name,
        category: s.category ?? null,
        type: s.type ?? null,
        vendorRate,
        // do not overwrite custom sell rate if already set: only set on create
        minQty: Number(s.min) || 1,
        maxQty: Number(s.max) || 1000000,
        refill: Boolean(s.refill),
        cancel: Boolean(s.cancel),
        rawMeta: s as unknown as object,
      },
      create: {
        providerId,
        vendorServiceId: String(s.service),
        name: s.name,
        category: s.category ?? null,
        type: s.type ?? null,
        vendorRate,
        sellRate,
        minQty: Number(s.min) || 1,
        maxQty: Number(s.max) || 1000000,
        refill: Boolean(s.refill),
        cancel: Boolean(s.cancel),
        rawMeta: s as unknown as object,
      },
    });
    imported++;
  }

  await prisma.smmProvider.update({
    where: { id: providerId },
    data: { lastSyncAt: new Date() },
  });

  return { imported };
}

/**
 * Forward a local SmmOrder to the vendor. Returns the updated row.
 */
export async function forwardOrder(localSmmOrderId: string) {
  const local = await prisma.smmOrder.findUnique({
    where: { id: localSmmOrderId },
    include: { service: true, provider: true },
  });
  if (!local) throw new Error("SMM order not found");
  if (local.vendorOrderId) return local; // already forwarded

  const client = new SmmClient(local.provider.apiUrl, local.provider.apiKey);
  const call = await client.addOrder({
    service: local.service.vendorServiceId,
    link: local.link,
    quantity: local.quantity,
  });
  await logCall(local.providerId, "add", call);

  const data = (call.data ?? {}) as SmmAddOrderDTO;
  if (!call.ok || !data.order) {
    return prisma.smmOrder.update({
      where: { id: local.id },
      data: {
        status: SmmOrderStatus.FAILED,
        errorMessage: data.error ?? "Vendor rejected order",
        retries: { increment: 1 },
      },
    });
  }

  return prisma.smmOrder.update({
    where: { id: local.id },
    data: {
      vendorOrderId: String(data.order),
      status: SmmOrderStatus.IN_PROGRESS,
      errorMessage: null,
    },
  });
}

function mapVendorStatus(s: string | undefined): SmmOrderStatus {
  switch ((s ?? "").toLowerCase()) {
    case "completed":
      return SmmOrderStatus.COMPLETED;
    case "in progress":
    case "processing":
      return SmmOrderStatus.IN_PROGRESS;
    case "partial":
      return SmmOrderStatus.PARTIAL;
    case "canceled":
    case "cancelled":
      return SmmOrderStatus.CANCELED;
    case "pending":
      return SmmOrderStatus.PENDING;
    default:
      return SmmOrderStatus.IN_PROGRESS;
  }
}

export async function syncOrderStatus(localSmmOrderId: string) {
  const local = await prisma.smmOrder.findUnique({
    where: { id: localSmmOrderId },
    include: { provider: true },
  });
  if (!local) throw new Error("SMM order not found");
  if (!local.vendorOrderId) throw new Error("Order not yet forwarded");

  const client = new SmmClient(local.provider.apiUrl, local.provider.apiKey);
  const call = await client.status(local.vendorOrderId);
  await logCall(local.providerId, "status", call);

  const d = (call.data ?? {}) as SmmStatusDTO;
  if (!call.ok) return local;

  return prisma.smmOrder.update({
    where: { id: local.id },
    data: {
      status: mapVendorStatus(d.status),
      charge: d.charge !== undefined ? Number(d.charge) : undefined,
      startCount: d.start_count !== undefined ? Number(d.start_count) : undefined,
      remains: d.remains !== undefined ? Number(d.remains) : undefined,
      lastSyncedAt: new Date(),
    },
  });
}

export async function retryOrder(localSmmOrderId: string) {
  const local = await prisma.smmOrder.findUnique({ where: { id: localSmmOrderId } });
  if (!local) throw new Error("SMM order not found");
  if (local.status !== SmmOrderStatus.FAILED) {
    throw new Error("Only FAILED orders can be retried");
  }
  await prisma.smmOrder.update({
    where: { id: local.id },
    data: { status: SmmOrderStatus.PENDING, errorMessage: null, vendorOrderId: null },
  });
  return forwardOrder(local.id);
}
