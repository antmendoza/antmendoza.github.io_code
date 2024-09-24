package com.antmendoza.temporal;

import org.apache.commons.lang3.SerializationUtils;

import java.io.Serializable;
import java.util.Objects;

public class Task implements Serializable {
    private String id;
    private String title;
    private String assignedTo;
    private TaskState taskState;

    private Task previousState;

    public Task() {
    }

    public Task(String id, String title) {
        this.id = id;
        this.title = title;
        this.taskState = TaskState.New;
    }

    public String getTitle() {
        return title;
    }

    public TaskState getTaskState() {
        return taskState;
    }

    public String getId() {
        return id;
    }


    public String getAssignedTo() {
        return assignedTo;
    }

    public Task getPreviousState() {
        return previousState;
    }

    @Override
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        final Task task = (Task) o;
        return Objects.equals(id, task.id) && Objects.equals(title, task.title) && Objects.equals(assignedTo, task.assignedTo)  && taskState == task.taskState && Objects.equals(previousState, task.previousState);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, assignedTo, taskState, previousState);
    }

    @Override
    public String toString() {
        return "Task{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", assignedTo='" + assignedTo + '\'' +
                ", taskState=" + taskState +
                ", previousState=" + previousState +
                '}';
    }

    //Mutate task state with the requested changes
    public void changeTaskState(final ChangeTaskRequest changeTaskRequest) {
        this.previousState = SerializationUtils.clone(this);
        this.taskState = changeTaskRequest.newState();
        this.assignedTo = changeTaskRequest.assignedTo();
    }

}
