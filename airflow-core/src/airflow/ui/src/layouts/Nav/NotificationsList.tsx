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
import { Badge, Box, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { type ReactNode, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";

import type {
  DeadlineCollectionResponse,
  DeadlineResponse,
  HITLDetail,
  HITLDetailCollection,
} from "openapi/requests/types.gen";

import { DeadlineNotificationCard } from "./DeadlineNotificationCard";
import { HITLNotificationCard } from "./HITLNotificationCard";
import { NotificationSectionHeading } from "./NotificationCard";

const DEADLINE_ALERTS_LABEL = "Deadline alerts";
const NO_MISSED_DEADLINES_LABEL = "No missed deadlines";
const NO_REQUIRED_ACTIONS_LABEL = "No required actions";
const PENDING_HITL_ACTIONS_LABEL = "Pending HITL actions";
const VIEW_ALL_LABEL = "View all required actions";
const DAG_LABEL = "Dag";
const DAG_RUN_LABEL = "Dag run";

type NotificationsListProps = {
  readonly deadlineData?: DeadlineCollectionResponse;
  readonly hitlData?: HITLDetailCollection;
};

type NotificationRunGroup<T> = {
  readonly dagRunId: string;
  readonly items: Array<T>;
};

type NotificationDagGroup<T> = {
  readonly dagDisplayName?: string;
  readonly dagId: string;
  readonly items: Array<T>;
  readonly runGroups: Array<NotificationRunGroup<T>>;
};

const getDisplayName = (displayName: string | null | undefined, id: string) =>
  displayName !== null && displayName !== undefined && displayName !== "" && displayName !== id
    ? `${displayName} (${id})`
    : id;

const buildNotificationDagGroups = <T,>({
  getDagDisplayName,
  getDagId,
  getDagRunId,
  items,
}: {
  readonly getDagDisplayName?: (item: T) => string | null | undefined;
  readonly getDagId: (item: T) => string;
  readonly getDagRunId: (item: T) => string;
  readonly items: Array<T>;
}) => {
  const groups = new Map<string, NotificationDagGroup<T>>();

  for (const item of items) {
    const dagId = getDagId(item);
    const dagRunId = getDagRunId(item);
    const existingGroup = groups.get(dagId);

    if (existingGroup === undefined) {
      groups.set(dagId, {
        dagDisplayName: getDagDisplayName?.(item) ?? undefined,
        dagId,
        items: [item],
        runGroups: [{ dagRunId, items: [item] }],
      });
    } else {
      existingGroup.items.push(item);
      const existingRunGroup = existingGroup.runGroups.find((runGroup) => runGroup.dagRunId === dagRunId);

      if (existingRunGroup === undefined) {
        existingGroup.runGroups.push({ dagRunId, items: [item] });
      } else {
        existingRunGroup.items.push(item);
      }
    }
  }

  return [...groups.values()];
};

const NotificationDagGroup = <T,>({
  children,
  group,
}: {
  readonly children: ReactNode;
  readonly group: NotificationDagGroup<T>;
}) => (
  <VStack alignItems="stretch" gap={2} width="100%">
    <HStack gap={2} minW={0}>
      <Text color="fg.muted" flexShrink={0} fontSize="xs">
        {DAG_LABEL}
      </Text>
      <Text fontSize="sm" fontWeight="semibold" truncate>
        {getDisplayName(group.dagDisplayName, group.dagId)}
      </Text>
      <Badge flexShrink={0} variant="subtle">
        {group.items.length}
      </Badge>
    </HStack>
    <Box ps={3}>{children}</Box>
  </VStack>
);

const NotificationRunGroup = <T,>({
  children,
  group,
}: {
  readonly children: ReactNode;
  readonly group: NotificationRunGroup<T>;
}) => (
  <VStack alignItems="stretch" gap={1.5} width="100%">
    <HStack gap={2} minW={0}>
      <Text color="fg.muted" flexShrink={0} fontSize="xs">
        {DAG_RUN_LABEL}
      </Text>
      <Text fontSize="sm" truncate>
        {group.dagRunId}
      </Text>
      <Badge flexShrink={0} variant="subtle">
        {group.items.length}
      </Badge>
    </HStack>
    <Box ps={3}>{children}</Box>
  </VStack>
);

export const NotificationsList = ({ deadlineData, hitlData }: NotificationsListProps) => {
  const deadlines = useMemo(() => deadlineData?.deadlines ?? [], [deadlineData?.deadlines]);
  const hitlDetails = useMemo(() => hitlData?.hitl_details ?? [], [hitlData?.hitl_details]);
  const deadlineGroups = useMemo(
    () =>
      buildNotificationDagGroups<DeadlineResponse>({
        getDagId: (deadline) => deadline.dag_id,
        getDagRunId: (deadline) => deadline.dag_run_id,
        items: deadlines,
      }),
    [deadlines],
  );
  const hitlGroups = useMemo(
    () =>
      buildNotificationDagGroups<HITLDetail>({
        getDagDisplayName: (detail) => detail.task_instance.dag_display_name,
        getDagId: (detail) => detail.task_instance.dag_id,
        getDagRunId: (detail) => detail.task_instance.dag_run_id,
        items: hitlDetails,
      }),
    [hitlDetails],
  );

  const hitlTotal = hitlData?.total_entries ?? 0;
  const deadlineTotal = deadlineData?.total_entries ?? 0;
  const overflowCount =
    Math.max(0, hitlTotal - hitlDetails.length) + Math.max(0, deadlineTotal - deadlines.length);

  return (
    <VStack alignItems="stretch" gap={4} width="100%">
      <VStack alignItems="stretch" gap={3} width="100%">
        <NotificationSectionHeading count={hitlTotal}>
          {PENDING_HITL_ACTIONS_LABEL}
        </NotificationSectionHeading>
        {hitlDetails.length > 0 ? (
          <VStack alignItems="stretch" gap={2} width="100%">
            {hitlGroups.map((dagGroup) => (
              <NotificationDagGroup group={dagGroup} key={dagGroup.dagId}>
                <VStack alignItems="stretch" gap={2} width="100%">
                  {dagGroup.runGroups.map((runGroup) => (
                    <NotificationRunGroup group={runGroup} key={runGroup.dagRunId}>
                      <VStack alignItems="stretch" gap={2} width="100%">
                        {runGroup.items.map((detail) => (
                          <HITLNotificationCard
                            detail={detail}
                            key={detail.task_instance.id}
                            showRunContext={false}
                          />
                        ))}
                      </VStack>
                    </NotificationRunGroup>
                  ))}
                </VStack>
              </NotificationDagGroup>
            ))}
          </VStack>
        ) : (
          <Text color="fg.muted" fontSize="sm">
            {NO_REQUIRED_ACTIONS_LABEL}
          </Text>
        )}
      </VStack>
      <VStack alignItems="stretch" gap={2} width="100%">
        <NotificationSectionHeading count={deadlineTotal}>{DEADLINE_ALERTS_LABEL}</NotificationSectionHeading>
        {deadlines.length > 0 ? (
          <VStack alignItems="stretch" gap={2} width="100%">
            {deadlineGroups.map((dagGroup) => (
              <NotificationDagGroup group={dagGroup} key={dagGroup.dagId}>
                <VStack alignItems="stretch" gap={2} width="100%">
                  {dagGroup.runGroups.map((runGroup) => (
                    <NotificationRunGroup group={runGroup} key={runGroup.dagRunId}>
                      <VStack alignItems="stretch" gap={2} width="100%">
                        {runGroup.items.map((deadline) => (
                          <DeadlineNotificationCard
                            deadline={deadline}
                            key={deadline.id}
                            showRunContext={false}
                          />
                        ))}
                      </VStack>
                    </NotificationRunGroup>
                  ))}
                </VStack>
              </NotificationDagGroup>
            ))}
          </VStack>
        ) : (
          <Text color="fg.muted" fontSize="sm">
            {NO_MISSED_DEADLINES_LABEL}
          </Text>
        )}
      </VStack>
      {overflowCount > 0 ? (
        <HStack justifyContent="flex-end">
          <Link asChild color="fg.info" fontSize="sm">
            <RouterLink to="/required_actions">{`${VIEW_ALL_LABEL} (+${overflowCount} more)`}</RouterLink>
          </Link>
        </HStack>
      ) : undefined}
    </VStack>
  );
};
