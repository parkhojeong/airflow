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
import { Button, Table, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

import type { DeadlineResponse } from "openapi/requests/types.gen";

import { formatNotificationDetailTime, getParsedDagRunMeta } from "./notificationDisplayUtils";

const MISSED_DEADLINE_LABEL = "Missed deadline";
const OPEN_DAG_RUN_LABEL = "Open Dag run";

const MetaRow = ({ label, value }: { readonly label: string; readonly value: React.ReactNode }) => (
  <Table.Row>
    <Table.Cell color="fg.subtle" fontSize="xs" px={2} py={1.5} w="30%">
      {label}
    </Table.Cell>
    <Table.Cell fontSize="xs" px={2} py={1.5}>
      {value}
    </Table.Cell>
  </Table.Row>
);

export const DeadlineNotificationCard = ({
  deadline,
  onNavigate,
}: {
  readonly deadline: DeadlineResponse;
  readonly onNavigate?: () => void;
}) => {
  const dagRunMeta = getParsedDagRunMeta(deadline.dag_run_id);
  const dagRunLink = `/dags/${deadline.dag_id}/runs/${deadline.dag_run_id}`;
  const deadlineTime = formatNotificationDetailTime(deadline.deadline_time, true);

  return (
    <VStack alignItems="stretch" gap={4} width="100%">
      <Table.Root size="sm" tableLayout="fixed" width="100%">
        <Table.Body>
          <MetaRow label="Dag ID" value={<Text truncate>{deadline.dag_id}</Text>} />
          <MetaRow
            label="Dag Run"
            value={
              <Text>{formatNotificationDetailTime(dagRunMeta?.runAfter ?? deadline.dag_run_id, true) ?? deadline.dag_run_id}</Text>
            }
          />
          <MetaRow label="Deadline" value={<Text>{deadlineTime ?? "-"}</Text>} />
          <MetaRow label="Alert" value={<Text truncate>{deadline.alert_name ?? MISSED_DEADLINE_LABEL}</Text>} />
        </Table.Body>
      </Table.Root>

      <Button asChild alignSelf="flex-end" size="sm" variant="outline">
        <Link onClick={onNavigate} to={dagRunLink}>
          {OPEN_DAG_RUN_LABEL}
        </Link>
      </Button>
    </VStack>
  );
};
