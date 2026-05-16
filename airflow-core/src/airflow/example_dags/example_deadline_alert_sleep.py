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
import logging
import time

import pendulum

from airflow.sdk import DAG, DeadlineAlert, DeadlineReference, SyncCallback, task

log = logging.getLogger(__name__)


def log_deadline_miss(*, context: dict, message: str) -> None:
    """Small local callback for exercising Deadline Alerts in Breeze."""
    dag_run = context["dag_run"]
    deadline = context["deadline"]

    log.warning(
        "%s dag_id=%s run_id=%s deadline_time=%s",
        message,
        dag_run.dag_id,
        dag_run.run_id,
        deadline.deadline_time,
    )


with DAG(
    dag_id="example_deadline_alert_sleep",
    dag_display_name="Five second queued deadline with sleep",
    start_date=pendulum.datetime(2026, 1, 1, tz="UTC"),
    catchup=False,
    schedule=None,
    tags=["example", "deadline"],
    deadline=DeadlineAlert(
        reference=DeadlineReference.DAGRUN_QUEUED_AT,
        interval=datetime.timedelta(seconds=5),
        callback=SyncCallback(
            log_deadline_miss,
            kwargs={"message": "Deadline missed"},
        ),
        name="Five second queued deadline",
    ),
):

    @task
    def sleep_past_deadline() -> str:
        time.sleep(30)
        return "finished"

    sleep_past_deadline()
