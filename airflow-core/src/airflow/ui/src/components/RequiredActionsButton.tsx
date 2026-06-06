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
import { NeedsReviewButton } from "src/components/NeedsReviewButton";
import { RequiredActionsModal } from "src/components/RequiredActionsModal";
import { useRequiredActionsModal } from "src/hooks/useRequiredActionsModal";

export const RequiredActionsButton = ({
  dagId,
  runId,
}: {
  readonly dagId: string;
  readonly runId?: string;
}) => {
  const redirectPath = runId === undefined ? `/dags/${dagId}` : `/dags/${dagId}/runs/${runId}`;
  const { onCloseRequiredActions, onOpenRequiredActions, requiredActionsOpen } =
    useRequiredActionsModal(redirectPath);

  return (
    <>
      <NeedsReviewButton dagId={dagId} onClick={onOpenRequiredActions} runId={runId} />
      <RequiredActionsModal
        dagId={dagId}
        onClose={onCloseRequiredActions}
        open={requiredActionsOpen}
        runId={runId}
      />
    </>
  );
};
