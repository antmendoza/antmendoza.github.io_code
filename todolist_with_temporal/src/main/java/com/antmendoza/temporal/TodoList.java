package com.antmendoza.temporal;

import java.util.ArrayList;
import java.util.List;

public class TodoList {

    private List<Task> tasks = new ArrayList<>();

    public TodoList(){

    }


    public List<Task> getTasks() {
        return tasks;
    }

    public void setTasks(final List<Task> tasks) {
        this.tasks = tasks;
    }
}
