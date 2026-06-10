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
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useTranslation } from "react-i18next";

import type { HITLDetail } from "openapi/requests/types.gen.ts";
import Time from "src/components/Time.tsx";
import { useTimezone } from "src/context/timezone";

dayjs.extend(utc);
dayjs.extend(tz);

const getHitlReviewListDateFormat = (datetime: string, showSeconds: boolean, timezone: string) => {
  if (dayjs(datetime).tz(timezone).isSame(dayjs().tz(timezone), "day")) {
    return `HH:mm${showSeconds ? ":ss" : ""}`;
  }

  return `MMM D, HH:mm${showSeconds ? ":ss" : ""}`;
};

const TableColumnHeader = ({ children, width }: { readonly children: string; readonly width?: string }) => (
  <Table.ColumnHeader color="fg.muted" fontSize="xs" fontWeight="medium" px={2} py={1.5} w={width}>
    {children}
  </Table.ColumnHeader>
);

const getHitlGroupIndices = (details: Array<HITLDetail>) =>
  details.reduce<Array<number>>((indices, detail, index) => {
    const previous = details[index - 1];
    const previousGroupIndex = indices.at(-1) ?? 0;

    indices.push(
      previous === undefined || detail.task_instance.dag_id === previous.task_instance.dag_id
        ? previousGroupIndex
        : previousGroupIndex + 1,
    );

    return indices;
  }, []);

export const HITLReviewList = ({
  details,
  onSelect,
  selectedKey,
}: {
  readonly details: Array<HITLDetail>;
  readonly onSelect: (selection: HITLDetail) => void;
  readonly selectedKey?: string;
}) => {
  const { t: translate } = useTranslation("hitl");
  const { selectedTimezone } = useTimezone();
  const groupIndices = getHitlGroupIndices(details);

  return (
    <Table.Root size="sm" tableLayout="fixed" width="100%">
      <Table.Header>
        <Table.Row>
          <TableColumnHeader width="30%">{translate("review.fields.dagId")}</TableColumnHeader>
          <TableColumnHeader width="76px">{translate("review.fields.dagRun")}</TableColumnHeader>
          <TableColumnHeader width="76px">{translate("review.fields.mapIndex")}</TableColumnHeader>
          <TableColumnHeader>{translate("review.fields.taskId")}</TableColumnHeader>
          <TableColumnHeader width="88px">{translate("review.fields.createdAt")}</TableColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {details.length === 0
          ? null
          : details.map((detail, index) => {
              const key = detail.task_instance.id;
              const selected = selectedKey === key;
              const ti = detail.task_instance;
              const mappedIndex =
                ti.rendered_map_index ?? (ti.map_index >= 0 ? String(ti.map_index) : undefined);
              const groupColor = ["green.500", "purple.500"][(groupIndices[index] ?? 0) % 2];

              return (
                <Table.Row
                  _hover={{ bg: selected ? "bg.muted" : "bg.subtle" }}
                  aria-pressed={selected}
                  bg={selected ? "bg.muted" : undefined}
                  cursor="pointer"
                  key={key}
                  onClick={() => onSelect(detail)}
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
                        format={getHitlReviewListDateFormat(ti.run_after, true, selectedTimezone)}
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
                        format={getHitlReviewListDateFormat(detail.created_at, false, selectedTimezone)}
                      />
                    </Text>
                  </Table.Cell>
                </Table.Row>
              );
            })}
      </Table.Body>
    </Table.Root>
  );
};
