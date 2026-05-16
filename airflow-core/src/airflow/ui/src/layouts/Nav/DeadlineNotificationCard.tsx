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
import { Accordion, Box, Grid, HStack, Link, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import type { DeadlineResponse } from "openapi/requests/types.gen";
import Time from "src/components/Time";
import { getRelativeTime } from "src/utils/datetimeUtils";

import { NotificationCard } from "./NotificationCard";

const DAG_LABEL = "Dag";
const DAG_RUN_LABEL = "Dag run";
const ALERT_LABEL = "Alert";
const DEADLINE_LABEL = "Deadline";
const MISSED_DEADLINE_LABEL = "Missed deadline";
const MISSED_LABEL = "Missed";
const OPEN_RUN_LABEL = "Open run";
const OPEN_DAG_LABEL = "Open dag";

type SummaryMetaItem = {
  readonly label: string;
  readonly value: number | string;
};

const SummaryMetaGrid = ({
  items,
  templateColumns,
}: {
  readonly items: Array<SummaryMetaItem>;
  readonly templateColumns: string;
}) => (
  <Grid gap={1} minW={0} templateColumns={templateColumns}>
    {items.map((item) => (
      <Text color="fg.muted" fontSize="xs" key={item.label} truncate>
        {item.label}
      </Text>
    ))}
    {items.map((item) => (
      <Text fontSize="sm" key={`${item.label}-value`} truncate>
        {item.value}
      </Text>
    ))}
  </Grid>
);

const MetaRow = ({ label, value }: { readonly label: string; readonly value: ReactNode }) => (
  <HStack gap={2} minW={0}>
    <Text color="fg.muted" flexShrink={0} fontSize="sm">
      {label}
    </Text>
    <Text fontSize="sm" truncate>
      {value}
    </Text>
  </HStack>
);

const formatMissedTime = (datetime: string) => {
  const relative = getRelativeTime(datetime);

  return relative === "" ? "-" : relative;
};

const DeadlineNotificationSummary = ({
  deadline,
  showRunContext,
}: {
  readonly deadline: DeadlineResponse;
  readonly showRunContext: boolean;
}) => (
  <VStack alignItems="stretch" gap={2} minW={0}>
    <VStack alignItems="stretch" gap={1} minW={0}>
      <SummaryMetaGrid
        items={
          showRunContext
            ? [
                { label: DAG_LABEL, value: deadline.dag_id },
                { label: DAG_RUN_LABEL, value: deadline.dag_run_id },
                { label: ALERT_LABEL, value: deadline.alert_name ?? MISSED_DEADLINE_LABEL },
                { label: MISSED_LABEL, value: formatMissedTime(deadline.deadline_time) },
              ]
            : [
                { label: ALERT_LABEL, value: deadline.alert_name ?? MISSED_DEADLINE_LABEL },
                { label: MISSED_LABEL, value: formatMissedTime(deadline.deadline_time) },
              ]
        }
        templateColumns={
          showRunContext ? "minmax(0, 1fr) minmax(0, 1.35fr) minmax(0, 1fr) 5.5rem" : "minmax(0, 1fr) 5.5rem"
        }
      />
    </VStack>
  </VStack>
);

const DeadlineNotificationLinks = ({ deadline }: { readonly deadline: DeadlineResponse }) => (
  <HStack gap={3}>
    <Link asChild color="fg.info">
      <RouterLink to={`/dags/${deadline.dag_id}/runs/${deadline.dag_run_id}`}>{OPEN_RUN_LABEL}</RouterLink>
    </Link>
    <Link asChild color="fg.info">
      <RouterLink to={`/dags/${deadline.dag_id}`}>{OPEN_DAG_LABEL}</RouterLink>
    </Link>
  </HStack>
);

const DeadlineNotificationDetails = ({ deadline }: { readonly deadline: DeadlineResponse }) => (
  <VStack alignItems="stretch" gap={2}>
    <VStack alignItems="stretch" gap={1} minW={0}>
      <MetaRow label={DEADLINE_LABEL} value={<Time datetime={deadline.deadline_time} />} />
    </VStack>
    <DeadlineNotificationLinks deadline={deadline} />
  </VStack>
);

export const DeadlineNotificationCard = ({
  deadline,
  showRunContext = true,
}: {
  readonly deadline: DeadlineResponse;
  readonly showRunContext?: boolean;
}) => (
  <NotificationCard accent="fg.error" aria-label={`${MISSED_DEADLINE_LABEL}: ${deadline.alert_name ?? ""}`}>
    <Accordion.Root collapsible variant="plain">
      <Accordion.Item value={deadline.id}>
        <Accordion.ItemTrigger alignItems="flex-start" cursor="pointer" p={0}>
          <Box flex={1} minW={0}>
            <DeadlineNotificationSummary deadline={deadline} showRunContext={showRunContext} />
          </Box>
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <Accordion.ItemBody px={0} py={3}>
            <DeadlineNotificationDetails deadline={deadline} />
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  </NotificationCard>
);
