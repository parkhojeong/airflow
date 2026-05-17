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
import { Box, HStack, Separator, Skeleton, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

import { useTaskInstanceServiceGetHitlDetailTryDetail } from "openapi/queries";
import type { HITLDetail } from "openapi/requests/types.gen";
import Time from "src/components/Time";
import { RouterLink } from "src/components/ui";
import { HITLResponseForm } from "src/pages/HITLTaskInstances/HITLResponseForm";
import { DEFAULT_DATETIME_FORMAT, getRelativeTime } from "src/utils/datetimeUtils";
import { getTaskInstanceLink } from "src/utils/links";

const ASSIGNEE_LABEL = "Assignee:";
const ATTEMPT_LABEL = "Attempt:";
const DAG_LABEL = "Dag:";
const DAG_RUN_LABEL = "DagRun:";
const MAP_LABEL = "Map:";
const REQUESTED_LABEL = "Requested:";
const TASK_LABEL = "Task:";
const LOADING_RESPONSE_LABEL = "Loading response form...";

const formatTaskId = (taskInstance: HITLDetail["task_instance"]) => {
  const mapSuffix = taskInstance.map_index >= 0 ? `[${taskInstance.map_index}]` : "";

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

const formatRelative = (datetime: string) => {
  const relative = getRelativeTime(datetime);

  return relative === "" ? undefined : relative;
};

const MetaLine = ({ label, value }: { readonly label: string; readonly value: ReactNode }) => (
  <HStack color="fg.muted" fontSize="sm" gap={2} minW={0}>
    <Text color="fg.muted" flexShrink={0}>
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
}: {
  readonly detail: HITLDetail;
  readonly onNavigate?: () => void;
}) => {
  const assignees = formatAssignees(detail.assigned_users);
  const { data: hitlDetail, isLoading } = useTaskInstanceServiceGetHitlDetailTryDetail({
    dagId: detail.task_instance.dag_id,
    dagRunId: detail.task_instance.dag_run_id,
    mapIndex: detail.task_instance.map_index,
    taskId: detail.task_instance.task_id,
    tryNumber: detail.task_instance.try_number,
  });

  const dagName = formatDisplayName(detail.task_instance.dag_display_name, detail.task_instance.dag_id);
  const taskName = formatDisplayName(detail.task_instance.task_display_name, formatTaskId(detail.task_instance));
  const mappedIndex =
    detail.task_instance.rendered_map_index ??
    (detail.task_instance.map_index >= 0 ? detail.task_instance.map_index : undefined);
  const relative = formatRelative(detail.created_at);

  return (
    <VStack alignItems="stretch" gap={3} width="100%">
      {isLoading || hitlDetail === undefined ? (
        <VStack alignItems="stretch" gap={2}>
          <Text color="fg.muted" fontSize="sm">
            {LOADING_RESPONSE_LABEL}
          </Text>
          <Skeleton height="80px" />
        </VStack>
      ) : (
        <Box mt={-4}>
          <HITLResponseForm hitlDetail={hitlDetail} namespace={`hitl:${detail.task_instance.id}`} />
        </Box>
      )}

      <Separator />

      <VStack alignItems="stretch" gap={1} width="100%">
        <MetaLine
          label={DAG_LABEL}
          value={
            <RouterLink fontSize="sm" onClick={onNavigate} to={`/dags/${detail.task_instance.dag_id}`} truncate>
              {dagName}
            </RouterLink>
          }
        />
        <MetaLine
          label={DAG_RUN_LABEL}
          value={
            <RouterLink
              fontSize="sm"
              onClick={onNavigate}
              to={`/dags/${detail.task_instance.dag_id}/runs/${detail.task_instance.dag_run_id}`}
              truncate
            >
              {detail.task_instance.dag_run_id}
            </RouterLink>
          }
        />
        <MetaLine
          label={TASK_LABEL}
          value={
            <RouterLink
              fontSize="sm"
              onClick={onNavigate}
              to={`${getTaskInstanceLink(detail.task_instance)}/required_actions`}
              truncate
            >
              {taskName}
            </RouterLink>
          }
        />
        {assignees === undefined ? undefined : (
          <MetaLine label={ASSIGNEE_LABEL} value={<Text truncate>{assignees}</Text>} />
        )}
        <MetaLine label={ATTEMPT_LABEL} value={<Text>{detail.task_instance.try_number}</Text>} />
        {mappedIndex === undefined ? undefined : <MetaLine label={MAP_LABEL} value={<Text>{mappedIndex}</Text>} />}
        <MetaLine
          label={REQUESTED_LABEL}
          value={
            <>
              {relative === undefined ? undefined : <Text>{relative}</Text>}
              <Text color="fg.subtle">(</Text>
              <Time datetime={detail.created_at} format={DEFAULT_DATETIME_FORMAT} />
              <Text color="fg.subtle">)</Text>
            </>
          }
        />
      </VStack>
    </VStack>
  );
};
