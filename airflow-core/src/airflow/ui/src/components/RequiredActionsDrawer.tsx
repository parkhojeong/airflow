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
import { HITLNotificationCard } from "src/layouts/Nav/HITLNotificationCard";

const REQUIRED_ACTIONS_LABEL = "Required actions";
const EMPTY_LABEL = "No required actions";

type RequiredActionsDrawerProps = {
  readonly detail?: HITLDetail;
  readonly onClose: () => void;
  readonly open: boolean;
};

export const RequiredActionsDrawer = ({ detail, onClose, open }: RequiredActionsDrawerProps) => (
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
            {detail === undefined ? (
              <Text color="fg.muted" fontSize="sm">
                {EMPTY_LABEL}
              </Text>
            ) : (
              <Box minW={0}>
                <HITLNotificationCard detail={detail} onNavigate={onClose} onResponded={onClose} />
              </Box>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Portal>
  </Drawer.Root>
);
