"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { X, User, Mail, Briefcase, MapPin, UserPlus, AlertCircle } from "lucide-react";

const BRAND = "#2C7CF2";

function ModalInput({
  icon, placeholder, value, onChange, type = "text", span2 = false,
}: {
  icon?: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  span2?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ gridColumn: span2 ? "1 / -1" : undefined, position: "relative" }}>
      {icon && (
        <div style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: focused ? BRAND : "#94A3B8", pointerEvents: "none",
          display: "flex", transition: "color 0.15s",
        }}>
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: `10px 13px 10px ${icon ? "36px" : "13px"}`,
          borderRadius: 11,
          border: `1.5px solid ${focused ? BRAND : "#E2E8F0"}`,
          fontSize: 13.5, color: "#0F172A",
          background: focused ? "#fff" : "#FAFAFA",
          outline: "none", fontFamily: "inherit",
          boxSizing: "border-box",
          transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
          boxShadow: focused ? "0 0 0 3px rgba(44,124,242,0.10)" : "none",
        }}
      />
    </div>
  );
}

export function AddCandidateModal({
  open, onClose, onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {

  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    headline: "", location: "",
  });

  const canSubmit = useMemo(() =>
    form.firstName.trim() && form.lastName.trim() &&
    form.email.trim() && form.headline.trim() && form.location.trim(),
  [form]);

  if (!open) return null;

  const submit = async () => {
    setBusy(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/candidates`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            skills: [], experience: [], education: [], projects: [],
            availability: { status: "Open to Opportunities", type: "Full-time" },
          }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      toast.success("Candidate added");
      onSuccess();
      onClose();
        } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : typeof e === "string"
            ? e
            : "Failed to add candidate";

      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const allFilled = !!(
    form.firstName.trim() && form.lastName.trim() &&
    form.email.trim() && form.headline.trim() && form.location.trim()
  );

  return (
    <>
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(13,27,62,0.50)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, pointerEvents: "none",
      }}>
        <div style={{
          width: "100%", maxWidth: 520,
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 24px 64px rgba(44,124,242,0.18)",
          overflow: "hidden",
          pointerEvents: "all",
          animation: "modalIn 0.2s ease both",
        }}>

          <div style={{
            background: "linear-gradient(135deg, #1a65d6 0%, #2C7CF2 55%, #3d8ff5 100%)",
            padding: "20px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", width: 160, height: 160, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.10)",
              top: -50, right: -40, pointerEvents: "none",
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <UserPlus size={18} color="#fff" />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>
                  Add Candidate
                </h2>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.70)", margin: 0 }}>
                  Fill in the details below
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.30)",
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff",
                position: "relative",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.25)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)")}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ padding: "22px 24px 0" }}>

            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 12px", borderRadius: 9,
              background: "rgba(44,124,242,0.06)",
              border: "1px solid rgba(44,124,242,0.15)",
              marginBottom: 18,
            }}>
              <AlertCircle size={13} color={BRAND} />
              <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>
                All fields are required to add a candidate.
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <ModalInput icon={<User size={14} />}     placeholder="First name"            value={form.firstName} onChange={set("firstName")} />
              <ModalInput                               placeholder="Last name"             value={form.lastName}  onChange={set("lastName")}  />
              <ModalInput icon={<Mail size={14} />}     placeholder="Email address"         value={form.email}     onChange={set("email")}     type="email" span2 />
              <ModalInput icon={<Briefcase size={14} />} placeholder="Headline (e.g. Senior Backend Engineer)" value={form.headline}  onChange={set("headline")}  span2 />
              <ModalInput icon={<MapPin size={14} />}   placeholder="Location (City, Country)" value={form.location}  onChange={set("location")}  span2 />
            </div>
          </div>

          <div style={{
            padding: "18px 24px 22px",
            display: "flex", justifyContent: "flex-end", gap: 10,
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px", borderRadius: 11,
                border: "1.5px solid #E2E8F0", background: "#F8FAFF",
                fontSize: 13, fontWeight: 700, color: "#374151",
                cursor: "pointer", fontFamily: "inherit",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#CBD5E1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0")}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit || busy}
              style={{
                padding: "10px 22px", borderRadius: 11, border: "none",
                background: !allFilled || busy ? "#CBD5E1" : BRAND,
                color: !allFilled || busy ? "#94A3B8" : "#fff",
                fontSize: 13, fontWeight: 700,
                cursor: !allFilled || busy ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 7,
                transition: "background 0.15s, transform 0.1s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { if (allFilled && !busy) (e.currentTarget as HTMLElement).style.background = "#1a65d6"; }}
              onMouseLeave={(e) => { if (allFilled && !busy) (e.currentTarget as HTMLElement).style.background = BRAND; }}
              onMouseDown={(e)  => { if (allFilled && !busy) (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
              onMouseUp={(e)    => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
            >
              {busy ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Saving…
                </>
              ) : (
                <><UserPlus size={14} /> Add Candidate</>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes spin    { to { transform:rotate(360deg) } }
        * { box-sizing: border-box; }
        input::placeholder { color: #94A3B8; }
      `}</style>
    </>
  );
}