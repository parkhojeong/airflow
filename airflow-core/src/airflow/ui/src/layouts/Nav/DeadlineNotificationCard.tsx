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
import { Button, HStack, Separator, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import type { DeadlineResponse } from "openapi/requests/types.gen";
import Time from "src/components/Time";

import {
  DAG_RUN_META_DATE_FORMAT,
  formatNotificationDetailTime,
  getParsedDagRunMeta,
} from "./notificationDisplayUtils";

const MISSED_DEADLINE_LABEL = "Missed deadline";
const ALERT_LABEL = "Alert";
const MISSED_LABEL = "Missed";
const OPEN_DAG_RUN_LABEL = "Open Dag run";

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

export const DeadlineNotificationCard = ({
  deadline,
  onNavigate,
}: {
  readonly deadline: DeadlineResponse;
  readonly onNavigate?: () => void;
}) => {
  const title = deadline.alert_name ?? MISSED_DEADLINE_LABEL;
  const dagRunMeta = getParsedDagRunMeta(deadline.dag_run_id);
  const dagRunLink = `/dags/${deadline.dag_id}/runs/${deadline.dag_run_id}`;
  const missed = formatNotificationDetailTime(deadline.deadline_time);

  return (
    <VStack alignItems="stretch" gap={4} width="100%">
      <HStack alignItems="flex-start" gap={3} justifyContent="space-between" width="100%">
        <VStack alignItems="stretch" flex={1} gap={1.5} minW={0}>
          <Text fontSize="xl" fontWeight="semibold" lineHeight="short" truncate>
            {deadline.dag_id}
          </Text>
          <HStack color="fg.muted" fontSize="md" fontWeight="medium" gap={1} lineHeight="short" minW={0}>
            {dagRunMeta?.runAfter === undefined ? (
              <Text truncate>{deadline.dag_run_id}</Text>
            ) : (
              <>
                <Text flexShrink={0}>{dagRunMeta.runType}</Text>
                <Text flexShrink={0}>·</Text>
                <Time datetime={dagRunMeta.runAfter} format={DAG_RUN_META_DATE_FORMAT} />
              </>
            )}
          </HStack>
          <Text color="fg.muted" fontSize="md" lineHeight="short" truncate>
            {title}
          </Text>
        </VStack>
        <Button asChild flexShrink={0} size="sm" variant="outline">
          <Link onClick={onNavigate} to={dagRunLink}>
            {OPEN_DAG_RUN_LABEL}
          </Link>
        </Button>
      </HStack>
      <Separator />
      <VStack alignItems="stretch" gap={1.5} width="100%">
        <MetaLine label={ALERT_LABEL} value={<Text truncate>{title}</Text>} />
        <MetaLine label={MISSED_LABEL} value={<Text>{missed ?? "-"}</Text>} />
      </VStack>
    </VStack>
  );
};
