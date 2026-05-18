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
import { Heading, HStack, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

import type { DeadlineResponse } from "openapi/requests/types.gen";
import { RouterLink } from "src/components/ui";

import { formatNotificationDetailTime } from "./NotificationsList";

const DAG_LABEL = "Dag:";
const DAG_RUN_LABEL = "DagRun:";
const MISSED_DEADLINE_LABEL = "Missed deadline";
const MISSED_LABEL = "Missed:";
const TYPE_LABEL = "Missed deadline";

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

export const DeadlineNotificationCard = ({
  deadline,
  onNavigate,
}: {
  readonly deadline: DeadlineResponse;
  readonly onNavigate?: () => void;
}) => {
  const title = deadline.alert_name ?? MISSED_DEADLINE_LABEL;
  const missed = formatNotificationDetailTime(deadline.deadline_time);

  return (
    <VStack alignItems="stretch" gap={3} width="100%">
      <VStack alignItems="stretch" gap={1} width="100%">
        <Text
          color="fg.muted"
          fontSize="xs"
          fontWeight="semibold"
          letterSpacing="wide"
          textTransform="uppercase"
        >
          {TYPE_LABEL}
        </Text>
        <Heading size="md">{title}</Heading>
      </VStack>
      <VStack alignItems="stretch" gap={1} width="100%">
        <MetaLine
          label={DAG_LABEL}
          value={
            <RouterLink fontSize="sm" onClick={onNavigate} to={`/dags/${deadline.dag_id}`} truncate>
              {deadline.dag_id}
            </RouterLink>
          }
        />
        <MetaLine
          label={DAG_RUN_LABEL}
          value={
            <RouterLink
              fontSize="sm"
              onClick={onNavigate}
              to={`/dags/${deadline.dag_id}/runs/${deadline.dag_run_id}`}
              truncate
            >
              {deadline.dag_run_id}
            </RouterLink>
          }
        />
        <MetaLine label={MISSED_LABEL} value={<Text>{missed ?? "-"}</Text>} />
      </VStack>
    </VStack>
  );
};
