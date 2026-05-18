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
import { Box, HStack, Separator, Text, VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useMemo } from "react";

import type {
  DeadlineCollectionResponse,
  DeadlineResponse,
  HITLDetail,
  HITLDetailCollection,
} from "openapi/requests/types.gen";
import { getRelativeTime } from "src/utils/datetimeUtils";

import { NotificationSectionHeading } from "./NotificationCard";

const MISSED_DEADLINES_LABEL = "Missed deadlines";
const LOAD_DEADLINES_ERROR_LABEL = "Unable to load deadline alerts";
const LOAD_HITL_ERROR_LABEL = "Unable to load pending HITL actions";
const LOADING_DEADLINES_LABEL = "Loading deadline alerts...";
const LOADING_HITL_LABEL = "Loading pending HITL actions...";
const NO_MISSED_DEADLINES_LABEL = "No missed deadlines";
const NO_REQUIRED_ACTIONS_LABEL = "No required actions";
const PENDING_HITL_LABEL = "Pending HITL";
const UNTITLED_DEADLINE_LABEL = "Missed deadline";

export type SelectedNotification =
  | { readonly item: DeadlineResponse; readonly type: "deadline" }
  | { readonly item: HITLDetail; readonly type: "hitl" };

export const getNotificationKey = (selection: SelectedNotification): string =>
  selection.type === "hitl" ? `hitl:${selection.item.task_instance.id}` : `deadline:${selection.item.id}`;

type NotificationsListProps = {
  readonly deadlineData?: DeadlineCollectionResponse;
  readonly deadlineIsError: boolean;
  readonly deadlineIsLoading: boolean;
  readonly hitlData?: HITLDetailCollection;
  readonly hitlIsError: boolean;
  readonly hitlIsLoading: boolean;
  readonly onSelect: (selection: SelectedNotification) => void;
  readonly selectedKey?: string;
};

type DagGroup<T> = {
  readonly dagDisplayName?: string;
  readonly dagId: string;
  readonly items: Array<T>;
};

const getDisplayName = (displayName: string | null | undefined, id: string) =>
  displayName !== null && displayName !== undefined && displayName !== "" ? displayName : id;

const getSectionLabel = (label: string, count?: number) =>
  count === undefined ? label : `${label} (${count})`;

const groupByDag = <T,>(
  items: Array<T>,
  getDagId: (item: T) => string,
  getDagDisplayName?: (item: T) => string | null | undefined,
): Array<DagGroup<T>> => {
  const groups = new Map<string, DagGroup<T>>();

  for (const item of items) {
    const dagId = getDagId(item);
    const existing = groups.get(dagId);

    if (existing === undefined) {
      groups.set(dagId, {
        dagDisplayName: getDagDisplayName?.(item) ?? undefined,
        dagId,
        items: [item],
      });
    } else {
      existing.items.push(item);
    }
  }

  return [...groups.values()];
};

export const getNotificationsInDisplayOrder = ({
  deadlines,
  hitlDetails,
}: {
  readonly deadlines: Array<DeadlineResponse>;
  readonly hitlDetails: Array<HITLDetail>;
}): Array<SelectedNotification> => {
  const hitlNotifications = groupByDag(
    hitlDetails,
    (detail) => detail.task_instance.dag_id,
    (detail) => detail.task_instance.dag_display_name,
  ).flatMap((group) => group.items.map((item) => ({ item, type: "hitl" }) as const));
  const deadlineNotifications = groupByDag(deadlines, (deadline) => deadline.dag_id).flatMap((group) =>
    group.items.map((item) => ({ item, type: "deadline" }) as const),
  );

  return [...hitlNotifications, ...deadlineNotifications];
};

export const formatNotificationTime = (datetime?: string) => {
  if (datetime === undefined) {
    return undefined;
  }

  const date = dayjs(datetime);

  if (!date.isValid()) {
    return undefined;
  }

  return date.isSame(dayjs(), "day") ? date.format("h:mm A") : date.format("MMM DD");
};

export const formatNotificationDetailTime = (datetime?: string) => {
  if (datetime === undefined) {
    return undefined;
  }

  const date = dayjs(datetime);

  if (!date.isValid()) {
    return undefined;
  }

  const timestamp = date.isSame(dayjs(), "day") ? date.format("h:mm A") : date.format("ddd, MMM D, h:mm A");
  const relative = getRelativeTime(datetime);

  return relative === "" ? timestamp : `${timestamp} (${relative})`;
};

const NotificationRow = ({
  datetime,
  label,
  onSelect,
  selected,
}: {
  readonly datetime?: string;
  readonly label: string;
  readonly onSelect: () => void;
  readonly selected: boolean;
}) => {
  const formattedTime = formatNotificationTime(datetime);

  return (
    <Box
      _after={
        selected
          ? {
              bg: "border.emphasized",
              content: '""',
              height: "1px",
              left: "100%",
              pointerEvents: "none",
              position: "absolute",
              top: "50%",
              width: 16,
              zIndex: 1,
            }
          : undefined
      }
      _hover={{ bg: selected ? "bg.muted" : "bg.subtle" }}
      aria-pressed={selected}
      as="button"
      bg={selected ? "bg.muted" : undefined}
      borderRadius="sm"
      cursor="pointer"
      onClick={onSelect}
      position="relative"
      px={2}
      py={1}
      textAlign="left"
      width="100%"
      zIndex={selected ? 2 : undefined}
    >
      <HStack gap={2} minW={0} width="100%">
        <Text
          color={selected ? "fg" : "fg.muted"}
          flex={1}
          fontSize="xs"
          fontWeight={selected ? "semibold" : "normal"}
          minW={0}
          truncate
        >
          • {label}
        </Text>
        {formattedTime === undefined ? undefined : (
          <Text color="fg.subtle" flexShrink={0} fontSize="xs">
            {formattedTime}
          </Text>
        )}
      </HStack>
    </Box>
  );
};

const DagSection = ({
  children,
  dagDisplayName,
  dagId,
}: {
  readonly children: React.ReactNode;
  readonly dagDisplayName?: string;
  readonly dagId: string;
}) => (
  <VStack alignItems="stretch" gap={1} px={2} width="100%">
    <Text color="fg.muted" fontSize="xs" fontWeight="semibold" pl={1.5} pr={3} truncate>
      {getDisplayName(dagDisplayName, dagId)}
    </Text>
    <VStack alignItems="stretch" gap={0.5} pl={5} pt={2} width="100%">
      {children}
    </VStack>
  </VStack>
);

const StatusText = ({
  children,
  tone = "muted",
}: {
  readonly children: string;
  readonly tone?: "error" | "muted";
}) => (
  <Text color={tone === "error" ? "fg.error" : "fg.muted"} fontSize="sm" px={3}>
    {children}
  </Text>
);

const NotificationSection = ({ children }: { readonly children: React.ReactNode }) => (
  <VStack
    alignItems="stretch"
    bg="bg"
    borderColor="border"
    borderRadius="md"
    borderWidth={1}
    gap={2}
    py={2}
    width="100%"
  >
    {children}
  </VStack>
);

const DagSections = ({ children }: { readonly children: React.ReactNode }) => (
  <VStack alignItems="stretch" gap={3} separator={<Separator borderColor="border" />} width="100%">
    {children}
  </VStack>
);

const SectionHeader = ({ children }: { readonly children: string }) => (
  <Box px={2}>
    <NotificationSectionHeading>{children}</NotificationSectionHeading>
  </Box>
);

export const NotificationsList = ({
  deadlineData,
  deadlineIsError,
  deadlineIsLoading,
  hitlData,
  hitlIsError,
  hitlIsLoading,
  onSelect,
  selectedKey,
}: NotificationsListProps) => {
  const deadlines = useMemo(() => deadlineData?.deadlines ?? [], [deadlineData?.deadlines]);
  const hitlDetails = useMemo(() => hitlData?.hitl_details ?? [], [hitlData?.hitl_details]);

  const hitlGroups = useMemo(
    () =>
      groupByDag(
        hitlDetails,
        (detail) => detail.task_instance.dag_id,
        (detail) => detail.task_instance.dag_display_name,
      ),
    [hitlDetails],
  );
  const deadlineGroups = useMemo(() => groupByDag(deadlines, (deadline) => deadline.dag_id), [deadlines]);

  return (
    <VStack alignItems="stretch" gap={4} width="100%">
      <NotificationSection>
        <SectionHeader>{getSectionLabel(PENDING_HITL_LABEL, hitlDetails.length)}</SectionHeader>
        {hitlIsLoading ? (
          <StatusText>{LOADING_HITL_LABEL}</StatusText>
        ) : hitlIsError ? (
          <StatusText tone="error">{LOAD_HITL_ERROR_LABEL}</StatusText>
        ) : hitlDetails.length > 0 ? (
          <DagSections>
            {hitlGroups.map((group) => (
              <DagSection dagDisplayName={group.dagDisplayName} dagId={group.dagId} key={group.dagId}>
                {group.items.map((detail) => {
                  const key = getNotificationKey({ item: detail, type: "hitl" });

                  return (
                    <NotificationRow
                      datetime={detail.created_at}
                      key={key}
                      label={detail.subject}
                      onSelect={() => onSelect({ item: detail, type: "hitl" })}
                      selected={selectedKey === key}
                    />
                  );
                })}
              </DagSection>
            ))}
          </DagSections>
        ) : (
          <StatusText>{NO_REQUIRED_ACTIONS_LABEL}</StatusText>
        )}
      </NotificationSection>
      <NotificationSection>
        <SectionHeader>{getSectionLabel(MISSED_DEADLINES_LABEL, deadlines.length)}</SectionHeader>
        {deadlineIsLoading ? (
          <StatusText>{LOADING_DEADLINES_LABEL}</StatusText>
        ) : deadlineIsError ? (
          <StatusText tone="error">{LOAD_DEADLINES_ERROR_LABEL}</StatusText>
        ) : deadlines.length > 0 ? (
          <DagSections>
            {deadlineGroups.map((group) => (
              <DagSection dagId={group.dagId} key={group.dagId}>
                {group.items.map((deadline) => {
                  const key = getNotificationKey({ item: deadline, type: "deadline" });

                  return (
                    <NotificationRow
                      datetime={deadline.deadline_time}
                      key={key}
                      label={deadline.alert_name ?? UNTITLED_DEADLINE_LABEL}
                      onSelect={() => onSelect({ item: deadline, type: "deadline" })}
                      selected={selectedKey === key}
                    />
                  );
                })}
              </DagSection>
            ))}
          </DagSections>
        ) : (
          <StatusText>{NO_MISSED_DEADLINES_LABEL}</StatusText>
        )}
      </NotificationSection>
    </VStack>
  );
};
