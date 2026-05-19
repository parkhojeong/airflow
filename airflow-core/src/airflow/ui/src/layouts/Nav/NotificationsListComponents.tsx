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
import type { ReactNode } from "react";

export const StatusText = ({
  children,
  tone = "muted",
}: {
  readonly children: string;
  readonly tone?: "error" | "muted";
}) => (
  <Text color={tone === "error" ? "fg.error" : "fg.muted"} fontSize="sm" px={3} py={2}>
    {children}
  </Text>
);

export const NotificationSection = ({ children }: { readonly children: ReactNode }) => (
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
    {children}
  </VStack>
);

export const NotificationTypeSection = ({
  children,
  heading,
}: {
  readonly children: ReactNode;
  readonly heading: string;
}) => (
  <VStack alignItems="stretch" gap={2} minW={0} width="100%">
    <Heading px={2} size="sm">{heading}</Heading>
    {children}
  </VStack>
);
