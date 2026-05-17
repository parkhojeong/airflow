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
import { Box, Grid, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import { useState, type ComponentProps, type MouseEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { useTaskInstanceServiceGetHitlDetailTryDetail } from "openapi/queries";
import type { HITLDetail } from "openapi/requests/types.gen";
import Time from "src/components/Time";
import { Accordion, RouterLink } from "src/components/ui";
import { HITLResponseForm } from "src/pages/HITLTaskInstances/HITLResponseForm";
import { DEFAULT_DATETIME_FORMAT } from "src/utils/datetimeUtils";
import { getHITLState } from "src/utils/hitl";
import { getTaskInstanceLink } from "src/utils/links";

import { HITLTaskInstanceLink } from "./HITLTaskInstanceLink";
import { NotificationCard } from "./NotificationCard";

const DAG_LABEL = "Dag";
const DAG_RUN_LABEL = "Dag run";
const MAP_LABEL = "Map";
const ASSIGNED_LABEL = "Assigned to";
const ATTEMPT_LABEL = "Attempt";
const OPEN_TASK_LABEL = "Open task";
const REQUESTED_LABEL = "Requested";
const SUBJECT_LABEL = "Subject";
const TASK_PREFIX = "Task:";

const formatTaskId = (taskInstance: HITLDetail["task_instance"]) => {
  const mapSuffix = taskInstance.map_index >= 0 ? `[${taskInstance.map_index}]` : "";

  return `${taskInstance.task_id}${mapSuffix}`;
};

const formatDisplayName = (displayName: string | null | undefined, id: string) =>
  displayName !== null && displayName !== undefined && displayName !== "" && displayName !== id
    ? `${displayName} (${id})`
    : id;

const formatAssignees = (users: HITLDetail["assigned_users"]) => {
  if (users === undefined || users.length === 0) {
    return undefined;
  }

  return users.map((user) => user.name).join(", ");
};

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
      <RouterLink fontSize="xs" key={item.label} onClick={stopAccordionToggle} to={item.to} truncate>
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

const HITLNotificationSummary = ({
  detail,
  showRunContext,
}: {
  readonly detail: HITLDetail;
  readonly showRunContext: boolean;
}) => {
  const dagName = formatDisplayName(detail.task_instance.dag_display_name, detail.task_instance.dag_id);
  const taskName = formatDisplayName(
    detail.task_instance.task_display_name,
    formatTaskId(detail.task_instance),
  );

  return (
    <VStack alignItems="stretch" gap={2} minW={0}>
      {showRunContext ? (
        <SummaryMetaGrid
          items={[
            { label: DAG_LABEL, to: `/dags/${detail.task_instance.dag_id}`, value: dagName },
            {
              label: DAG_RUN_LABEL,
              to: `/dags/${detail.task_instance.dag_id}/runs/${detail.task_instance.dag_run_id}`,
              value: detail.task_instance.dag_run_id,
            },
          ]}
          templateColumns="minmax(0, 1fr) minmax(0, 1.35fr)"
        />
      ) : undefined}
      <Text fontSize="sm" fontWeight="medium" truncate>
        {taskName}
      </Text>
    </VStack>
  );
};

const HITLNotificationDetails = ({
  assignees,
  detail,
  hitlDetail,
  isLoading,
  mappedIndex,
}: {
  readonly assignees?: string;
  readonly detail: HITLDetail;
  readonly hitlDetail?: ComponentProps<typeof HITLResponseForm>["hitlDetail"];
  readonly isLoading: boolean;
  readonly mappedIndex?: number | string;
}) => (
  <VStack alignItems="stretch" gap={2}>
    <VStack alignItems="stretch" gap={1.5} minW={0}>
      <MetaRow label={SUBJECT_LABEL} value={detail.subject} />
      {assignees === undefined ? undefined : <MetaRow label={ASSIGNED_LABEL} value={assignees} />}
      <MetaRow
        label={REQUESTED_LABEL}
        value={<Time datetime={detail.created_at} format={DEFAULT_DATETIME_FORMAT} />}
      />
      <MetaRow label={ATTEMPT_LABEL} value={detail.task_instance.try_number} />
      {mappedIndex === undefined ? undefined : <MetaRow label={MAP_LABEL} value={mappedIndex} />}
    </VStack>
    <Box>
      <HITLTaskInstanceLink taskInstance={detail.task_instance}>{OPEN_TASK_LABEL}</HITLTaskInstanceLink>
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
);

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
  const assignees = formatAssignees(detail.assigned_users);
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
    <HStack alignItems="flex-start" gap={2} width="100%">
      <RouterLink
        flexShrink={0}
        fontSize="sm"
        pt={3}
        to={`${getTaskInstanceLink(detail.task_instance)}/required_actions`}
      >
        {TASK_PREFIX}
      </RouterLink>
      <Box flex={1} minW={0}>
        <NotificationCard accent="fg.info" aria-label={`${hitlState}: ${detail.subject}`}>
          <Accordion.Root
            collapsible
            onValueChange={(event) => setOpenItems(event.value)}
            value={openItems}
            variant="plain"
            width="100%"
          >
            <Accordion.Item value={accordionValue} width="100%">
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
                  <HITLNotificationSummary detail={detail} showRunContext={showRunContext} />
                </Box>
              </Accordion.ItemTrigger>
              <Accordion.ItemContent width="100%">
                <Accordion.ItemBody borderTopColor="border" borderTopWidth={1} px={3} py={3}>
                  <HITLNotificationDetails
                    assignees={assignees}
                    detail={detail}
                    hitlDetail={hitlDetail}
                    isLoading={isLoading}
                    mappedIndex={mappedIndex}
                  />
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          </Accordion.Root>
        </NotificationCard>
      </Box>
    </HStack>
  );
};
