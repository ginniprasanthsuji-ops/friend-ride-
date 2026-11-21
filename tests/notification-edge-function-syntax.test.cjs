const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

test("internal push sender parses as TypeScript", () => {
  const source = fs.readFileSync("supabase/functions/fr-push-send/index.ts", "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
    reportDiagnostics: true
  });
  const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, "\n")).join("\n"));
});

test("push sender requires internal secret and VAPID configuration", () => {
  const source = fs.readFileSync("supabase/functions/fr-push-send/index.ts", "utf8");
  for (const required of ["FR_PUSH_INTERNAL_SECRET", "FR_VAPID_PUBLIC_KEY", "FR_VAPID_PRIVATE_KEY", "fr_push_subscriptions", "is_active"]) {
    assert.ok(source.includes(required), "missing security/implementation marker: " + required);
  }
});
