const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const taskList = document.getElementById('task-list');
const filterContainer = document.getElementById('filter-container');

const statTotal = document.getElementById('stat-total');
const statCompleted = document.getElementById('stat-completed');
const statProgress = document.getElementById('stat-progress');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

function saveToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function toggleTaskCompleted(id) {
    const task = tasks.find(item => item.id === id);
    if(task) {
        task.completed = !task.completed;
        updateUI();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(item => item.id !== id);
    updateUI();
}

function addTask(title, category) {
    const newTask = {
        id: Date.now(),
        title: title.trim(),
        category: category || 'Geral',
        completed: false
    };
    tasks.push(newTask);
    updateUI();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (statTotal) statTotal.textContent = total;
    if (statCompleted) statCompleted.textContent = completed;
    if (statProgress) statProgress.textContent = percentage;
}

function updateUI() {
    saveToStorage();
    renderTasks();
    updateStats();
}


function getFilteredTasks() {
    if (currentFilter === 'completed') {
        return tasks.filter(task => task.completed);
    }

    if (currentFilter === 'pending') {
        return tasks.filter(task => !task.completed);
    }

    return tasks;
}

function renderTasks() {
    const taskToRender = getFilteredTasks();

    taskList.innerHTML = '';

    if (taskToRender.length === 0) {
        taskList.innerHTML = `<li class="empty-message">Nenhuma tarefa encontrada.</li>`;
        return;
    }

    taskToRender.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
        <div class="task-content">
            <input
                type="checkbox"
                class="task-check"
                ${task.completed ? 'checked' : ''}
            />
            <span class="task-text">${task.title}</span>
            <span class="badge">${task.category}</span>
        </div>
        <button class="btn-delete" title="Excluir tarefa">&times;</button>
        `;
        taskList.appendChild(li);
    });
}

// Evento de Envio do Formulário (Criar Tarefa)
taskForm.addEventListener('submit', (event) => {
    event.preventDefault(); // impede o recarregamento da página

    const title = taskInput.value.trim();
    const category = categorySelect.value;

    if (title) {
        addTask(title, category);

        taskForm.reset();
        taskInput.focus();
    }
})

// Configura um único oubinte de evento no pai
taskList.addEventListener('click', (event) => {
    const target = event.target;
    // Localiza o <li> correspondente subindo pelo DOM a partir do elemento clicado
    const taskItem = target.closest('.task-item');

    if (!taskItem) return;

    const taskId = Number(taskItem.dataset.id);

    // checkboc -> concluir/desfazer
    if (target.classList.contains('task-check')) {
        toggleTaskCompleted(taskId);
    }

    if(target.classList.contains('btn-delete')) {
        deleteTask(taskId)
    }
})

// Delegação de eventos no container dos botões do filtro
filterContainer.addEventListener('click', (event)=> {
    const target = event.target;

    if (!target.classList.contains('filter-btn')) return;

    const buttons = filterContainer.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    target.classList.add('active');
    currentFilter = target.dataset.filter;

    renderTasks();
});

updateUI();