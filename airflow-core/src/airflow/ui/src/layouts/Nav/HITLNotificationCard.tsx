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
import { Button, HStack, Separator, Skeleton, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { useTaskInstanceServiceGetHitlDetailTryDetail } from "openapi/queries";
import type { HITLDetail } from "openapi/requests/types.gen";
import Time from "src/components/Time";
import { HITLResponseForm } from "src/pages/HITLTaskInstances/HITLResponseForm";
import { getTaskInstanceLink } from "src/utils/links";

import {
  DAG_RUN_META_DATE_FORMAT,
  formatNotificationDetailTime,
  getParsedDagRunMeta,
} from "./notificationDisplayUtils";

const ASSIGNEE_LABEL = "Assignee";
const ATTEMPT_LABEL = "Attempt";
const MAP_LABEL = "Map";
const OPEN_TASK_LABEL = "Open task";
const REQUESTED_LABEL = "Requested";
const RESPONSE_LABEL = "Response";
const LOADING_RESPONSE_LABEL = "Loading response form...";

const formatTaskId = (taskInstance: HITLDetail["task_instance"]) => {
  const mappedIndex =
    taskInstance.rendered_map_index ?? (taskInstance.map_index >= 0 ? taskInstance.map_index : undefined);
  const mapSuffix = mappedIndex === undefined ? "" : `[${mappedIndex}]`;

  return `${taskInstance.task_id}${mapSuffix}`;
};

const formatDisplayName = (displayName: string | null | undefined, id: string) =>
  displayName !== null && displayName !== undefined && displayName !== "" ? displayName : id;

const formatAssignees = (users: HITLDetail["assigned_users"]) => {
  if (users === undefined || users.length === 0) {
    return undefined;
  }

  return users.map((user) => user.name).join(", ");
};

const MetaLine = ({ label, value }: { readonly label: string; readonly value: ReactNode }) => (
  <HStack alignItems="baseline" color="fg.muted" fontSize="sm" gap={3} minW={0}>
    <Text color="fg.subtle" flexShrink={0} minW="72px">
      {label}
    </Text>
    <HStack flex={1} gap={1} minW={0}>
      {value}
    </HStack>
  </HStack>
);

export const HITLNotificationCard = ({
  detail,
  onNavigate,
  onResponded,
}: {
  readonly detail: HITLDetail;
  readonly onNavigate?: () => void;
  readonly onResponded?: () => void;
}) => {
  const assignees = formatAssignees(detail.assigned_users);
  const taskId = formatTaskId(detail.task_instance);
  const { data: hitlDetail, isLoading } = useTaskInstanceServiceGetHitlDetailTryDetail({
    dagId: detail.task_instance.dag_id,
    dagRunId: detail.task_instance.dag_run_id,
    mapIndex: detail.task_instance.map_index,
    taskId: detail.task_instance.task_id,
    tryNumber: detail.task_instance.try_number,
  });

  const dagName = formatDisplayName(detail.task_instance.dag_display_name, detail.task_instance.dag_id);
  const taskLink = `${getTaskInstanceLink(detail.task_instance)}/required_actions`;
  const taskName = taskId;
  const mappedIndex =
    detail.task_instance.rendered_map_index ??
    (detail.task_instance.map_index >= 0 ? detail.task_instance.map_index : undefined);
  const dagRunMeta = getParsedDagRunMeta(detail.task_instance.dag_run_id, detail.task_instance.run_after);
  const requestedTime = formatNotificationDetailTime(detail.created_at);

  return (
    <VStack alignItems="stretch" gap={4} width="100%">
      <HStack alignItems="flex-start" gap={3} justifyContent="space-between" width="100%">
        <VStack alignItems="stretch" flex={1} gap={1.5} minW={0}>
          <Text fontSize="lg" fontWeight="semibold" lineHeight="short" truncate>
            {dagName}
          </Text>
          <HStack color="fg.muted" fontSize="md" fontWeight="medium" gap={1} lineHeight="short" minW={0}>
            {dagRunMeta?.runAfter === undefined ? (
              <Text truncate>{detail.task_instance.dag_run_id}</Text>
            ) : (
              <>
                <Text flexShrink={0}>{dagRunMeta.runType}</Text>
                <Text flexShrink={0}>·</Text>
                <Time datetime={dagRunMeta.runAfter} format={DAG_RUN_META_DATE_FORMAT} />
              </>
            )}
          </HStack>
          <Text color="fg.muted" fontSize="md" lineHeight="short" truncate>
            {taskName}
          </Text>
        </VStack>
        <Button asChild flexShrink={0} size="sm" variant="outline">
          <Link onClick={onNavigate} to={taskLink}>
            {OPEN_TASK_LABEL}
          </Link>
        </Button>
      </HStack>

      <VStack alignItems="stretch" gap={1.5} width="100%">
        {assignees === undefined ? undefined : (
          <MetaLine label={ASSIGNEE_LABEL} value={<Text truncate>{assignees}</Text>} />
        )}
        <MetaLine label={ATTEMPT_LABEL} value={<Text>{detail.task_instance.try_number}</Text>} />
        {mappedIndex === undefined ? undefined : (
          <MetaLine label={MAP_LABEL} value={<Text>{mappedIndex}</Text>} />
        )}
        <MetaLine label={REQUESTED_LABEL} value={<Text truncate>{requestedTime ?? "-"}</Text>} />
      </VStack>

      <Separator />

      <VStack alignItems="stretch" gap={3} width="100%">
        <Text color="fg.muted" fontSize="sm" fontWeight="semibold">
          {RESPONSE_LABEL}
        </Text>
        {isLoading || hitlDetail === undefined ? (
          <VStack alignItems="stretch" gap={2}>
            <Text color="fg.muted" fontSize="sm">
              {LOADING_RESPONSE_LABEL}
            </Text>
            <Skeleton height="80px" />
          </VStack>
        ) : (
          <HITLResponseForm
            hitlDetail={hitlDetail}
            namespace={`hitl:${detail.task_instance.id}`}
            onResponded={onResponded}
          />
        )}
      </VStack>
    </VStack>
  );
};
