import { useParams } from "react-router-dom";
import { Stethoscope, Activity, Siren } from "lucide-react";
import OPDContent from "./OPDContent";
// import ICUContent from "./ICUContent";           // add when ICU is built
// import EmergencyContent from "./EmergencyContent"; // add when Emergency is built

const DEPARTMENT_LABELS = {
  opd: "OPD",
  icu: "ICU",
  emergency: "Emergency",
};

const DEPARTMENT_ICONS = {
  opd: Stethoscope,
  icu: Activity,
  emergency: Siren,
};

// Swap in the real component as each module gets built.
// Anything not yet built falls back to the "coming soon" placeholder.
const DEPARTMENT_CONTENT = {
  opd: OPDContent,
  // icu: ICUContent,
  // emergency: EmergencyContent,
};

export default function DepartmentPage() {
  const { slug } = useParams(); // "opd" | "icu" | "emergency"
  const label = DEPARTMENT_LABELS[slug] ?? slug;
  const Icon = DEPARTMENT_ICONS[slug] ?? Stethoscope;
  const Content = DEPARTMENT_CONTENT[slug];

  return (
    <>
      <span className="block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-2">
        DEPARTMENT
      </span>
      <h1 className="font-serif font-semibold text-3xl sm:text-4xl mb-8 flex items-center gap-3">
        <Icon className="text-emerald-700" size={30} />
        {label}
      </h1>

      {Content ? (
        <Content />
      ) : (
        <div className="border border-dashed border-neutral-300 rounded-xl p-10 text-center bg-white">
          <p className="font-serif text-xl mb-1">{label} overview coming soon</p>
          <p className="text-sm opacity-60">
            This page will show live {label} data once it's wired up.
          </p>
        </div>
      )}
    </>
  );
}