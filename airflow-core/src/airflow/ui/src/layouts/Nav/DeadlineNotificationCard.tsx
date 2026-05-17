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
import { Box, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import type { MouseEvent, ReactNode } from "react";

import type { DeadlineResponse } from "openapi/requests/types.gen";
import Time from "src/components/Time";
import { Accordion, RouterLink } from "src/components/ui";
import { getRelativeTime } from "src/utils/datetimeUtils";

import { NotificationCard } from "./NotificationCard";

const DAG_LABEL = "Dag";
const DAG_RUN_LABEL = "Dag run";
const ALERT_LABEL = "Alert";
const DEADLINE_LABEL = "Deadline";
const DEADLINE_PREFIX = "Deadline:";
const MISSED_DEADLINE_LABEL = "Missed deadline";
const MISSED_LABEL = "Missed";
const OPEN_RUN_LABEL = "Open run";
const OPEN_DAG_LABEL = "Open dag";
const MISSED_PREFIX = "Missed:";

type SummaryMetaItem = {
  readonly label: string;
  readonly to: string;
  readonly value: string;
};

const stopAccordionToggle = (event: MouseEvent) => event.stopPropagation();

const SummaryMetaGrid = ({
  items,
  templateColumns,
}: {
  readonly items: Array<SummaryMetaItem>;
  readonly templateColumns: string;
}) => (
  <Grid gap={1} minW={0} templateColumns={templateColumns}>
    {items.map((item) => (
      <RouterLink
        fontSize="xs"
        key={item.label}
        onClick={stopAccordionToggle}
        to={item.to}
        truncate
      >
        {item.label}
      </RouterLink>
    ))}
    {items.map((item) => (
      <Text fontSize="sm" fontWeight="medium" key={`${item.label}-value`} truncate>
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
      {showRunContext ? (
        <SummaryMetaGrid
          items={[
            { label: DAG_LABEL, to: `/dags/${deadline.dag_id}`, value: deadline.dag_id },
            {
              label: DAG_RUN_LABEL,
              to: `/dags/${deadline.dag_id}/runs/${deadline.dag_run_id}`,
              value: deadline.dag_run_id,
            },
          ]}
          templateColumns="minmax(0, 1fr) minmax(0, 1.35fr)"
        />
      ) : undefined}
      <Text fontSize="sm" fontWeight="medium" truncate>
        {deadline.alert_name ?? MISSED_DEADLINE_LABEL}
      </Text>
      <Text color="fg.muted" fontSize="sm" truncate>
        {MISSED_PREFIX} {formatMissedTime(deadline.deadline_time)}
      </Text>
    </VStack>
  </VStack>
);

const DeadlineNotificationLinks = ({ deadline }: { readonly deadline: DeadlineResponse }) => (
  <HStack gap={3}>
    <RouterLink to={`/dags/${deadline.dag_id}/runs/${deadline.dag_run_id}`}>{OPEN_RUN_LABEL}</RouterLink>
    <RouterLink to={`/dags/${deadline.dag_id}`}>{OPEN_DAG_LABEL}</RouterLink>
  </HStack>
);

const DeadlineNotificationDetails = ({ deadline }: { readonly deadline: DeadlineResponse }) => (
  <VStack alignItems="stretch" gap={2}>
    <VStack alignItems="stretch" gap={1.5} minW={0}>
      <MetaRow label={ALERT_LABEL} value={deadline.alert_name ?? MISSED_DEADLINE_LABEL} />
      <MetaRow label={DAG_LABEL} value={deadline.dag_id} />
      <MetaRow label={DAG_RUN_LABEL} value={deadline.dag_run_id} />
      <MetaRow label={MISSED_LABEL} value={formatMissedTime(deadline.deadline_time)} />
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
  <HStack alignItems="flex-start" gap={2} width="100%">
    <Text color="fg.muted" flexShrink={0} fontSize="sm" pt={3}>
      {DEADLINE_PREFIX}
    </Text>
    <Box flex={1} minW={0}>
      <NotificationCard accent="fg.error" aria-label={`${MISSED_DEADLINE_LABEL}: ${deadline.alert_name ?? ""}`}>
        <Accordion.Root collapsible variant="plain" width="100%">
          <Accordion.Item value={deadline.id} width="100%">
            <Accordion.ItemTrigger
              _hover={{ bg: "bg.muted" }}
              alignItems="center"
              borderRadius="sm"
              cursor="pointer"
              gap={3}
              px={3}
              py={3}
              width="100%"
            >
              <Box flex={1} minW={0}>
                <DeadlineNotificationSummary deadline={deadline} showRunContext={showRunContext} />
              </Box>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent width="100%">
              <Accordion.ItemBody borderTopColor="border" borderTopWidth={1} px={3} py={3}>
                <DeadlineNotificationDetails deadline={deadline} />
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      </NotificationCard>
    </Box>
  </HStack>
);
