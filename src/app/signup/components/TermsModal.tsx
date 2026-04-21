"use client";

// src/app/signup/components/TermsModal.tsx
// Standalone Terms & Conditions modal — import anywhere

import { X, ShieldCheck } from "lucide-react";

interface TermsModalProps {
  onClose: () => void;
}

const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By creating an account on HireLens ("the Platform"), operated by Umurava Africa, you agree to be bound by these Terms and Conditions. If you do not agree, please do not register or use the Platform. These terms apply to all users, including recruiters, administrators, and any other individuals who access the service.`,
  },
  {
    title: "2. Description of Service",
    body: `HireLens is an AI-powered talent screening platform that helps recruiters evaluate and shortlist candidates for job roles. The Platform uses the Gemini API to analyze candidate profiles, generate match scores, and produce ranked shortlists with AI-generated explanations. HireLens is designed to augment — not replace — human hiring decisions.`,
  },
  {
    title: "3. Account Registration & Security",
    body: `You must provide accurate, complete, and current information when creating your account. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. Sessions expire after 5 minutes of inactivity to protect your recruiter workspace. Notify us immediately at support@umurava.africa if you suspect unauthorized access.`,
  },
  {
    title: "4. Acceptable Use",
    body: `You agree to use HireLens only for lawful recruitment and talent evaluation purposes. You must not use the Platform to discriminate against candidates on the basis of race, gender, age, religion, nationality, disability, or any other protected characteristic. You agree not to upload malicious files, attempt to reverse-engineer the AI models, or impair the Platform's functionality.`,
  },
  {
    title: "5. AI Outputs & Human Oversight",
    body: `AI-generated match scores, rankings, and explanations are decision-support tools only. HireLens does not make binding hiring decisions. All final employment decisions remain the sole responsibility of the recruiter and their organization. AI outputs may contain errors; you are responsible for verifying information before acting on it.`,
  },
  {
    title: "6. Data Privacy & Candidate Information",
    body: `You acknowledge that candidate profiles uploaded to HireLens may contain personal data. You are responsible for obtaining appropriate consent from candidates and complying with applicable data protection laws including GDPR and Rwanda's data protection regulations. Umurava processes candidate data solely to provide the screening service and does not sell personal data to third parties.`,
  },
  {
    title: "7. Intellectual Property",
    body: `All software, AI models, UI designs, logos, and content comprising HireLens are the intellectual property of Umurava Africa. You retain ownership of job descriptions and candidate data you upload. By using the Platform, you grant Umurava a limited, non-exclusive license to process your data for the purpose of providing the service.`,
  },
  {
    title: "8. Service Availability",
    body: `Umurava strives for high availability but does not guarantee uninterrupted access to HireLens. The Platform may be unavailable during maintenance windows or events beyond our reasonable control. We are not liable for any loss resulting from temporary unavailability of the service.`,
  },
  {
    title: "9. Limitation of Liability",
    body: `To the maximum extent permitted by law, Umurava Africa shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of HireLens, including hiring outcomes, missed candidates, or data loss. Our total aggregate liability shall not exceed the amount paid for the service in the preceding 12 months.`,
  },
  {
    title: "10. Termination",
    body: `Umurava reserves the right to suspend or terminate your account at any time if you violate these Terms or engage in conduct harmful to the Platform, other users, or candidates. Upon termination, your access will cease and data may be deleted per our data retention policy.`,
  },
  {
    title: "11. Changes to Terms",
    body: `We may update these Terms from time to time. Continued use of HireLens after changes are posted constitutes your acceptance of the revised Terms. We will notify registered users of material changes via email or an in-platform notice.`,
  },
  {
    title: "12. Contact Us",
    body: `For questions about these Terms: competence@umurava.africa · +250 784 664 612 · Umurava Africa, Kigali Innovation City, Kigali, Rwanda.`,
  },
];

export function TermsModal({ onClose }: TermsModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(13,27,62,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      // Close on backdrop click
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 580,
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(44,124,242,0.18)",
          overflow: "hidden",
        }}
      >
        {/* ── Header ───────────────────────────────────────── */}
        <div
          style={{
            padding: "20px 28px 16px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: "rgba(44,124,242,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={18} color="#2C7CF2" />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#0F172A",
                  margin: 0,
                }}
              >
                Terms & Conditions
              </h2>
              <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>
                HireLens by Umurava · Last updated Jan 2025
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid #E2E8F0",
              background: "#F8FAFC",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748B",
              flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Scrollable body ───────────────────────────────── */}
        <div
          style={{
            overflowY: "auto",
            padding: "24px 28px 28px",
            fontSize: 13.5,
            color: "#374151",
            lineHeight: 1.75,
          }}
        >
          {TERMS_SECTIONS.map((section) => (
            <div key={section.title} style={{ marginBottom: 20 }}>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: 6,
                  marginTop: 0,
                }}
              >
                {section.title}
              </h3>
              <p style={{ margin: 0, color: "#4B5563" }}>{section.body}</p>
            </div>
          ))}

          {/* ── Accept CTA ───────────────────────────────────── */}
          <div
            style={{
              marginTop: 24,
              padding: "16px 20px",
              background: "rgba(44,124,242,0.06)",
              border: "1px solid rgba(44,124,242,0.18)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "#374151", fontWeight: 500 }}>
              By checking the box in the sign-up form, you confirm you have read
              and agree to these Terms.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: "9px 20px",
                borderRadius: 9,
                border: "none",
                background: "#2C7CF2",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                fontFamily: "inherit",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}