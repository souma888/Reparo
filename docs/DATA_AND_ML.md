# Data, ML, Cost and Feasibility Strategy

## Avoid the dataset trap
A broad appliance-fault model would require large, well-labeled, representative datasets across brands, models, operating states and environments. Such datasets may be scarce, biased or restricted. Begin with **rules + structured questions**, not an unsupported claim of end-to-end AI diagnosis.

## Candidate data sources
- Public manufacturer troubleshooting manuals **only when usage rights permit**.
- Licensed repair guides and publicly available documentation with attribution.
- Expert-reviewed synthetic symptom scenarios for software tests (not proof of real-world accuracy).
- Opt-in user reports and recordings after privacy/consent safeguards.
- Curated, licensed sound/image datasets matched to the target appliance and fault.

Record provenance, license, appliance/model, label method, collection conditions and permitted uses. Do not scrape copyrighted manuals indiscriminately.

## Baselines and experiments
1. Deterministic symptom decision trees.
2. Text retrieval over a reviewed knowledge base.
3. Text classifier or reranker if labeled data supports it.
4. Image/audio specialists only for narrow tasks with enough labels.
5. Multimodal fusion only if it improves performance over each baseline.

## Evaluation
Use held-out scenarios split by appliance/model and, where possible, user/location to avoid leakage. Measure hazard recall, unsafe recommendation rate, diagnostic top-k accuracy, abstention quality, calibration, question count, latency and cost. Include out-of-distribution and noisy media tests.

## Audio
Potential tasks include identifying fan bearing-like noise or abnormal washing-machine sounds. Audio cannot reliably identify every fault. Record noise conditions, sample rate, device variability and background sound interference.

## Images and video
Images may help with external leaks, indicator lights or visible damage; video is costlier and introduces privacy and safety concerns. Do not ask users to expose energized components for better footage.

## Compute/cost plan
- MVP: rules and small text services on CPU.
- Retrieval: modest embedding and search costs, cache permitted documents.
- Image/audio: batch or on-demand inference with strict size/duration limits.
- Video: defer until measured value justifies processing/storage expense.
- Track per-request latency, GPU minutes, storage, egress and model API spend.

## Failure policy
If evidence is insufficient or conflicting, ask a safe clarifying question or abstain and recommend professional inspection. Never fabricate certainty.
