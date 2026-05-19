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
import { Box, Heading, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import type { DeadlineCollectionResponse, HITLDetailCollection } from "openapi/requests/types.gen";
import { Dialog, Tooltip } from "src/components/ui";

import { DeadlineNotificationCard } from "./DeadlineNotificationCard";
import { HITLNotificationCard } from "./HITLNotificationCard";
import {
  getNotificationKey,
  getNotificationsInDisplayOrder,
  NotificationsList,
  type SelectedNotification,
} from "./NotificationsList";
import { prefetchHitlDetail } from "./notificationPrefetchUtils";

const NOTIFICATIONS_LABEL = "Notifications";
const EMPTY_DETAIL_LABEL = "Select a notification to see details";
const LOADING_NOTIFICATIONS_LABEL = "Loading notifications...";
const NEXT_NOTIFICATION_LABEL = "Next";
const PREVIOUS_NOTIFICATION_LABEL = "Prev";

type NotificationsModalProps = {
  readonly deadlineData?: DeadlineCollectionResponse;
  readonly deadlineIsError: boolean;
  readonly deadlineIsLoading: boolean;
  readonly hitlData?: HITLDetailCollection;
  readonly hitlIsError: boolean;
  readonly hitlIsLoading: boolean;
  readonly onClose: () => void;
  readonly open: boolean;
};

const isSelectedNotificationStillInFetchedData = ({
  deadlineData,
  deadlineIsLoading,
  hitlData,
  hitlIsLoading,
  selectedNotification,
}: {
  readonly deadlineData?: DeadlineCollectionResponse;
  readonly deadlineIsLoading: boolean;
  readonly hitlData?: HITLDetailCollection;
  readonly hitlIsLoading: boolean;
  readonly selectedNotification?: SelectedNotification;
}) => {
  if (selectedNotification === undefined) {
    return false;
  }

  const selectedNotificationKey = getNotificationKey(selectedNotification);

  if (selectedNotification.type === "hitl") {
    if (hitlIsLoading) {
      return true;
    }

    return (
      hitlData?.hitl_details.some(
        (hitlDetail) => getNotificationKey({ item: hitlDetail, type: "hitl" }) === selectedNotificationKey,
      ) === true
    );
  }

  if (deadlineIsLoading) {
    return true;
  }

  return (
    deadlineData?.deadlines.some(
      (deadline) => getNotificationKey({ item: deadline, type: "deadline" }) === selectedNotificationKey,
    ) === true
  );
};

const getNotifications = ({
  deadlineData,
  hitlData,
}: {
  readonly deadlineData?: DeadlineCollectionResponse;
  readonly hitlData?: HITLDetailCollection;
}) =>
  getNotificationsInDisplayOrder({
    deadlines: deadlineData?.deadlines ?? [],
    hitlDetails: hitlData?.hitl_details ?? [],
  });

const getNextNotification = ({
  notifications,
  selectedNotificationKey,
}: {
  readonly notifications: Array<SelectedNotification>;
  readonly selectedNotificationKey?: string;
}) => {
  if (selectedNotificationKey === undefined) {
    return notifications[0];
  }

  const selectedNotificationIndex = notifications.findIndex(
    (notification) => getNotificationKey(notification) === selectedNotificationKey,
  );

  if (selectedNotificationIndex === -1) {
    return notifications[0];
  }

  return notifications[selectedNotificationIndex + 1];
};

const getPreviousNotification = ({
  notifications,
  selectedNotificationKey,
}: {
  readonly notifications: Array<SelectedNotification>;
  readonly selectedNotificationKey?: string;
}) => {
  if (selectedNotificationKey === undefined) {
    return notifications.at(-1);
  }

  const selectedNotificationIndex = notifications.findIndex(
    (notification) => getNotificationKey(notification) === selectedNotificationKey,
  );

  if (selectedNotificationIndex === -1) {
    return notifications.at(-1);
  }

  return notifications[selectedNotificationIndex - 1];
};

const getNextNotificationAfterResponse = ({
  notifications,
  selectedNotificationKey,
}: {
  readonly notifications: Array<SelectedNotification>;
  readonly selectedNotificationKey?: string;
}) => {
  const selectedNotificationIndex = notifications.findIndex(
    (notification) => getNotificationKey(notification) === selectedNotificationKey,
  );
  const remainingNotifications = notifications.filter(
    (notification) => getNotificationKey(notification) !== selectedNotificationKey,
  );

  if (selectedNotificationIndex === -1) {
    return remainingNotifications[0];
  }

  return remainingNotifications[selectedNotificationIndex] ?? remainingNotifications[0];
};

const NotificationNavigation = ({
  canNavigateNotifications,
  hasNextNotification,
  hasPreviousNotification,
  onNext,
  onPrevious,
}: {
  readonly canNavigateNotifications: boolean;
  readonly hasNextNotification: boolean;
  readonly hasPreviousNotification: boolean;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
}) => (
  <HStack gap={1}>
    <Tooltip content={PREVIOUS_NOTIFICATION_LABEL}>
      <IconButton
        aria-label={PREVIOUS_NOTIFICATION_LABEL}
        disabled={!canNavigateNotifications || !hasPreviousNotification}
        onClick={onPrevious}
        size="xs"
        variant="ghost"
      >
        <FiChevronLeft />
      </IconButton>
    </Tooltip>
    <Tooltip content={NEXT_NOTIFICATION_LABEL}>
      <IconButton
        aria-label={NEXT_NOTIFICATION_LABEL}
        disabled={!canNavigateNotifications || !hasNextNotification}
        onClick={onNext}
        size="xs"
        variant="ghost"
      >
        <FiChevronRight />
      </IconButton>
    </Tooltip>
  </HStack>
);

const NotificationDetailPane = ({
  isLoading,
  onNavigate,
  onResponded,
  selected,
}: {
  readonly isLoading: boolean;
  readonly onNavigate: () => void;
  readonly onResponded: () => void;
  readonly selected?: SelectedNotification;
}) => {
  if (selected === undefined) {
    return (
      <VStack alignItems="center" gap={2} justifyContent="center" minH="240px" width="100%">
        <Text color="fg.muted" fontSize="sm">
          {isLoading ? LOADING_NOTIFICATIONS_LABEL : EMPTY_DETAIL_LABEL}
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
        onResponded={onResponded}
      />
    );
  }

  return <DeadlineNotificationCard deadline={selected.item} key={selected.item.id} onNavigate={onNavigate} />;
};

export const NotificationsModal = ({
  deadlineData,
  deadlineIsError,
  deadlineIsLoading,
  hitlData,
  hitlIsError,
  hitlIsLoading,
  onClose,
  open,
}: NotificationsModalProps) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<SelectedNotification | undefined>(undefined);
  const effectiveDeadlineIsLoading = open && deadlineData === undefined && !deadlineIsError;
  const effectiveHitlIsLoading = open && hitlData === undefined && !hitlIsError;
  const notifications = useMemo(() => getNotifications({ deadlineData, hitlData }), [deadlineData, hitlData]);

  const selectedNotificationKey = selected === undefined ? undefined : getNotificationKey(selected);
  const selectedNotificationIndex = notifications.findIndex(
    (notification) => getNotificationKey(notification) === selectedNotificationKey,
  );
  const hasNextNotification =
    selectedNotificationIndex === -1
      ? notifications.length > 0
      : selectedNotificationIndex < notifications.length - 1;
  const hasPreviousNotification =
    selectedNotificationIndex === -1 ? notifications.length > 0 : selectedNotificationIndex > 0;
  const visibleSelectedNotification = isSelectedNotificationStillInFetchedData({
    deadlineData,
    deadlineIsLoading: deadlineIsLoading || effectiveDeadlineIsLoading,
    hitlData,
    hitlIsLoading: hitlIsLoading || effectiveHitlIsLoading,
    selectedNotification: selected,
  })
    ? selected
    : undefined;

  useEffect(() => {
    if (selectedNotificationIndex === -1) {
      return;
    }

    const adjacentNotifications = [
      notifications[selectedNotificationIndex - 1],
      notifications[selectedNotificationIndex + 1],
    ];

    for (const notification of adjacentNotifications) {
      if (notification?.type === "hitl") {
        prefetchHitlDetail(queryClient, notification.item);
      }
    }
  }, [notifications, queryClient, selectedNotificationIndex]);

  const selectNextNotification = () => {
    setSelected(
      getNextNotificationAfterResponse({
        notifications,
        selectedNotificationKey,
      }),
    );
  };

  const handleNextNotification = () => {
    setSelected(getNextNotification({ notifications, selectedNotificationKey }));
  };

  const handlePreviousNotification = () => {
    setSelected(getPreviousNotification({ notifications, selectedNotificationKey }));
  };

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
        maxW="1440px"
        p={4}
        width={{ base: "96vw", lg: "90vw" }}
      >
        <Dialog.Header>
          <HStack justifyContent="space-between" pr={8} width="100%">
            <Heading flexShrink={0} size="md">
              {NOTIFICATIONS_LABEL}
            </Heading>
            <NotificationNavigation
              canNavigateNotifications={notifications.length > 0}
              hasNextNotification={hasNextNotification}
              hasPreviousNotification={hasPreviousNotification}
              onNext={handleNextNotification}
              onPrevious={handlePreviousNotification}
            />
          </HStack>
        </Dialog.Header>
        <Dialog.CloseTrigger />
        <Dialog.Body>
          <HStack alignItems="stretch" gap={0} height="100%" width="100%">
            <Box
              flexShrink={0}
              height="100%"
              overflowX="hidden"
              overflowY="auto"
              pl={2}
              position="relative"
              pr={8}
              py={2}
              width={{ base: "50%", md: "768px" }}
              zIndex={2}
            >
              <NotificationsList
                deadlineData={deadlineData}
                deadlineIsError={deadlineIsError}
                deadlineIsLoading={deadlineIsLoading || effectiveDeadlineIsLoading}
                hitlData={hitlData}
                hitlIsError={hitlIsError}
                hitlIsLoading={hitlIsLoading || effectiveHitlIsLoading}
                onSelect={handleSelect}
                selectedKey={selectedNotificationKey}
              />
            </Box>
            <Box
              bg="bg"
              borderColor="border"
              borderRadius="md"
              borderWidth={1}
              flex={1}
              height="100%"
              minW={0}
              overflowY="auto"
              p={3}
              position="relative"
              zIndex={1}
            >
              <NotificationDetailPane
                isLoading={
                  hitlIsLoading || deadlineIsLoading || effectiveHitlIsLoading || effectiveDeadlineIsLoading
                }
                onNavigate={onClose}
                onResponded={selectNextNotification}
                selected={visibleSelectedNotification}
              />
            </Box>
          </HStack>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog.Root>
  );
};
