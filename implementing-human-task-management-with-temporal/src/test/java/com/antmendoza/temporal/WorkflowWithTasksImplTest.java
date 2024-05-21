package com.antmendoza.temporal;

import io.temporal.api.common.v1.WorkflowExecution;
import io.temporal.api.enums.v1.WorkflowExecutionStatus;
import io.temporal.api.workflowservice.v1.DescribeWorkflowExecutionRequest;
import io.temporal.api.workflowservice.v1.DescribeWorkflowExecutionResponse;
import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import io.temporal.common.interceptors.WorkerInterceptorBase;
import io.temporal.common.interceptors.WorkflowInboundCallsInterceptor;
import io.temporal.common.interceptors.WorkflowInboundCallsInterceptorBase;
import io.temporal.testing.TestWorkflowRule;
import io.temporal.worker.WorkerFactoryOptions;
import io.temporal.workflow.Workflow;
import org.junit.Rule;
import org.junit.Test;

import java.util.concurrent.CompletableFuture;

import static org.junit.Assert.assertEquals;

public class WorkflowWithTasksImplTest {

    private final MyWorkerInterceptor myWorkerInterceptor = new MyWorkerInterceptor();

    @Rule
    public TestWorkflowRule testWorkflowRule =
            TestWorkflowRule.newBuilder()
                    .setWorkerFactoryOptions(
                            WorkerFactoryOptions.newBuilder()
                                    .setWorkerInterceptors(myWorkerInterceptor)
                                    .validateAndBuildWithDefaults())
                    .setDoNotStart(true)
                    //.setUseExternalService(true)
                    //.setNamespace("default")
                    //.setTarget("127.0.0.1:7233")
                    .build();



    @Test
    public void testEnd2End() {

        final WorkflowClient workflowClient = testWorkflowRule.getTestEnvironment().getWorkflowClient();
        testWorkflowRule
                .getWorker()
                .registerWorkflowImplementationTypes(
                         WorkflowTaskManagerImpl.class);

//        testWorkflowRule
//                .getWorker()
//                .registerActivitiesImplementations(new ActivityTaskImpl(workflowClient));

        testWorkflowRule.getTestEnvironment().start();

        WorkflowTaskManager workflow =
                testWorkflowRule
                        .getWorkflowClient()
                        .newWorkflowStub(
                                WorkflowTaskManager.class,
                                WorkflowOptions.newBuilder()
                                        .setWorkflowId(WorkflowTaskManager.WORKFLOW_ID)
                                        .setTaskQueue(testWorkflowRule.getTaskQueue())
                                        .build());

        WorkflowExecution execution = WorkflowClient.start(workflow::run, new TasksList());


        WorkflowTaskManager workflowManager =
                workflowClient.newWorkflowStub(WorkflowTaskManager.class, WorkflowTaskManager.WORKFLOW_ID);

        final String id_1 = "" + Math.random();
        workflowManager.addTask(new Task(id_1, "My TODO 1"));
        workflowManager.addTask(new Task(""+Math.random(), "My TODO 2"));
        workflowManager.addTask(new Task(""+Math.random(), "My TODO 3"));


        workflowManager.changeTaskStateTo(new ChangeTaskRequest(id_1,"user1", null, TaskState.Assigned ));

        workflowManager.changeTaskStateTo(new ChangeTaskRequest(id_1,"user2", null, TaskState.Assigned ));
        workflowManager.changeTaskStateTo(new ChangeTaskRequest(id_1,"user3", null, TaskState.Assigned ));

        assertEquals(3, workflowManager.getAllTasks().size());

        final DescribeWorkflowExecutionResponse describeWorkflowExecutionResponse =
                getDescribeWorkflowExecutionResponse(workflowClient, execution);
        assertEquals(
                WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_RUNNING,
                describeWorkflowExecutionResponse.getWorkflowExecutionInfo().getStatus());
    }

    private DescribeWorkflowExecutionResponse getDescribeWorkflowExecutionResponse(
            final WorkflowClient workflowClient, final WorkflowExecution execution) {
        return workflowClient
                .getWorkflowServiceStubs()
                .blockingStub()
                .describeWorkflowExecution(
                        DescribeWorkflowExecutionRequest.newBuilder()
                                .setNamespace(testWorkflowRule.getTestEnvironment().getNamespace())
                                .setExecution(execution)
                                .build());
    }

    private class MyWorkerInterceptor extends WorkerInterceptorBase {

        private int createTaskInvocations = 0;

        private final CompletableFuture<Void> waitUntilTwoInvocationsOfCreateTask;

        private final CompletableFuture<Void> waitUntilThreeInvocationsOfCreateTask;

        public MyWorkerInterceptor() {
            waitUntilTwoInvocationsOfCreateTask = new CompletableFuture<>();
            waitUntilThreeInvocationsOfCreateTask = new CompletableFuture<>();
        }

        public Void waitUntilTwoCreateTaskInvocations() {
            return getFromCompletableFuture(waitUntilTwoInvocationsOfCreateTask);
        }

        public Void waitUntilThreeInvocationsOfCreateTask() {
            return getFromCompletableFuture(waitUntilThreeInvocationsOfCreateTask);
        }

        private Void getFromCompletableFuture(final CompletableFuture<Void> completableFuture) {
            try {
                return completableFuture.get();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        @Override
        public WorkflowInboundCallsInterceptor interceptWorkflow(
                final WorkflowInboundCallsInterceptor next) {
            return new WorkflowInboundCallsInterceptorBase(next) {
                @Override
                public UpdateOutput executeUpdate(final UpdateInput input) {
                    if (input.getUpdateName().equals("createTask")
                            && Workflow.getInfo()
                            .getWorkflowType()
                            .equals(WorkflowTaskManager.class.getSimpleName())) {
                        createTaskInvocations++;
                        if (createTaskInvocations == 2) {
                            waitUntilTwoInvocationsOfCreateTask.complete(null);
                        }

                        if (createTaskInvocations == 3) {
                            waitUntilThreeInvocationsOfCreateTask.complete(null);
                        }
                    }

                    return super.executeUpdate(input);
                }
            };
        }
    }
}
