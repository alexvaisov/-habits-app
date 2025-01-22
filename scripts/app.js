'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';

// page

const page = {
    menu: document.querySelector('.menu-list')
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
    if (!activeHabbit) {
        return;
    }
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

function rerender(activeHabbitId) {
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
    rerenderMenu(activeHabbit);
}

// init

(() => {
    loadData();
    rerender(habbits[0].id)
})();