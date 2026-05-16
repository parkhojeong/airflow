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
import { Accordion, Box, Grid, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { useTaskInstanceServiceGetHitlDetailTryDetail } from "openapi/queries";
import type { HITLDetail } from "openapi/requests/types.gen";
import { StateBadge } from "src/components/StateBadge";
import { HITLResponseForm } from "src/pages/HITLTaskInstances/HITLResponseForm";
import { getRelativeTime } from "src/utils/datetimeUtils";
import { getHITLState } from "src/utils/hitl";

import { HITLTaskInstanceLink } from "./HITLTaskInstanceLink";
import { NotificationCard } from "./NotificationCard";

const ASSIGNED_LABEL = "Assigned to";
const ATTEMPT_LABEL = "Attempt";
const DAG_LABEL = "Dag";
const DAG_RUN_LABEL = "Dag run";
const EMPTY_VALUE = "-";
const MAP_LABEL = "Map";
const TASK_LABEL = "Task";
const OPEN_TASK_LABEL = "Open task";
const REQUESTED_LABEL = "Requested";

const formatTaskId = (taskInstance: HITLDetail["task_instance"]) => {
  const mapSuffix = taskInstance.map_index >= 0 ? `[${taskInstance.map_index}]` : "";

  return `${taskInstance.task_id}${mapSuffix}`;
};

const formatAssignees = (users: HITLDetail["assigned_users"]) => {
  if (users === undefined || users.length === 0) {
    return undefined;
  }

  return users.map((user) => user.name).join(", ");
};

const formatDisplayName = (displayName: string | null | undefined, id: string) =>
  displayName !== null && displayName !== undefined && displayName !== "" && displayName !== id
    ? `${displayName} (${id})`
    : id;

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

const formatRequestedTime = (datetime: string) => {
  const relative = getRelativeTime(datetime);

  return relative === "" ? EMPTY_VALUE : relative;
};

const HITLNotificationSummary = ({
  detail,
  showRunContext,
}: {
  readonly detail: HITLDetail;
  readonly showRunContext: boolean;
}) => {
  const { t: translate } = useTranslation("hitl");
  const assignees = formatAssignees(detail.assigned_users);
  const hitlState = getHITLState(translate, detail);
  const dagName = formatDisplayName(detail.task_instance.dag_display_name, detail.task_instance.dag_id);
  const taskName = formatDisplayName(
    detail.task_instance.task_display_name,
    formatTaskId(detail.task_instance),
  );
  const mappedIndex =
    detail.task_instance.rendered_map_index ??
    (detail.task_instance.map_index >= 0 ? detail.task_instance.map_index : undefined);

  return (
    <VStack alignItems="stretch" gap={2} minW={0}>
      <HStack alignItems="flex-start" gap={2} justifyContent="space-between" minW={0}>
        <VStack alignItems="flex-start" gap={1} minW={0}>
          <StateBadge flexShrink={0} fontSize="2xs" px={1.5} py={0.5} state={detail.task_instance.state}>
            {hitlState}
          </StateBadge>
        </VStack>
      </HStack>
      <VStack alignItems="stretch" gap={1} minW={0}>
        <SummaryMetaGrid
          items={
            showRunContext
              ? [
                  { label: DAG_LABEL, value: dagName },
                  { label: DAG_RUN_LABEL, value: detail.task_instance.dag_run_id },
                  { label: TASK_LABEL, value: taskName },
                  { label: MAP_LABEL, value: mappedIndex ?? EMPTY_VALUE },
                  { label: ATTEMPT_LABEL, value: detail.task_instance.try_number },
                  { label: REQUESTED_LABEL, value: formatRequestedTime(detail.created_at) },
                ]
              : [
                  { label: TASK_LABEL, value: taskName },
                  { label: MAP_LABEL, value: mappedIndex ?? EMPTY_VALUE },
                  { label: ATTEMPT_LABEL, value: detail.task_instance.try_number },
                  { label: REQUESTED_LABEL, value: formatRequestedTime(detail.created_at) },
                ]
          }
          templateColumns={
            showRunContext
              ? "minmax(0, 1fr) minmax(0, 1.35fr) minmax(0, 1fr) 3.5rem 4.5rem 5.5rem"
              : "minmax(0, 1fr) 3.5rem 4.5rem 5.5rem"
          }
        />
        {assignees === undefined ? undefined : <MetaRow label={ASSIGNED_LABEL} value={assignees} />}
      </VStack>
    </VStack>
  );
};

export const HITLNotificationCard = ({
  detail,
  showRunContext = true,
}: {
  readonly detail: HITLDetail;
  readonly showRunContext?: boolean;
}) => {
  const { t: translate } = useTranslation("hitl");
  const accordionValue = detail.task_instance.id;
  const [openItems, setOpenItems] = useState<Array<string>>([]);
  const isOpen = openItems.includes(accordionValue);
  const hitlState = getHITLState(translate, detail);
  const { data: hitlDetail, isLoading } = useTaskInstanceServiceGetHitlDetailTryDetail(
    {
      dagId: detail.task_instance.dag_id,
      dagRunId: detail.task_instance.dag_run_id,
      mapIndex: detail.task_instance.map_index,
      taskId: detail.task_instance.task_id,
      tryNumber: detail.task_instance.try_number,
    },
    undefined,
    { enabled: isOpen },
  );

  const mappedIndex =
    detail.task_instance.rendered_map_index ??
    (detail.task_instance.map_index >= 0 ? detail.task_instance.map_index : undefined);

  return (
    <NotificationCard accent="fg.info" aria-label={`${hitlState}: ${detail.subject}`}>
      <Accordion.Root
        collapsible
        onValueChange={(event) => setOpenItems(event.value)}
        value={openItems}
        variant="plain"
      >
        <Accordion.Item value={accordionValue}>
          <Accordion.ItemTrigger alignItems="flex-start" cursor="pointer" p={0}>
            <Box flex={1} minW={0}>
              <HITLNotificationSummary detail={detail} showRunContext={showRunContext} />
            </Box>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody px={0} py={3}>
              <VStack alignItems="stretch" gap={2}>
                <VStack alignItems="stretch" gap={1} minW={0}>
                  {mappedIndex === undefined ? undefined : <MetaRow label={MAP_LABEL} value={mappedIndex} />}
                </VStack>
                <Box>
                  <HITLTaskInstanceLink taskInstance={detail.task_instance}>
                    {OPEN_TASK_LABEL}
                  </HITLTaskInstanceLink>
                </Box>
                {isLoading || hitlDetail === undefined ? (
                  <VStack alignItems="stretch">
                    <Skeleton height="48px" />
                    <Skeleton height="120px" />
                  </VStack>
                ) : (
                  <HITLResponseForm hitlDetail={hitlDetail} namespace={`hitl:${detail.task_instance.id}`} />
                )}
              </VStack>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </NotificationCard>
  );
};
