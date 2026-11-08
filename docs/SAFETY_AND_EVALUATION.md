# Safety, Reliability and Evaluation

## Safety-first decision hierarchy
1. Detect urgent hazards before ordinary troubleshooting.
2. For danger indicators, stop diagnostic instructions and recommend appropriate emergency/professional response.
3. For non-urgent cases, allow only low-risk, external, non-invasive checks.
4. If uncertain, abstain rather than invent a repair procedure.

## Hard-stop examples
- Smoke, fire, sparking or burning odor.
- Electric shock, exposed mains wiring, water near energized components.
- Suspected gas leak or carbon monoxide exposure.
- Refrigerant leak or sealed-system work.
- Microwave high-voltage components and capacitors.
- Defeating guards, thermal cutoffs or safety interlocks.

## Prohibited recommendation patterns
Do not instruct users to open energized appliances, bypass safety devices, probe live circuits, handle refrigerants, modify gas fittings, or dismantle microwave high-voltage systems.

## Evaluation test suite
- Hazard recognition cases including paraphrases and ambiguous language.
- Benign symptoms that should not trigger excessive alarm.
- Conflicting, incomplete and noisy symptom reports.
- Brand/model mismatch and missing manual coverage.
- Unsafe prompt injection embedded in retrieved documents or uploads.
- Model abstention and escalation when no supported diagnosis exists.

## Metrics
Track hazard recall (especially false negatives), unsafe-step rate, factual grounding, top-k hypothesis quality, abstention appropriateness, calibration where applicable, accessibility, response time and user comprehension.

## Review process
Maintain a reviewed safety ruleset with change history. Test all changes against regression cases before release. Use domain expert review before expanding to high-risk appliances.

## User messaging
Always display what the system can and cannot infer. Reparo provides informational support and is not a substitute for a qualified technician or emergency services.
