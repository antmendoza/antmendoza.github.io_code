package com.antmendoza.temporal.taskinteraction;

import io.temporal.workflow.Workflow;
import org.slf4j.Logger;

import java.util.List;
import java.util.Objects;

public class WorkflowTaskManagerImpl implements WorkflowTaskManager {
    private final Logger logger = Workflow.getLogger(WorkflowTaskManagerImpl.class.getName());


    private TasksList taskList = new TasksList();


    @Override
    public void run(TasksList taskList) {

        this.taskList = taskList != null ? taskList : new TasksList();


        while (true) {

            Workflow.await(
                    () ->
                            // Wait until there are pending task to process
                            this.taskList.hasUnprocessedTasks());


            final Task task = this.taskList.getNextUnprocessedTasks();
            logger.info("Processing task " + task);
            Task previousTask = task.getPreviousState();
            logger.info("Processing previousTask " + previousTask);


            if (previousTask != null &&
                    // Here we could add activities to notify the user...
                    !Objects.equals(task.getAssignedTo(), previousTask.getAssignedTo())) {
                //Notify use task.getAssignedTo()
            }

        }


    }

    @Override
    public void addTask(Task task) {
        taskList.add(task);
    }

    @Override
    public void validateChangeTaskStateTo(ChangeTaskRequest changeTaskRequest) {

        final String taskId = changeTaskRequest.taskId();
        if (!taskList.canTaskTransitionToState(changeTaskRequest)) {
            final TaskState taskState = taskList.getTask(taskId).getTaskState();
            throw new RuntimeException("Task with id [" + taskId + "], " +
                    "with state [" + taskState + "], can not transition to " + changeTaskRequest.newState());
        }
    }


    @Override
    public void changeTaskStateTo(ChangeTaskRequest changeTaskRequest) {
        taskList.changeTaskStateTo(changeTaskRequest);
    }

    @Override
    public List<Task> getAllTasks() {
        return taskList.getTasks();
    }


}
