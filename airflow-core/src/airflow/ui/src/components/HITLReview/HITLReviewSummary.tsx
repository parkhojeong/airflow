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
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { HITLDetail } from "openapi/requests/types.gen.ts";
import { useTimezone } from "src/context/timezone";

import { formatRequiredActionDetailTime } from "./utils/requiredActionDisplay.ts";

const formatAssignees = (users: HITLDetail["assigned_users"]) => {
  if (users === undefined || users.length === 0) {
    return undefined;
  }

  return users.map((user) => user.name).join(", ");
};

const HITLReviewRow = ({ label, value }: { readonly label: string; readonly value: ReactNode }) => (
  <Table.Row>
    <Table.Cell
      as="th"
      color="fg.subtle"
      fontSize="xs"
      fontWeight="normal"
      px={2}
      py={1.5}
      scope="row"
      w="30%"
    >
      {label}
    </Table.Cell>
    <Table.Cell fontSize="xs" px={2} py={1.5}>
      {value}
    </Table.Cell>
  </Table.Row>
);

export const HITLReviewSummary = ({ detail }: { readonly detail: HITLDetail }) => {
  const { t: translate } = useTranslation("hitl");
  const { selectedTimezone } = useTimezone();
  const ti = detail.task_instance;
  const mappedIndex = ti.rendered_map_index ?? (ti.map_index >= 0 ? ti.map_index : undefined);
  const assignees = formatAssignees(detail.assigned_users);
  const assigneeLabel = translate(
    detail.assigned_users?.length === 1 ? "review.fields.assignee" : "review.fields.assignees",
  );
  const requestedTime = formatRequiredActionDetailTime(detail.created_at, true, selectedTimezone);

  return (
    <Table.Root size="sm" tableLayout="fixed" width="100%">
      <Table.Body>
        <HITLReviewRow label={translate("review.fields.dagId")} value={<Text truncate>{ti.dag_id}</Text>} />
        <HITLReviewRow label={translate("review.fields.dagRunId")} value={<Text>{ti.dag_run_id}</Text>} />
        <HITLReviewRow label={translate("review.fields.mapIndex")} value={<Text>{mappedIndex}</Text>} />
        <HITLReviewRow label={translate("review.fields.taskId")} value={<Text truncate>{ti.task_id}</Text>} />
        <HITLReviewRow
          label={translate("review.fields.createdAt")}
          value={<Text>{requestedTime ?? "-"}</Text>}
        />
        <HITLReviewRow label={translate("review.fields.attempt")} value={<Text>{ti.try_number}</Text>} />
        {assignees === undefined ? undefined : (
          <HITLReviewRow label={assigneeLabel} value={<Text truncate>{assignees}</Text>} />
        )}
      </Table.Body>
    </Table.Root>
  );
};
