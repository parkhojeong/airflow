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
import { FiBell } from "react-icons/fi";

import { useDeadlinesServiceGetDeadlines, useTaskInstanceServiceGetHitlDetails } from "openapi/queries";
import { Tooltip } from "src/components/ui";
import { useAutoRefresh } from "src/utils";

import { NavButton } from "./NavButton";
import { NotificationsModal } from "./NotificationsModal";

const MAX_BADGE_COUNT = 99;
const NOTIFICATION_LIMIT = 10;

export const NotificationsButton = () => {
  const { onClose, onOpen, open } = useDisclosure();
  const refetchInterval = useAutoRefresh({ checkPendingRuns: true });

  const { data: hitlData } = useTaskInstanceServiceGetHitlDetails(
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

  const { data: deadlineData } = useDeadlinesServiceGetDeadlines(
    {
      dagId: "~",
      dagRunId: "~",
      limit: NOTIFICATION_LIMIT,
      missed: true,
      orderBy: ["-deadline_time"],
    },
    undefined,
    { refetchInterval },
  );

  const deadlineTotalEntries = deadlineData?.total_entries ?? 0;
  const hitlTotalEntries = hitlData?.total_entries ?? 0;
  const notificationCount = hitlTotalEntries + deadlineTotalEntries;
  const displayCount = notificationCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : notificationCount;

  return (
    <>
      <Tooltip content={`${notificationCount} active notification${notificationCount === 1 ? "" : "s"}`}>
        <Box position="relative">
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
      <NotificationsModal deadlineData={deadlineData} hitlData={hitlData} onClose={onClose} open={open} />
    </>
  );
};
