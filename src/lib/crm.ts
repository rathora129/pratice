export const pipelineStages = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "requirement", label: "Requirement" },
  { value: "quotation", label: "Quotation" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
] as const;

export type PipelineStage = (typeof pipelineStages)[number]["value"];

export function isPipelineStage(value: string): value is PipelineStage {
  return pipelineStages.some((stage) => stage.value === value);
}

export function stageLabel(value: string) {
  return pipelineStages.find((stage) => stage.value === value)?.label ?? value;
}

export const activityTypes = [
  { value: "note", label: "Note" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

export function activityTypeLabel(value: string) {
  return activityTypes.find((type) => type.value === value)?.label ?? value;
}
