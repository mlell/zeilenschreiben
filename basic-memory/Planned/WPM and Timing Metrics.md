---
title: WPM and Timing Metrics
type: note
permalink: basic-memory/planned/wpm-and-timing-metrics
tags:
- feature
- metrics
- future
---

# WPM and Timing Metrics

Calculate and display typing speed and timing statistics.

## Metrics

* **WPM (Words Per Minute)**: Standard calculation (characters / 5) / minutes
* **Duration per line**: Time from first keypress to Enter
* **Total time**: Sum of all line durations
* **Average WPM**: Mean across successful attempts only
* **Fastest WPM**: Maximum WPM achieved
* **Slowest WPM**: Minimum WPM achieved

## Calculation

* Start timer when line is displayed
* Stop timer when Enter is pressed
* Calculate: `wpm = (text.length / 5) / (durationMs / 60000)`
* Round to whole number
* Failed attempts have WPM = 0

## Display

* Per-line WPM in attempt history
* Average WPM in results summary
* Fastest WPM highlighted
* Time spent per line
* Total session time

## Implementation

* Track `startTime` and `endTime` for each attempt
* Store `durationMs` and `wpm` in TypingAttempt
* Calculate statistics in SessionResults

---

relates_to [[Instructor Features]]
relates_to [[Domain Model]]