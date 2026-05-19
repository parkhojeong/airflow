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
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useMemo } from "react";

import type {
  DeadlineCollectionResponse,
  DeadlineResponse,
  HITLDetail,
  HITLDetailCollection,
} from "openapi/requests/types.gen";
import Time from "src/components/Time";
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

export const DAG_RUN_META_DATE_FORMAT = "MMM D, h:mm:ss A";

const DAG_RUN_TYPES = new Set([
  "asset_materialization",
  "asset_triggered",
  "backfill",
  "manual",
  "operator_triggered",
  "scheduled",
]);

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

type DagRunGroup<T> = {
  readonly dagRunId: string;
  readonly fallbackRunAfter?: string;
  readonly items: Array<T>;
};

const getSectionLabel = (label: string, count?: number) =>
  count === undefined ? label : `${label} (${count})`;

const getTimestamp = (datetime?: string) => {
  const date = dayjs(datetime);

  return date.isValid() ? date.valueOf() : 0;
};

const compareStrings = (left: string, right: string) => left.localeCompare(right);

const compareDates = (left?: string, right?: string) => getTimestamp(left) - getTimestamp(right);

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

const groupByDagRun = <T,>(
  items: Array<T>,
  getDagRunId: (item: T) => string,
  getFallbackRunAfter?: (item: T) => string | undefined,
): Array<DagRunGroup<T>> => {
  const groups = new Map<string, DagRunGroup<T>>();

  for (const item of items) {
    const dagRunId = getDagRunId(item);
    const existing = groups.get(dagRunId);

    if (existing === undefined) {
      groups.set(dagRunId, {
        dagRunId,
        fallbackRunAfter: getFallbackRunAfter?.(item),
        items: [item],
      });
    } else {
      existing.items.push(item);
    }
  }

  return [...groups.values()];
};

const getDagRunOrderTimestamp = (dagRunId: string, fallbackRunAfter?: string) => {
  const [runType, runAfterWithSuffix] = dagRunId.split("__");

  if (runType === undefined || runAfterWithSuffix === undefined || !DAG_RUN_TYPES.has(runType)) {
    return getTimestamp(fallbackRunAfter);
  }

  const runAfter = dayjs(runAfterWithSuffix).isValid()
    ? runAfterWithSuffix
    : runAfterWithSuffix.replace(/_[^_]+$/u, "");

  return getTimestamp(dayjs(runAfter).isValid() ? runAfter : fallbackRunAfter);
};

const compareHitlNotifications = (left: HITLDetail, right: HITLDetail) =>
  compareStrings(left.task_instance.dag_id, right.task_instance.dag_id) ||
  getDagRunOrderTimestamp(left.task_instance.dag_run_id, left.task_instance.run_after) -
    getDagRunOrderTimestamp(right.task_instance.dag_run_id, right.task_instance.run_after) ||
  compareDates(left.created_at, right.created_at) ||
  compareStrings(left.task_instance.task_id, right.task_instance.task_id);

const compareDeadlineNotifications = (left: DeadlineResponse, right: DeadlineResponse) =>
  compareStrings(left.dag_id, right.dag_id) ||
  getDagRunOrderTimestamp(left.dag_run_id) - getDagRunOrderTimestamp(right.dag_run_id) ||
  compareDates(left.deadline_time, right.deadline_time) ||
  compareStrings(left.alert_name ?? UNTITLED_DEADLINE_LABEL, right.alert_name ?? UNTITLED_DEADLINE_LABEL);

export const getNotificationsInDisplayOrder = ({
  deadlines,
  hitlDetails,
}: {
  readonly deadlines: Array<DeadlineResponse>;
  readonly hitlDetails: Array<HITLDetail>;
}): Array<SelectedNotification> => {
  const hitlNotifications = [...hitlDetails]
    .sort(compareHitlNotifications)
    .map((item) => ({ item, type: "hitl" }) as const);
  const deadlineNotifications = [...deadlines]
    .sort(compareDeadlineNotifications)
    .map((item) => ({ item, type: "deadline" }) as const);

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

export const getParsedDagRunMeta = (dagRunId: string, fallbackRunAfter?: string) => {
  const [runType, runAfterWithSuffix] = dagRunId.split("__");

  if (runType === undefined || runAfterWithSuffix === undefined) {
    return undefined;
  }

  if (!DAG_RUN_TYPES.has(runType)) {
    return undefined;
  }

  const runAfter = dayjs(runAfterWithSuffix).isValid()
    ? runAfterWithSuffix
    : runAfterWithSuffix.replace(/_[^_]+$/u, "");

  return dayjs(runAfter).isValid()
    ? {
        runAfter,
        runType,
      }
    : {
        runAfter: fallbackRunAfter,
        runType,
      };
};

const getDagRunSortDate = (dagRun: DagRunGroup<unknown>) =>
  getParsedDagRunMeta(dagRun.dagRunId, dagRun.fallbackRunAfter)?.runAfter;

const compareDagGroups = <T,>(left: DagGroup<T>, right: DagGroup<T>) =>
  compareStrings(left.dagId, right.dagId);

const compareDagRunGroups = <T,>(left: DagRunGroup<T>, right: DagRunGroup<T>) =>
  compareDates(getDagRunSortDate(left), getDagRunSortDate(right)) ||
  compareStrings(left.dagRunId, right.dagRunId);

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
        <VStack alignItems="stretch" flex={1} gap={0} minW={0}>
          <Text
            color={selected ? "fg" : "fg.muted"}
            fontSize="xs"
            fontWeight={selected ? "semibold" : "normal"}
            minW={0}
            truncate
          >
            • {label}
          </Text>
        </VStack>
        {formattedTime === undefined ? undefined : (
          <Text color="fg.subtle" flexShrink={0} fontSize="xs">
            {formattedTime}
          </Text>
        )}
      </HStack>
    </Box>
  );
};

const DagRunSection = ({
  children,
  dagRunId,
  fallbackRunAfter,
}: {
  readonly children: React.ReactNode;
  readonly dagRunId: string;
  readonly fallbackRunAfter?: string;
}) => {
  const dagRunMeta = getParsedDagRunMeta(dagRunId, fallbackRunAfter);

  return (
    <VStack alignItems="stretch" gap={0.5} minW={0} width="100%">
      <HStack color="fg.subtle" fontSize="xs" gap={1} minW={0}>
        {dagRunMeta?.runAfter === undefined ? (
          <Text truncate>{dagRunId}</Text>
        ) : (
          <>
            <Text flexShrink={0}>{dagRunMeta.runType}</Text>
            <Text flexShrink={0}>·</Text>
            <Time datetime={dagRunMeta.runAfter} format={DAG_RUN_META_DATE_FORMAT} />
          </>
        )}
      </HStack>
      <VStack alignItems="stretch" gap={0.5} width="100%">
        {children}
      </VStack>
    </VStack>
  );
};

const DagSection = ({ children, dagId }: { readonly children: React.ReactNode; readonly dagId: string }) => (
  <VStack
    alignItems="stretch"
    bg="bg"
    borderColor="border"
    borderRadius="md"
    borderWidth={1}
    gap={2}
    minW={0}
    py={2}
    width="100%"
  >
    <Text
      borderBottomColor="border"
      borderBottomWidth={1}
      color="fg.muted"
      fontSize="xs"
      fontWeight="semibold"
      pb={2}
      px={3}
      truncate
    >
      {dagId}
    </Text>
    <VStack alignItems="stretch" gap={2} minW={0} px={3} width="100%">
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
  <VStack alignItems="stretch" gap={3} minW={0} width="100%">
    {children}
  </VStack>
);

const SectionHeader = ({ children }: { readonly children: string }) => (
  <Box px={2}>
    <NotificationSectionHeading>{children}</NotificationSectionHeading>
  </Box>
);

const NotificationTypeSection = ({
  children,
  heading,
}: {
  readonly children: React.ReactNode;
  readonly heading: string;
}) => (
  <VStack alignItems="stretch" gap={2} minW={0} width="100%">
    <SectionHeader>{heading}</SectionHeader>
    {children}
  </VStack>
);

const getHitlTaskLabel = (detail: HITLDetail) => {
  const taskInstance = detail.task_instance;
  const mappedIndex =
    taskInstance.rendered_map_index ?? (taskInstance.map_index >= 0 ? taskInstance.map_index : undefined);
  const mapSuffix = mappedIndex === undefined ? "" : `[${mappedIndex}]`;

  return `${taskInstance.task_id}${mapSuffix}`;
};

const compareHitlDetails = (left: HITLDetail, right: HITLDetail) =>
  compareDates(left.created_at, right.created_at) ||
  compareStrings(getHitlTaskLabel(left), getHitlTaskLabel(right));

const compareDeadlines = (left: DeadlineResponse, right: DeadlineResponse) =>
  compareDates(left.deadline_time, right.deadline_time) ||
  compareStrings(left.alert_name ?? UNTITLED_DEADLINE_LABEL, right.alert_name ?? UNTITLED_DEADLINE_LABEL);

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
      groupByDag(hitlDetails, (detail) => detail.task_instance.dag_id)
        .map((group) => ({
          ...group,
          items: [...group.items].sort(compareHitlDetails),
        }))
        .sort(compareDagGroups),
    [hitlDetails],
  );
  const deadlineGroups = useMemo(
    () =>
      groupByDag(deadlines, (deadline) => deadline.dag_id)
        .map((group) => ({
          ...group,
          items: [...group.items].sort(compareDeadlines),
        }))
        .sort(compareDagGroups),
    [deadlines],
  );

  return (
    <VStack alignItems="stretch" gap={4} width="100%">
      <NotificationTypeSection heading={getSectionLabel(PENDING_HITL_LABEL, hitlDetails.length)}>
        {hitlIsLoading ? (
          <NotificationSection>
            <StatusText>{LOADING_HITL_LABEL}</StatusText>
          </NotificationSection>
        ) : hitlIsError ? (
          <NotificationSection>
            <StatusText tone="error">{LOAD_HITL_ERROR_LABEL}</StatusText>
          </NotificationSection>
        ) : hitlDetails.length > 0 ? (
          <DagSections>
            {hitlGroups.map((group) => (
              <DagSection dagId={group.dagId} key={group.dagId}>
                {groupByDagRun(
                  group.items,
                  (detail) => detail.task_instance.dag_run_id,
                  (detail) => detail.task_instance.run_after,
                )
                  .sort(compareDagRunGroups)
                  .map((dagRunGroup) => (
                    <DagRunSection
                      dagRunId={dagRunGroup.dagRunId}
                      fallbackRunAfter={dagRunGroup.fallbackRunAfter}
                      key={dagRunGroup.dagRunId}
                    >
                      {dagRunGroup.items.map((detail) => {
                        const key = getNotificationKey({ item: detail, type: "hitl" });

                        return (
                          <NotificationRow
                            datetime={detail.created_at}
                            key={key}
                            label={getHitlTaskLabel(detail)}
                            onSelect={() => onSelect({ item: detail, type: "hitl" })}
                            selected={selectedKey === key}
                          />
                        );
                      })}
                    </DagRunSection>
                  ))}
              </DagSection>
            ))}
          </DagSections>
        ) : (
          <NotificationSection>
            <StatusText>{NO_REQUIRED_ACTIONS_LABEL}</StatusText>
          </NotificationSection>
        )}
      </NotificationTypeSection>
      <NotificationTypeSection heading={getSectionLabel(MISSED_DEADLINES_LABEL, deadlines.length)}>
        {deadlineIsLoading ? (
          <NotificationSection>
            <StatusText>{LOADING_DEADLINES_LABEL}</StatusText>
          </NotificationSection>
        ) : deadlineIsError ? (
          <NotificationSection>
            <StatusText tone="error">{LOAD_DEADLINES_ERROR_LABEL}</StatusText>
          </NotificationSection>
        ) : deadlines.length > 0 ? (
          <DagSections>
            {deadlineGroups.map((group) => (
              <DagSection dagId={group.dagId} key={group.dagId}>
                {groupByDagRun(group.items, (deadline) => deadline.dag_run_id)
                  .sort(compareDagRunGroups)
                  .map((dagRunGroup) => (
                    <DagRunSection dagRunId={dagRunGroup.dagRunId} key={dagRunGroup.dagRunId}>
                      {dagRunGroup.items.map((deadline) => {
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
                    </DagRunSection>
                  ))}
              </DagSection>
            ))}
          </DagSections>
        ) : (
          <NotificationSection>
            <StatusText>{NO_MISSED_DEADLINES_LABEL}</StatusText>
          </NotificationSection>
        )}
      </NotificationTypeSection>
    </VStack>
  );
};
