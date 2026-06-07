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
import { Button, Group } from "@chakra-ui/react";

import type { RequiredActionsFilterMode } from "./RequiredActionsList";

const PENDING_ACTIONS_LABEL = "Pending";
const ALL_ACTIONS_LABEL = "All";

export const PENDING_ACTIONS_VALUE = "pending" satisfies RequiredActionsFilterMode;
export const ALL_ACTIONS_VALUE = "all" satisfies RequiredActionsFilterMode;

const REQUIRED_ACTION_FILTER_OPTIONS: Array<{ label: string; value: RequiredActionsFilterMode }> = [
  { label: PENDING_ACTIONS_LABEL, value: PENDING_ACTIONS_VALUE },
  { label: ALL_ACTIONS_LABEL, value: ALL_ACTIONS_VALUE },
];

export const getRequiredActionsFilterMode = (value?: string): RequiredActionsFilterMode =>
  value === ALL_ACTIONS_VALUE ? ALL_ACTIONS_VALUE : PENDING_ACTIONS_VALUE;

export const RequiredActionsFilter = ({
  onChange,
  value,
}: {
  readonly onChange: (value: RequiredActionsFilterMode) => void;
  readonly value: RequiredActionsFilterMode;
}) => (
  <Group backgroundColor="bg.muted" borderColor="border.emphasized" borderRadius={8} borderWidth={1} p={0.5}>
    {REQUIRED_ACTION_FILTER_OPTIONS.map((option) => {
      const selected = value === option.value;

      return (
        <Button
          _hover={{ backgroundColor: "bg.emphasized" }}
          bg={selected ? "bg.panel" : undefined}
          borderColor={selected ? "border.emphasized" : "transparent"}
          borderWidth={selected ? 1 : 0}
          key={option.value}
          minH={6}
          onClick={() => onChange(option.value)}
          px={2}
          size="xs"
          variant="ghost"
        >
          {option.label}
        </Button>
      );
    })}
  </Group>
);
