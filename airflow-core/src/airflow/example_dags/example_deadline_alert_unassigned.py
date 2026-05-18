# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

from __future__ import annotations

import datetime

import pendulum

from airflow.providers.standard.operators.hitl import ApprovalOperator
from airflow.sdk import DAG, DeadlineAlert, DeadlineReference
from airflow.sdk.definitions.callback import AsyncCallback


async def notify_missed_deadline() -> None:
    """No-op callback for demonstrating deadline alert notifications."""


with DAG(
    dag_id="example_deadline_alert_unassigned",
    dag_display_name="Five second queued deadline (unassigned)",
    start_date=pendulum.datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["example", "deadline", "HITL"],
    deadline=DeadlineAlert(
        reference=DeadlineReference.DAGRUN_QUEUED_AT,
        interval=datetime.timedelta(seconds=5),
        callback=AsyncCallback(notify_missed_deadline),
        name="Five second queued deadline (unassigned)",
    ),
):
    ApprovalOperator(
        task_id="approve_deadline_repro_unassigned",
        task_display_name="Approve deadline repro (unassigned)",
        subject="Approve the unassigned deadline alert repro",
        body=(
            "No assigned_users set, so any authorized user can respond. "
            "Useful when the auth manager's user id does not match the example "
            "assigned_users id (e.g., FAB stores numeric ids while the assigned "
            "example uses 'admin')."
        ),
    )
