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
import { expect } from "tests/e2e/fixtures";
import { test } from "tests/e2e/fixtures/dag-runs-data";
import { safeCleanupDagRun } from "tests/e2e/utils/api/dag-runs";
import { setupPendingHITLFlowViaAPI } from "tests/e2e/utils/api/hitl";

test.describe("Dag Runs Page", () => {
  test.setTimeout(60_000);

  // dagRunsPageData is triggered once per worker via beforeEach.
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- triggers worker-scoped data fixture
  test.beforeEach(async ({ dagRunsPageData: _data }) => {});

  test("verify Dag runs table displays data", async ({ dagRunsPage }) => {
    await dagRunsPage.navigate();
    await dagRunsPage.verifyDagRunsExist();
  });

  test("verify run details display correctly", async ({ dagRunsPage }) => {
    await dagRunsPage.navigate();
    await dagRunsPage.verifyRunDetailsDisplay();
  });

  test("verify filtering by failed state", async ({ dagRunsPage, dagRunsPageData }) => {
    await dagRunsPage.navigate();
    await dagRunsPage.verifyStateFiltering("Failed", dagRunsPageData.dag1Id);
  });

  test("verify filtering by success state", async ({ dagRunsPage, dagRunsPageData }) => {
    await dagRunsPage.navigate();
    await dagRunsPage.verifyStateFiltering("Success", dagRunsPageData.dag1Id);
  });

  test("verify filtering by Dag ID", async ({ dagRunsPage, dagRunsPageData }) => {
    await dagRunsPage.navigate();
    await dagRunsPage.verifyDagIdFiltering(dagRunsPageData.dag1Id);
  });

  test("verify HITL review modal opens from Dag run details", async ({ authenticatedRequest, page }) => {
    test.slow();

    const hitlDagId = testConfig.testDag.hitlId;
    let dagRunId: string | undefined;

    try {
      dagRunId = await setupPendingHITLFlowViaAPI(authenticatedRequest, hitlDagId);

      await page.goto(`/dags/${hitlDagId}/runs/${dagRunId}`);

      await page.getByRole("button", { name: /required actions/i }).click();
      await expect(page.getByRole("dialog", { name: /required actions/i })).toBeVisible();
    } finally {
      if (dagRunId !== undefined) {
        await safeCleanupDagRun(authenticatedRequest, hitlDagId, dagRunId);
      }
    }
  });

  test("verify HITL review modal opens from the required actions route", async ({
    authenticatedRequest,
    page,
  }) => {
    test.slow();

    const hitlDagId = testConfig.testDag.hitlId;
    let dagRunId: string | undefined;

    try {
      dagRunId = await setupPendingHITLFlowViaAPI(authenticatedRequest, hitlDagId);

      await page.goto(`/dags/${hitlDagId}/runs/${dagRunId}/required_actions`);

      await expect(page.getByRole("dialog", { name: /required actions/i })).toBeVisible();
    } finally {
      if (dagRunId !== undefined) {
        await safeCleanupDagRun(authenticatedRequest, hitlDagId, dagRunId);
      }
    }
  });
});
