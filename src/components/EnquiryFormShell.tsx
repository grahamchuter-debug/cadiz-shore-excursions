"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

const ENDPOINT = "https://wowatour-enquiries.dark-violet-8d91.workers.dev/v1/enquiries";
const CORE_FIELDS = new Set(["name", "email", "phone", "message", "travelDate", "ship", "guests", "productRef", "website"]);

type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "success"; reference: string } | { kind: "error"; message: string };

interface Props {
  siteId: string;
  fallbackEmail: string;
  children: ReactNode;
  className?: string;
  submitClassName: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
}

function newKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Submits the wrapped form fields to the shared Wow A Tour enquiry service. Fields named after the
 * service's core fields are sent as-is; any other named field is sent in `extra`.
 */
export function EnquiryFormShell({ siteId, fallbackEmail, children, className, submitClassName, submitLabel, successTitle, successBody }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const renderedAt = useRef(0);
  const idempotencyKey = useRef("");

  useEffect(() => {
    renderedAt.current = Date.now();
    idempotencyKey.current = newKey();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "submitting") return;
    const form = new FormData(event.currentTarget);
    const core: Record<string, string> = {};
    const extra: Record<string, string> = {};
    for (const [key, raw] of form.entries()) {
      const value = String(raw).trim();
      if (CORE_FIELDS.has(key)) core[key] = value;
      else if (value) extra[key] = value;
    }
    setStatus({ kind: "submitting" });
    setFieldErrors({});
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          idempotencyKey: idempotencyKey.current,
          name: core.name ?? "",
          email: core.email ?? "",
          phone: core.phone || null,
          message: core.message ?? "",
          travelDate: core.travelDate || null,
          ship: core.ship || null,
          guests: core.guests || null,
          productRef: core.productRef || null,
          extra: Object.keys(extra).length ? extra : null,
          sourceUrl: window.location.href,
          website: core.website ?? "",
          elapsedMs: Date.now() - renderedAt.current,
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; reference?: string; message?: string; errors?: Record<string, string> } | null;
      if (res.ok && data?.ok && data.reference) {
        setStatus({ kind: "success", reference: data.reference });
        idempotencyKey.current = newKey();
        return;
      }
      if (data?.errors) setFieldErrors(data.errors);
      setStatus({ kind: "error", message: data?.message ?? "We couldn't send your enquiry just now. Please try again." });
    } catch {
      setStatus({ kind: "error", message: "We couldn't reach our server. Please check your connection and try again." });
    }
  }

  if (status.kind === "success") {
    return (
      <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-6" data-enquiry-success>
        <h2 className="text-xl font-semibold text-emerald-900">{successTitle}</h2>
        <p className="mt-2 text-emerald-800">{successBody}</p>
        <p className="mt-3 text-sm text-emerald-900">
          Your reference is <strong>{status.reference}</strong>.
        </p>
      </div>
    );
  }

  const errorList = Object.values(fieldErrors);
  return (
    <form className={className} onSubmit={onSubmit}>
      {children}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="enquiry-website">Leave this field empty</label>
        <input id="enquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {status.kind === "error" && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" data-enquiry-error>
          {status.message}
          {errorList.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {errorList.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
          <span className="mt-2 block">
            If the problem continues, email us at <a className="underline" href={`mailto:${fallbackEmail}`}>{fallbackEmail}</a>.
          </span>
        </div>
      )}
      <button type="submit" className={submitClassName} disabled={status.kind === "submitting"}>
        {status.kind === "submitting" ? "Sending…" : status.kind === "error" ? "Try again" : submitLabel}
      </button>
      <p className="text-xs text-gray-500">
        We use your details only to reply to your enquiry. See our <a className="underline" href="/privacy/">privacy policy</a>.
      </p>
    </form>
  );
}
