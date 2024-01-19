/* Variablendeklaration */
const todoListContainer = document.querySelector(".todo-unsorted-list");
const newTodoForm = document.querySelector("#new-todo-form");
const newTodoInput = document.querySelector("#new-todo");
const deleteDoneBtn = document.querySelector("#btn-delete");

/* EventListener*/
newTodoForm.addEventListener("submit", addTodo);
deleteDoneBtn.addEventListener("click", deleteDoneTodos);

/*Array um To-Do's zu speichern */
let todosArray = [];

/* Die Handhabung der Checkboxen */
function createCheckbox(checked, onChange) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = checked;
  checkbox.addEventListener("change", onChange);
  return checkbox;
}

/* Funktionen */
/* GET request, JSON convert, Daten in den Array schreiben, UI updaten */
function fetchTodos() {
  fetch("http://localhost:4730/todos")
    .then((response) => response.json())
    .then((data) => {
      todosArray = data;
      renderTodos();
    });
}

/* Container leeren, ein neues Listenelement erstellen, ein Textnode erstellen,
eine Checkbox erstellen und den Status reinschreiben */
function renderTodos() {
  todoListContainer.innerHTML = "";
  todosArray.forEach((todo) => {
    const listItem = document.createElement("li");
    const textNode = document.createTextNode(todo.description);
    const checkbox = createCheckbox(todo.done, () => updateTodoStatus(todo));

    listItem.append(checkbox, textNode);
    todoListContainer.appendChild(listItem);
  });
}

/* Verhindert das Standartverhalten der Form, toDo-Objekt erstellen, POST-request
über die Fetch-API, GET request, UI wird geupdatet, Form leeren */
function addTodo(event) {
  event.preventDefault();
  const newTodo = { description: newTodoInput.value, done: false };

  fetch("http://localhost:4730/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  })
    .then((response) => response.json())
    .then((newTodoFromApi) => {
      fetchTodos();
      newTodoInput.value = "";
    });
}

/* Negiert die done-Property, PUT-request über die Fetch-API, index des
geupdateten To-Do's finden, To-Do ersetzen, UI updaten */
function updateTodoStatus(todo) {
  const updatedTodo = {
    id: todo.id,
    description: todo.description,
    done: !todo.done,
  };

  fetch(`http://localhost:4730/todos/${todo.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedTodo),
  })
    .then((response) => response.json())
    .then((updatedTodoFromApi) => {
      const index = todosArray.findIndex((item) => item.id === todo.id);
      todosArray.splice(index, 1, updatedTodoFromApi);
      renderTodos();
    });
}

/* Array nach done-Status filtern, neues Array erstellen mit den delete-requests,
warten bis alle requests durchgelaufen sind, bevor die Liste geupdatet wird */
function deleteDoneTodos() {
  const doneTodos = todosArray.filter((todo) => todo.done === true);
  const deleteRequests = doneTodos.map((item) =>
    fetch(`http://localhost:4730/todos/${item.id}`, { method: "DELETE" })
  );

  Promise.all(deleteRequests).then(fetchTodos);
}

/* Die To-Do's sofort laden,  */
fetchTodos();
