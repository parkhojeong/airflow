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
import { Box, CloseButton, Drawer, Portal, Text } from "@chakra-ui/react";

import type { HITLDetail } from "openapi/requests/types.gen";
import { ErrorAlert } from "src/components/ErrorAlert";
import { HITLNotificationCard } from "src/layouts/Nav/HITLNotificationCard";

const REQUIRED_ACTIONS_LABEL = "Required actions";
const LOADING_LABEL = "Loading required actions...";
const EMPTY_LABEL = "No required actions";

type RequiredActionsDrawerProps = {
  readonly details: Array<HITLDetail>;
  readonly error?: unknown;
  readonly isError?: boolean;
  readonly isLoading?: boolean;
  readonly onClose: () => void;
  readonly open: boolean;
  readonly selectedDetail?: HITLDetail;
};

export const RequiredActionsDrawer = ({
  details,
  error,
  isError = false,
  isLoading = false,
  onClose,
  open,
  selectedDetail,
}: RequiredActionsDrawerProps) => {
  const visibleSelected = selectedDetail ?? details[0];

  return (
    <Drawer.Root
      lazyMount
      onOpenChange={(event) => {
        if (!event.open) {
          onClose();
        }
      }}
      open={open}
      size="xl"
      unmountOnExit
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>{REQUIRED_ACTIONS_LABEL}</Drawer.Title>
            </Drawer.Header>
            <Drawer.CloseTrigger asChild>
              <CloseButton position="absolute" right={2} size="sm" top={2} />
            </Drawer.CloseTrigger>
            <Drawer.Body>
              {isLoading ? (
                <Text color="fg.muted" fontSize="sm">
                  {LOADING_LABEL}
                </Text>
              ) : isError ? (
                <ErrorAlert error={error} />
              ) : visibleSelected === undefined ? (
                <Text color="fg.muted" fontSize="sm">
                  {EMPTY_LABEL}
                </Text>
              ) : (
                <Box minW={0}>
                  <HITLNotificationCard detail={visibleSelected} onNavigate={onClose} onResponded={onClose} />
                </Box>
              )}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};
