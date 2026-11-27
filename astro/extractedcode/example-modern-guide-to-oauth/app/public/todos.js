const buildAttemptRefresh = function(after) {
  return async (error) => {
    console.log("trying to refresh");
    // try to refresh if we got an error
    // we can't send the cookie, so we need to request the refresh endpoint
    try {
      const response = await fetch('/refresh', { method: 'POST' });
      if (!response.ok) throw new Error('refresh failed: ' + response.status);
      after();
    }
    catch (refreshError) {
      console.log("unable to refresh tokens");
      console.log(refreshError);
      window.location.href = "/";
    }
  };
}

const loadTodos = async function() {
  const response = await fetch('/api/todos');
  if (!response.ok) throw new Error('unauthorized: ' + response.status);
  const todos = await response.json();
  buildUI(todos);
  buildClickHandler();
}

const getTodos = async function() {
  try {
    await loadTodos();
  }
  catch (error) { console.log(error); }
}

(async function() {
  try {
    await loadTodos();
  }
  catch (error) { await buildAttemptRefresh(getTodos)(error); }
})();

function buildUI(data) {
  const todos = data;
  const id_token = Cookies.get('id_token');
  if (!id_token) {
    window.location.href = "/";
    return;
  }
  var decoded = jwt_decode(id_token);
  const email = decoded.email || decoded.preferred_username || decoded.sub;
  const title = 'Todo list';
  var html = `
    <h1>${title}</h1><p>Todos for ${email}</p>
    <table>
    <tr><th>Task</th><th>Complete</th></tr>
  `;
  todos.forEach(val => {
    var checked = '';
    if (val.done) checked = 'checked';
    html += `<tr><td>${val.task}</td><td><input type='checkbox' class='chk' ${checked} data-id='${val.id}'></td></tr>`;
  });
  html = html + `</table>`;
  document.getElementById('content').innerHTML = html;
}

const saveTodo = async function(action, id) {
  const response = await fetch('/api/todos/'+action+'/'+id, { method: 'POST' });
  if (!response.ok) throw new Error('save failed: ' + response.status);
  const todos = await response.json();
  console.log(todos);
}

function buildClickHandler() {
  document.addEventListener('click', async function (event) {
    // If the clicked element doesn't have the right selector, bail
    if (!event.target.matches('.chk')) return;
    // Log the clicked element in the console
    const completed = event.target.checked
    const id = event.target.dataset.id
    const action = completed ? 'complete' : 'uncomplete';
    try {
      await saveTodo(action, id);
    }
    catch (error) {
      await buildAttemptRefresh(async function() {
        await saveTodo(action, id);
      })(error);
    }
  }, false);
}
