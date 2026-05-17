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
import { Badge, Box, Heading, HStack, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

import Time from "src/components/Time";
import { Tooltip } from "src/components/ui";
import { getRelativeTime } from "src/utils/datetimeUtils";

type NotificationAccent = "fg.error" | "fg.info";

type NotificationCardProps = {
  readonly accent: NotificationAccent;
  readonly "aria-label"?: string;
  readonly children: ReactNode;
  readonly meta?: ReactNode;
  readonly selected?: boolean;
  readonly title?: ReactNode;
};

export const NotificationCard = ({
  accent,
  "aria-label": ariaLabel,
  children,
  meta,
  selected = false,
  title,
}: NotificationCardProps) => (
  <Box
    _focusVisible={{
      outline: "2px solid",
      outlineColor: accent,
      outlineOffset: "2px",
    }}
    appearance="none"
    aria-label={ariaLabel}
    bg="bg"
    borderColor={selected ? accent : "border"}
    borderRadius="md"
    borderWidth={1}
    color="inherit"
    font="inherit"
    overflow="hidden"
    p={0}
    textAlign="start"
    width="100%"
  >
    <VStack alignItems="stretch" gap={2} minW={0} width="100%">
      {title === undefined && meta === undefined ? undefined : (
        <HStack alignItems="flex-start" gap={2} justifyContent="space-between" minW={0} width="100%">
          {title === undefined ? (
            <Box flex={1} minW={0} />
          ) : (
            <Box flex={1} fontWeight="semibold" lineClamp={2} minW={0}>
              {title}
            </Box>
          )}
          {meta}
        </HStack>
      )}
      {children}
    </VStack>
  </Box>
);

export const RelativeTimePill = ({ datetime }: { readonly datetime: string }) => {
  const relative = getRelativeTime(datetime);

  if (relative === "") {
    return undefined;
  }

  return (
    <Tooltip content={<Time datetime={datetime} />}>
      <Badge flexShrink={0} variant="subtle">
        {relative}
      </Badge>
    </Tooltip>
  );
};

export const NotificationSectionHeading = ({
  children,
}: {
  readonly children: ReactNode;
}) => (
  <HStack gap={2} justifyContent="flex-start">
    <Heading size="sm">{children}</Heading>
  </HStack>
);
