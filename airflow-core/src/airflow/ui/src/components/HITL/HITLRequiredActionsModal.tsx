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
import { Box, Button, Heading, HStack, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useTaskInstanceServiceGetHitlDetails } from "openapi/queries";
import type { HITLDetailCollection } from "openapi/requests/types.gen";
import { RequiredActionNavigation } from "src/components/RequiredActions/RequiredActionNavigation";
import {
  ALL_ACTIONS_VALUE,
  getRequiredActionsFilterMode,
  PENDING_ACTIONS_VALUE,
  RequiredActionsFilter,
} from "src/components/RequiredActions/RequiredActionsFilter";
import type { RequiredActionsFilterMode } from "src/components/RequiredActions/types";
import { Dialog } from "src/components/ui";

import { HITLRequiredActionDetailPane } from "./HITLRequiredActionDetailPane";
import { HITLRequiredActionSection } from "./HITLRequiredActionSection";
import {
  getRequiredActionSelectionState,
  useAutoSelectFirstRequiredAction,
} from "./useRequiredActionSelectionEffects";
import { createRequiredActionNavigationHandlers } from "./utils/requiredActionNavigation";
import { getHITLRequiredActionKey, type SelectedHITLRequiredAction } from "./utils/requiredActionSelection";

const VIEW_ALL_REQUIRED_ACTIONS_LABEL = "View all required actions";
const REQUIRED_ACTIONS_LINK = "/required_actions?response_received=false";
const REQUIRED_ACTIONS_LABEL = "Required actions";
const NO_REQUIRED_ACTIONS_LABEL = "No required actions";
const NO_COMPLETED_HITL_ACTIONS_LABEL = "No completed HITL actions";
const PENDING_HITL_LABEL = "Pending HITL";
const COMPLETED_HITL_LABEL = "Completed HITL";

const getSectionLabel = (label: string, count?: number) =>
  count === undefined ? label : `${label} (${count})`;

const getAllHitlData = ({
  completedHitlData,
  pendingHitlData,
}: {
  readonly completedHitlData: HITLDetailCollection;
  readonly pendingHitlData?: HITLDetailCollection;
}): HITLDetailCollection => ({
  hitl_details: [...(pendingHitlData?.hitl_details ?? []), ...completedHitlData.hitl_details],
  total_entries: (pendingHitlData?.total_entries ?? 0) + completedHitlData.total_entries,
});

export const ViewAllRequiredActionsButton = ({ onClick }: { readonly onClick: () => void }) => (
  <Button asChild size="sm" variant="outline">
    <Link onClick={onClick} to={REQUIRED_ACTIONS_LINK}>
      {VIEW_ALL_REQUIRED_ACTIONS_LABEL}
    </Link>
  </Button>
);

export const HITLRequiredActionsModal = ({
  dagId,
  headerAction,
  onClose,
  open,
  pendingHitlData,
  runId,
}: {
  readonly dagId?: string;
  readonly headerAction?: ReactNode;
  readonly onClose: () => void;
  readonly open: boolean;
  readonly pendingHitlData?: HITLDetailCollection;
  readonly runId?: string;
}) => {
  const [selectedFilter, setSelectedFilter] = useState<RequiredActionsFilterMode>(PENDING_ACTIONS_VALUE);
  const [selectedRequiredAction, setSelectedRequiredAction] = useState<
    SelectedHITLRequiredAction | undefined
  >(undefined);
  const filterMode = getRequiredActionsFilterMode(selectedFilter);
  const showAllActions = filterMode === ALL_ACTIONS_VALUE;
  const {
    data: completedHitlData,
    isError: hitlIsError,
    isLoading: hitlIsLoading,
  } = useTaskInstanceServiceGetHitlDetails({
    dagId: dagId ?? "~",
    dagRunId: runId ?? "~",
    orderBy: ["dag_id", "run_after", "created_at", "task_display_name"],
    responseReceived: true,
  });
  const hitlData =
    showAllActions && completedHitlData !== undefined
      ? getAllHitlData({ completedHitlData, pendingHitlData })
      : pendingHitlData;
  const isLoadingCompletedHitlActions = showAllActions && hitlIsLoading;
  const {
    hasNextRequiredAction,
    hasPreviousRequiredAction,
    requiredActions,
    selectedRequiredActionKey,
    visibleSelectedHITLRequiredAction,
  } = getRequiredActionSelectionState({
    hitlData,
    selected: selectedRequiredAction,
  });

  useAutoSelectFirstRequiredAction({
    open,
    requiredActions,
    setSelected: setSelectedRequiredAction,
    visibleSelected: visibleSelectedHITLRequiredAction,
  });
  const { handleNextRequiredAction, handlePreviousRequiredAction, selectNextRequiredActionAfterResponse } =
    createRequiredActionNavigationHandlers({
      requiredActions,
      selectedRequiredActionKey,
      setSelected: setSelectedRequiredAction,
    });
  const handleSelect = (next: SelectedHITLRequiredAction) => {
    setSelectedRequiredAction((current) => {
      const nextIsSelected =
        current !== undefined && getHITLRequiredActionKey(current) === getHITLRequiredActionKey(next);

      return nextIsSelected ? undefined : next;
    });
  };

  return (
    <Dialog.Root onOpenChange={onClose} open={open} scrollBehavior="inside" size="xl">
      <Dialog.Content
        backdrop
        height={{ base: "92vh", lg: "960px" }}
        maxW="1440px"
        p={4}
        width={{ base: "96vw", lg: "90vw" }}
      >
        <Dialog.Header>
          <HStack justifyContent="space-between" pr={8} width="100%">
            <Heading flexShrink={0} size="md">
              {REQUIRED_ACTIONS_LABEL}
            </Heading>
            <HStack gap={2}>
              {headerAction}
              <RequiredActionsFilter onChange={setSelectedFilter} value={filterMode} />
              <RequiredActionNavigation
                canNavigateRequiredActions={requiredActions.length > 0}
                hasNextRequiredAction={hasNextRequiredAction}
                hasPreviousRequiredAction={hasPreviousRequiredAction}
                onNext={handleNextRequiredAction}
                onPrevious={handlePreviousRequiredAction}
              />
            </HStack>
          </HStack>
        </Dialog.Header>
        <Dialog.CloseTrigger />
        <Dialog.Body>
          <HStack
            alignItems="stretch"
            flexDirection={{ base: "column", lg: "row" }}
            gap={{ base: 3, lg: 0 }}
            height="100%"
            width="100%"
          >
            <Box
              flexShrink={0}
              height={{ base: "42%", lg: "100%" }}
              overflowX="hidden"
              overflowY="auto"
              pl={2}
              position="relative"
              pr={{ base: 2, lg: 8 }}
              py={2}
              width={{ base: "100%", lg: "770px", xl: "836px" }}
              zIndex={2}
            >
              <VStack alignItems="stretch" gap={4} width="100%">
                <HITLRequiredActionSection
                  details={pendingHitlData?.hitl_details}
                  emptyLabel={NO_REQUIRED_ACTIONS_LABEL}
                  heading={getSectionLabel(PENDING_HITL_LABEL, pendingHitlData?.hitl_details.length ?? 0)}
                  onSelect={handleSelect}
                  selectedKey={selectedRequiredActionKey}
                />
                {showAllActions ? (
                  <HITLRequiredActionSection
                    details={completedHitlData?.hitl_details}
                    emptyLabel={NO_COMPLETED_HITL_ACTIONS_LABEL}
                    heading={getSectionLabel(
                      COMPLETED_HITL_LABEL,
                      completedHitlData?.hitl_details.length ?? 0,
                    )}
                    isError={hitlIsError}
                    isLoading={isLoadingCompletedHitlActions}
                    onSelect={handleSelect}
                    selectedKey={selectedRequiredActionKey}
                  />
                ) : undefined}
              </VStack>
            </Box>
            <Box
              bg="bg"
              borderColor="border"
              borderRadius="md"
              borderWidth={1}
              flex={1}
              height={{ base: "58%", lg: "100%" }}
              minW={0}
              overflowY="auto"
              p={3}
              position="relative"
              zIndex={1}
            >
              <HITLRequiredActionDetailPane
                onNavigate={onClose}
                onResponded={selectNextRequiredActionAfterResponse}
                selected={visibleSelectedHITLRequiredAction}
              />
            </Box>
          </HStack>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog.Root>
  );
};
