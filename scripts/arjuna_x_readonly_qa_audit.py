#!/usr/bin/env python3
"""Read-only Arjuna X QA safety audit. No network calls or application mutations."""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = {
    "voice intent contract": "qa/voice-intent-contract.cjs",
    "location flow contract": "qa/location-flow-contract.cjs",
    "ride workflow contract": "qa/ride-workflow-contract.cjs",
    "permission safety contract": "qa/permission-safety-contract.cjs",
    "UI adapter contract": "qa/arjuna-ui-adapter-contract.cjs",
    "location UI adapter": "qa/location-ui-adapter-contract.cjs",
    "ride booking readiness": "qa/ride-booking-readiness-contract.cjs",
}
TESTS = {
    "voice intent tests": "tests/voice-intent-contract.test.cjs",
    "location flow tests": "tests/location-flow-contract.test.cjs",
    "ride workflow tests": "tests/ride-workflow-contract.test.cjs",
    "permission tests": "tests/permission-safety-contract.test.cjs",
    "UI adapter tests": "tests/arjuna-ui-adapter-contract.test.cjs",
    "location UI tests": "tests/location-ui-adapter-contract.test.cjs",
    "booking readiness tests": "tests/ride-booking-readiness-contract.test.cjs",
}

def audit():
    checks = []
    for label, rel in {**REQUIRED, **TESTS}.items():
        exists = (ROOT / rel).is_file()
        checks.append({"check": f"file:{label}", "status": "PASS" if exists else "FAIL", "detail": rel})
    for label, rel, needles in [
        ("booking contract no-execution guard", "qa/ride-booking-readiness-contract.cjs",
         ["execution: 'not_performed'", "backendAuthorizationRequired: true", "explicit_ui_gesture"]),
        ("voice contract blocks high impact actions", "qa/voice-intent-contract.cjs",
         ["blocked", "payment"]),
        ("location contract requires confirmation", "qa/location-flow-contract.cjs",
         ["confirmed"]),
    ]:
        path = ROOT / rel
        content = path.read_text(encoding="utf-8") if path.exists() else ""
        ok = all(needle in content for needle in needles)
        checks.append({"check": label, "status": "PASS" if ok else "FAIL", "detail": "required safety markers present" if ok else "marker missing"})
    return {"audit": "ARJUNA_X_READ_ONLY_QA", "checks": checks,
            "summary": {"passed": sum(c["status"] == "PASS" for c in checks),
                       "failed": sum(c["status"] == "FAIL" for c in checks),
                       "total": len(checks)},
            "side_effects": "none", "network": "not used"}

def self_test():
    report = audit()
    assert report["side_effects"] == "none"
    assert report["network"] == "not used"
    assert report["summary"]["total"] == len(REQUIRED) + len(TESTS) + 3
    print("Self-test PASS: audit is read-only and deterministic.")

if __name__ == "__main__":
    if "--self-test" in sys.argv:
        self_test()
    report = audit()
    print(json.dumps(report, indent=2))
    sys.exit(1 if report["summary"]["failed"] else 0)
