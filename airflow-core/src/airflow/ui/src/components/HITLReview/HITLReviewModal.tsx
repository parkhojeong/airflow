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
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { HITLDetailCollection } from "openapi/requests/types.gen.ts";
import { HITLReviewDetail } from "src/components/HITLReview/HITLReviewDetail.tsx";
import {
  ALL_REVIEWS_VALUE,
  getHITLReviewFilterMode,
  HITLReviewFilter,
  PENDING_REVIEWS_VALUE,
  type HITLReviewFilterMode,
} from "src/components/HITLReview/HITLReviewFilter.tsx";
import { HITLReviewNavigation } from "src/components/HITLReview/HITLReviewNavigation.tsx";
import { Dialog } from "src/components/ui/Dialog";

import { HITLReviewListSection } from "./HITLReviewListSection.tsx";
import { useHITLActionSelection } from "./useHITLActionSelection.ts";

const REQUIRED_ACTIONS_LINK = "/required_actions?response_received=false";

const getSectionLabel = (label: string, count?: number) =>
  count === undefined ? label : `${label} (${count})`;

export const ViewAllHITLReviewsButton = ({ onClick }: { readonly onClick: () => void }) => {
  const { t: translate } = useTranslation("hitl");

  return (
    <Button asChild size="sm" variant="outline">
      <Link onClick={onClick} to={REQUIRED_ACTIONS_LINK}>
        {translate("review.viewAll")}
      </Link>
    </Button>
  );
};

export const HITLReviewModal = ({
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
  const { t: translate } = useTranslation("hitl");
  const [selectedFilter, setSelectedFilter] = useState<HITLReviewFilterMode>(PENDING_REVIEWS_VALUE);
  const filterMode = getHITLReviewFilterMode(selectedFilter);
  const hitlDetails = hitlData?.hitl_details ?? [];
  const completedHitlDetails = hitlDetails.filter((detail) => detail.response_received);
  const pendingHitlDetails = hitlDetails.filter((detail) => !detail.response_received);
  const enabledFilter = completedHitlDetails.length > 0;
  const showAllActions = enabledFilter && filterMode === ALL_REVIEWS_VALUE;
  const actions = showAllActions ? [...pendingHitlDetails, ...completedHitlDetails] : pendingHitlDetails;
  const { onNext, onPrevious, onResponded, onSelect, selectedKey, selectionState } = useHITLActionSelection({
    actions,
    open,
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
              {translate("requiredAction_other")}
            </Heading>
            <HStack gap={2}>
              {headerAction}
              {enabledFilter ? (
                <HITLReviewFilter onChange={setSelectedFilter} value={filterMode} />
              ) : undefined}
              <HITLReviewNavigation
                canNavigate={actions.length > 0}
                hasNext={selectionState.hasNext}
                hasPrevious={selectionState.hasPrevious}
                onNext={onNext}
                onPrevious={onPrevious}
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
                <HITLReviewListSection
                  details={pendingHitlDetails}
                  emptyLabel={translate("review.emptyRequiredActions")}
                  heading={getSectionLabel(translate("review.pendingHitl"), pendingHitlDetails.length)}
                  onSelect={onSelect}
                  selectedKey={selectedKey}
                />
                {showAllActions ? (
                  <HITLReviewListSection
                    details={completedHitlDetails}
                    emptyLabel={translate("review.emptyCompletedHitl")}
                    heading={getSectionLabel(translate("review.completedHitl"), completedHitlDetails.length)}
                    onSelect={onSelect}
                    selectedKey={selectedKey}
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
              <HITLReviewDetail
                detail={selectionState.selected}
                onNavigate={onClose}
                onResponded={onResponded}
              />
            </Box>
          </HStack>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog.Root>
  );
};
