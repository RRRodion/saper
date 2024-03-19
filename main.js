let flagMode = false;

function drawField() {
    const rows = parseInt(document.getElementById('rowsInput').value);
    const cols = parseInt(document.getElementById('colsInput').value);
    let timerInterval;
    let seconds = 0;
    let minutes = 0;
    let hours = 0;
    let gameInProgress = false;


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

    const buttonsData = {};

    for (let i = 0; i < rows; i++) {
        const rowContainer = document.createElement('div');
        for (let j = 0; j < cols; j++) {
            const button = document.createElement('button');
            button.textContent = '0';
            const id = `${i * cols + j + 1}`;
            button.id = id;
            const pos = `${i} ${j}`;
            button.setAttribute('data-pos', pos);
            buttonsData[id] = {
                value: 0,
                revealed: false,
                flagged: false,
                hasBomb: false
            };
            rowContainer.appendChild(button);
        }
        buttonContainer.appendChild(rowContainer);
    }

    const totalFields = rows * cols;
    const numBombs = Math.max(1, Math.floor(totalFields * 0.13));
    const bombIndices = generateBombIndices(totalFields, numBombs);

    const buttons = document.querySelectorAll('#buttonContainer button');
    bombIndices.forEach(index => {
        const button = buttons[index];
        button.textContent = '💣';
        const buttonData = buttonsData[button.id];
        buttonData.hasBomb = true;
        buttonData.value = '💣';
    });


    updateNumbers(buttons, buttonsData, rows, cols);

    buttons.forEach(button => {
        button.style.color = 'transparent';
        button.addEventListener('click', function (event) {
            if (event.button === 0) {
                handleClick(button, buttonsData);
            } else if (event.button === 2) {
                event.preventDefault();
                toggleFlag(button, buttonsData);
            }
        });
        button.addEventListener('contextmenu', function (event) {
            event.preventDefault();
            toggleFlag(button, buttonsData);
        });
    });

    // обработки клика по клетке
    function handleClick(button, buttonsData) {
        if (!gameInProgress) {
            gameInProgress = true;
            startTimer();
        }
        if (flagMode) {
            toggleFlag(button, buttonsData);
        } else {
            const buttonData = buttonsData[button.id];
            if (!buttonData.revealed && !buttonData.flagged) {
                if (buttonData.hasBomb) {
                    button.style.color = 'red';
                    setTimeout(function () {
                        gameInProgress = false;
                        clearInterval(timerInterval);
                        alert('Вы проиграли!');
                        buttons.forEach(button => {
                            const buttonData = buttonsData[button.id];
                            buttonData.revealed = true;
                        });
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

    function toggleFlag(button, buttonsData) {
        const buttonData = buttonsData[button.id];
        if (!buttonData.revealed) {
            if (buttonData.flagged) {
                button.textContent = buttonData.value;
                button.style.color = 'transparent';
            } else {
                button.textContent = '🚩';
                button.style.color = 'black';
            }
            buttonData.flagged = !buttonData.flagged;
        }
    }

    function revealEmpty(buttons, buttonsData, button) {
        const pos = button.getAttribute('data-pos').split(' ');
        const row = parseInt(pos[0]);
        const col = parseInt(pos[1]);
        const buttonData = buttonsData[button.id];

        if (buttonData.flagged) {
            return;
        }

        buttonData.revealed = true;
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
                            neighborButtonData.revealed = true;
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

    function checkWin(buttons, buttonsData) {
        let count = 0;
        buttons.forEach(button => {
            const buttonData = buttonsData[button.id];
            if (!buttonData.revealed && !buttonData.hasBomb) {
                count++;
            }
        });
        if (count === 0) {
            gameInProgress = false;
            clearInterval(timerInterval);
            alert('Поздравляем! Вы победили!');
        }
    }

    function startTimer() {
        if (!timerInterval) {
            timerInterval = setInterval(updateTimer, 1000);
        }
    }

    function updateTimer() {
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
            if (minutes >= 60) {
                minutes = 0;
                hours++;
            }
        }
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = formattedTime;
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
