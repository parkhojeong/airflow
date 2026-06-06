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
import { Table, Text, VStack } from "@chakra-ui/react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";

import type { HITLDetail, HITLDetailCollection } from "openapi/requests/types.gen";
import Time from "src/components/Time";
import { useTimezone } from "src/context/timezone";
import { isHITLPending } from "src/utils/hitl";

import { NotificationSection, NotificationTypeSection, StatusText } from "./NotificationsListComponents";
import { getDagRunListDateFormat, getDagRunOrderTimestamp, getTimestamp } from "./notificationDisplayUtils";
import { prefetchHitlDetail } from "./notificationPrefetchUtils";

const LOAD_HITL_ERROR_LABEL = "Unable to load pending HITL actions";
const LOADING_HITL_LABEL = "Loading pending HITL actions...";
const NO_REQUIRED_ACTIONS_LABEL = "No required actions";
const NO_HITL_ACTIONS_LABEL = "No HITL actions";
const NO_COMPLETED_HITL_ACTIONS_LABEL = "No completed HITL actions";
const PENDING_HITL_LABEL = "Pending HITL";
const COMPLETED_HITL_LABEL = "Completed HITL";
const CREATED_AT_LABEL = "Created at";
const DAG_ID_LABEL = "Dag ID";
const DAG_RUN_LABEL = "Dag Run";
const MAP_INDEX_LABEL = "Map Index";
const TASK_ID_LABEL = "Task ID";

export type SelectedNotification = { readonly item: HITLDetail; readonly type: "hitl" };
export type NotificationFilterMode = "all" | "pending";

export const getNotificationKey = (selection: SelectedNotification): string =>
  `hitl:${selection.item.task_instance.id}`;

type NotificationsListProps = {
  readonly filterMode: NotificationFilterMode;
  readonly hitlData?: HITLDetailCollection;
  readonly hitlIsError: boolean;
  readonly hitlIsLoading: boolean;
  readonly onSelect: (selection: SelectedNotification) => void;
  readonly selectedKey?: string;
};

const getSectionLabel = (label: string, count?: number) =>
  count === undefined ? label : `${label} (${count})`;

const compareStrings = (left: string, right: string) => left.localeCompare(right);

const compareDates = (left?: string, right?: string) => getTimestamp(left) - getTimestamp(right);

const compareHitlNotifications = (left: HITLDetail, right: HITLDetail) =>
  compareStrings(left.task_instance.dag_id, right.task_instance.dag_id) ||
  getDagRunOrderTimestamp(left.task_instance.dag_run_id, left.task_instance.run_after) -
    getDagRunOrderTimestamp(right.task_instance.dag_run_id, right.task_instance.run_after) ||
  compareDates(left.created_at, right.created_at) ||
  compareStrings(left.task_instance.task_id, right.task_instance.task_id);

export const getNotificationsInDisplayOrder = ({
  hitlDetails,
}: {
  readonly hitlDetails: Array<HITLDetail>;
}): Array<SelectedNotification> =>
  [...hitlDetails].sort(compareHitlNotifications).map((item) => ({ item, type: "hitl" }) as const);

const isPendingHitlDetail = (detail: HITLDetail) =>
  !detail.response_received && isHITLPending(detail.task_instance.state);

const TableColumnHeader = ({ children, width }: { readonly children: string; readonly width?: string }) => (
  <Table.ColumnHeader color="fg.muted" fontSize="xs" fontWeight="medium" px={2} py={1.5} w={width}>
    {children}
  </Table.ColumnHeader>
);

const HITL_COL_SPAN = 5;

const EmptyRow = ({ colSpan, label }: { readonly colSpan: number; readonly label: string }) => (
  <Table.Row>
    <Table.Cell colSpan={colSpan} px={2} py={3} textAlign="center">
      <Text color="fg.muted" fontSize="xs">
        {label}
      </Text>
    </Table.Cell>
  </Table.Row>
);

const HitlTable = ({
  details,
  emptyLabel,
  onSelect,
  queryClient,
  selectedKey,
  timezone,
}: {
  readonly details: Array<HITLDetail>;
  readonly emptyLabel: string;
  readonly onSelect: (selection: SelectedNotification) => void;
  readonly queryClient: QueryClient;
  readonly selectedKey?: string;
  readonly timezone: string;
}) => {
  const groupIndices = details.reduce<Array<number>>((indices, detail, index) => {
    const previous = details[index - 1];
    const previousGroupIndex = indices.at(-1) ?? 0;

    indices.push(
      previous === undefined || detail.task_instance.dag_id === previous.task_instance.dag_id
        ? previousGroupIndex
        : previousGroupIndex + 1,
    );

    return indices;
  }, []);

  const GROUP_COLORS = ["green.500", "purple.500"];

  return (
    <Table.Root size="sm" tableLayout="fixed" width="100%">
      <Table.Header>
        <Table.Row>
          <TableColumnHeader width="30%">{DAG_ID_LABEL}</TableColumnHeader>
          <TableColumnHeader width="76px">{DAG_RUN_LABEL}</TableColumnHeader>
          <TableColumnHeader width="76px">{MAP_INDEX_LABEL}</TableColumnHeader>
          <TableColumnHeader>{TASK_ID_LABEL}</TableColumnHeader>
          <TableColumnHeader width="88px">{CREATED_AT_LABEL}</TableColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {details.length === 0 ? (
          <EmptyRow colSpan={HITL_COL_SPAN} label={emptyLabel} />
        ) : (
          details.map((detail, index) => {
            const key = getNotificationKey({ item: detail, type: "hitl" });
            const selected = selectedKey === key;
            const ti = detail.task_instance;
            const mappedIndex =
              ti.rendered_map_index ?? (ti.map_index >= 0 ? String(ti.map_index) : undefined);
            const groupColor = GROUP_COLORS[(groupIndices[index] ?? 0) % GROUP_COLORS.length];

            return (
              <Table.Row
                _hover={{ bg: selected ? "bg.muted" : "bg.subtle" }}
                aria-pressed={selected}
                bg={selected ? "bg.muted" : undefined}
                cursor="pointer"
                key={key}
                onClick={() => onSelect({ item: detail, type: "hitl" })}
                onMouseEnter={() => prefetchHitlDetail(queryClient, detail)}
              >
                <Table.Cell
                  borderLeftColor={groupColor}
                  borderLeftWidth={3}
                  overflow="hidden"
                  px={2}
                  py={1.5}
                >
                  <Text fontSize="xs" truncate>
                    {ti.dag_id}
                  </Text>
                </Table.Cell>
                <Table.Cell px={2} py={1.5}>
                  <Text fontSize="xs">
                    <Time
                      datetime={ti.run_after}
                      format={getDagRunListDateFormat(ti.run_after, true, timezone)}
                    />
                  </Text>
                </Table.Cell>
                <Table.Cell px={2} py={1.5}>
                  <Text color="fg.muted" fontSize="xs">
                    {mappedIndex}
                  </Text>
                </Table.Cell>
                <Table.Cell overflow="hidden" px={2} py={1.5}>
                  <Text fontSize="xs" truncate>
                    {ti.task_id}
                  </Text>
                </Table.Cell>
                <Table.Cell px={2} py={1.5}>
                  <Text fontSize="xs">
                    <Time
                      datetime={detail.created_at}
                      format={getDagRunListDateFormat(detail.created_at, false, timezone)}
                    />
                  </Text>
                </Table.Cell>
              </Table.Row>
            );
          })
        )}
      </Table.Body>
    </Table.Root>
  );
};

export const NotificationsList = ({
  filterMode,
  hitlData,
  hitlIsError,
  hitlIsLoading,
  onSelect,
  selectedKey,
}: NotificationsListProps) => {
  const queryClient = useQueryClient();
  const { selectedTimezone } = useTimezone();
  const hitlDetails = [...(hitlData?.hitl_details ?? [])].sort(compareHitlNotifications);
  const isShowingAllActions = filterMode === "all";
  const pendingHitlDetails = isShowingAllActions ? hitlDetails.filter(isPendingHitlDetail) : hitlDetails;
  const completedHitlDetails = isShowingAllActions
    ? hitlDetails.filter((detail) => Boolean(detail.response_received))
    : [];

  return (
    <VStack alignItems="stretch" gap={4} width="100%">
      <NotificationTypeSection heading={getSectionLabel(PENDING_HITL_LABEL, pendingHitlDetails.length)}>
        <NotificationSection>
          {hitlIsLoading ? (
            <StatusText>{LOADING_HITL_LABEL}</StatusText>
          ) : hitlIsError ? (
            <StatusText tone="error">{LOAD_HITL_ERROR_LABEL}</StatusText>
          ) : (
            <HitlTable
              details={pendingHitlDetails}
              emptyLabel={NO_REQUIRED_ACTIONS_LABEL}
              onSelect={onSelect}
              queryClient={queryClient}
              selectedKey={selectedKey}
              timezone={selectedTimezone}
            />
          )}
        </NotificationSection>
      </NotificationTypeSection>
      {isShowingAllActions ? (
        <NotificationTypeSection heading={getSectionLabel(COMPLETED_HITL_LABEL, completedHitlDetails.length)}>
          <NotificationSection>
            {hitlIsLoading ? (
              <StatusText>{LOADING_HITL_LABEL}</StatusText>
            ) : hitlIsError ? (
              <StatusText tone="error">{LOAD_HITL_ERROR_LABEL}</StatusText>
            ) : (
              <HitlTable
                details={completedHitlDetails}
                emptyLabel={
                  hitlDetails.length === 0 ? NO_HITL_ACTIONS_LABEL : NO_COMPLETED_HITL_ACTIONS_LABEL
                }
                onSelect={onSelect}
                queryClient={queryClient}
                selectedKey={selectedKey}
                timezone={selectedTimezone}
              />
            )}
          </NotificationSection>
        </NotificationTypeSection>
      ) : undefined}
    </VStack>
  );
};
