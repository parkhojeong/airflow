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
import { Table, Text } from "@chakra-ui/react";

import type { HITLDetail } from "openapi/requests/types.gen";
import { MetaRow } from "src/components/RequiredActions/RequiredActionCard";
import { useTimezone } from "src/context/timezone";

import { formatRequiredActionDetailTime } from "./utils/requiredActionDisplay";

const formatAssignees = (users: HITLDetail["assigned_users"]) => {
  if (users === undefined || users.length === 0) {
    return undefined;
  }

  return users.map((user) => user.name).join(", ");
};

export const HITLRequiredActionSummary = ({ detail }: { readonly detail: HITLDetail }) => {
  const { selectedTimezone } = useTimezone();
  const ti = detail.task_instance;
  const mappedIndex = ti.rendered_map_index ?? (ti.map_index >= 0 ? ti.map_index : undefined);
  const assignees = formatAssignees(detail.assigned_users);
  const assigneeLabel = detail.assigned_users?.length === 1 ? "Assignee" : "Assignees";
  const requestedTime = formatRequiredActionDetailTime(detail.created_at, true, selectedTimezone);

  return (
    <Table.Root size="sm" tableLayout="fixed" width="100%">
      <Table.Body>
        <MetaRow label="Dag ID" value={<Text truncate>{ti.dag_id}</Text>} />
        <MetaRow label="Dag Run ID" value={<Text>{ti.dag_run_id}</Text>} />
        <MetaRow label="Map index" value={<Text>{mappedIndex}</Text>} />
        <MetaRow label="Task ID" value={<Text truncate>{ti.task_id}</Text>} />
        <MetaRow label="Created at" value={<Text>{requestedTime ?? "-"}</Text>} />
        <MetaRow label="Attempt" value={<Text>{ti.try_number}</Text>} />
        {assignees === undefined ? undefined : (
          <MetaRow label={assigneeLabel} value={<Text truncate>{assignees}</Text>} />
        )}
      </Table.Body>
    </Table.Root>
  );
};
