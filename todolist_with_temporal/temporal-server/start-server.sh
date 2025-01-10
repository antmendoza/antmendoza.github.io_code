#!/bin/sh

temporal server start-dev \
--dynamic-config-value frontend.enableUpdateWorkflowExecution=true \
--dynamic-config-value frontend.enableUpdateWorkflowExecutionAsyncAccepted=true \
--dynamic-config-value frontend.enableExecuteMultiOperation=true

