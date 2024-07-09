const apiBaseUrl = 'http://localhost:3000';

async function register() {
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;

  if (username && password) {
    const response = await fetch(`${apiBaseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      alert('Registration successful. Please login.');
    } else {
      alert('Registration failed');
    }
  } else {
    alert('Please enter both username and password');
  }
}

async function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  if (username && password) {
    const response = await fetch(`${apiBaseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (response.ok) {
      document.getElementById('loginContainer').style.display = 'none';
      document.getElementById('forumContainer').style.display = 'block';
      document.getElementById('forumContainer').setAttribute('data-username', username);
      localStorage.setItem('token', result.token);
    } else {
      alert(result.message || 'Login failed');
    }
  } else {
    alert('Please enter both username and password');
  }
}

async function postQuestion() {
  const title = document.getElementById('questionTitle').value;
  const content = document.getElementById('questionContent').value;
  const token = localStorage.getItem('token');

  if (title && content && token) {
    const response = await fetch(`${apiBaseUrl}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, content, token })
    });

    if (response.ok) {
      displayQuestions();
      document.getElementById('questionTitle').value = '';
      document.getElementById('questionContent').value = '';
    } else {
      alert('Failed to post question');
    }
  } else {
    alert('Please enter both title and content');
  }
}

async function displayQuestions() {
  const response = await fetch(`${apiBaseUrl}/questions`);
  if (response.ok) {
    const questions = await response.json();
    const questionList = document.getElementById('questionList');
    questionList.innerHTML = '';

    questions.forEach(question => {
      const li = document.createElement('li');
      li.innerHTML = `
        <h3>${question.title}</h3>
        <p>${question.content}</p>
        <p><small>Posted by ${question.username}</small></p>
        <div class="comments">
          <h4>Comments</h4>
          <ul id="commentList${question._id}">
            ${question.comments.map(comment => `<li class="comment">${comment.username}: ${comment.comment}</li>`).join('')}
          </ul>
          <input type="text" id="commentInput${question._id}" placeholder="Add a comment">
          <button onclick="addComment('${question._id}')">Add Comment</button>
        </div>
      `;
      questionList.appendChild(li);
    });
  }
}

async function addComment(questionId) {
  const commentInput = document.getElementById(`commentInput${questionId}`);
  const commentText = commentInput.value;
  const token = localStorage.getItem('token');

  if (commentText && token) {
    const response = await fetch(`${apiBaseUrl}/questions/${questionId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment: commentText, token })
    });

    if (response.ok) {
      displayQuestions();
      commentInput.value = '';
    } else {
      alert('Failed to add comment');
    }
  } else {
    alert('Please enter a comment');
  }
}
