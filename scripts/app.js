
// let response = fetch('scripts/data.json');

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
            element.innerHTML = `<img src="images/${habbit.icon}.svg" alt="${habbit.name}">`
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
    rerenderMenu(activeHabbit);
    rerenderHead(activeHabbit);
    rerenderContent(activeHabbit);
}

// work with days

function addDays(event) {
    const form = event.target;
    event.preventDefault();
    const data = new FormData(form);
    const comment = data.get('comment');
    form['comment'].classList.remove('error');
    if (!comment) {
        form['comment'].classList.add('error');
    }
    habbits = habbits.map(habbit => {
        if (habbit.id ===globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.concat([{ comment}])
            };
        }
        return habbit;
    });
    form['comment'].value = '';
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

// init

(() => {
    loadData();
    rerender(habbits[0].id)
})();