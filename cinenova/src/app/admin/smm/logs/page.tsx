import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ onlyFailed?: string; providerId?: string }>;
}) {
  const sp = await searchParams;
  const logs = await prisma.smmApiLog.findMany({
    where: {
      providerId: sp.providerId,
      ok: sp.onlyFailed === "1" ? false : undefined,
    },
    include: { provider: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">SMM API Logs</h1>
        <p className="text-sm text-slate-400">Last 100 calls to vendor APIs.</p>
      </div>
      <form className="flex gap-2 items-center">
        <label className="inline-flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" name="onlyFailed" value="1" defaultChecked={sp.onlyFailed === "1"} />
          Show failures only
        </label>
        <button className="btn-primary">Apply</button>
      </form>
      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-subtle text-slate-400">
            <tr>
              <Th>When</Th>
              <Th>Provider</Th>
              <Th>Action</Th>
              <Th>HTTP</Th>
              <Th>Latency</Th>
              <Th>OK</Th>
              <Th>Response</Th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-bg-border align-top">
                <Td className="text-xs whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</Td>
                <Td>{l.provider.name}</Td>
                <Td className="font-mono">{l.action}</Td>
                <Td>{l.statusCode ?? "—"}</Td>
                <Td>{l.durationMs ?? "—"} ms</Td>
                <Td>
                  <span className={l.ok ? "pill-success" : "pill-danger"}>{l.ok ? "ok" : "fail"}</span>
                </Td>
                <Td>
                  <pre className="text-xs whitespace-pre-wrap break-all max-w-xl text-slate-300">
                    {JSON.stringify(l.response, null, 2)}
                  </pre>
                </Td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <Td colSpan={7}>
                  <div className="text-center py-10 text-slate-500">No log entries.</div>
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 font-medium uppercase tracking-wide text-xs">{children}</th>;
}
function Td({ children, className = "", colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={`px-4 py-3 align-top ${className}`}>
      {children}
    </td>
  );
}
