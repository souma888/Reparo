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

for (const [id, name] of [
  ["dishwasher", "Dishwasher"],
  ["vacuum", "Vacuum cleaner"],
  ["air-purifier", "Air purifier"],
  ["water-purifier", "Water purifier"],
  ["mixer-grinder", "Mixer-grinder"],
])
  appliances.push({
    id,
    name,
    icon: "kettle",
    description: "Everyday care, with clear limits.",
  });
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

for (const a of appliances)
  symptoms[a.id] ||= [
    "Will not start",
    "Unusual noise",
    "Poor performance",
    "Visible error code",
    "Something else",
  ];
