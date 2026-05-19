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
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

import Time from "src/components/Time";

import { NotificationSectionHeading } from "./NotificationCard";
import {
  formatNotificationTime,
  getDagRunListDateFormat,
  getParsedDagRunMeta,
} from "./notificationDisplayUtils";

export const NotificationRow = ({
  datetime,
  isRead = false,
  label,
  onPrefetch,
  onSelect,
  selected,
}: {
  readonly datetime?: string;
  readonly isRead?: boolean;
  readonly label: string;
  readonly onPrefetch?: () => void;
  readonly onSelect: () => void;
  readonly selected: boolean;
}) => {
  const formattedTime = formatNotificationTime(datetime);

  return (
    <Box
      _hover={{ bg: selected ? "bg.muted" : "bg.subtle" }}
      aria-pressed={selected}
      as="button"
      bg={selected ? "bg.muted" : undefined}
      borderColor={selected ? "border.emphasized" : "transparent"}
      borderRadius="md"
      borderWidth={1}
      cursor="pointer"
      onClick={onSelect}
      onMouseEnter={onPrefetch}
      opacity={isRead && !selected ? 0.5 : 1}
      position="relative"
      px={1.5}
      py={1.5}
      textAlign="left"
      width="100%"
      zIndex={selected ? 2 : undefined}
    >
      <HStack gap={2} minW={0} width="100%">
        <VStack alignItems="stretch" flex={1} gap={0} minW={0}>
          <Text
            color={selected ? "fg" : "fg.muted"}
            fontSize="xs"
            fontWeight={selected ? "semibold" : "normal"}
            minW={0}
            truncate
          >
            {label}
          </Text>
        </VStack>
        {formattedTime === undefined ? undefined : (
          <Text color="fg.subtle" flexShrink={0} fontSize="xs">
            {formattedTime}
          </Text>
        )}
      </HStack>
    </Box>
  );
};

export const DagRunSection = ({
  children,
  dagRunId,
  fallbackRunAfter,
  separated,
  showSeconds,
}: {
  readonly children: ReactNode;
  readonly dagRunId: string;
  readonly fallbackRunAfter?: string;
  readonly separated: boolean;
  readonly showSeconds: boolean;
}) => {
  const dagRunMeta = getParsedDagRunMeta(dagRunId, fallbackRunAfter);

  return (
    <VStack alignItems="stretch" gap={0.5} minW={0} pt={separated ? 3 : undefined} width="100%">
      <HStack color="fg.muted" fontSize="xs" fontWeight="medium" gap={1} minW={0} px={2}>
        {dagRunMeta?.runAfter === undefined ? (
          <Text truncate>{dagRunId}</Text>
        ) : (
          <>
            <Text flexShrink={0}>{dagRunMeta.runType}</Text>
            <Text flexShrink={0}>·</Text>
            <Time
              datetime={dagRunMeta.runAfter}
              format={getDagRunListDateFormat(dagRunMeta.runAfter, showSeconds)}
            />
          </>
        )}
      </HStack>
      <VStack alignItems="stretch" gap={0.5} minW={0} pl={2} width="100%">
        {children}
      </VStack>
    </VStack>
  );
};

export const DagSection = ({ children, dagId }: { readonly children: ReactNode; readonly dagId: string }) => (
  <VStack
    alignItems="stretch"
    bg="bg"
    borderColor="border"
    borderRadius="md"
    borderWidth={1}
    gap={0}
    minW={0}
    width="100%"
  >
    <Text
      borderBottomColor="border"
      borderBottomWidth={1}
      color="fg"
      fontSize="xs"
      fontWeight="semibold"
      px={3}
      py={2}
      truncate
    >
      {dagId}
    </Text>
    <VStack alignItems="stretch" gap={2.5} minW={0} px={3} py={2.5} width="100%">
      {children}
    </VStack>
  </VStack>
);

export const StatusText = ({
  children,
  tone = "muted",
}: {
  readonly children: string;
  readonly tone?: "error" | "muted";
}) => (
  <Text color={tone === "error" ? "fg.error" : "fg.muted"} fontSize="sm" px={3}>
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
    gap={2}
    minW={0}
    py={2}
    width="100%"
  >
    {children}
  </VStack>
);

export const DagSections = ({ children }: { readonly children: ReactNode }) => (
  <VStack alignItems="stretch" gap={3} minW={0} width="100%">
    {children}
  </VStack>
);

const SectionHeader = ({ children }: { readonly children: string }) => (
  <Box px={2}>
    <NotificationSectionHeading>{children}</NotificationSectionHeading>
  </Box>
);

export const NotificationTypeSection = ({
  children,
  heading,
}: {
  readonly children: ReactNode;
  readonly heading: string;
}) => (
  <VStack alignItems="stretch" gap={2} minW={0} width="100%">
    <SectionHeader>{heading}</SectionHeader>
    {children}
  </VStack>
);
