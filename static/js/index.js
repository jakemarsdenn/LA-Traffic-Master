window.addEventListener("DOMContentLoaded", function() {
    animateText();
    displayLocalDate();
    loadChecklist();
});


window.addEventListener("beforeunload", function() {
    saveChecklist();
});


function animateText() {
    const text = document.getElementById("title");
    const letters = text.textContent.split("");
    text.textContent = "";
    letters.forEach((letter, index) => {
        const span = document.createElement("span");
        span.textContent = letter;
        span.style.animationDelay = `${index * 100}ms`;
        span.classList.add("loading");
        text.appendChild(span);
    });
}


function displayLocalDate() {
    const dateElement = document.getElementById("date");
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = currentDate.toLocaleDateString(undefined, options);
    const parts = date.split(' ');
    parts[2] += ',';
    const formattedDate = parts.join(' ');
    dateElement.textContent = formattedDate;
}


document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        createCheckbox();
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteCheckbox();
    }
});


function createCheckbox(checked = false, label = '') {
    const checklistContainer = document.querySelector('.checklist-container');
    const newCheckboxWrapper = document.createElement('div');
    const focusedCheckbox = document.activeElement.closest('.checkbox-wrapper');

    newCheckboxWrapper.classList.add('checkbox-wrapper');
    newCheckboxWrapper.innerHTML = `
        <input type="checkbox" id="cbx-${Date.now()}" class="inp-cbx" ${checked ? 'checked' : ''} />
        <label for="cbx-${Date.now()}" class="cbx">
            <span><svg viewBox="0 0 12 10" height="10px" width="12px"><polyline points="1.5 6 4.5 9 10.5 1"></polyline></svg></span>
            <input type="text" class="user-label-input" value="${label}" placeholder="activity" />
        </label>
    `;

    if (focusedCheckbox) {
        checklistContainer.insertBefore(newCheckboxWrapper, focusedCheckbox.nextSibling);
    } else {
        checklistContainer.appendChild(newCheckboxWrapper);
    }

    checklistContainer.appendChild(newCheckboxWrapper);

    const newLabelInput = newCheckboxWrapper.querySelector('.user-label-input');
    newLabelInput.focus();
}


function deleteCheckbox() {
    const focusedCheckbox = document.activeElement.closest('.checkbox-wrapper');

    if (focusedCheckbox) {
        const inputLabel = focusedCheckbox.querySelector('.user-label-input');
        if (inputLabel.value.length > 0) {
            const selectionStart = inputLabel.selectionStart;
            const selectionEnd = inputLabel.selectionEnd;
            if (selectionStart !== selectionEnd) {
                inputLabel.value = inputLabel.value.slice(0, selectionStart) + inputLabel.value.slice(selectionEnd);
                inputLabel.selectionStart = inputLabel.selectionEnd = selectionStart;
            } else if (selectionStart > 0) {
                inputLabel.value = inputLabel.value.slice(0, selectionStart - 1) + inputLabel.value.slice(selectionStart);
                inputLabel.selectionStart = inputLabel.selectionEnd = selectionStart - 1;
            }
        } else if (!focusedCheckbox.isSameNode(document.querySelector('.checkbox-wrapper'))) {
            const previousCheckbox = focusedCheckbox.previousElementSibling;
            focusedCheckbox.remove();

            if (previousCheckbox) {
                const inputLabel = previousCheckbox.querySelector('.user-label-input');
                inputLabel.focus();
            }
        }
    }
}


class ChecklistMemento {
    constructor(checklistState) {
        this.checklistState = checklistState;
    }
}


function saveChecklist() {
    const checklistState = [];
    const checkboxes = document.querySelectorAll('.checkbox-wrapper');

    checkboxes.forEach(checkbox => {
        const checkboxInput = checkbox.querySelector('.inp-cbx');
        const checkboxLabel = checkbox.querySelector('.user-label-input');

        checklistState.push({
            checked: checkboxInput.checked,
            label: checkboxLabel.value
        });
    });

    const checklistMemento = new ChecklistMemento(checklistState);
    localStorage.setItem('checklistMemento', JSON.stringify(checklistMemento));
}


function loadChecklist() {
    const checklistMementoJson = localStorage.getItem('checklistMemento');

    if (checklistMementoJson) {
        const checklistMemento = JSON.parse(checklistMementoJson);
        const checklistState = checklistMemento.checklistState;

        const checklistContainer = document.querySelector('.checklist-container');
        checklistContainer.innerHTML = '';

        checklistState.forEach(item => {
            createCheckbox(item.checked, item.label);
        });
    }
}






