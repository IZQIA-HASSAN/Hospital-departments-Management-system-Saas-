import { useParams } from "react-router-dom";
import { Stethoscope } from "lucide-react";

const DEPARTMENT_LABELS = {
  opd: "OPD",
  icu: "ICU",
  emergency: "Emergency",
};

export default function DepartmentPage() {
  const { slug } = useParams(); // "opd" | "icu" | "emergency"
  const label = DEPARTMENT_LABELS[slug] ?? slug;

  return (
    <>
      <span className="block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-2">
        DEPARTMENT
      </span>
      <h1 className="font-serif font-semibold text-3xl sm:text-4xl mb-8 flex items-center gap-3">
        <Stethoscope className="text-emerald-700" size={30} />
        {label}
      </h1>

      <div className="border border-dashed border-neutral-300 rounded-xl p-10 text-center bg-white">
        <p className="font-serif text-xl mb-1">{label} overview coming soon</p>
        <p className="text-sm opacity-60">
          This page will show live {label} data once it's wired up.
        </p>
      </div>
    </>
  );
}