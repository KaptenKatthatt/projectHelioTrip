import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { GravityLabControls } from "./GravityLabControls";
import { GravityDropLab } from "../organisms/GravityDropLab";
import { useTranslation } from "../../hooks/useTranslation";

type SectionId = "orbit" | "drop";

type AccordionSectionProps = {
  readonly id: SectionId;
  readonly title: string;
  readonly icon: string;
  readonly open: boolean;
  readonly onToggle: (id: SectionId) => void;
  readonly children: React.ReactNode;
};

const AccordionSection = ({
  id,
  title,
  icon,
  open,
  onToggle,
  children,
}: AccordionSectionProps) => (
  <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden transition-colors hover:border-white/12">
    <button
      type="button"
      onClick={() => onToggle(id)}
      className="pointer-events-auto flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
      aria-expanded={open}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="flex-1 text-xs font-semibold tracking-tight text-white/80">
        {title}
      </span>
      <ChevronDown
        className={
          "h-3.5 w-3.5 text-white/30 transition-transform duration-200 " +
          (open ? "rotate-180" : "")
        }
        aria-hidden
      />
    </button>
    <div
      className={
        "grid transition-[grid-template-rows] duration-250 ease-out " +
        (open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
      }
    >
      <div className="overflow-hidden">
        <div className="px-3 pb-3 pt-1">{children}</div>
      </div>
    </div>
  </div>
);

export const LabAccordion = () => {
  const { locale } = useTranslation();
  const [openSection, setOpenSection] = useState<SectionId>("drop");

  const handleToggle = (id: SectionId) => {
    setOpenSection((prev) => (prev === id ? id : id));
  };

  const orbitTitle =
    locale === "sv" ? "Banmekanik — Solens massa" : "Orbital Mechanics — Sun Mass";
  const dropTitle =
    locale === "sv" ? "Gravitations-labbet — Släpp & jämför" : "Gravity Lab — Drop & Compare";

  return (
    <div className="flex flex-col gap-2">
      <AccordionSection
        id="orbit"
        title={orbitTitle}
        icon="☀️"
        open={openSection === "orbit"}
        onToggle={handleToggle}
      >
        <GravityLabControls embedded />
      </AccordionSection>

      <AccordionSection
        id="drop"
        title={dropTitle}
        icon="🍎"
        open={openSection === "drop"}
        onToggle={handleToggle}
      >
        <GravityDropLab />
      </AccordionSection>
    </div>
  );
};
