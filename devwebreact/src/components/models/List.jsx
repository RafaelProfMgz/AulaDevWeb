import React, { useState } from "react";
import "../../assets/List.css";

export default function List() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Aprender React", isEditing: false },
    { id: 2, text: "Criar um componente de lista", isEditing: false },
  ]);

  const [newTaskText, setNewTaskText] = useState("");

  const [editingTask, setEditingTask] = useState({ id: null, text: "" });

  const handleInputChange = (event) => {
    setNewTaskText(event.target.value);
  };

  const handleAddTask = (event) => {
    event.preventDefault();

    if (newTaskText.trim() === "") {
      return;
    }

    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      isEditing: false,
    };

    setTasks([...tasks, newTask]);

    setNewTaskText("");
  };

  const handleRemoveTask = (taskIdToRemove) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskIdToRemove);
    setTasks(updatedTasks);

    if (editingTask.id === taskIdToRemove) {
      setEditingTask({ id: null, text: "" });
    }
  };

  const handleEditStart = (taskToEdit) => {
    setEditingTask({ id: taskToEdit.id, text: taskToEdit.text });
  };

  const handleEditInputChange = (event) => {
    setEditingTask({ ...editingTask, text: event.target.value });
  };

  const handleEditSave = (taskIdToSave) => {
    if (editingTask.text.trim() === "") {
      alert("A tarefa não pode ficar vazia!");
      return;
    }

    const updatedTasks = tasks.map((task) => {
      if (task.id === taskIdToSave) {
        return { ...task, text: editingTask.text.trim() };
      }
      // Mantém as outras tarefas como estão
      return task;
    });

    setTasks(updatedTasks);

    setEditingTask({ id: null, text: "" });
  };

  const handleEditCancel = () => {
    setEditingTask({ id: null, text: "" });
  };

  return (
    <div className="list-container">
      <h1>Lista de Tarefas</h1>

      <form onSubmit={handleAddTask} className="add-task-form">
        <input
          type="text"
          value={newTaskText}
          onChange={handleInputChange}
          placeholder="Adicionar nova tarefa..."
        />
        <button type="submit">Adicionar</button>
      </form>

      <ul className="task-list">
        {tasks.length === 0 ? (
          <p>Nenhuma tarefa ainda!</p>
        ) : (
          tasks.map((task) => (
            <li key={task.id} className="task-item">
              {editingTask.id === task.id ? (
                <div className="edit-mode">
                  <input
                    type="text"
                    value={editingTask.text}
                    onChange={handleEditInputChange}
                    autoFocus
                  />
                  <button
                    onClick={() => handleEditSave(task.id)}
                    className="save-btn"
                  >
                    Salvar
                  </button>
                  <button onClick={handleEditCancel} className="cancel-btn">
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="view-mode">
                  <span>{task.text}</span>
                  <div className="task-actions">
                    <button
                      onClick={() => handleEditStart(task)}
                      className="edit-btn"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleRemoveTask(task.id)}
                      className="remove-btn"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
