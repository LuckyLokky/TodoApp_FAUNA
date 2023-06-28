const FAUNA_KEY = "fnAFHj2YPmAAUDQSe7Z3LBg6mfnOcF3GYU_jNdIx";
const url = "https://graphql.us.fauna.com/graphql";

async function graphqlQuery(query) {
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + FAUNA_KEY,
    },
    body: JSON.stringify({ query }),
  });
  let graphqlData = await response.json();
  if (graphqlData.errors) {
    graphqlData.errors.forEach((error) =>
      console.error(`GraphQL error: ${error.message}`)
    );
    throw new Error("GraphQL error");
  } else {
    return graphqlData.data;
  }
}

async function createTodoItem(title) {
  let data = await graphqlQuery(`
    mutation {
      createTodoItem(data: {
      title: "${title}"
      done: false
      }) {
        _id
        title
        done
      }
    }
  `);
  return data.createTodoItem;
}

async function getTodoItems() {
  const data = await graphqlQuery(`
    query {
      allTodoItems {
        data {
          _id
          title
          done
        }
      }
    }
  `);
  return data.allTodoItems.data;
}

async function updateTodoItemTitle(id, title) {
  let data = await graphqlQuery(`
    mutation {
      updateTodoItem(
        id: "${id}"
        data: {
          title: "${title}"
        }
      )
      {
        _id
        title
      }
    }
  `);
  return data.updateTodoItem;
}

async function updateTodoItemDone(id, done) {
  let data = await graphqlQuery(`
    mutation {
      updateTodoItem(
        id: "${id}"
        data: {

          done: ${done}

        }
      )
      {
        _id

        done
      }
    }
  `);
  return data.updateTodoItem;
}

function deleteTodoItem(id) {
  return graphqlQuery(`
    mutation {
      deleteTodoItem(id: "${id}") {
        _id
      }
    }
  `);
}

function renderTodoItem(id, title, done) {
  const li = document.createElement("li");
  const div_DELETE_EDIT = document.createElement("div");
  const p = document.createElement("p");
  let ul = document.querySelector("ul");
  checkBoxTodoItem(li, id, p);
  li.appendChild(p);
  li.appendChild(div_DELETE_EDIT);
  p.innerText = title;
  ul.appendChild(li);
  deleteTodoItemButton(li, id, div_DELETE_EDIT);
  editTodoItemButton(id, div_DELETE_EDIT, p);
  if (done === true) {
    p.style.backgroundColor = "aquamarine";
  } else {
    p.style.backgroundColor = "yellow";
  }
}

function deleteTodoItemButton(li, id, div_DELETE_EDIT) {
  let deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.className = "delete";
  div_DELETE_EDIT.appendChild(deleteButton);
  deleteButton.addEventListener("click", () => {
    deleteTodoItem(id).then(() => li.remove());
  });
}

function editTodoItemButton(id, div_DELETE_EDIT, p) {
  let editTodo = document.createElement("button");
  editTodo.innerText = "Edit ToDo note>>>";
  editTodo.className = "editTodo";
  div_DELETE_EDIT.appendChild(editTodo);
  let inputEditTodo = document.createElement("input");
  inputEditTodo.className = "inputEditTodo";
  let submitEditTodo = document.createElement("button");
  submitEditTodo.innerText = "ADD CHANGES";
  submitEditTodo.className = "submitEditTodo";

  editTodo.addEventListener("click", () => {
    if (div_DELETE_EDIT.querySelector("input") === null) {
      editTodo.innerText = "Edit ToDo note<<<";
      inputEditTodo.value = p.innerText;
      div_DELETE_EDIT.appendChild(inputEditTodo);
      div_DELETE_EDIT.appendChild(submitEditTodo);
    } else {
      editTodo.innerText = "Edit ToDo note>>>";
      inputEditTodo.remove();
      submitEditTodo.remove();
    }

    submitEditTodo.addEventListener("click", () => {
      if (inputEditTodo.value === "") {
        inputEditTodo.placeholder = "Type a note!!!";
      } else {
        updateTodoItemTitle(id, inputEditTodo.value);
        p.innerText = inputEditTodo.value;
        inputEditTodo.value = "";
      }
    });
  });
}

function checkBoxTodoItem(li, id, p) {
  let checkBox = document.createElement("input");
  checkBox.type = "checkbox";

  checkBox.addEventListener("click", () => {
    if (checkBox.checked) {
      p.style.backgroundColor = "aquamarine";
      updateTodoItemDone(id, true);
    } else {
      p.style.backgroundColor = "yellow";
      updateTodoItemDone(id, false);
    }
  });
  li.appendChild(checkBox);
}

const form = document.querySelector("form");
const input = form.querySelector("input");

getTodoItems().then((items) => {
  for (const item of items) {
    renderTodoItem(item._id, item.title, item.done);
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value === "") {
    alert("Type a note!!!");
  } else {
    createTodoItem(input.value).then((item) => {
      renderTodoItem(item._id, item.title, item.done);
      input.value = "";
    });
  }
});
