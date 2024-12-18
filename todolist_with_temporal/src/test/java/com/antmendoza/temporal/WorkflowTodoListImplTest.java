package com.antmendoza.temporal;

import io.temporal.api.common.v1.WorkflowExecution;
import io.temporal.api.enums.v1.WorkflowExecutionStatus;
import io.temporal.api.workflowservice.v1.DescribeWorkflowExecutionRequest;
import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import io.temporal.testing.TestWorkflowRule;
import io.temporal.worker.WorkerFactoryOptions;
import org.junit.Assert;
import org.junit.Rule;
import org.junit.Test;

import java.time.Duration;


public class WorkflowTodoListImplTest {


    @Rule
    public TestWorkflowRule testWorkflowRule =
            TestWorkflowRule.newBuilder()
                    .setWorkerFactoryOptions(
                            WorkerFactoryOptions.newBuilder()
                                    .validateAndBuildWithDefaults())
                    .setDoNotStart(true)
                    //.setUseExternalService(true)
                    //.setNamespace("default")
                    //.setTarget("127.0.0.1:7233")
                    .build();


    @Test
    public void testEnd2End() {
        final String WORKFLOW_ID = "WORKFLOW_ID";


        testWorkflowRule.getWorker().registerWorkflowImplementationTypes(WorkflowTodoListImpl.class);

        testWorkflowRule.getTestEnvironment().start();

        final WorkflowClient workflowClient = testWorkflowRule.getWorkflowClient();
        WorkflowTodoList workflow = workflowClient.newWorkflowStub(WorkflowTodoList.class,
                WorkflowOptions.newBuilder()
                        .setTaskQueue(testWorkflowRule.getTaskQueue())
                        .setWorkflowId(WORKFLOW_ID).build());


        WorkflowClient.execute(workflow::run, new TodoList());

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
//        testWorkflowRule.getTestEnvironment().sleep(Duration.ofSeconds(1));


        final WorkflowExecution build = WorkflowExecution.newBuilder().setWorkflowId(WORKFLOW_ID).build();
        Assert.assertEquals(WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_RUNNING, workflowClient.getWorkflowServiceStubs().blockingStub().describeWorkflowExecution(
                DescribeWorkflowExecutionRequest.newBuilder().setNamespace(testWorkflowRule.getTestEnvironment().getNamespace()).setExecution(build).build()).getWorkflowExecutionInfo().getStatus() );


    }
}
