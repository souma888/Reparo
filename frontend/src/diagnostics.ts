import type { IconName } from "./components/Icon";

export const appliances: {
  id: string;
  name: string;
  icon: IconName;
  description: string;
}[] = [
  {
    id: "washer",
    name: "Washing machine",
    icon: "washer",
    description: "A quieter laundry day.",
  },
  {
    id: "fridge",
    name: "Refrigerator",
    icon: "fridge",
    description: "Keep the everyday fresh.",
  },
  {
    id: "fan",
    name: "Fan",
    icon: "fan",
    description: "Bring back a little calm.",
  },
  {
    id: "small",
    name: "Small appliance",
    icon: "kettle",
    description: "The little things matter.",
  },
];

export const symptoms: Record<string, string[]> = {
  washer: ["Will not start", "Unusual noise", "Not draining", "Something else"],
  fridge: [
    "Not cooling as expected",
    "Unusual noise",
    "Door will not seal",
    "Something else",
  ],
  fan: ["Will not start", "Unusual noise", "Weak airflow", "Something else"],
  small: [
    "Will not start",
    "Unusual noise",
    "Poor performance",
    "Something else",
  ],
};

export type SafetyAnswer = "yes" | "no" | "unsure" | "";
export type Guidance = {
  stop: boolean;
  title: string;
  intro: string;
  checks: string[];
};

// Conservative preview only. An explicit safety answer is mandatory; free text
// may escalate it but must never downgrade it. No remote inference is performed.
const danger =
  /smok|burn|spark|\bfire\b|\bflame|\bshock|electrocut|gas|carbon monoxide|exposed.{0,20}(wire|wiring)|refrigerant|flood|water.{0,30}(electric|socket|outlet|plug)|leak.{0,30}(electric|socket|outlet|plug)/i;

export function getGuidance(
  appliance: string,
  symptom: string,
  safety: SafetyAnswer,
  notes: string,
): Guidance {
  if (safety !== "no" || danger.test(notes))
    return {
      stop: true,
      title: "Let’s put safety first.",
      intro:
        "Troubleshooting stops here because a hazard is present or safety is uncertain. This preview cannot assess whether an appliance is safe.",
      checks: [
        "Stop using the appliance. Keep people away and do not open, touch, or attempt to repair it.",
        "For smoke, fire, a suspected gas leak, or immediate danger, move to a safe place and contact local emergency services. Do not operate switches or plugs near a suspected gas leak.",
        "For other concerns, contact a qualified technician before using the appliance again.",
      ],
    };
  const checks = [
    "Read the troubleshooting and safety section of your appliance’s own manufacturer manual before taking any action.",
    "Note the model number only if its label is visible from outside, without moving or opening the appliance.",
  ];
  if (appliance === "washer" && symptom === "Will not start")
    checks.push(
      "From outside, observe whether the door appears fully closed and whether the display shows an error or a delayed-start setting. Record what you see; do not bypass the door lock.",
    );
  else if (appliance === "fridge" && symptom === "Door will not seal")
    checks.push(
      "Look for food packages visibly obstructing the door. Do not dismantle the hinge or seal. Ask a technician if the door still will not close normally.",
    );
  else if (appliance === "fan" && symptom === "Weak airflow")
    checks.push(
      "Observe whether curtains or furniture are blocking airflow from a safe distance. Keep hands and objects outside the guard; do not remove it.",
    );
  else
    checks.push(
      "Record when the symptom occurs and any visible error code. Do not repeat a cycle or run the appliance to reproduce a fault.",
    );
  checks.push(
    "If the symptom persists, share your observations and the model number with a qualified technician. Stop immediately if any new hazard appears.",
  );
  return {
    stop: false,
    title: "A clearer place to start.",
    intro:
      "These are general external observations, not a diagnosis. The cause is unknown; this preview has no verified model-specific manuals or diagnostic backend.",
    checks,
  };
}
