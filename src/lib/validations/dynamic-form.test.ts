import assert from "node:assert/strict";
import test from "node:test";
import { validateDynamicBriefSubmission, type DynamicFieldSpec } from "./dynamic-form.ts";

const SAMPLE_FIELDS: DynamicFieldSpec[] = [
  {
    id: "f-1",
    fieldKey: "target_pages",
    label: "Target Page Count",
    fieldType: "number",
    placeholder: null,
    helpText: null,
    options: [],
    validationRules: { min: 1, max: 100 },
    isRequired: true,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "f-2",
    fieldKey: "site_url",
    label: "Existing Website",
    fieldType: "url",
    placeholder: null,
    helpText: null,
    options: [],
    validationRules: {},
    isRequired: false,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "f-3",
    fieldKey: "design_style",
    label: "Design Direction",
    fieldType: "select",
    placeholder: null,
    helpText: null,
    options: [
      { label: "Minimalist", value: "minimal" },
      { label: "3D Interactive", value: "3d" },
    ],
    validationRules: {},
    isRequired: true,
    displayOrder: 3,
    isActive: true,
  },
  {
    id: "f-4",
    fieldKey: "accept_brief_terms",
    label: "Scope Confirmation",
    fieldType: "checkbox",
    placeholder: null,
    helpText: null,
    options: [],
    validationRules: {},
    isRequired: true,
    displayOrder: 4,
    isActive: true,
  },
];

test("validateDynamicBriefSubmission validates typed fields and rejects invalid options/unknown keys", () => {
  const valid = validateDynamicBriefSubmission(SAMPLE_FIELDS, {
    target_pages: "8",
    site_url: "https://elevante.in",
    design_style: "3d",
    accept_brief_terms: true,
  });
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.responses[0]?.responseValue, 8);
    assert.equal(valid.schemaSnapshot.length, 4);
  }

  const badChoiceAndJavascriptUrl = validateDynamicBriefSubmission(SAMPLE_FIELDS, {
    target_pages: 0,
    site_url: "javascript:alert(1)",
    design_style: "unknown_option",
    accept_brief_terms: false,
  });
  assert.equal(badChoiceAndJavascriptUrl.ok, false);
  if (!badChoiceAndJavascriptUrl.ok) {
    assert.ok(badChoiceAndJavascriptUrl.fieldErrors.target_pages);
    assert.ok(badChoiceAndJavascriptUrl.fieldErrors.site_url);
    assert.ok(badChoiceAndJavascriptUrl.fieldErrors.design_style);
    assert.ok(badChoiceAndJavascriptUrl.fieldErrors.accept_brief_terms);
  }

  const unknownKey = validateDynamicBriefSubmission(SAMPLE_FIELDS, {
    target_pages: 5,
    design_style: "minimal",
    accept_brief_terms: true,
    injected_admin_flag: true,
  });
  assert.equal(unknownKey.ok, false);
});
