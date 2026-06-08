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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { HITLDetail, HITLDetailCollection } from "openapi/requests/types.gen";
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
import { getHITLRequiredActionKey } from "./utils/requiredActionSelection";

const VIEW_ALL_REQUIRED_ACTIONS_LABEL = "View all required actions";
const REQUIRED_ACTIONS_LINK = "/required_actions?response_received=false";
const REQUIRED_ACTIONS_LABEL = "Required actions";
const NO_REQUIRED_ACTIONS_LABEL = "No required actions";
const NO_COMPLETED_HITL_ACTIONS_LABEL = "No completed HITL actions";
const PENDING_HITL_LABEL = "Pending HITL";
const COMPLETED_HITL_LABEL = "Completed HITL";

const getSectionLabel = (label: string, count?: number) =>
  count === undefined ? label : `${label} (${count})`;

export const ViewAllRequiredActionsButton = ({ onClick }: { readonly onClick: () => void }) => (
  <Button asChild size="sm" variant="outline">
    <Link onClick={onClick} to={REQUIRED_ACTIONS_LINK}>
      {VIEW_ALL_REQUIRED_ACTIONS_LABEL}
    </Link>
  </Button>
);

export const HITLRequiredActionsModal = ({
  headerAction,
  hitlData,
  onClose,
  open,
}: {
  readonly headerAction?: ReactNode;
  readonly hitlData?: HITLDetailCollection;
  readonly onClose: () => void;
  readonly open: boolean;
}) => {
  const [selectedFilter, setSelectedFilter] = useState<RequiredActionsFilterMode>(PENDING_ACTIONS_VALUE);
  const [selectedRequiredAction, setSelectedRequiredAction] = useState<HITLDetail | undefined>(undefined);
  const filterMode = getRequiredActionsFilterMode(selectedFilter);
  const pendingHitlDetails = hitlData?.hitl_details.filter((detail) => !detail.response_received) ?? [];
  const completedHitlDetails = hitlData?.hitl_details.filter((detail) => detail.response_received) ?? [];
  const hasCompletedActions = completedHitlDetails.length > 0;
  const enabledFilter = hasCompletedActions;
  const showAllActions = enabledFilter && filterMode === ALL_ACTIONS_VALUE;
  const requiredActions = showAllActions
    ? [...pendingHitlDetails, ...completedHitlDetails]
    : pendingHitlDetails;
  const selectedRequiredActionKey =
    selectedRequiredAction === undefined ? undefined : getHITLRequiredActionKey(selectedRequiredAction);
  const selectedRequiredActionIndex =
    selectedRequiredActionKey === undefined
      ? -1
      : requiredActions.findIndex(
          (requiredAction) => getHITLRequiredActionKey(requiredAction) === selectedRequiredActionKey,
        );
  const hasNextRequiredAction =
    selectedRequiredActionIndex === -1
      ? requiredActions.length > 0
      : selectedRequiredActionIndex < requiredActions.length - 1;
  const hasPreviousRequiredAction =
    selectedRequiredActionIndex === -1 ? requiredActions.length > 0 : selectedRequiredActionIndex > 0;
  const visibleSelectedHITLRequiredAction =
    selectedRequiredActionIndex === -1 ? undefined : selectedRequiredAction;
  const [firstRequiredAction] = requiredActions;

  useEffect(() => {
    if (!open || visibleSelectedHITLRequiredAction !== undefined || firstRequiredAction === undefined) {
      return;
    }

    setSelectedRequiredAction(firstRequiredAction);
  }, [firstRequiredAction, open, visibleSelectedHITLRequiredAction]);

  const handleSelect = (next: HITLDetail) => {
    setSelectedRequiredAction((current) => {
      const nextIsSelected =
        current !== undefined && getHITLRequiredActionKey(current) === getHITLRequiredActionKey(next);

      return nextIsSelected ? undefined : next;
    });
  };
  const handleNextRequiredAction = () => {
    setSelectedRequiredAction(
      selectedRequiredActionIndex === -1
        ? requiredActions[0]
        : requiredActions[selectedRequiredActionIndex + 1],
    );
  };
  const handlePreviousRequiredAction = () => {
    setSelectedRequiredAction(
      selectedRequiredActionIndex === -1
        ? requiredActions.at(-1)
        : requiredActions[selectedRequiredActionIndex - 1],
    );
  };
  const selectNextRequiredActionAfterResponse = () => {
    const remainingRequiredActions = requiredActions.filter(
      (requiredAction) => getHITLRequiredActionKey(requiredAction) !== selectedRequiredActionKey,
    );

    setSelectedRequiredAction(
      selectedRequiredActionIndex === -1
        ? remainingRequiredActions[0]
        : (remainingRequiredActions[selectedRequiredActionIndex] ?? remainingRequiredActions[0]),
    );
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
              {enabledFilter ? (
                <RequiredActionsFilter onChange={setSelectedFilter} value={filterMode} />
              ) : undefined}
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
                  details={pendingHitlDetails}
                  emptyLabel={NO_REQUIRED_ACTIONS_LABEL}
                  heading={getSectionLabel(PENDING_HITL_LABEL, pendingHitlDetails.length)}
                  onSelect={handleSelect}
                  selectedKey={selectedRequiredActionKey}
                />
                {showAllActions ? (
                  <HITLRequiredActionSection
                    details={completedHitlDetails}
                    emptyLabel={NO_COMPLETED_HITL_ACTIONS_LABEL}
                    heading={getSectionLabel(COMPLETED_HITL_LABEL, completedHitlDetails.length)}
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
