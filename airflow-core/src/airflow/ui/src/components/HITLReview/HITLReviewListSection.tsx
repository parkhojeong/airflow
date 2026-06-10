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
import { Heading, Text, VStack } from "@chakra-ui/react";

import type { HITLDetail } from "openapi/requests/types.gen.ts";

import { HITLReviewList } from "./HITLReviewList.tsx";

const LOAD_HITL_ERROR_LABEL = "Unable to load HITL actions";
const LOADING_HITL_LABEL = "Loading HITL actions...";

export const HITLReviewListSection = ({
  details,
  heading,
  isError = false,
  isLoading = false,
  onSelect,
  selectedKey,
}: {
  readonly details?: Array<HITLDetail>;
  readonly heading: string;
  readonly isError?: boolean;
  readonly isLoading?: boolean;
  readonly onSelect: (selection: HITLDetail) => void;
  readonly selectedKey?: string;
}) => (
  <VStack alignItems="stretch" gap={2} minW={0} width="100%">
    <Heading px={2} size="sm">
      {heading}
    </Heading>
    <VStack
      alignItems="stretch"
      bg="bg"
      borderColor="border"
      borderRadius="md"
      borderWidth={1}
      gap={0}
      minW={0}
      overflow="hidden"
      width="100%"
    >
      {isLoading ? (
        <Text color="fg.error" fontSize="sm" px={3} py={2}>
          {LOADING_HITL_LABEL}
        </Text>
      ) : isError ? (
        <Text color="fg.error" fontSize="sm" px={3} py={2}>
          {LOAD_HITL_ERROR_LABEL}
        </Text>
      ) : (
        <HITLReviewList details={details ?? []} onSelect={onSelect} selectedKey={selectedKey} />
      )}
    </VStack>
  </VStack>
);
