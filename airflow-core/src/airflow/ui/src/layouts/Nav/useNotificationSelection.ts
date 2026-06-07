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
import type { QueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import type { HITLDetailCollection } from "openapi/requests/types.gen";

import { getNotificationKey, type SelectedNotification } from "./NotificationsList";
import { prefetchHitlDetail } from "./notificationPrefetchUtils";

const isSelectedNotificationStillInFetchedData = ({
  hitlData,
  hitlIsLoading,
  selectedNotification,
}: {
  readonly hitlData?: HITLDetailCollection;
  readonly hitlIsLoading: boolean;
  readonly selectedNotification?: SelectedNotification;
}) => {
  if (selectedNotification === undefined) {
    return false;
  }

  const selectedNotificationKey = getNotificationKey(selectedNotification);

  if (hitlIsLoading) {
    return true;
  }

  return (
    hitlData?.hitl_details.some(
      (hitlDetail) => getNotificationKey({ item: hitlDetail, type: "hitl" }) === selectedNotificationKey,
    ) === true
  );
};

const getNotifications = ({ hitlData }: { readonly hitlData?: HITLDetailCollection }) =>
  (hitlData?.hitl_details ?? []).map((item) => ({ item, type: "hitl" }) as const);

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

export const useNotificationSelection = ({
  hitlData,
  isLoading,
  open,
  queryClient,
}: {
  readonly hitlData?: HITLDetailCollection;
  readonly isLoading: boolean;
  readonly open: boolean;
  readonly queryClient: QueryClient;
}) => {
  const [selected, setSelected] = useState<SelectedNotification | undefined>(undefined);
  const notifications = getNotifications({ hitlData });
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
    hitlData,
    hitlIsLoading: isLoading,
    selectedNotification: selected,
  })
    ? selected
    : undefined;

  useEffect(() => {
    if (
      selectedNotificationKey === undefined ||
      isLoading ||
      hitlData === undefined ||
      selectedNotificationIndex !== -1
    ) {
      return;
    }

    setSelected(undefined);
  }, [hitlData, isLoading, selectedNotificationIndex, selectedNotificationKey]);

  useEffect(() => {
    if (!open || selected !== undefined) {
      return;
    }

    const [firstNotification] = getNotifications({ hitlData });

    if (firstNotification !== undefined) {
      setSelected(firstNotification);
    }
  }, [hitlData, open, selected]);

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

  const handleSelect = (next: SelectedNotification) => {
    setSelected((current) => {
      const nextIsSelected =
        current !== undefined && getNotificationKey(current) === getNotificationKey(next);

      return nextIsSelected ? undefined : next;
    });
  };

  return {
    canNavigateNotifications: notifications.length > 0,
    handleNextNotification,
    handlePreviousNotification,
    handleSelect,
    hasNextNotification,
    hasPreviousNotification,
    selectedNotificationKey,
    selectNextNotification,
    visibleSelectedNotification,
  };
};
