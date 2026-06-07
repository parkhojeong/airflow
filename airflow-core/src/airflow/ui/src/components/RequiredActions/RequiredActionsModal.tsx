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
import { Box, Button, Heading, HStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Dialog } from "src/components/ui";

import { HITLRequiredActionsList } from "./HITL/HITLRequiredActionsList";
import { RequiredActionDetailPane } from "./RequiredActionDetailPane";
import { RequiredActionNavigation } from "./RequiredActionNavigation";
import { RequiredActionsFilter } from "./RequiredActionsFilter";
import { RequiredActionsModalState } from "./RequiredActionsModalState";

const VIEW_ALL_REQUIRED_ACTIONS_LABEL = "View all required actions";
const REQUIRED_ACTIONS_LINK = "/required_actions?response_received=false";
const REQUIRED_ACTIONS_LABEL = "Required actions";

export const ViewAllRequiredActionsButton = ({ onClick }: { readonly onClick: () => void }) => (
  <Button asChild size="sm" variant="outline">
    <Link onClick={onClick} to={REQUIRED_ACTIONS_LINK}>
      {VIEW_ALL_REQUIRED_ACTIONS_LABEL}
    </Link>
  </Button>
);

export const RequiredActionsModal = ({
  dagId,
  headerAction,
  onClose,
  open,
  runId,
}: {
  readonly dagId?: string;
  readonly headerAction?: ReactNode;
  readonly onClose: () => void;
  readonly open: boolean;
  readonly runId?: string;
}) => (
  <Dialog.Root onOpenChange={onClose} open={open} scrollBehavior="inside" size="xl">
    <Dialog.Content
      backdrop
      height={{ base: "92vh", lg: "960px" }}
      maxW="1440px"
      p={4}
      width={{ base: "96vw", lg: "90vw" }}
    >
      <RequiredActionsModalState dagId={dagId} open={open} runId={runId}>
        {({ detail, filter, list, navigation }) => (
          <>
            <Dialog.Header>
              <HStack justifyContent="space-between" pr={8} width="100%">
                <Heading flexShrink={0} size="md">
                  {REQUIRED_ACTIONS_LABEL}
                </Heading>
                <HStack gap={2}>
                  {headerAction}
                  <RequiredActionsFilter {...filter} />
                  <RequiredActionNavigation {...navigation} />
                </HStack>
              </HStack>
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <HStack
                alignItems="stretch"
                flexDirection={{ base: "column", lg: "row" }}
                gap={{ base: 3, lg: 0 }}
                height="100%"
                width="100%"
              >
                <Box
                  flexShrink={0}
                  height={{ base: "42%", lg: "100%" }}
                  overflowX="hidden"
                  overflowY="auto"
                  pl={2}
                  position="relative"
                  pr={{ base: 2, lg: 8 }}
                  py={2}
                  width={{ base: "100%", lg: "770px", xl: "836px" }}
                  zIndex={2}
                >
                  <HITLRequiredActionsList {...list} />
                </Box>
                <Box
                  bg="bg"
                  borderColor="border"
                  borderRadius="md"
                  borderWidth={1}
                  flex={1}
                  height={{ base: "58%", lg: "100%" }}
                  minW={0}
                  overflowY="auto"
                  p={3}
                  position="relative"
                  zIndex={1}
                >
                  <RequiredActionDetailPane {...detail} onNavigate={onClose} />
                </Box>
              </HStack>
            </Dialog.Body>
          </>
        )}
      </RequiredActionsModalState>
    </Dialog.Content>
  </Dialog.Root>
);
