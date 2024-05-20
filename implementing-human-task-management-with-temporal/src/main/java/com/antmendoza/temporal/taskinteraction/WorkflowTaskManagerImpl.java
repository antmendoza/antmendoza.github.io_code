package com.antmendoza.temporal.taskinteraction;

import io.temporal.workflow.Workflow;

import java.util.List;

public class WorkflowTaskManagerImpl implements WorkflowTaskManager {


    private  TasksList taskList = new TasksList();


    @Override
    public void run(TasksList taskList) {

        this.taskList = taskList != null ? taskList : new TasksList();


        while (true) {

            Workflow.await(
                    () ->
                            // Wait until there are pending task to process
                            this.taskList.hasUnprocessedTask());



            final Task task = this.taskList.getNextTaskToProcess();


            //


            if (Workflow.getInfo().isContinueAsNewSuggested()) {
                Workflow.newContinueAsNewStub(WorkflowTaskManager.class)
                        .run(this.taskList);
            }



        }
    }

    @Override
    public void addTask(Task task) {
        taskList.add(task);
        System.out.println(">>>>> " + taskList.hasUnprocessedTask());
    }

    @Override
    public void validateChangeTaskStateTo(ChangeTaskRequest changeTaskRequest, TaskState newState) {

        final String taskId = changeTaskRequest.taskId();
        if (taskList.canTaskTransitionToState(changeTaskRequest, newState)) {
            final TaskState taskState = taskList.getTask(taskId).getTaskState();
            throw new RuntimeException("Task with id [" + taskId + "], " +
                    "with state [" + taskState + "], can not transition to " + newState);
        }
    }


    @Override
    public void changeTaskStateTo(ChangeTaskRequest changeTaskRequest, TaskState newState) {
        taskList.changeTaskStateTo(changeTaskRequest, newState);
    }

    @Override
    public List<Task> getAllTasks() {
        return taskList.getTasks();
    }


}
