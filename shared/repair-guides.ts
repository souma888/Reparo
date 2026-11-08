export type RepairGuideDefinition = {
  id: string;
  appliance: string;
  title: string;
  condition: string;
  source: string;
  sourceLabel: string;
  steps: string[];
};
// Fixed owner-level tasks, never model-authored procedures or internal repairs.
export const repairGuides: RepairGuideDefinition[] = [
  {
    id: "fridge-door-obstruction",
    appliance: "fridge",
    title: "Clear an item blocking the door",
    condition:
      "I can already see a food package or loose container keeping the refrigerator door from closing normally.",
    source: "https://www.samsung.com/us/support/troubleshoot/TSG10007112/",
    sourceLabel: "Samsung: refrigerator doors will not close",
    steps: [
      "Check that there are no hazard signs and that your model manual permits ordinary shelf access. If there is water near electrics, damage, or another concern, stop here.",
      "Without moving the refrigerator, opening panels, or touching wiring, reposition the visible food package or loose container so it no longer projects into the door opening. Do not force a stuck shelf or bin.",
      "Close the door normally and observe whether the obstruction is gone. If it needs force or still will not seal, stop and arrange service; do not adjust hinges or dismantle the seal.",
    ],
  },
  {
    id: "washer-delay-setting",
    appliance: "washer",
    title: "Check an unintended delayed-start setting",
    condition:
      "The display already shows a delayed-start indicator, and my exact model manual describes how to cancel that setting.",
    source:
      "https://producthelp.whirlpool.com/Laundry/Washers/Product_Info/Washer_Product_Assistance/Cycles%2C_Options%2C_and_Modifiers_on_a_Top_Load_HE_Washer",
    sourceLabel: "Whirlpool: cycle options and Delay Start",
    steps: [
      "Read the Cancel Delay Start instructions for your exact model. The linked example applies to certain Whirlpool controls only; do not use its button sequence on a different model.",
      "If no hazard is present, use only the normal cancel-delay control specified in your model manual. Do not reset a fault, force the door, bypass its lock, or enter service mode.",
      "Observe whether the delay indicator clears. Do not start a cycle just to test a suspected fault. If the display is unclear, shows an error, or the original issue remains, stop and contact support.",
    ],
  },
  {
    id: "fan-external-obstruction",
    appliance: "fan",
    title: "Clear an external airflow obstruction",
    condition:
      "A curtain, furniture item, or loose object outside the fan guard visibly blocks airflow. Nothing is caught inside the guard.",
    source:
      "https://www.dyson.com/medialibrary/Files/Dyson/Support/downloads/US/fan/Manuals/AM09_Manual.pdf",
    sourceLabel:
      "Dyson: unplug before cleaning or carrying; keep openings clear",
    steps: [
      "Use normal controls to switch the fan off. If its plug is dry, undamaged, and safely accessible, unplug it before moving an obstruction. If access is unsafe, stop and get help.",
      "Move only the loose item outside the fan away from the airflow path. Do not insert tools or hands through the guard, remove covers, or attempt to free an internal obstruction.",
      "Leave the fan stopped while checking the external path is clear. Do not reconnect it if a noise, damaged cord, internal blockage, or any other fault remains; arrange service instead.",
    ],
  },
];
export function guidesFor(appliance: string, stopped: boolean) {
  return stopped
    ? []
    : repairGuides.filter((guide) => guide.appliance === appliance);
}
