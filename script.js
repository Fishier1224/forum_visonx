document.addEventListener('DOMContentLoaded', (event) => {
  displayQuestions();
});

const apiBaseUrl = 'http://localhost:3000';

async function postQuestion() {
  const title = document.getElementById('questionTitle').value;
  const content = document.getElementById('questionContent').value;

  if (title && content) {
    try {
      const response = await fetch(`${apiBaseUrl}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
      });

      if (response.ok) {
        displayQuestions();
        document.getElementById('questionTitle').value = '';
        document.getElementById('questionContent').value = '';
      } else {
        const error = await response.json();
        console.error('Failed to post question:', error);
        alert('Failed to post question');
      }
    } catch (error) {
      console.error('Error posting question:', error);
      alert('Failed to post question');
    }
  } else {
    alert('Please enter both title and content');
  }
}

async function displayQuestions() {
  try {
    const response = await fetch(`${apiBaseUrl}/questions`);
    if (response.ok) {
      const questions = await response.json();
      const questionList = document.getElementById('questionList');
      questionList.innerHTML = '';

      questions.forEach(question => {
        const li = document.createElement('li');
        li.className = "list-group-item mb-3";
        li.innerHTML = `
          <div class="media">
            <img src="https://via.placeholder.com/50" class="mr-3 rounded-circle" alt="User Avatar">
            <div class="media-body">
              <h5 class="mt-0">${question.title}</h5>
              <p>${question.content}</p>
              <p><small>Posted by Anonymous</small></p>
              <div class="comments">
                <h6>Comments</h6>
                <ul id="commentList${question._id}" class="list-group">
                  ${question.comments.map(comment => `
                    <li class="list-group-item">
                      <div class="media">
                        <img src="https://via.placeholder.com/30" class="mr-3 rounded-circle" alt="User Avatar">
                        <div class="media-body">
                          <p class="mb-0">Anonymous: ${comment.comment}</p>
                          <small>${new Date(comment.createdAt).toLocaleString()}</small>
                        </div>
                      </div>
                    </li>
                  `).join('')}
                </ul>
                <div class="input-group mt-3">
                  <input type="text" id="commentInput${question._id}" class="form-control" placeholder="Add a comment">
                  <div class="input-group-append">
                    <button onclick="addComment('${question._id}')" class="btn btn-outline-secondary">Add Comment</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        questionList.appendChild(li);
      });
    }
  } catch (error) {
    console.error('Failed to fetch questions', error);
  }
}

async function addComment(questionId) {
  const commentInput = document.getElementById(`commentInput${questionId}`);
  const commentText = commentInput.value;

  if (commentText) {
    try {
      const response = await fetch(`${apiBaseUrl}/questions/${questionId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: commentText })
      });

      const responseBody = await response.json();

      if (response.ok) {
        displayQuestions();
        commentInput.value = '';
      } else {
        console.error('Failed to add comment:', responseBody);
        alert('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  } else {
    alert('Please enter a comment');
  }
}
