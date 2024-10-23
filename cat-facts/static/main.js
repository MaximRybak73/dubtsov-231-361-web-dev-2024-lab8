function createPageBtn(page, classes = []) {
    let btn = document.createElement('button');
    classes.push('btn');
    for (cls of classes) {
        btn.classList.add(cls);
    }
    btn.dataset.page = page;
    btn.innerHTML = page;
    return btn;
}

function renderPaginationElement(info) {
    let btn;
    let paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    btn = createPageBtn(1, ['first-page-btn']);
    btn.innerHTML = 'Первая страница';
    if (info.current_page == 1) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);

    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('pages-btns');
    paginationContainer.append(buttonsContainer);

    let start = Math.max(info.current_page - 2, 1);
    let end = Math.min(info.current_page + 2, info.total_pages);
    for (let i = start; i <= end; i++) {
        buttonsContainer.append(createPageBtn(i, i == info.current_page ? ['active'] : []));
    }

    btn = createPageBtn(info.total_pages, ['last-page-btn']);
    btn.innerHTML = 'Последняя страница';
    if (info.current_page == info.total_pages) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);
}

function perPageBtnHandler(event) {
    downloadData(1);
}

function setPaginationInfo(info) {
    document.querySelector('.total-count').innerHTML = info.total_count;
    let start = info.total_count > 0 ? (info.current_page - 1) * info.per_page + 1 : 0;
    document.querySelector('.current-interval-start').innerHTML = start;
    let end = Math.min(info.total_count, start + info.per_page - 1)
    document.querySelector('.current-interval-end').innerHTML = end;
}

function pageBtnHandler(event) {
    if (event.target.dataset.page) {
        downloadData(event.target.dataset.page);
        window.scrollTo(0, 0);
    }
}

function createAuthorElement(record) {
    let user = record.user || { 'name': { 'first': '', 'last': '' } };
    let authorElement = document.createElement('div');
    authorElement.classList.add('author-name');
    authorElement.innerHTML = user.name.first + ' ' + user.name.last;
    return authorElement;
}

function createUpvotesElement(record) {
    let upvotesElement = document.createElement('div');
    upvotesElement.classList.add('upvotes');
    upvotesElement.innerHTML = record.upvotes;
    return upvotesElement;
}

function createFooterElement(record) {
    let footerElement = document.createElement('div');
    footerElement.classList.add('item-footer');
    footerElement.append(createAuthorElement(record));
    footerElement.append(createUpvotesElement(record));
    return footerElement;
}

function createContentElement(record) {
    let contentElement = document.createElement('div');
    contentElement.classList.add('item-content');
    contentElement.innerHTML = record.text;
    return contentElement;
}

function createListItemElement(record) {
    let itemElement = document.createElement('div');
    itemElement.classList.add('facts-list-item');
    itemElement.append(createContentElement(record));
    itemElement.append(createFooterElement(record));
    return itemElement;
}

// Функция для отображения фактов на странице
function renderRecords(records) {
    let factsList = document.querySelector('.facts-list');
    factsList.innerHTML = '';
    //проход по каждому факту и добавление его на страницу
    for (let i = 0; i < records.length; i++) {
        factsList.append(createListItemElement(records[i]));
    }
}

function downloadData(page = 1, query = '') {
    let factsList = document.querySelector('.facts-list');
    let url = new URL('http://cat-facts-api.std-900.ist.mospolytech.ru/facts');
    let perPage = document.querySelector('.per-page-btn').value;

    //добавление параметров в запрос
    url.searchParams.append('page', page);
    url.searchParams.append('per-page', perPage);

    // Если передан параметр запроса, добавляем его в URL
    if (query) {
        url.searchParams.append('q', query);
    }

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        renderRecords(this.response.records);
        setPaginationInfo(this.response['_pagination']);
        renderPaginationElement(this.response['_pagination']);
    }
    xhr.send();
}

//для обработки нажатия на кнопку поиска (новая)
function searchBtnHandler() {
    let searchField = document.querySelector('.search-field'); // Получаем значение поля ввода
    let searchQuery = searchField.value; // Получаем текст, введённый пользователем
    downloadData(1, searchQuery); // Запускаем поиск с введенным запросом
}

//для отображения вариантов автозаполнения (новая)
function renderAutocompleteSuggestions(suggestions) {
    let autocompleteList = document.querySelector('.autocomplete-list');
    autocompleteList.innerHTML = ''; // Очищаем список перед добавлением новых вариантов

    // Если нет предложений, скрыть список
    if (suggestions.length === 0) {
        autocompleteList.style.display = 'none';
        return;
    }

    // если есть предл-ия отображаем каждый вариант в виде элемента списка
    suggestions.forEach(suggestion => {
        let listItem = document.createElement('li');
        listItem.classList.add('autocomplete-item');
        listItem.innerHTML = suggestion;

        // Добавляем обработку клика по элементу списка
        listItem.onclick = function () {
            document.querySelector('.search-field').value = suggestion; // Вставляем выбранное значение в поле поиска
            autocompleteList.innerHTML = ''; // Очищаем список предложений
            autocompleteList.style.display = 'none'; // Скрываем список
        };

        autocompleteList.append(listItem); // Добавляем элемент в список
    });

    autocompleteList.style.display = 'block'; // Показываем список
}

//для обработки ввода текста в поле поиска (новая)
function handleInput(event) {
    let query = event.target.value;

    // Если введено меньше 1 символа, скрываем список и прекращаем выполнение
    if (query.length < 1) {
        document.querySelector('.autocomplete-list').style.display = 'none';
        return;
    }

    // Отправляем запрос на сервер для получения вариантов автозаполнения
    let url = new URL('http://cat-facts-api.std-900.ist.mospolytech.ru/autocomplete');
    url.searchParams.append('q', query);

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        let suggestions = xhr.response;
        renderAutocompleteSuggestions(suggestions); // Отображаем варианты на странице
    };
    xhr.send();
}

//обработчик событий для поля ввода
document.querySelector('.search-field').addEventListener('input', handleInput);


window.onload = function () {
    downloadData();
    document.querySelector('.pagination').onclick = pageBtnHandler; //обработка кликов по кнопкам навигации
    document.querySelector('.per-page-btn').onchange = perPageBtnHandler; //об-ка изменения кол-ва записей на странице
    document.querySelector('.search-btn').onclick = searchBtnHandler; // Добавляем обработку нажатия кнопки поиска
}



