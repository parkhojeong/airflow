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

import type { HITLReviewFilterMode } from "./types";

const PENDING_ACTIONS_LABEL = "Pending";
const ALL_ACTIONS_LABEL = "All";

export const PENDING_REVIEWS_VALUE = "pending" satisfies HITLReviewFilterMode;
export const ALL_REVIEWS_VALUE = "all" satisfies HITLReviewFilterMode;

const HITL_REVIEW_FILTER_OPTIONS: Array<{ label: string; value: HITLReviewFilterMode }> = [
  { label: PENDING_ACTIONS_LABEL, value: PENDING_REVIEWS_VALUE },
  { label: ALL_ACTIONS_LABEL, value: ALL_REVIEWS_VALUE },
];

export const getHITLReviewFilterMode = (value?: string): HITLReviewFilterMode =>
  value === ALL_REVIEWS_VALUE ? ALL_REVIEWS_VALUE : PENDING_REVIEWS_VALUE;

export const HITLReviewFilter = ({
  onChange,
  value,
}: {
  readonly onChange: (value: HITLReviewFilterMode) => void;
  readonly value: HITLReviewFilterMode;
}) => (
  <Group backgroundColor="bg.muted" borderColor="border.emphasized" borderRadius={8} borderWidth={1} p={0.5}>
    {HITL_REVIEW_FILTER_OPTIONS.map((option) => {
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
