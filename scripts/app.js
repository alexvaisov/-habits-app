
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

let deleteCandidateId = null;

function deleteHabbit(habbitId) {
    const habbitToDelete = habbits.find(h => h.id === habbitId);
    if (!habbitToDelete) return;
    
    const iconPath = `images/${habbitToDelete.icon.toLowerCase()}.svg`;
    showDeleteModal(habbitId, iconPath);
}

function showDeleteModal(habbitId, iconPath) {
    deleteCandidateId = habbitId;
    const iconElement = document.querySelector('.delete-habbit-icon');
    iconElement.src = iconPath;
    document.getElementById('delete-habbit-popup').classList.remove('cover-hidden');
}

function closeDeleteModal() {
    deleteCandidateId = null;
    document.getElementById('delete-habbit-popup').classList.add('cover-hidden');
}

function confirmDelete() {
    if (!deleteCandidateId) return;
    
    habbits = habbits.filter(habbit => habbit.id !== deleteCandidateId);
    saveData();
    
    const newActiveHabbit = habbits.length > 0 ? habbits[0].id : null;
    rerender(newActiveHabbit);
    closeDeleteModal();
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
        
        let longPressTimer;
        const longPressDuration = 1000;

        const startLongPress = (event) => {
            if (navigator.vibrate) navigator.vibrate(100);
            event.preventDefault();
            longPressTimer = setTimeout(() => {
                element.classList.add('menu-item-deleting');
                deleteHabbit(habbit.id);
            }, longPressDuration);
        };

        const cancelLongPress = () => {
            clearTimeout(longPressTimer);
            element.classList.remove('menu-item-deleting');
        };

        element.addEventListener('touchstart', startLongPress);
        element.addEventListener('touchend', cancelLongPress);
        element.addEventListener('touchcancel', cancelLongPress);

        element.addEventListener('mousedown', startLongPress);
        element.addEventListener('mouseup', cancelLongPress);
        element.addEventListener('mouseleave', cancelLongPress);

        element.addEventListener('click', (e) => {
            if (!element.classList.contains('menu-item-deleting')) {
                rerender(habbit.id);
            }
        });

        if (activeHabbit?.id === habbit.id) {
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
                                    <img src="images/delete.svg" alt="delete day ${index + 1}">
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
                days: habbit.days.concat([{ comment: data.comment }]),
                lastUpdated: new Date().toISOString()
            };
        }
        return habbit;
    });
    resetForm(event.target, ['comment']);
    rerender(globalActiveHabbitId);
    saveData();
}

function checkReminders() {
    const today = new Date().toDateString();
    
    habbits.forEach(habbit => {
        if (habbit.days.length >= habbit.target) return;
        
        const lastUpdatedDate = habbit.lastUpdated ? new Date(habbit.lastUpdated).toDateString() : null;
        if (lastUpdatedDate !== today) {
            sendNotification(`Don't forget to add a habit day "${habbit.name}"!`);
        }
    });
}

checkReminders();
setInterval(checkReminders, 24 * 60 * 60 * 1000);


function sendNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification('Reminder', { body: message });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Reminder', { body: message });
            }
        });
    }
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

function selectHabbit(habbitId) {
    console.log('выбрана привычка с ID', habbitId);

    const habbit = habbits.find(h => h.id === habbitId);
    if (!habbit) {
        console.log('привычка не найдена');
        return;
    }

    const header = document.querySelector('.header-title');
    if (!header) {
        console.log('Ошибка: элемент .header-title не найден!');
        return;
    }

    document.querySelector('.header-title').textContent = habbit.name;

    console.log('Обновляем заголовок на:', habbit.name);
    header.textContent = habbit.name;
}

function addHabbit(event) {
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
    if (!data) return;

    const storedHabbits = JSON.parse(localStorage.getItem(HABBIT_KEY)) || [];
    
    const maxId = storedHabbits.reduce((acc, habbit) => Math.max(acc, habbit.id), 0);

    const newHabbit = {
        id: maxId + 1,
        name: data.name,
        target: Number(data.target),
        icon: data.icon,
        days: []
    };

    habbits.push(newHabbit);
    saveData();

    resetForm(event.target, ['name', 'icon', 'target']);
    togglePopup();
    rerender(newHabbit.id);
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
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./scripts/sw.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(err => console.log('ServiceWorker failed:', err));

    }
    showMenu();
});


// init
(() => {
    loadData();
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Разрешение на уведомления получено');
            }
        });
    }

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
