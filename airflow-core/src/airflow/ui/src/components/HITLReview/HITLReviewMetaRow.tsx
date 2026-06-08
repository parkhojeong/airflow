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
import { Table } from "@chakra-ui/react";
import type { ReactNode } from "react";

export const HITLReviewMetaRow = ({
  label,
  value,
}: {
  readonly label: string;
  readonly value: ReactNode;
}) => (
  <Table.Row>
    <Table.Cell
      as="th"
      color="fg.subtle"
      fontSize="xs"
      fontWeight="normal"
      px={2}
      py={1.5}
      scope="row"
      w="30%"
    >
      {label}
    </Table.Cell>
    <Table.Cell fontSize="xs" px={2} py={1.5}>
      {value}
    </Table.Cell>
  </Table.Row>
);
