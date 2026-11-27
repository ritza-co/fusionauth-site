const buildAttemptRefresh = function(after) {
   return (error) => {
    console.log("trying to refresh");
    // try to refresh if we got an error
    // we can't send the cookie, so we need to request the refresh endpoint
    fetch('/refresh', { method: 'POST' })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('refresh failed: ' + response.status);
      }
      after();
    })
    .catch(function (error) {
      console.log("unable to refresh tokens");
      console.log(error);
      window.location.href="/";
    });
  };
}

const getTodos = function() {
fetch('/api/todos')
  .then(function (response) {
    if (!response.ok) {
      throw new Error('unauthorized: ' + response.status);
    }
    return response.json();
  })
  .then(function (todos) {
    buildUI(todos);
    buildClickHandler();
  })
  .catch(console.log);
}

fetch('/api/todos')
  .then(function (response) {
    if (!response.ok) {
      throw new Error('unauthorized: ' + response.status);
    }
    return response.json();
  })
  .then(function (todos) {
    buildUI(todos);
    buildClickHandler();
  })
  .catch(buildAttemptRefresh(getTodos));

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
    if (val.done){ 
      checked = 'checked'
    }
    html += `<tr><td>${val.task}</td><td><input type='checkbox' class='chk' ${checked} data-id='${val.id}'></td></tr>`;
  });
  html = html + `</table>`;

  document.getElementById('content').innerHTML = html;
}

function buildClickHandler() {
  document.addEventListener('click', function (event) {

    // If the clicked element doesn't have the right selector, bail
    if (!event.target.matches('.chk')) return;

    // Log the clicked element in the console
    const completed = event.target.checked
    const id = event.target.dataset.id
    const action = completed ? 'complete' : 'uncomplete';
    fetch('/api/todos/'+action+'/'+id, { method: 'POST' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('save failed: ' + response.status);
        }
        return response.json();
      })
      .then(function (todos) {
        console.log(todos);
      })
      .catch(buildAttemptRefresh(function() {
        fetch('/api/todos/'+action+'/'+id, { method: 'POST' })
        .then(function (response) {
          return response.json();
        })
        .then(function (todos) {
          console.log(todos);
        })
        .catch(console.log);
      }));
  }, false);
}
