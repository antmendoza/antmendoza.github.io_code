package com.antmendoza.temporal.taskinteraction;

import java.util.Objects;

public class Task {
    private String id;
    private String title;
    private String assignedTo;
    private String candidate;
    private TaskState taskState;

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

    @Override
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        final Task task = (Task) o;
        return Objects.equals(id, task.id)
                && Objects.equals(title, task.title)
                && Objects.equals(assignedTo, task.assignedTo)
                && Objects.equals(candidate, task.candidate)
                && taskState == task.taskState;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, assignedTo, candidate, taskState);
    }

    @Override
    public String toString() {
        return "Task{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", assignedTo='" + assignedTo + '\'' +
                ", candidate='" + candidate + '\'' +
                ", taskState=" + taskState +
                '}';
    }
}
