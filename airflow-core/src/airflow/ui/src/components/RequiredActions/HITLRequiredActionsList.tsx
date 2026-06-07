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
import { VStack } from "@chakra-ui/react";

import type { HITLDetailCollection } from "openapi/requests/types.gen";
import { isHITLPending } from "src/utils/hitl";

import { HITLRequiredActionSection } from "./HITLRequiredActionSection";
import type { RequiredActionsFilterMode } from "./types";
import type { SelectedHITLRequiredAction } from "./utils/requiredActionSelection";

const NO_REQUIRED_ACTIONS_LABEL = "No required actions";
const NO_HITL_ACTIONS_LABEL = "No HITL actions";
const NO_COMPLETED_HITL_ACTIONS_LABEL = "No completed HITL actions";
const PENDING_HITL_LABEL = "Pending HITL";
const COMPLETED_HITL_LABEL = "Completed HITL";

type HITLRequiredActionsListProps = {
  readonly filterMode: RequiredActionsFilterMode;
  readonly hitlData?: HITLDetailCollection;
  readonly hitlIsError: boolean;
  readonly hitlIsLoading: boolean;
  readonly onSelect: (selection: SelectedHITLRequiredAction) => void;
  readonly selectedKey?: string;
};

const getSectionLabel = (label: string, count?: number) =>
  count === undefined ? label : `${label} (${count})`;

export const HITLRequiredActionsList = ({
  filterMode,
  hitlData,
  hitlIsError,
  hitlIsLoading,
  onSelect,
  selectedKey,
}: HITLRequiredActionsListProps) => {
  const hitlDetails = hitlData?.hitl_details ?? [];
  const isShowingAllActions = filterMode === "all";
  const pendingHitlDetails = hitlDetails.filter(
    (detail) => !detail.response_received && isHITLPending(detail.task_instance.state),
  );
  const completedHitlDetails = hitlDetails.filter((detail) => Boolean(detail.response_received));

  return (
    <VStack alignItems="stretch" gap={4} width="100%">
      <HITLRequiredActionSection
        details={pendingHitlDetails}
        emptyLabel={NO_REQUIRED_ACTIONS_LABEL}
        heading={getSectionLabel(PENDING_HITL_LABEL, pendingHitlDetails.length)}
        isError={hitlIsError}
        isLoading={hitlIsLoading}
        onSelect={onSelect}
        selectedKey={selectedKey}
      />
      {isShowingAllActions ? (
        <HITLRequiredActionSection
          details={completedHitlDetails}
          emptyLabel={hitlDetails.length === 0 ? NO_HITL_ACTIONS_LABEL : NO_COMPLETED_HITL_ACTIONS_LABEL}
          heading={getSectionLabel(COMPLETED_HITL_LABEL, completedHitlDetails.length)}
          isError={hitlIsError}
          isLoading={hitlIsLoading}
          onSelect={onSelect}
          selectedKey={selectedKey}
        />
      ) : undefined}
    </VStack>
  );
};
