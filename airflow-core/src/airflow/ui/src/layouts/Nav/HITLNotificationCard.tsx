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
import { Button, Skeleton, Table, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { useTaskInstanceServiceGetHitlDetailTryDetail } from "openapi/queries";
import type { HITLDetail } from "openapi/requests/types.gen";
import { HITLResponseForm } from "src/pages/HITLTaskInstances/HITLResponseForm";
import { getTaskInstanceLink } from "src/utils/links";

import { MetaRow } from "./NotificationCard";
import { formatNotificationDetailTime } from "./notificationDisplayUtils";

const OPEN_TASK_LABEL = "Open task";
const LOADING_RESPONSE_LABEL = "Loading response form...";

const formatAssignees = (users: HITLDetail["assigned_users"]) => {
  if (users === undefined || users.length === 0) {
    return undefined;
  }

  return users.map((user) => user.name).join(", ");
};

export const HITLNotificationCard = ({
  detail,
  onNavigate,
  onResponded,
}: {
  readonly detail: HITLDetail;
  readonly onNavigate?: () => void;
  readonly onResponded?: () => void;
}) => {
  const { data: hitlDetail, isLoading } = useTaskInstanceServiceGetHitlDetailTryDetail({
    dagId: detail.task_instance.dag_id,
    dagRunId: detail.task_instance.dag_run_id,
    mapIndex: detail.task_instance.map_index,
    taskId: detail.task_instance.task_id,
    tryNumber: detail.task_instance.try_number,
  });

  const ti = detail.task_instance;
  const mappedIndex = ti.rendered_map_index ?? (ti.map_index >= 0 ? ti.map_index : undefined);
  const assignees = formatAssignees(detail.assigned_users);
  const requestedTime = formatNotificationDetailTime(detail.created_at, true);
  const taskLink = `${getTaskInstanceLink(ti)}/required_actions`;

  return (
    <VStack alignItems="stretch" gap={4} width="100%">
      <Table.Root size="sm" tableLayout="fixed" width="100%">
        <Table.Body>
          <MetaRow label="Dag ID" value={<Text truncate>{ti.dag_id}</Text>} />
          <MetaRow label="Dag Run ID" value={<Text>{ti.dag_run_id}</Text>} />
          <MetaRow label="Map index" value={<Text>{mappedIndex}</Text>} />
          <MetaRow label="Task ID" value={<Text truncate>{ti.task_id}</Text>} />
          <MetaRow label="Created at" value={<Text>{requestedTime ?? "-"}</Text>} />
          <MetaRow label="Attempt" value={<Text>{ti.try_number}</Text>} />
          {assignees === undefined ? undefined : (
            <MetaRow label="Assignee" value={<Text truncate>{assignees}</Text>} />
          )}
        </Table.Body>
      </Table.Root>

      <Button alignSelf="flex-end" asChild size="sm" variant="outline">
        <Link onClick={onNavigate} to={taskLink}>
          {OPEN_TASK_LABEL}
        </Link>
      </Button>

      {isLoading || hitlDetail === undefined ? (
        <VStack alignItems="stretch" gap={2}>
          <Text color="fg.muted" fontSize="sm">
            {LOADING_RESPONSE_LABEL}
          </Text>
          <Skeleton height="80px" />
        </VStack>
      ) : (
        <HITLResponseForm hitlDetail={hitlDetail} namespace={`hitl:${ti.id}`} onResponded={onResponded} />
      )}
    </VStack>
  );
};
