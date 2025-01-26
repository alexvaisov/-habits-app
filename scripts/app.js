
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
    const habbitsString = localStorage.getItem('HABBIT_KEY');
    const habbitArray = JSON.parse(habbitsString);
    if (Array.isArray(habbitArray)) {
        habbits = habbitArray;
    }
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function togglePopup() {
    if (page.popup.index.classList.contains('cover-hidden')) {
        page.popup.index.classList.remove('cover-hidden');
    } else {
        page.popup.index.classList.add('cover-hidden');
    }
}

function resetForm(form, fields) {
    for (const field of fields) {
        form[field].value = '';
    }
}

function validateAndGetFormData(form, fields) {
    const formData = new FormData(form);
    const res = {};
    for(const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('error');
        if (!fieldValue) {
            form[field].classList.add('error');
        }
        res[field] = fieldValue;
    }
    let isValid = true;
    for (const filed of fields) {
        if (!res[filed]) {
            isValid = false;
        }
    }
    if (!isValid) {
        return;
    }
    return res;
}

// render

function rerenderMenu(activeHabbit) {
    for (const habbit of habbits) {
        let existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
        if (!existed) {
            // add
            const element = document.createElement('button');
            element.setAttribute('menu-habbit-id', habbit.id);
            element.classList.add('menu-item');
            element.addEventListener('click', () => rerender(habbit.id));
            element.innerHTML = `<img src="images/${habbit.icon.toLowerCase()}.svg" alt="${habbit.name}">`
            page.menu.appendChild(element);
            existed = element;
        }
        if (activeHabbit.id === habbit.id) {
            existed.classList.add('menu-item-active');
        } else {
            existed.classList.remove('menu-item-active');
        }

    }
}

// header

function rerenderHead(activeHabbit) {
    page.header.h1.innerText = activeHabbit.name;
    const progress = activeHabbit.days.length / activeHabbit.target > 1
        ? 100
        : activeHabbit.days.length / activeHabbit.target * 100;
    page.header.progressPercent.innerText = progress.toFixed(0) + '%';
    page.header.progressBarActive.setAttribute('style', `width: ${progress}%`)
}

function rerenderContent(activeHabbit) {
    page.content.daysContainer.innerHTML = '';
    for (const index in activeHabbit.days) {
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = `<div class="list-habbit">
                        <div class="habbit-day">Day ${Number(index) + 1}</div>
                        <div class="habbit-comment">${activeHabbit.days[index].comment}</div>
                        <button class="habbit-delete" onclick="deleteDay(${index})">
                            <img src="images/file-delete-alternate--file-common-delete-cross.svg" alt="delete day ${index + 1}">
                        </button>
                    </div>`
        page.content.daysContainer.appendChild(element);
    }
    page.content.nextDay.innerHTML = `Day ${activeHabbit.days.length + 1}`;
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
    
    habbits = habbits.map(habbit => {
        if (habbit.id ===globalActiveHabbitId) {
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
            habbit.days.splice(index, 1);
            return {
                ...habbit,
                days: habbit.days
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
    const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0)
    habbits.push({
        id: maxId + 1,
        name: data.name,
        target: data.target,
        icon: data.icon,
        days: []
    });
    resetForm(event.target, ['name', 'target']);
    togglePopup();
    saveData();
    rerender(maxId + 1);
}

// init

(() => {
    loadData();
    const hashId = Number(document.location.hash.replace('#', ''));
    const urlHabbit = habbits.find(habbit => habbit.id == hashId);
    if (urlHabbit) {
        rerender(urlHabbit.id);
    } else {
        rerender(habbits[0].id);
    }
})();