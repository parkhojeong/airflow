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

import pendulum

from airflow.providers.standard.operators.hitl import ApprovalOperator
from airflow.sdk import DAG

with DAG(
    dag_id="example_hitl_notification",
    dag_display_name="HITL notification example",
    start_date=pendulum.datetime(2026, 1, 1, tz="UTC"),
    max_active_runs=5,
    schedule=None,
    catchup=False,
    tags=["example", "HITL"],
):
    ApprovalOperator(
        task_id="approve_notification_repro",
        task_display_name="Approve notification repro",
        subject="Approve the HITL notification repro",
        body="Leave this task unanswered to keep a pending HITL notification visible.",
        assigned_users=[{"id": "admin", "name": "admin"}],
    )
