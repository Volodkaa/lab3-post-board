// Лабораторная работа № 3 — Андрианов Вова, БПИ-23-РП-1.
// Работа с REST API: GET, POST, async/await и обновление DOM без перезагрузки.

const API_URL = "https://jsonplaceholder.typicode.com/posts";
const POSTS_URL = `${API_URL}?_limit=5`;

const loadButton = document.querySelector("#load-posts");
const postsList = document.querySelector("#posts-list");
const postsCount = document.querySelector("#posts-count");
const getStatus = document.querySelector("#get-status");

const createForm = document.querySelector("#create-form");
const titleInput = document.querySelector("#post-title");
const bodyInput = document.querySelector("#post-body");
const createButton = document.querySelector("#create-button");
const postStatus = document.querySelector("#post-status");
const createdResult = document.querySelector("#created-result");
const createdTitle = document.querySelector("#created-title");
const createdId = document.querySelector("#created-id");
const createdBody = document.querySelector("#created-body");

// Все сообщения пользователю появляются на странице, а не через alert().
function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `notice notice-${type}`;
}

function getErrorMessage(error, action) {
  if (error instanceof Error && error.message.startsWith("HTTP ")) {
    return `Не удалось ${action}: сервер вернул ошибку ${error.message}. Повторите попытку.`;
  }

  return `Не удалось ${action}. Проверьте интернет-соединение и попробуйте снова.`;
}

// Создаём элементы безопасно: текст сервера вставляется только через textContent.
function renderPosts(posts) {
  const fragment = document.createDocumentFragment();

  posts.forEach((post, index) => {
    const card = document.createElement("article");
    card.className = "post-card";

    const top = document.createElement("div");
    top.className = "post-card-top";

    const number = document.createElement("span");
    number.className = "post-number";
    number.textContent = `№ ${String(index + 1).padStart(2, "0")}`;

    const category = document.createElement("span");
    category.className = "post-category";
    category.textContent = `ID: ${post.id}`;

    const heading = document.createElement("h3");
    heading.textContent = post.title;

    const body = document.createElement("p");
    body.textContent = post.body;

    top.append(number, category);
    card.append(top, heading, body);
    fragment.append(card);
  });

  postsList.replaceChildren(fragment);
  postsCount.textContent = String(posts.length);
}

// 1. GET: загрузка пяти публикаций.
loadButton.addEventListener("click", async () => {
  loadButton.disabled = true;
  postsList.setAttribute("aria-busy", "true");
  showStatus(getStatus, "Загрузка публикаций... Подождите немного.", "loading");

  try {
    const response = await fetch(POSTS_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const posts = await response.json();
    if (!Array.isArray(posts)) {
      throw new Error("Неверный формат данных");
    }

    renderPosts(posts);
    showStatus(getStatus, `Готово! Загружено публикаций: ${posts.length}.`, "success");
  } catch (error) {
    showStatus(getStatus, getErrorMessage(error, "загрузить публикации"), "error");
    console.error("Ошибка GET-запроса:", error);
  } finally {
    loadButton.disabled = false;
    postsList.setAttribute("aria-busy", "false");
  }
});

// 2. POST: проверка формы и отправка новой публикации.
createForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Предотвращаем перезагрузку страницы.

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title || !body) {
    showStatus(postStatus, "Заполните и заголовок, и текст. Одних пробелов недостаточно.", "error");
    if (!title) {
      titleInput.focus();
    } else {
      bodyInput.focus();
    }
    return; // Если поля пустые, fetch не вызывается.
  }

  createButton.disabled = true;
  createForm.setAttribute("aria-busy", "true");
  createdResult.hidden = true;
  showStatus(postStatus, "Отправка публикации... Подождите немного.", "loading");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const createdPost = await response.json();
    createdTitle.textContent = createdPost.title;
    createdId.textContent = `ID публикации: ${createdPost.id}`;
    createdBody.textContent = createdPost.body;
    createdResult.hidden = false;

    showStatus(postStatus, "Успех! Публикация создана (тестовый ответ API).", "success");
    createForm.reset();
  } catch (error) {
    showStatus(postStatus, getErrorMessage(error, "создать публикацию"), "error");
    console.error("Ошибка POST-запроса:", error);
  } finally {
    createButton.disabled = false;
    createForm.setAttribute("aria-busy", "false");
  }
});
