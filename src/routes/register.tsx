import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { ShareButtons } from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { getCapacityStatus, type CapacityStatus } from "@/lib/enrollments.functions";
import { canonical, ogImage } from "@/lib/seo";

const OG = ogImage("/og-register.jpg");
const CAMP_YEAR = 2027;
const STORAGE_KEY = "mathos-2027-enrollment-draft";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Enroll for MathOs 2027 — free summer math camp" },
      {
        name: "description",
        content:
          "Enroll for MathOs 2027 or join the interest list for updates about our free hybrid summer applied math camp.",
      },
      { property: "og:title", content: "Enroll for MathOs 2027" },
      {
        property: "og:description",
        content: "Enroll for MathOs 2027 or join the interest list for camp updates.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG },
    ],
    links: [canonical("/register")],
  }),
});

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_RE = /^[+()\d\s.-]{7,25}$/;

type Track = "choose" | "enroll" | "updates";
type InterestStatus = "idle" | "loading" | "success" | "duplicate" | "error";
type FormatPreference = "in_person" | "online" | "undecided";

type EnrollmentDraft = {
  studentFirstName: string;
  studentLastName: string;
  gradeLevel: string;
  dateOfBirth: string;
  address: string;
  state: string;
  school: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  formatPreference: FormatPreference;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  medicalNotes: string;
  photoConsent: boolean | null;
  waiverSignatureName: string;
  waiverAccepted: boolean;
};

const EMPTY_DRAFT: EnrollmentDraft = {
  studentFirstName: "",
  studentLastName: "",
  gradeLevel: "",
  dateOfBirth: "",
  address: "",
  state: "",
  school: "",
  parentFirstName: "",
  parentLastName: "",
  parentEmail: "",
  parentPhone: "",
  formatPreference: "undecided",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",
  medicalNotes: "",
  photoConsent: null,
  waiverSignatureName: "",
  waiverAccepted: false,
};

const STEPS = ["Student", "Parent", "Safety", "Consent", "Review"] as const;
const fieldClass =
  "h-12 rounded-xl border-2 border-ink bg-cream px-4 text-ink placeholder:text-ink/40 focus-visible:ring-4 focus-visible:ring-electric/30";

function RegisterPage() {
  const [track, setTrack] = useState<Track>("choose");
  const [email, setEmail] = useState("");
  const [interestStatus, setInterestStatus] = useState<InterestStatus>("idle");
  const [interestError, setInterestError] = useState("");
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<EnrollmentDraft>(EMPTY_DRAFT);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done">("idle");
  const [submitError, setSubmitError] = useState("");
  const [enrollResult, setEnrollResult] = useState<"pending" | "waitlisted" | null>(null);
  const [capacity, setCapacity] = useState<CapacityStatus | null>(null);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) setDraft({ ...EMPTY_DRAFT, ...(JSON.parse(saved) as Partial<EnrollmentDraft>) });
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, draftLoaded]);

  useEffect(() => {
    getCapacityStatus({ data: { campYear: CAMP_YEAR } })
      .then(setCapacity)
      .catch(() => setCapacity(null));
  }, []);

  const updateDraft = <K extends keyof EnrollmentDraft>(key: K, value: EnrollmentDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleEnrollmentSubmit = async () => {
    if (!validateStep(4)) {
      setStep(4);
      return;
    }
    setSubmitState("submitting");
    setSubmitError("");
    try {
      const { data, error } = await supabase.functions.invoke("send-registration-email", {
        body: {
          kind: "enrollment",
          camp_year: CAMP_YEAR,
          student_first_name: draft.studentFirstName.trim(),
          student_last_name: draft.studentLastName.trim(),
          grade_level: draft.gradeLevel.trim(),
          date_of_birth: draft.dateOfBirth,
          address: draft.address.trim(),
          state: draft.state.trim(),
          school: draft.school.trim(),
          parent_first_name: draft.parentFirstName.trim(),
          parent_last_name: draft.parentLastName.trim(),
          parent_email: draft.parentEmail.trim().toLowerCase(),
          parent_phone: draft.parentPhone.trim(),
          format_preference: draft.formatPreference,
          emergency_contact_name: draft.emergencyContactName.trim(),
          emergency_contact_phone: draft.emergencyContactPhone.trim(),
          emergency_contact_relationship: draft.emergencyContactRelationship.trim(),
          medical_notes: draft.medicalNotes.trim(),
          photo_consent: draft.photoConsent,
          waiver_signature_name: draft.waiverSignatureName.trim(),
          waiver_accepted: draft.waiverAccepted,
        },
      });
      let payload = (data ?? null) as { error?: string; ok?: boolean; status?: string } | null;
      if (error) {
        const context = (error as { context?: Response }).context;
        if (context && typeof context.json === "function") {
          try {
            payload = await context.json();
          } catch {
            // Fall through to the friendly error below.
          }
        }
        if (!payload?.error) throw new Error("Something went wrong. Please try again.");
      }
      if (payload?.error) throw new Error(payload.error);
      setEnrollResult(payload?.status === "waitlisted" ? "waitlisted" : "pending");
      setSubmitState("done");
      setDraft(EMPTY_DRAFT);
      window.sessionStorage.removeItem(STORAGE_KEY);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      setSubmitState("idle");
    }
  };

  const validateStep = (currentStep: number) => {
    const errors: Record<string, string> = {};
    const required = (key: keyof EnrollmentDraft, label: string, max = 150) => {
      const value = String(draft[key]).trim();
      if (!value) errors[key] = `${label} is required.`;
      else if (value.length > max) errors[key] = `${label} is too long.`;
    };

    if (currentStep === 1) {
      required("studentFirstName", "Student first name", 100);
      required("studentLastName", "Student last name", 100);
      required("gradeLevel", "Grade level", 50);
      required("dateOfBirth", "Date of birth", 10);
      required("address", "Address", 300);
      required("state", "State", 50);
      required("school", "School", 200);
      if (draft.dateOfBirth && new Date(draft.dateOfBirth) >= new Date()) {
        errors.dateOfBirth = "Date of birth must be in the past.";
      }
    }
    if (currentStep === 2) {
      required("parentFirstName", "Parent or guardian first name", 100);
      required("parentLastName", "Parent or guardian last name", 100);
      required("parentEmail", "Parent or guardian email", 320);
      required("parentPhone", "Parent or guardian phone", 25);
      if (draft.parentEmail && !EMAIL_RE.test(draft.parentEmail.trim())) {
        errors.parentEmail = "Enter a valid email address.";
      }
      if (draft.parentPhone && !PHONE_RE.test(draft.parentPhone.trim())) {
        errors.parentPhone = "Enter a valid phone number.";
      }
    }
    if (currentStep === 3) {
      required("emergencyContactName", "Emergency contact name", 200);
      required("emergencyContactPhone", "Emergency contact phone", 25);
      required("emergencyContactRelationship", "Relationship", 100);
      if (draft.emergencyContactPhone && !PHONE_RE.test(draft.emergencyContactPhone.trim())) {
        errors.emergencyContactPhone = "Enter a valid phone number.";
      }
      if (draft.medicalNotes.length > 2000) errors.medicalNotes = "Medical notes must be under 2,000 characters.";
    }
    if (currentStep === 4) {
      if (draft.photoConsent === null) errors.photoConsent = "Choose a photo consent option.";
      required("waiverSignatureName", "Typed signature", 200);
      if (!draft.waiverAccepted) errors.waiverAccepted = "You must acknowledge the waiver before continuing.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInterestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleaned = email.trim().toLowerCase();
    if (!EMAIL_RE.test(cleaned) || cleaned.length > 320) {
      setInterestError("That doesn't look like a valid email address — please check it for typos.");
      setInterestStatus("error");
      return;
    }
    setInterestStatus("loading");
    setInterestError("");
    try {
      const { data, error } = await supabase.functions.invoke("send-registration-email", {
        body: { email: cleaned },
      });
      let payload = (data ?? null) as
        | { error?: string; duplicate?: boolean; message?: string; ok?: boolean }
        | null;
      if (error) {
        const context = (error as { context?: Response }).context;
        if (context && typeof context.json === "function") {
          try {
            payload = await context.json();
          } catch {
            // Fall through to the existing friendly error message.
          }
        }
        if (!payload?.duplicate && !payload?.error) {
          throw new Error(payload?.message || "Something went wrong. Please try again.");
        }
      }
      if (payload?.duplicate) {
        setInterestStatus("duplicate");
        return;
      }
      if (payload?.error) throw new Error(payload.error);
      setInterestStatus("success");
      setEmail("");
    } catch (error) {
      setInterestError(error instanceof Error ? error.message : "Something went wrong.");
      setInterestStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <section className="grid-paper border-b-2 border-ink">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            MathOs {CAMP_YEAR}
          </p>
          <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] md:text-7xl">
            Choose your <span className="italic text-electric">next step.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            Ready to join camp? Complete the full enrollment. Still deciding? Join the update list
            with only your email.
          </p>

          {track === "choose" && (
            <div className="mt-12 grid gap-7 md:grid-cols-2">
              <Button
                type="button"
                onClick={() => setTrack("enroll")}
                className="card-3d h-auto whitespace-normal bg-electric p-8 text-left text-cream transition hover:-translate-y-1 hover:bg-electric"
              >
                <span className="block w-full"><span className="font-mono text-xs uppercase tracking-widest text-cream/75">Full registration</span>
                <span className="mt-3 block font-display text-4xl font-black">Enroll for {CAMP_YEAR}</span>
                <span className="mt-4 block font-serif text-base font-normal text-cream/85">Student, guardian, emergency, consent, and waiver information.</span></span>
              </Button>
              <Button
                type="button"
                onClick={() => setTrack("updates")}
                className="card-3d h-auto whitespace-normal bg-sun p-8 text-left text-ink transition hover:-translate-y-1 hover:bg-sun"
              >
                <span className="block w-full"><span className="font-mono text-xs uppercase tracking-widest text-ink/65">Email only</span>
                <span className="mt-3 block font-display text-4xl font-black">Just keep me updated</span>
                <span className="mt-4 block font-serif text-base font-normal text-ink/75">No commitment. We’ll send schedules and joining details later.</span></span>
              </Button>
            </div>
          )}

          {track === "enroll" && (submitState === "done" ? (
            <div className="mt-12 card-3d bg-sun p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-ink/70">Enrollment received</p>
              <h2 className="mt-2 font-display text-3xl font-black md:text-4xl">
                {enrollResult === "waitlisted" ? "You’re on the waitlist 📝" : "Congrats! Your enrollment is in 🎉"}
              </h2>
              <p className="mt-3 text-ink/80">
                {enrollResult === "waitlisted"
                  ? "This track is currently at capacity, so we’ve placed the enrollment on the waitlist. We’ve emailed you a confirmation — and we’ll reach out right away if a spot opens up."
                  : "We’ve emailed you a confirmation with a summary of everything you submitted. We’ll confirm the spot soon — keep an eye on your inbox."}
              </p>
              <Button
                type="button"
                onClick={() => {
                  setTrack("choose");
                  setStep(1);
                  setSubmitState("idle");
                  setEnrollResult(null);
                }}
                className="mt-6 h-12 rounded-full bg-ink px-6 text-cream"
              >
                Back to start
              </Button>
            </div>
          ) : (
            <EnrollmentForm
              draft={draft}
              errors={formErrors}
              step={step}
              capacity={capacity}
              submitting={submitState === "submitting"}
              submitError={submitError}
              onChange={updateDraft}
              onBack={() => {
                if (step === 1) setTrack("choose");
                else setStep((current) => current - 1);
              }}
              onNext={nextStep}
              onEdit={setStep}
              onSubmit={handleEnrollmentSubmit}
            />
          ))}

          {track === "updates" && (
            <InterestList
              email={email}
              status={interestStatus}
              error={interestError}
              onEmailChange={setEmail}
              onSubmit={handleInterestSubmit}
              onReset={() => {
                setInterestStatus("idle");
                setEmail("");
              }}
              onBack={() => setTrack("choose")}
            />
          )}

          <p className="mt-10 font-mono text-lg text-muted-foreground">
            Questions? Email <a href="mailto:campmathos@gmail.com" className="underline hover:text-electric">campmathos@gmail.com</a>.
          </p>
          <div className="mt-12">
            <Link to="/admin/login" aria-label="Director sign-in" className="font-mono text-[10px] tracking-widest text-ink/20 transition hover:text-ink/60">
              Admin
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

type EnrollmentFormProps = {
  draft: EnrollmentDraft;
  errors: Record<string, string>;
  step: number;
  onChange: <K extends keyof EnrollmentDraft>(key: K, value: EnrollmentDraft[K]) => void;
  onBack: () => void;
  onNext: () => void;
  onEdit: (step: number) => void;
};

function EnrollmentForm({ draft, errors, step, onChange, onBack, onNext, onEdit }: EnrollmentFormProps) {
  return (
    <div className="mt-12">
      <ol aria-label="Enrollment progress" className="grid grid-cols-5 gap-2">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const active = number === step;
          const complete = number < step;
          return (
            <li key={label} className="min-w-0 text-center">
              <div className={`card-3d mx-auto grid h-11 w-11 place-items-center font-mono font-bold ${active ? "bg-electric text-cream" : complete ? "bg-sun text-ink" : "bg-cream text-ink"}`}>
                {number}
              </div>
              <span className="mt-3 hidden truncate font-mono text-[10px] uppercase tracking-widest sm:block">{label}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 card-3d bg-cream p-6 md:p-10">
        {step === 1 && (
          <StepSection eyebrow="Step 1 of 5" title="Student information">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Student first name" error={errors.studentFirstName}><Input value={draft.studentFirstName} onChange={(e) => onChange("studentFirstName", e.target.value)} maxLength={100} autoComplete="given-name" className={fieldClass} /></Field>
              <Field label="Student last name" error={errors.studentLastName}><Input value={draft.studentLastName} onChange={(e) => onChange("studentLastName", e.target.value)} maxLength={100} autoComplete="family-name" className={fieldClass} /></Field>
              <Field label="Grade level" error={errors.gradeLevel}><Input value={draft.gradeLevel} onChange={(e) => onChange("gradeLevel", e.target.value)} maxLength={50} placeholder="e.g. Entering 6th grade" className={fieldClass} /></Field>
              <Field label="Date of birth" error={errors.dateOfBirth}><Input type="date" value={draft.dateOfBirth} onChange={(e) => onChange("dateOfBirth", e.target.value)} className={fieldClass} /></Field>
              <Field label="Address" error={errors.address} className="md:col-span-2"><Input value={draft.address} onChange={(e) => onChange("address", e.target.value)} maxLength={300} autoComplete="street-address" className={fieldClass} /></Field>
              <Field label="State" error={errors.state}><Input value={draft.state} onChange={(e) => onChange("state", e.target.value)} maxLength={50} autoComplete="address-level1" className={fieldClass} /></Field>
              <Field label="School" error={errors.school}><Input value={draft.school} onChange={(e) => onChange("school", e.target.value)} maxLength={200} className={fieldClass} /></Field>
            </div>
          </StepSection>
        )}

        {step === 2 && (
          <StepSection eyebrow="Step 2 of 5" title="Parent or guardian">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="First name" error={errors.parentFirstName}><Input value={draft.parentFirstName} onChange={(e) => onChange("parentFirstName", e.target.value)} maxLength={100} autoComplete="given-name" className={fieldClass} /></Field>
              <Field label="Last name" error={errors.parentLastName}><Input value={draft.parentLastName} onChange={(e) => onChange("parentLastName", e.target.value)} maxLength={100} autoComplete="family-name" className={fieldClass} /></Field>
              <Field label="Email" error={errors.parentEmail}><Input type="email" value={draft.parentEmail} onChange={(e) => onChange("parentEmail", e.target.value)} maxLength={320} autoComplete="email" className={fieldClass} /></Field>
              <Field label="Phone" error={errors.parentPhone}><Input type="tel" value={draft.parentPhone} onChange={(e) => onChange("parentPhone", e.target.value)} maxLength={25} autoComplete="tel" className={fieldClass} /></Field>
              <fieldset className="md:col-span-2">
                <legend className="font-mono text-xs font-bold uppercase tracking-widest">Preferred camp format</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {(["in_person", "online", "undecided"] as const).map((format) => (
                    <label key={format} className={`cursor-pointer rounded-xl border-2 border-ink p-4 font-semibold ${draft.formatPreference === format ? "bg-electric text-cream" : "bg-cream"}`}>
                      <input className="sr-only" type="radio" name="format" checked={draft.formatPreference === format} onChange={() => onChange("formatPreference", format)} />
                      {format === "in_person" ? "In person" : format === "online" ? "Online" : "Undecided"}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </StepSection>
        )}

        {step === 3 && (
          <StepSection eyebrow="Step 3 of 5" title="Emergency and health">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Emergency contact name" error={errors.emergencyContactName}><Input value={draft.emergencyContactName} onChange={(e) => onChange("emergencyContactName", e.target.value)} maxLength={200} className={fieldClass} /></Field>
              <Field label="Emergency contact phone" error={errors.emergencyContactPhone}><Input type="tel" value={draft.emergencyContactPhone} onChange={(e) => onChange("emergencyContactPhone", e.target.value)} maxLength={25} className={fieldClass} /></Field>
              <Field label="Relationship to student" error={errors.emergencyContactRelationship} className="md:col-span-2"><Input value={draft.emergencyContactRelationship} onChange={(e) => onChange("emergencyContactRelationship", e.target.value)} maxLength={100} className={fieldClass} /></Field>
              <Field label="Medical notes (optional)" error={errors.medicalNotes} className="md:col-span-2"><Textarea value={draft.medicalNotes} onChange={(e) => onChange("medicalNotes", e.target.value)} maxLength={2000} rows={6} placeholder="Allergies, medications, accommodations, or anything the camp team should know." className={`${fieldClass} min-h-36 py-3`} /><span className="mt-2 block text-right font-mono text-xs text-muted-foreground">{draft.medicalNotes.length}/2000</span></Field>
            </div>
          </StepSection>
        )}

        {step === 4 && (
          <StepSection eyebrow="Step 4 of 5" title="Consent and waiver">
            <fieldset>
              <legend className="font-mono text-xs font-bold uppercase tracking-widest">Photo consent</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[{ value: true, label: "I give photo consent" }, { value: false, label: "I do not give photo consent" }].map((option) => (
                  <label key={option.label} className={`cursor-pointer rounded-xl border-2 border-ink p-4 font-semibold ${draft.photoConsent === option.value ? "bg-electric text-cream" : "bg-cream"}`}>
                    <input className="sr-only" type="radio" name="photoConsent" checked={draft.photoConsent === option.value} onChange={() => onChange("photoConsent", option.value)} />
                    {option.label}
                  </label>
                ))}
              </div>
              {errors.photoConsent && <p className="mt-2 font-mono text-sm text-coral">{errors.photoConsent}</p>}
            </fieldset>

            <div className="mt-8 card-3d-inverse bg-ink p-6 text-cream">
              <p className="font-mono text-xs uppercase tracking-widest text-coral">Required legal copy missing</p>
              <p className="mt-3 font-display text-2xl font-black">[WAIVER TEXT TO BE SUPPLIED — do not launch without this]</p>
            </div>

            <div className="mt-8 space-y-5">
              <Field label="Type your full name as your signature" error={errors.waiverSignatureName}><Input value={draft.waiverSignatureName} onChange={(e) => onChange("waiverSignatureName", e.target.value)} maxLength={200} className={fieldClass} /></Field>
              <label className="flex items-start gap-3 rounded-xl border-2 border-ink p-4">
                <Checkbox checked={draft.waiverAccepted} onCheckedChange={(checked) => onChange("waiverAccepted", checked === true)} className="mt-1 h-5 w-5" />
                <span>I acknowledge the waiver above and confirm that the typed name is my signature.</span>
              </label>
              {errors.waiverAccepted && <p className="font-mono text-sm text-coral">{errors.waiverAccepted}</p>}
            </div>
          </StepSection>
        )}

        {step === 5 && (
          <StepSection eyebrow="Step 5 of 5" title="Review enrollment">
            <div className="space-y-6">
              <ReviewGroup title="Student" onEdit={() => onEdit(1)} rows={[
                ["Name", `${draft.studentFirstName} ${draft.studentLastName}`], ["Grade", draft.gradeLevel], ["Date of birth", draft.dateOfBirth], ["Address", `${draft.address}, ${draft.state}`], ["School", draft.school],
              ]} />
              <ReviewGroup title="Parent or guardian" onEdit={() => onEdit(2)} rows={[
                ["Name", `${draft.parentFirstName} ${draft.parentLastName}`], ["Email", draft.parentEmail], ["Phone", draft.parentPhone], ["Format", draft.formatPreference.replace("_", " ")],
              ]} />
              <ReviewGroup title="Emergency and health" onEdit={() => onEdit(3)} rows={[
                ["Emergency contact", draft.emergencyContactName], ["Phone", draft.emergencyContactPhone], ["Relationship", draft.emergencyContactRelationship], ["Medical notes", draft.medicalNotes || "None provided"],
              ]} />
              <ReviewGroup title="Consent" onEdit={() => onEdit(4)} rows={[
                ["Photo consent", draft.photoConsent ? "Yes" : "No"], ["Signature", draft.waiverSignatureName],
              ]} />
              <div className="card-3d bg-sun p-5">
                <p className="font-mono text-xs font-bold uppercase tracking-widest">Review checkpoint</p>
                <p className="mt-2">Final submission is intentionally disabled until the required waiver text and secure submission email flow are added in the next reviewed phase.</p>
              </div>
            </div>
          </StepSection>
        )}

        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-full border-2 border-ink bg-cream px-7 text-ink hover:bg-ink hover:text-cream">← Back</Button>
          {step < 5 ? (
            <Button type="button" onClick={onNext} className="h-12 rounded-full bg-ink px-8 text-cream hover:bg-electric">Continue →</Button>
          ) : (
            <Button type="button" disabled className="h-12 rounded-full bg-ink px-8 text-cream">Submit enrollment</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <section><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p><h2 className="mt-2 mb-7 font-display text-3xl font-black md:text-4xl">{title}</h2>{children}</section>;
}

function Field({ label, error, children, className = "" }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-2 block font-mono text-xs font-bold uppercase tracking-widest">{label}</span>{children}{error && <span className="mt-2 block font-mono text-sm text-coral">{error}</span>}</label>;
}

function ReviewGroup({ title, rows, onEdit }: { title: string; rows: Array<[string, string]>; onEdit: () => void }) {
  return <section className="rounded-xl border-2 border-ink p-5"><div className="flex items-center justify-between gap-4"><h3 className="font-display text-2xl font-black">{title}</h3><Button type="button" variant="ghost" onClick={onEdit} className="rounded-full font-mono text-xs underline">Edit</Button></div><dl className="mt-4 grid gap-3 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label}><dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</dt><dd className="mt-1 break-words">{value}</dd></div>)}</dl></section>;
}

type InterestListProps = {
  email: string;
  status: InterestStatus;
  error: string;
  onEmailChange: (email: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onReset: () => void;
  onBack: () => void;
};

function InterestList({ email, status, error, onEmailChange, onSubmit, onReset, onBack }: InterestListProps) {
  if (status === "success") return <div className="mt-12 card-3d bg-sun p-8"><p className="font-mono text-xs uppercase tracking-widest text-ink/70">You’re on the list</p><h2 className="mt-2 font-display text-3xl font-black md:text-4xl">Congrats! You’ve been added to the 2027 waitlist 🎉</h2><p className="mt-3 text-ink/80">Check your email to confirm everything has been entered correctly. We’ll reach out with more details closer to camp.</p><ShareButtons /><Button type="button" onClick={onReset} className="mt-6 h-12 rounded-full bg-ink px-6 text-cream">Add another email</Button></div>;
  if (status === "duplicate") return <div className="mt-12 card-3d bg-electric p-8 text-cream"><p className="font-mono text-xs uppercase tracking-widest text-cream/70">Already on the list</p><h2 className="mt-2 font-display text-3xl font-black md:text-4xl">Looks like you’ve already signed up 📬</h2><p className="mt-3 text-cream/85">We already have <strong>{email}</strong> on our interest list. We’ll be in touch closer to camp.</p><Button type="button" onClick={onReset} className="mt-6 h-12 rounded-full border-2 border-cream bg-ink px-6 text-cream hover:bg-cream hover:text-ink">Use a different email</Button></div>;

  return <div className="mt-12 card-3d bg-cream p-6 md:p-10"><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Email updates</p><h2 className="mt-2 font-display text-4xl font-black">Just keep me updated</h2><p className="mt-4 text-ink/75">No commitment — enter one email and we’ll send the schedule and joining details later.</p><form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row"><Input required type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} disabled={status === "loading"} maxLength={320} placeholder="parent@email.com" className={`${fieldClass} flex-1`} /><Button type="submit" disabled={status === "loading"} className="h-12 rounded-full bg-ink px-8 text-cream hover:bg-electric">{status === "loading" ? "Sending…" : "I’m interested"}</Button></form>{status === "error" && <p className="mt-4 font-mono text-sm text-coral">{error || "There was an issue with your email — please check it for typos and try again."}</p>}<p className="mt-6 card-3d bg-sun px-5 py-4 font-mono text-sm text-ink">✨ MathOs 2027 will be hybrid — join us in person or virtually.</p><Button type="button" variant="ghost" onClick={onBack} className="mt-7 rounded-full">← See both options</Button></div>;
}