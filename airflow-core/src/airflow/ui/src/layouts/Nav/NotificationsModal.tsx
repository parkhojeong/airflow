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
import { Box, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";

import type { DeadlineCollectionResponse, HITLDetailCollection } from "openapi/requests/types.gen";
import { ButtonGroupToggle, Dialog, type ButtonGroupOption } from "src/components/ui";

import { DeadlineNotificationCard } from "./DeadlineNotificationCard";
import { HITLNotificationCard } from "./HITLNotificationCard";
import {
  getNotificationKey,
  type NotificationFilter,
  NotificationsList,
  type SelectedNotification,
} from "./NotificationsList";

const NOTIFICATIONS_LABEL = "Notifications";
const ALL_LABEL = "All";
const HITL_LABEL = "HITL";
const DEADLINES_LABEL = "Deadlines";
const EMPTY_DETAIL_LABEL = "Select a notification to see details";

type NotificationsModalProps = {
  readonly deadlineData?: DeadlineCollectionResponse;
  readonly deadlineIsError: boolean;
  readonly deadlineIsLoading: boolean;
  readonly deadlineTotal: number;
  readonly hitlData?: HITLDetailCollection;
  readonly hitlIsError: boolean;
  readonly hitlIsLoading: boolean;
  readonly hitlTotal: number;
  readonly onClose: () => void;
  readonly open: boolean;
};

const NotificationDetailPane = ({
  onNavigate,
  selected,
}: {
  readonly onNavigate: () => void;
  readonly selected?: SelectedNotification;
}) => {
  if (selected === undefined) {
    return (
      <VStack alignItems="center" gap={2} justifyContent="center" minH="240px" width="100%">
        <Text color="fg.muted" fontSize="sm">
          {EMPTY_DETAIL_LABEL}
        </Text>
      </VStack>
    );
  }

  if (selected.type === "hitl") {
    return (
      <HITLNotificationCard
        detail={selected.item}
        key={selected.item.task_instance.id}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <DeadlineNotificationCard
      deadline={selected.item}
      key={selected.item.id}
      onNavigate={onNavigate}
    />
  );
};

export const NotificationsModal = ({
  deadlineData,
  deadlineIsError,
  deadlineIsLoading,
  deadlineTotal,
  hitlData,
  hitlIsError,
  hitlIsLoading,
  hitlTotal,
  onClose,
  open,
}: NotificationsModalProps) => {
  const [notificationFilter, setNotificationFilter] = useState<NotificationFilter>("all");
  const [selected, setSelected] = useState<SelectedNotification | undefined>(undefined);

  const notificationTotal = hitlTotal + deadlineTotal;
  const filterOptions: Array<ButtonGroupOption<NotificationFilter>> = [
    { label: `${ALL_LABEL} (${notificationTotal})`, value: "all" },
    { label: `${HITL_LABEL} (${hitlTotal})`, value: "hitl" },
    { label: `${DEADLINES_LABEL} (${deadlineTotal})`, value: "deadline" },
  ];

  const selectedKey = useMemo(
    () => (selected === undefined ? undefined : getNotificationKey(selected)),
    [selected],
  );

  const handleFilterChange = useCallback((next: NotificationFilter) => {
    setNotificationFilter(next);
    setSelected(undefined);
  }, []);

  const handleSelect = useCallback((next: SelectedNotification) => {
    setSelected((current) =>
      current !== undefined && getNotificationKey(current) === getNotificationKey(next) ? undefined : next,
    );
  }, []);

  return (
    <Dialog.Root onOpenChange={onClose} open={open} scrollBehavior="inside" size="xl">
      <Dialog.Content
        backdrop
        height={{ base: "92vh", lg: "960px" }}
        maxW="1100px"
        p={4}
        width={{ base: "96vw", lg: "75vw" }}
      >
        <Dialog.Header>
          <HStack flexWrap="wrap" gap={4}>
            <Heading flexShr이 nk={0} size="md">
              {NOTIFICATIONS_LABEL}
            </Heading>
            <ButtonGroupToggle<NotificationFilter>
              onChange={handleFilterChange}
              options={filterOptions}
              value={notificationFilter}
            />
          </HStack>
        </Dialog.Header>
        <Dialog.CloseTrigger />
        <Dialog.Body>
          <HStack alignItems="stretch" gap={4} height="100%" width="100%">
            <Box
              borderColor="border"
              borderRadius="md"
              borderWidth={1}
              flexShrink={0}
              height="100%"
              overflowY="auto"
              p={2}
              width={{ base: "50%", md: "480px" }}
            >
              <NotificationsList
                deadlineData={deadlineData}
                deadlineIsError={deadlineIsError}
                deadlineIsLoading={deadlineIsLoading}
                hitlData={hitlData}
                hitlIsError={hitlIsError}
                hitlIsLoading={hitlIsLoading}
                notificationFilter={notificationFilter}
                onSelect={handleSelect}
                selectedKey={selectedKey}
              />
            </Box>
            <Box flex={1} height="100%" minW={0} overflowY="auto">
              <NotificationDetailPane onNavigate={onClose} selected={selected} />
            </Box>
          </HStack>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog.Root>
  );
};
