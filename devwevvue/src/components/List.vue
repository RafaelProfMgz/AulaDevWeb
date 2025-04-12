<script setup>
import { ref, nextTick } from "vue";

const tasks = ref([
    { id: 1, text: "Aprender Vue 3", isEditing: false },
    { id: 2, text: "Criar um componente de lista", isEditing: false },
]);

const newTaskText = ref("");
const editingTask = ref({ id: null, text: "" });

function handleAddTask(e) {
    e.preventDefault();
    const text = newTaskText.value.trim();
    if (text === "") return;

    tasks.value.push({
        id: Date.now(),
        text,
        isEditing: false,
    });

    newTaskText.value = "";
}

function handleRemoveTask(id) {
    tasks.value = tasks.value.filter((task) => task.id !== id);
    if (editingTask.value.id === id) {
        editingTask.value = { id: null, text: "" };
    }
}

function handleEditStart(task) {
    editingTask.value = { id: task.id, text: task.text };
    nextTick(() => {
        const input = document.querySelector(".edit-mode input");
        if (input) input.focus();
    });
}

function handleEditSave(id) {
    const text = editingTask.value.text.trim();
    if (text === "") {
        alert("A tarefa não pode ficar vazia!");
        return;
    }

    tasks.value = tasks.value.map((task) =>
        task.id === id ? { ...task, text } : task,
    );
    editingTask.value = { id: null, text: "" };
}

function handleEditCancel() {
    editingTask.value = { id: null, text: "" };
}
</script>

<template>
    <div class="list-container">
        <h1>Lista de Tarefas</h1>

        <form class="add-task-form" @submit="handleAddTask">
            <input
                type="text"
                v-model="newTaskText"
                placeholder="Adicionar nova tarefa..."
            />
            <button type="submit">Adicionar</button>
        </form>

        <ul class="task-list">
            <p v-if="tasks.length === 0">Nenhuma tarefa ainda!</p>
            <li v-for="task in tasks" :key="task.id" class="task-item">
                <div v-if="editingTask.id === task.id" class="edit-mode">
                    <input
                        type="text"
                        v-model="editingTask.text"
                        @keyup.enter="handleEditSave(task.id)"
                        @keyup.esc="handleEditCancel"
                    />
                    <button @click="handleEditSave(task.id)" class="save-btn">
                        Salvar
                    </button>
                    <button @click="handleEditCancel" class="cancel-btn">
                        Cancelar
                    </button>
                </div>
                <div v-else class="view-mode">
                    <span>{{ task.text }}</span>
                    <div class="task-actions">
                        <button @click="handleEditStart(task)" class="edit-btn">
                            Editar
                        </button>
                        <button
                            @click="handleRemoveTask(task.id)"
                            class="remove-btn"
                        >
                            Remover
                        </button>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<style>
:root {
    --font-family-base:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
        sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    --primary-color: #6a11cb;
    --primary-color-dark: #570ca1;
    --secondary-color: #2575fc;
    --accent-color-edit: #ffc107;
    --accent-color-edit-dark: #e0a800;
    --accent-color-save: #28a745;
    --accent-color-save-dark: #218838;
    --accent-color-delete: #dc3545;
    --accent-color-delete-dark: #c82333;
    --accent-color-cancel: #6c757d;
    --accent-color-cancel-dark: #5a6268;
    --text-color: #333;
    --text-color-light: #555;
    --text-color-on-primary: #ffffff;
    --text-color-on-accent: #ffffff;
    --text-color-on-edit: #212529;
    --bg-color-container: #f8f9fa;
    --bg-color-item: #ffffff;
    --border-color-light: #e0e0e0;
    --border-color-focus: #6a11cb;
    --border-radius-base: 8px;
    --box-shadow-base: 0 4px 15px rgba(0, 0, 0, 0.08);
    --box-shadow-hover: 0 6px 20px rgba(0, 0, 0, 0.12);
    --spacing-unit: 0.5rem;
    --transition-speed: 0.2s;
}
</style>

<style scoped>
.list-container {
    font-family: var(--font-family-base);
    max-width: 600px;
    margin: calc(var(--spacing-unit) * 5) auto;
    padding: calc(var(--spacing-unit) * 4);
    background-color: var(--bg-color-container);
    border-radius: var(--border-radius-base);
    box-shadow: var(--box-shadow-base);
    color: var(--text-color);
}

.list-container h1 {
    text-align: center;
    color: var(--text-color);
    margin-bottom: calc(var(--spacing-unit) * 4);
    font-weight: 600;
    font-size: 1.75rem;
}

.add-task-form {
    display: flex;
    gap: calc(var(--spacing-unit) * 2);
    margin-bottom: calc(var(--spacing-unit) * 4);
}

.add-task-form input[type="text"],
.edit-mode input[type="text"] {
    flex-grow: 1;
    padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius-base);
    font-size: 1rem;
    background-color: var(--bg-color-item);
    color: var(--text-color);
    transition:
        border-color var(--transition-speed) ease,
        box-shadow var(--transition-speed) ease;
}

.add-task-form input[type="text"]:focus,
.edit-mode input[type="text"]:focus {
    outline: none;
    border-color: var(--border-color-focus);
    box-shadow: 0 0 0 3px #6a11cb33;
}

.add-task-form button {
    padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3);
    background-image: linear-gradient(
        45deg,
        var(--primary-color) 0%,
        var(--secondary-color) 100%
    );
    color: var(--text-color-on-primary);
    border: none;
    border-radius: var(--border-radius-base);
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all var(--transition-speed) ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.add-task-form button:hover {
    opacity: 0.9;
    box-shadow: var(--box-shadow-hover);
    transform: translateY(-2px);
}

.add-task-form button:active {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.add-task-form button:focus-visible {
    outline: 2px solid var(--primary-color-dark);
    outline-offset: 2px;
}

.task-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing-unit) * 2);
}

.task-item {
    background-color: var(--bg-color-item);
    padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3);
    border-radius: var(--border-radius-base);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: calc(var(--spacing-unit) * 3);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: box-shadow var(--transition-speed) ease;
}

.task-item:hover {
    box-shadow: var(--box-shadow-hover);
}

.task-item span {
    flex-grow: 1;
    word-break: break-word;
    color: var(--text-color-light);
    line-height: 1.4;
}

.task-actions {
    display: flex;
    gap: calc(var(--spacing-unit) * 1.5);
    flex-shrink: 0;
}

.task-actions button,
.edit-mode button {
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2);
    border: none;
    border-radius: var(--border-radius-base);
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all var(--transition-speed) ease;
    display: flex;
    align-items: center;
    gap: var(--spacing-unit);
}

.task-actions button:focus-visible,
.edit-mode button:focus-visible {
    outline-offset: 2px;
}

.edit-btn {
    background-color: var(--accent-color-edit);
    color: var(--text-color-on-edit);
}
.edit-btn:hover {
    background-color: var(--accent-color-edit-dark);
}
.edit-btn:focus-visible {
    outline: 2px solid var(--accent-color-edit-dark);
}

.remove-btn {
    background-color: var(--accent-color-delete);
    color: var(--text-color-on-accent);
}
.remove-btn:hover {
    background-color: var(--accent-color-delete-dark);
}
.remove-btn:focus-visible {
    outline: 2px solid var(--accent-color-delete-dark);
}

.save-btn {
    background-color: var(--accent-color-save);
    color: var(--text-color-on-accent);
}
.save-btn:hover {
    background-color: var(--accent-color-save-dark);
}
.save-btn:focus-visible {
    outline: 2px solid var(--accent-color-save-dark);
}

.cancel-btn {
    background-color: transparent;
    color: var(--accent-color-cancel);
    border: 1px solid var(--accent-color-cancel);
}
.cancel-btn:hover {
    background-color: var(--accent-color-cancel);
    color: var(--text-color-on-accent);
}
.cancel-btn:focus-visible {
    outline: 2px solid var(--accent-color-cancel-dark);
}

.edit-mode {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing-unit) * 1.5);
    width: 100%;
}

.task-list p {
    text-align: center;
    color: var(--text-color-light);
    padding: calc(var(--spacing-unit) * 4);
    font-style: italic;
}
</style>
