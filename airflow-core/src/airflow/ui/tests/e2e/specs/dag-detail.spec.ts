/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { testConfig } from "playwright.config";
import { expect, test } from "tests/e2e/fixtures";
import { safeCleanupDagRun, setupPendingHITLFlowViaAPI } from "tests/e2e/utils/test-helpers";

test.describe("Dag Detail Page", () => {
  test("verify HITL review modal opens from Dag detail", async ({ authenticatedRequest, dagsPage, page }) => {
    test.slow();

    const hitlDagId = testConfig.testDag.hitlId;
    let dagRunId: string | undefined;

    try {
      dagRunId = await setupPendingHITLFlowViaAPI(authenticatedRequest, hitlDagId);

      await dagsPage.navigateToDagDetail(hitlDagId);

      const requiredActionsButton = page.getByRole("button", { name: /required actions/i });

      await expect(requiredActionsButton).toBeVisible();
      await requiredActionsButton.click();

      const modal = page.getByRole("dialog", { name: /required actions/i });

      await expect(modal).toBeVisible();
      await expect(modal.getByText(hitlDagId).first()).toBeVisible();
    } finally {
      if (dagRunId !== undefined) {
        await safeCleanupDagRun(authenticatedRequest, hitlDagId, dagRunId);
      }
    }
  });

  test("verify HITL review modal opens from the Dag required actions route", async ({
    authenticatedRequest,
    page,
  }) => {
    test.slow();

    const hitlDagId = testConfig.testDag.hitlId;
    let dagRunId: string | undefined;

    try {
      dagRunId = await setupPendingHITLFlowViaAPI(authenticatedRequest, hitlDagId);

      await page.goto(`/dags/${hitlDagId}/required_actions`);

      await expect(page.getByRole("dialog", { name: /required actions/i })).toBeVisible();
    } finally {
      if (dagRunId !== undefined) {
        await safeCleanupDagRun(authenticatedRequest, hitlDagId, dagRunId);
      }
    }
  });
});
