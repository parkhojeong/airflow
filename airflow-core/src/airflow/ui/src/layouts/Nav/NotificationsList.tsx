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
import { useMemo } from "react";

import { useTimezone } from "src/context/timezone";

import type {
  DeadlineCollectionResponse,
  DeadlineResponse,
  HITLDetail,
  HITLDetailCollection,
} from "openapi/requests/types.gen";
import Time from "src/components/Time";

import { NotificationSection, NotificationTypeSection, StatusText } from "./NotificationsListComponents";
import {
  getDagRunListDateFormat,
  getDagRunOrderTimestamp,
  getParsedDagRunMeta,
  getTimestamp,
} from "./notificationDisplayUtils";
import { prefetchHitlDetail } from "./notificationPrefetchUtils";

const MISSED_DEADLINES_LABEL = "Missed deadlines";
const LOAD_DEADLINES_ERROR_LABEL = "Unable to load deadline alerts";
const LOAD_HITL_ERROR_LABEL = "Unable to load pending HITL actions";
const LOADING_DEADLINES_LABEL = "Loading deadline alerts...";
const LOADING_HITL_LABEL = "Loading pending HITL actions...";
const NO_MISSED_DEADLINES_LABEL = "No missed deadlines";
const NO_REQUIRED_ACTIONS_LABEL = "No required actions";
const PENDING_HITL_LABEL = "Pending HITL";
const UNTITLED_DEADLINE_LABEL = "Missed deadline";

export type SelectedNotification =
  | { readonly item: DeadlineResponse; readonly type: "deadline" }
  | { readonly item: HITLDetail; readonly type: "hitl" };

export const getNotificationKey = (selection: SelectedNotification): string =>
  selection.type === "hitl" ? `hitl:${selection.item.task_instance.id}` : `deadline:${selection.item.id}`;

type NotificationsListProps = {
  readonly deadlineData?: DeadlineCollectionResponse;
  readonly deadlineIsError: boolean;
  readonly deadlineIsLoading: boolean;
  readonly hitlData?: HITLDetailCollection;
  readonly hitlIsError: boolean;
  readonly hitlIsLoading: boolean;
  readonly hitlReadIds: ReadonlySet<string>;
  readonly onSelect: (selection: SelectedNotification) => void;
  readonly readIds: ReadonlySet<string>;
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

const compareDeadlineNotifications = (left: DeadlineResponse, right: DeadlineResponse) =>
  compareStrings(left.dag_id, right.dag_id) ||
  getDagRunOrderTimestamp(left.dag_run_id) - getDagRunOrderTimestamp(right.dag_run_id) ||
  compareDates(left.deadline_time, right.deadline_time) ||
  compareStrings(left.alert_name ?? UNTITLED_DEADLINE_LABEL, right.alert_name ?? UNTITLED_DEADLINE_LABEL);

export const getNotificationsInDisplayOrder = ({
  deadlines,
  hitlDetails,
}: {
  readonly deadlines: Array<DeadlineResponse>;
  readonly hitlDetails: Array<HITLDetail>;
}): Array<SelectedNotification> => {
  const hitlNotifications = [...hitlDetails]
    .sort(compareHitlNotifications)
    .map((item) => ({ item, type: "hitl" }) as const);
  const deadlineNotifications = [...deadlines]
    .sort(compareDeadlineNotifications)
    .map((item) => ({ item, type: "deadline" }) as const);

  return [...hitlNotifications, ...deadlineNotifications];
};


const TableColumnHeader = ({ children, w }: { readonly children: string; readonly w?: string }) => (
  <Table.ColumnHeader color="fg.muted" fontSize="xs" fontWeight="medium" px={2} py={1.5} w={w}>
    {children}
  </Table.ColumnHeader>
);

const HITL_COL_SPAN = 5;
const DEADLINE_COL_SPAN = 4;

const EmptyRow = ({ colSpan, label }: { readonly colSpan: number; readonly label: string }) => (
  <Table.Row>
    <Table.Cell colSpan={colSpan} px={2} py={3} textAlign="center">
      <Text color="fg.muted" fontSize="xs">{label}</Text>
    </Table.Cell>
  </Table.Row>
);

const HitlTable = ({
  details,
  emptyLabel,
  onSelect,
  queryClient,
  readIds,
  selectedKey,
  timezone,
}: {
  readonly details: Array<HITLDetail>;
  readonly emptyLabel: string;
  readonly onSelect: (selection: SelectedNotification) => void;
  readonly queryClient: QueryClient;
  readonly readIds: ReadonlySet<string>;
  readonly selectedKey?: string;
  readonly timezone: string;
}) => (
  <Table.Root size="sm" tableLayout="fixed" width="100%">
    <Table.Header>
      <Table.Row>
        <TableColumnHeader w="30%">Dag ID</TableColumnHeader>
        <TableColumnHeader w="76px">Dag Run</TableColumnHeader>
        <TableColumnHeader w="76px">Map Index</TableColumnHeader>
        <TableColumnHeader>Task ID</TableColumnHeader>
        <TableColumnHeader w="88px">Created at</TableColumnHeader>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {details.length === 0 ? (
        <EmptyRow colSpan={HITL_COL_SPAN} label={emptyLabel} />
      ) : details.map((detail) => {
        const key = getNotificationKey({ item: detail, type: "hitl" });
        const selected = selectedKey === key;
        const ti = detail.task_instance;
        const mappedIndex =
          ti.rendered_map_index ?? (ti.map_index >= 0 ? String(ti.map_index) : undefined);

        return (
          <Table.Row
            _hover={{ bg: selected ? "bg.muted" : "bg.subtle" }}
            aria-pressed={selected}
            bg={selected ? "bg.muted" : undefined}
            cursor="pointer"
            key={key}
            onClick={() => onSelect({ item: detail, type: "hitl" })}
            onMouseEnter={() => prefetchHitlDetail(queryClient, detail)}
            opacity={readIds.has(detail.task_instance.id) && !selected ? 0.5 : 1}
          >
            <Table.Cell overflow="hidden" px={2} py={1.5}>
              <Text fontSize="xs" truncate>{ti.dag_id}</Text>
            </Table.Cell>
            <Table.Cell px={2} py={1.5}>
              <Text fontSize="xs">
                <Time datetime={ti.run_after} format={getDagRunListDateFormat(ti.run_after, true, timezone)} />
              </Text>
            </Table.Cell>
            <Table.Cell px={2} py={1.5}>
              <Text color="fg.muted" fontSize="xs">{mappedIndex}</Text>
            </Table.Cell>
            <Table.Cell overflow="hidden" px={2} py={1.5}>
              <Text fontSize="xs" truncate>{ti.task_id}</Text>
            </Table.Cell>
            <Table.Cell px={2} py={1.5}>
              <Text fontSize="xs">
                <Time datetime={detail.created_at} format={getDagRunListDateFormat(detail.created_at ?? "", false, timezone)} />
              </Text>
            </Table.Cell>
          </Table.Row>
        );
      })}
    </Table.Body>
  </Table.Root>
);

const DeadlineTable = ({
  deadlines,
  emptyLabel,
  onSelect,
  readIds,
  selectedKey,
  timezone,
}: {
  readonly deadlines: Array<DeadlineResponse>;
  readonly emptyLabel: string;
  readonly onSelect: (selection: SelectedNotification) => void;
  readonly readIds: ReadonlySet<string>;
  readonly selectedKey?: string;
  readonly timezone: string;
}) => (
  <Table.Root size="sm" tableLayout="fixed" width="100%">
    <Table.Header>
      <Table.Row>
        <TableColumnHeader w="30%">Dag ID</TableColumnHeader>
        <TableColumnHeader w="76px">Dag Run</TableColumnHeader>
        <TableColumnHeader>Alert</TableColumnHeader>
        <TableColumnHeader w="88px">Deadline</TableColumnHeader>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {deadlines.length === 0 ? (
        <EmptyRow colSpan={DEADLINE_COL_SPAN} label={emptyLabel} />
      ) : deadlines.map((deadline) => {
        const key = getNotificationKey({ item: deadline, type: "deadline" });
        const selected = selectedKey === key;
        const runAfter = getParsedDagRunMeta(deadline.dag_run_id)?.runAfter;

        return (
          <Table.Row
            _hover={{ bg: selected ? "bg.muted" : "bg.subtle" }}
            aria-pressed={selected}
            bg={selected ? "bg.muted" : undefined}
            cursor="pointer"
            key={key}
            onClick={() => onSelect({ item: deadline, type: "deadline" })}
            opacity={readIds.has(deadline.id) && !selected ? 0.5 : 1}
          >
            <Table.Cell overflow="hidden" px={2} py={1.5}>
              <Text fontSize="xs" truncate>{deadline.dag_id}</Text>
            </Table.Cell>
            <Table.Cell px={2} py={1.5}>
              <Text fontSize="xs">
                {runAfter === undefined ? (
                  deadline.dag_run_id
                ) : (
                  <Time datetime={runAfter} format={getDagRunListDateFormat(runAfter, true, timezone)} />
                )}
              </Text>
            </Table.Cell>
            <Table.Cell overflow="hidden" px={2} py={1.5}>
              <Text fontSize="xs" truncate>{deadline.alert_name ?? UNTITLED_DEADLINE_LABEL}</Text>
            </Table.Cell>
            <Table.Cell px={2} py={1.5}>
              <Text fontSize="xs">
                <Time datetime={deadline.deadline_time} format={getDagRunListDateFormat(deadline.deadline_time, false, timezone)} />
              </Text>
            </Table.Cell>
          </Table.Row>
        );
      })}
    </Table.Body>
  </Table.Root>
);

export const NotificationsList = ({
  deadlineData,
  deadlineIsError,
  deadlineIsLoading,
  hitlData,
  hitlIsError,
  hitlIsLoading,
  hitlReadIds,
  onSelect,
  readIds,
  selectedKey,
}: NotificationsListProps) => {
  const queryClient = useQueryClient();
  const { selectedTimezone } = useTimezone();
  const deadlines = useMemo(
    () => [...(deadlineData?.deadlines ?? [])].sort(compareDeadlineNotifications),
    [deadlineData?.deadlines],
  );
  const hitlDetails = useMemo(
    () => [...(hitlData?.hitl_details ?? [])].sort(compareHitlNotifications),
    [hitlData?.hitl_details],
  );

  return (
    <VStack alignItems="stretch" gap={4} width="100%">
      <NotificationTypeSection heading={getSectionLabel(PENDING_HITL_LABEL, hitlDetails.length)}>
        <NotificationSection>
          {hitlIsLoading ? (
            <StatusText>{LOADING_HITL_LABEL}</StatusText>
          ) : hitlIsError ? (
            <StatusText tone="error">{LOAD_HITL_ERROR_LABEL}</StatusText>
          ) : (
            <HitlTable
              details={hitlDetails}
              emptyLabel={NO_REQUIRED_ACTIONS_LABEL}
              onSelect={onSelect}
              queryClient={queryClient}
              readIds={hitlReadIds}
              selectedKey={selectedKey}
              timezone={selectedTimezone}
            />
          )}
        </NotificationSection>
      </NotificationTypeSection>
      <NotificationTypeSection heading={getSectionLabel(MISSED_DEADLINES_LABEL, deadlines.length)}>
        <NotificationSection>
          {deadlineIsLoading ? (
            <StatusText>{LOADING_DEADLINES_LABEL}</StatusText>
          ) : deadlineIsError ? (
            <StatusText tone="error">{LOAD_DEADLINES_ERROR_LABEL}</StatusText>
          ) : (
            <DeadlineTable
              deadlines={deadlines}
              emptyLabel={NO_MISSED_DEADLINES_LABEL}
              onSelect={onSelect}
              readIds={readIds}
              selectedKey={selectedKey}
              timezone={selectedTimezone}
            />
          )}
        </NotificationSection>
      </NotificationTypeSection>
    </VStack>
  );
};
