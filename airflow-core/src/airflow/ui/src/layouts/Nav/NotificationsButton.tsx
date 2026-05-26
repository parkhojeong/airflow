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
import { Badge, Box, useDisclosure } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { FiBell } from "react-icons/fi";

import { useTaskInstanceServiceGetHitlDetails } from "openapi/queries";
import { prefetchUseTaskInstanceServiceGetHitlDetails } from "openapi/queries/prefetch";
import { Tooltip } from "src/components/ui";
import { useAutoRefresh } from "src/utils";

import { NavButton } from "./NavButton";
import { NotificationsModal } from "./NotificationsModal";

const MAX_BADGE_COUNT = 99;
const NOTIFICATION_LIMIT = 10;

export const NotificationsButton = () => {
  const { onClose, onOpen, open } = useDisclosure();
  const refetchInterval = useAutoRefresh({ checkPendingRuns: true });
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    if (open) {
      return;
    }
    void prefetchUseTaskInstanceServiceGetHitlDetails(queryClient, {
      dagId: "~",
      dagRunId: "~",
      limit: NOTIFICATION_LIMIT,
      orderBy: ["created_at"],
      responseReceived: false,
      state: ["deferred"],
    });
  };

  const { data: hitlSummaryData } = useTaskInstanceServiceGetHitlDetails(
    {
      dagId: "~",
      dagRunId: "~",
      limit: NOTIFICATION_LIMIT,
      orderBy: ["created_at"],
      responseReceived: false,
      state: ["deferred"],
    },
    undefined,
    { refetchInterval },
  );

  const {
    data: hitlData,
    isError: isHitlError,
    isLoading: isHitlLoading,
  } = useTaskInstanceServiceGetHitlDetails(
    {
      dagId: "~",
      dagRunId: "~",
      limit: NOTIFICATION_LIMIT,
      orderBy: ["created_at"],
      responseReceived: false,
      state: ["deferred"],
    },
    undefined,
    { enabled: open, refetchInterval },
  );

  const hitlTotalEntries = hitlSummaryData?.total_entries ?? 0;
  const notificationCount = hitlTotalEntries;
  const displayCount = notificationCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : notificationCount;
  const expectedHitlCount = Math.min(hitlTotalEntries, NOTIFICATION_LIMIT);
  const modalHitlIsLoading =
    isHitlLoading || (open && !isHitlError && (hitlData?.hitl_details.length ?? 0) < expectedHitlCount);

  return (
    <>
      <Tooltip content={`${notificationCount} active notification${notificationCount === 1 ? "" : "s"}`}>
        <Box onMouseEnter={handleMouseEnter} position="relative">
          <NavButton icon={FiBell} onClick={onOpen} title="Notifications" />
          {notificationCount > 0 ? (
            <Badge
              alignItems="center"
              borderRadius="full"
              colorPalette="red"
              display="flex"
              fontSize="2xs"
              height={5}
              justifyContent="center"
              minW={5}
              position="absolute"
              right={0}
              top={0}
              variant="solid"
              zIndex={1}
            >
              {displayCount}
            </Badge>
          ) : undefined}
        </Box>
      </Tooltip>
      <NotificationsModal
        hitlData={hitlData}
        hitlIsError={isHitlError}
        hitlIsLoading={modalHitlIsLoading}
        onClose={onClose}
        open={open}
      />
    </>
  );
};
