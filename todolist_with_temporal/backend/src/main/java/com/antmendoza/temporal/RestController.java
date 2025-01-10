package com.antmendoza.temporal;

import com.antmendoza.temporal.domain.Todo;
import com.antmendoza.temporal.domain.TodoList;
import com.antmendoza.temporal.domain.TodoRequest;
import com.antmendoza.temporal.workflow.WorkflowTodoList;
import io.temporal.api.enums.v1.WorkflowIdConflictPolicy;
import io.temporal.client.UpdateOptions;
import io.temporal.client.WithStartWorkflowOperation;
import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@org.springframework.web.bind.annotation.RestController
public class RestController {
    final String workflowId = "my-todo";


    private final WorkflowClient workflowClient;

    public RestController() {
        this.workflowClient = WorkflowWorker.getWorkflowClient();
    }


    @PostMapping("/todos")
    void add(@RequestBody TodoRequest todoRequest) {

        final WorkflowTodoList workflow = workflowClient.newWorkflowStub(WorkflowTodoList.class,
                WorkflowOptions.newBuilder()
                        .setWorkflowIdConflictPolicy(
                                WorkflowIdConflictPolicy
                                .WORKFLOW_ID_CONFLICT_POLICY_USE_EXISTING)
                        .setWorkflowId(workflowId)
                        .setTaskQueue("todo-list-tq")
                        .build());

        WorkflowClient.executeUpdateWithStart(workflow::addTodo, todoRequest,
                UpdateOptions.newBuilder().build(),
                new WithStartWorkflowOperation<>(workflow::run, new TodoList()));

    }


    @PutMapping("/todos/{id}")
    void update(@PathVariable String id, @RequestBody TodoRequest todoRequest) {

        final WorkflowTodoList workflow = workflowClient.newWorkflowStub(WorkflowTodoList.class,
                workflowId);

        workflow.updateTodo(todoRequest);
    }


    @PutMapping("/todos/{id}/complete")
    void complete(@PathVariable String id) {

        final WorkflowTodoList workflow = workflowClient.newWorkflowStub(WorkflowTodoList.class,
                workflowId);

        workflow.completeTodo(id);
    }



    @DeleteMapping("/todos/{id}")
    void delete(@PathVariable String id) {
        final WorkflowTodoList workflow = workflowClient.newWorkflowStub(WorkflowTodoList.class,
                workflowId);

        workflow.deleteTodo(id);
    }


    @GetMapping("/todos")
    List<Todo> getAll() {
        try {
            final WorkflowTodoList workflow = workflowClient.newWorkflowStub(WorkflowTodoList.class,
                    workflowId);
            final List<Todo> todos = workflow.getTodos();
            return todos;
        } catch (Exception e) {
        }
        return new ArrayList<>();

    }


}
