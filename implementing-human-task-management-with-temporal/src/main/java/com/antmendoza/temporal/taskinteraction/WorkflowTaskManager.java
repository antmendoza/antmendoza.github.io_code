package com.antmendoza.temporal.taskinteraction;

import io.temporal.workflow.*;

import java.util.List;

@WorkflowInterface
public interface WorkflowTaskManager {

    String WORKFLOW_ID = WorkflowTaskManager.class.getSimpleName();


    @WorkflowMethod
    void run(TasksList taskList);


    @UpdateMethod
    void addTask(Task task);


    @UpdateValidatorMethod(updateName = "changeTaskStateTo")
    void validateChangeTaskStateTo(ChangeTaskRequest changeTaskRequest);

    @UpdateMethod
    void changeTaskStateTo(ChangeTaskRequest changeTaskRequest);

    @QueryMethod
    List<Task> getAllTasks();
}
