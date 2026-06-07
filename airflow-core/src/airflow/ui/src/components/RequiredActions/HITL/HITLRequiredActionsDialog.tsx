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
import { Box, Heading, HStack } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import type { HITLDetailCollection } from "openapi/requests/types.gen";
import { Dialog } from "src/components/ui";

import { RequiredActionDetailPane } from "../RequiredActionDetailPane";
import { RequiredActionNavigation } from "../RequiredActionNavigation";
import type { RequiredActionsFilterMode } from "../types";
import { HITLRequiredActionsList } from "./HITLRequiredActionsList";
import { useRequiredActionSelection } from "./useRequiredActionSelection";

const REQUIRED_ACTIONS_LABEL = "Required actions";

type HITLRequiredActionsDialogProps = {
  readonly filterMode: RequiredActionsFilterMode;
  readonly headerAction?: ReactNode;
  readonly hitlData?: HITLDetailCollection;
  readonly hitlIsError: boolean;
  readonly hitlIsLoading: boolean;
  readonly onClose: () => void;
  readonly open: boolean;
};

export const HITLRequiredActionsDialog = ({
  filterMode,
  headerAction,
  hitlData,
  hitlIsError,
  hitlIsLoading,
  onClose,
  open,
}: HITLRequiredActionsDialogProps) => {
  const queryClient = useQueryClient();

  const effectiveHitlIsLoading = open && hitlData === undefined && !hitlIsError;
  const isLoadingHitlRequiredActions = hitlIsLoading || effectiveHitlIsLoading;
  const {
    canNavigateRequiredActions,
    handleNextRequiredAction,
    handlePreviousRequiredAction,
    handleSelect,
    hasNextRequiredAction,
    hasPreviousRequiredAction,
    selectedRequiredActionKey,
    selectNextRequiredActionAfterResponse,
    visibleSelectedHITLRequiredAction,
  } = useRequiredActionSelection({
    hitlData,
    isLoading: isLoadingHitlRequiredActions,
    open,
    queryClient,
  });

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
              <RequiredActionNavigation
                canNavigateRequiredActions={canNavigateRequiredActions}
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
              <HITLRequiredActionsList
                filterMode={filterMode}
                hitlData={hitlData}
                hitlIsError={hitlIsError}
                hitlIsLoading={isLoadingHitlRequiredActions}
                onSelect={handleSelect}
                selectedKey={selectedRequiredActionKey}
              />
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
              <RequiredActionDetailPane
                isLoading={isLoadingHitlRequiredActions}
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
