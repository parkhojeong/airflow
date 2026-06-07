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
import { useTaskInstanceServiceGetHitlDetails } from "openapi/queries";
import { useAutoRefresh } from "src/utils";

export const useHITLCompletedQuery = ({
  dagId,
  enabled = true,
  open,
  runId,
}: {
  readonly dagId?: string;
  readonly enabled?: boolean;
  readonly open: boolean;
  readonly runId?: string;
}) => {
  const refetchInterval = useAutoRefresh({ checkPendingRuns: open, dagId: open ? dagId : undefined });

  return useTaskInstanceServiceGetHitlDetails(
    {
      dagId: dagId ?? "~",
      dagRunId: runId ?? "~",
      orderBy: ["dag_id", "run_after", "created_at", "task_display_name"],
      responseReceived: true,
    },
    undefined,
    { enabled: open && enabled, refetchInterval },
  );
};
