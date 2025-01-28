
'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

// page

const page = {
    menu: document.querySelector('.menu-list'),
    header: {
        h1: document.querySelector('.header-title'),
        progressPercent: document.querySelector('.progres-percent'),
        progressBarActive: document.querySelector('.progres-bar-active')
    },
    content: {
        daysContainer: document.getElementById('main__list'),
        nextDay: document.querySelector('.habbit-day')
    },
    popup: {
        index: document.getElementById('add-habbit-popup'),
        iconField: document.querySelector('.popup__form input[name="icon"]')
    }

};

// utils

function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    if (habbitsString) {
        const habbitArray = JSON.parse(habbitsString);
        if (Array.isArray(habbitArray)) {
            habbits = habbitArray;
        }
    } else {
        habbits = [];
    }
}

function saveData() {
    try {
        localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
    }
}

function togglePopup() {
    page.popup.index.classList.toggle('cover-hidden');
}

function resetForm(form, fields) {
    for (const field of fields) {
        form[field].value = '';
    }
}

function validateAndGetFormData(form, fields) {
    const formData = new FormData(form);
    const res = {};
    let isValid = true;

    for (const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('error');
        if (!fieldValue) {
            form[field].classList.add('error');
            isValid = false;
        }
        res[field] = fieldValue;
    }

    return isValid ? res : null;
}

// render

function rerenderMenu(activeHabbit) {
    page.menu.innerHTML = '';
    for (const habbit of habbits) {
        const element = document.createElement('button');
        element.setAttribute('menu-habbit-id', habbit.id);
        element.classList.add('menu-item');
        element.addEventListener('click', () => rerender(habbit.id));
        element.innerHTML = `<img src="images/${habbit.icon.toLowerCase()}.svg" alt="${habbit.name}">`;
        if (activeHabbit.id === habbit.id) {
            element.classList.add('menu-item-active');
        }
        page.menu.appendChild(element);
    }
}

// header

function rerenderHead(activeHabbit) {
    page.header.h1.innerText = activeHabbit.name;
    const progress = Math.min(100, (activeHabbit.days.length / activeHabbit.target) * 100);
    page.header.progressPercent.innerText = progress.toFixed(0) + '%';
    page.header.progressBarActive.setAttribute('style', `width: ${progress}%`);
}


function rerenderContent(activeHabbit) {
    page.content.daysContainer.innerHTML = '';
    
    for (const index in activeHabbit.days) {
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = `<div class="list-habbit">
                        <div class="habbit-day">Day ${Number(index) + 1}</div>
                            <div class="habbit-content">
                                <div class="habbit-comment">${activeHabbit.days[index].comment}</div>
                                <button class="habbit-delete" onclick="deleteDay(${index})">
                                    <img src="images/file-delete-alternate--file-common-delete-cross.svg" alt="delete day ${index + 1}">
                                </button>
                            </div>
                    </div>`;
        page.content.daysContainer.appendChild(element);
    }

    const commentForm = document.querySelector('.habbit-form');

    if (activeHabbit.days.length >= activeHabbit.target) {
        if (commentForm) commentForm.style.display = 'none';
        page.content.nextDay.style.display = 'none';

        const message = document.createElement('div');
        message.classList.add('goal-reached-message');
        message.textContent = '🎉 Goal achieved! Well done!';
        page.content.daysContainer.appendChild(message);
    } else {
        if (commentForm) commentForm.style.display = 'flex';
        page.content.nextDay.style.display = 'flex';
        page.content.nextDay.innerHTML = `Day ${activeHabbit.days.length + 1}`;
    }
}



function rerender(activeHabbitId) {
    globalActiveHabbitId = activeHabbitId;
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
    if (!activeHabbit) {
        return;
    }
    document.location.replace(document.location.pathname + '#' + activeHabbitId);
    rerenderMenu(activeHabbit);
    rerenderHead(activeHabbit);
    rerenderContent(activeHabbit);
}

// work with days

function addDays(event) {
    event.preventDefault();
 
    const data = validateAndGetFormData(event.target, ['comment']);
    if (!data) {
        return;
    }

    const activeHabbit = habbits.find(habbit => habbit.id === globalActiveHabbitId);
    if (!activeHabbit) {
        return;
    }

    if (activeHabbit.days.length >= activeHabbit.target) {
        alert('You have reached your goal!');
        return;
    }

    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.concat([{ comment: data.comment }])
            };
        }
        return habbit;
    });

    resetForm(event.target, ['comment']);
    rerender(globalActiveHabbitId);
    saveData();
}

// delete days

function deleteDay(index) {
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.filter((_, i) => i !== index)
            };
        }
        return habbit;
    });
    rerender(globalActiveHabbitId);
    saveData();
}

// working with habbits

function setIcon(context, icon) {
    page.popup.iconField.value = icon;
    const activeIcon = document.querySelector('.icon.icon-active');
    activeIcon.classList.remove('icon-active');
    context.classList.add('icon-active');
}

function addHabbit(event) {
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
    if (!data) {
        return;
    }
    const inputElement = document.getElementById('input-name');
    inputElement.value = data.name.icon;
    const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0)
    habbits.push({
        id: maxId + 1,
        name: data.name,
        target: data.target,
        icon: data.icon,
        days: []
    });
    console.log(data.target);
    resetForm(event.target, ['name', 'icon', 'target']);
    togglePopup();
    saveData();
    rerender(maxId + 1);
}


function showMenu() {
    const buttonShowMenu = document.querySelector('.slider');
    if (buttonShowMenu) {
        buttonShowMenu.addEventListener('click', function() {
            const menu = document.querySelector('.panel__menu');
            const menuPosition = document.querySelector('.panel');
            const buttonSlider = document.querySelector('.slider');

            menu.classList.toggle('hide');
            buttonSlider.classList.toggle('position');
            menuPosition.classList.toggle('panel-off');
        })
    }
}

document.addEventListener('DOMContentLoaded', function() {
    showMenu();
});


// init
(() => {
    loadData();

    const hashId = Number(document.location.hash.replace('#', ''));
    if (isNaN(hashId)) {
        console.warn('Некорректный hashId:', hashId);
    }

    const urlHabbit = habbits.find(habbit => habbit.id === hashId);

    if (urlHabbit) {
        rerender(urlHabbit.id);
    } else if (habbits.length > 0) {
        rerender(habbits[0].id);
    } else {
        console.warn('Нет доступных привычек для отображения.');
    }
})();
