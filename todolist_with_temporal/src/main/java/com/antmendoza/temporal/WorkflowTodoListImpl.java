package com.antmendoza.temporal;

import io.temporal.workflow.Workflow;
import org.slf4j.Logger;

import java.util.List;
import java.util.Objects;

public class WorkflowTodoListImpl implements WorkflowTodoList {
    private final Logger logger = Workflow.getLogger(WorkflowTodoListImpl.class.getName());


    private TodoList todoList = new TodoList();


    @Override
    public void run(TodoList todoList) {

        while (true){
            Workflow.await(() -> false);
        }



    }



}
