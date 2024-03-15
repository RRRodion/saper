let flagMode = false; // Глобальная переменная для отслеживания текущего режима

function toggle() {
    flagMode = !flagMode; // Переключение режима
    const toggleButton = document.getElementById('toggle');
    toggleButton.textContent = flagMode ? '🚩' : '1'; // Обновление текста кнопки toggle
}

function drawField() {
    const rows = parseInt(document.getElementById('rowsInput').value);
    const cols = parseInt(document.getElementById('colsInput').value);

    if (rows < 5) {
        alert('количество столбцов не может быть меньше 5');
        return;
    }
    if (cols < 5) {
        alert('количество строк не может быть меньше 5');
        return;
    }
    const buttonContainer = document.getElementById('buttonContainer');
    buttonContainer.innerHTML = '';

    const buttonsData = {}; // Объект для хранения данных о кнопках

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const button = document.createElement('button');
            button.textContent = '0';
            const id = `${i * cols + j + 1}`;
            button.id = id;
            const pos = `${i} ${j}`;
            button.setAttribute('data-pos', pos);
            buttonsData[id] = { // Создание объекта для хранения данных о кнопке
                value: 0,
                revealed: false,
                flagged: false,
                hasBomb: false
            };
            buttonContainer.appendChild(button);
        }
        buttonContainer.appendChild(document.createElement('br'));
    }

    const totalFields = rows * cols;
    const numBombs = Math.max(1, Math.floor(totalFields * 0.13));
    const bombIndices = generateBombIndices(totalFields, numBombs);

    const buttons = document.querySelectorAll('#buttonContainer button');
    bombIndices.forEach(index => {
        const button = buttons[index];
        button.textContent = '💣';
        const buttonData = buttonsData[button.id];
        buttonData.hasBomb = true; // Установка флага, что у кнопки есть бомба
        buttonData.value = '💣'; // Обновление значения кнопки в объекте buttonsData
    });


    updateNumbers(buttons, buttonsData, rows, cols);

    buttons.forEach(button => {
        button.style.color = 'transparent';
        button.addEventListener('click', function () {
            handleClick(button, buttonsData); // Обработка клика
        });
    });

    // Функция для обработки клика по кнопке
    function handleClick(button, buttonsData) {
        if (flagMode) { // Если выбран режим установки флага
            const buttonData = buttonsData[button.id];
            if (!buttonData.revealed) { // Проверяем, не открыта ли уже кнопка
                if (buttonData.flagged) { // Если кнопка уже была отмечена флагом
                    button.textContent = buttonData.value; // Убираем флаг
                    button.style.color = 'transparent';
                } else {
                    button.textContent = '🚩'; // Устанавливаем флаг
                    button.style.color = 'black';
                }
                buttonData.flagged = !buttonData.flagged; // Изменяем состояние флага в объекте buttonsData
            }
        } else { // Если выбран режим открытия клеток
            const buttonData = buttonsData[button.id];
            if (!buttonData.revealed && !buttonData.flagged) { // Проверяем, не открыта ли уже кнопка и не установлен ли флаг
                // Реализация открытия клетки остается без изменений
                if (buttonData.hasBomb) {
                    button.style.color = 'red';
                    setTimeout(function () {
                        alert('Вы проиграли!');
                        console.log(buttonsData)
                    }, 0);
                } else if (buttonData.value === 0) {
                    revealEmpty(buttons, buttonsData, button);
                    button.style.color = 'black';
                } else {
                    button.classList.add('revealed');
                    button.style.color = 'blue';
                    buttonData.revealed = true;
                }

                checkWin(buttons, buttonsData);
            }
        }
    }

    function revealEmpty(buttons, buttonsData, button) {
        const pos = button.getAttribute('data-pos').split(' ');
        const row = parseInt(pos[0]);
        const col = parseInt(pos[1]);
        const buttonData = buttonsData[button.id];

        if (buttonData.flagged) {
            return; // Если на кнопке стоит флаг, выходим из функции
        }

        buttonData.revealed = true; // Marking the current button as revealed
        button.classList.add('revealed');
        button.style.color = 'black';

        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i >= 0 && i < rows && j >= 0 && j < cols) {
                    const neighborButton = buttons[i * cols + j];
                    const neighborButtonData = buttonsData[neighborButton.id];
                    if (!neighborButtonData.revealed) {
                        if (neighborButtonData.value === 0) {
                            revealEmpty(buttons, buttonsData, neighborButton);
                        } else {
                            neighborButtonData.revealed = true; // Marking the neighbor button as revealed
                            neighborButton.classList.add('revealed');
                            neighborButton.style.color = 'blue';
                        }
                    }
                }
            }
        }
    }


    function generateBombIndices(totalFields, numBombs) {
        const bombIndices = [];
        while (bombIndices.length < numBombs) {
            const index = Math.floor(Math.random() * totalFields);
            if (!bombIndices.includes(index)) {
                bombIndices.push(index);
            }
        }
        return bombIndices;
    }

    function countBombsAround(buttonsData, row, col, rows, cols) {
        let count = 0;
        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i >= 0 && i < rows && j >= 0 && j < cols) {
                    const id = i * cols + j + 1;
                    if (buttonsData[id].hasBomb) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    function updateNumbers(buttons, buttonsData, rows, cols) {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const id = i * cols + j + 1;
                const button = buttons[id - 1];
                const buttonData = buttonsData[id];
                if (!buttonData.hasBomb) {
                    const bombCount = countBombsAround(buttonsData, i, j, rows, cols);
                    if (bombCount > 0) {
                        button.textContent = bombCount.toString();
                        buttonData.value = bombCount;
                    }
                }
            }
        }
    }
}

function checkWin(buttons, buttonsData) {
    let count = 0;
    buttons.forEach(button => {
        const buttonData = buttonsData[button.id];
        if (!buttonData.revealed && !buttonData.hasBomb) {
            count++;
        }
    });
    if (count === 0) {
        alert('Поздравляем! Вы победили!');
    }
}

function rules() {
    alert('В начале игры у игрока есть планшет, заполненный закрытыми квадратными полями. ' +
        'Некоторые из этих полей скрывают мины, а некоторые нет. Задача игрока – определить под каким ' +
        ' полем скрывается мина и помечать эти поля. Игрок должен также открыть те поля, где нет мин. ' +
        'Если игрок открывает поле с миной, он проигрывает. Если игрок открывает поле без мины, появляется номер,' +
        ' указывающий, сколько мин находится в восьми соседних полях. Базируясь на этих числах,' +
        ' игрок должен определить, где находятся мины. Цель игры - нахождение всех мин, посредством открытия полей,' +
        ' в которых нет мин.');
}

function log() {
    const buttonsData = {}; // Создание объекта для хранения данных о кнопках
    const buttons = document.querySelectorAll('#buttonContainer button');

    console.log(`------------------ ${buttons.length} -------------------`);

    buttons.forEach(button => {
        const id = button.id;
        const value = button.textContent;
        buttonsData[id] = {
            value: value,
            revealed: button.classList.contains('revealed'),
            flagged: button.textContent === '🚩',
            hasBomb: button.textContent === '💣'
        };
        console.log(button.textContent);
        console.log(button.id);
    });
    console.log(buttonsData);
}