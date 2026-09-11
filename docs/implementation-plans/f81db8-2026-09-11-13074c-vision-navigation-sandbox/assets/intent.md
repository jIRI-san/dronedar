# Intent

<!-- Preliminary epic intent. Confirm and replace during this child's /cip interview. -->

## Goal

Introduce image-based perception through one controlled, explainable navigation task without jumping
directly to deep learning or general autonomy.

## Owned outcome

A virtual camera supplies timestamped frames to a separate vision module. A deterministic first task, such
as detecting a fiducial or colored target, produces typed observations that guide one bounded navigation
exercise and expose confidence, latency, and failure behavior.

## Interface boundaries

- Babylon.js or its rendering adapter owns image production but not detection or navigation decisions.
- The vision module converts frames plus calibration metadata into observations; raw pixels do not enter the
  flight-control core.
- Navigation consumes typed observations with timestamp, coordinate frame, confidence, and validity.

## Dependency rationale

Depends on `201d65` for reproducible rendered imagery and on `4e150f` for a mission/navigation consumer that
can act on observations without bypassing control layers.

## Success signals

- The chosen target is detected in documented positive scenes and rejected in negative/ambiguous scenes.
- A bounded guidance exercise succeeds under acceptance criteria confirmed during `/cip`.
- Frame rate, image resolution, processing latency, stale observations, and missed detections are visible.
- A learning chapter explains the camera model, calibration assumptions, image-processing pipeline,
  coordinate conversion, and why the exercise does not establish real-world robustness.

## Requirement candidates

- Make camera intrinsics/extrinsics and image-to-observation coordinate conventions explicit.
- Handle delayed, dropped, duplicate, malformed, and out-of-order frames or observations.
- Keep deterministic image fixtures for functional tests and separate browser performance measurements.
- Define confidence thresholds and no-detection behavior before closing the guidance loop.

## Risks

- Browser frame extraction and transfer may dominate runtime or behave differently across platforms.
- Synthetic imagery can make perception substantially easier than real camera data.
- Coordinate or timestamp mistakes can create plausible but incorrect guidance.

## Non-goals

- Deep-learning model training, arbitrary-object recognition, SLAM, unknown-scene robustness, or real camera
  support.
- Claiming that synthetic test performance transfers to physical flight.

## Definition of done

- A separately testable vision pipeline produces typed observations and closes one deterministic bounded
  navigation loop, with performance limits, failure cases, and learning material documented.
