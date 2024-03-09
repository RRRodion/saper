function toggle() {
    const toggle = document.getElementById('toggle');
    const image = document.createElement('img');
    image.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Minesweeper_flag.svg/1200px-Minesweeper_flag.svg.png';
    image.width = 50;
    image.height = 50

    if (toggle.textContent === '1') {
        //toggle.appendChild(image);
        toggle.textContent = 'F'

    } else {
        //toggle.removeChild(image);
        toggle.textContent = '1';
    }
}

function drawField() {
    // Создание поля
    const rows = parseInt(document.getElementById('rowsInput').value);
    const cols = parseInt(document.getElementById('colsInput').value);
    const buttonContainer = document.getElementById('buttonContainer');
    buttonContainer.innerHTML = '';

    // Создание кнопок
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const button = document.createElement('button');
            button.textContent = '0';
            button.id = `${i * cols + j + 1}`;
            button.setAttribute('data-pos', `${i} ${j}`);
            buttonContainer.appendChild(button);
        }
        buttonContainer.appendChild(document.createElement('br'));
    }

    // Размещение бомб
    const totalFields = rows * cols;
    const numBombs = Math.max(1, Math.floor(totalFields * 0.03)); // 3% от общего числа клеток
    const bombIndices = generateBombIndices(totalFields, numBombs);

    // Установка метки на кнопках с бомбами
    const buttons = document.querySelectorAll('#buttonContainer button');
    bombIndices.forEach(index => {
        buttons[index].textContent = 'B';
    });

    // Обновление чисел в соседних клетках
    updateNumbers(buttons, rows, cols);

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

    //numbers
    function countBombsAround(buttons, row, col, rows, cols) {
        let count = 0;
        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i >= 0 && i < rows && j >= 0 && j < cols) {
                    if (buttons[i * cols + j].textContent === 'B') {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    function updateNumbers(buttons, rows, cols) {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const index = i * cols + j;
                const button = buttons[index];
                if (button.textContent !== 'B') {
                    const bombCount = countBombsAround(buttons, i, j, rows, cols);
                    if (bombCount > 0) {
                        button.textContent = bombCount.toString();
                    }
                }
            }
        }
    }
    buttons.forEach(button => {
        button.style.color = 'transparent';
        button.addEventListener('click', function() {
            if (button.textContent === 'B') {
                alert('Вы проиграли!');
                // потом новая игра
            } else if (button.textContent === '0') {
                revealEmpty(buttons, button);
            } else {
                button.classList.add('revealed');
            }
            button.style.color = 'black';
            checkWin(buttons);
        });
    });

    function revealEmpty(buttons, button) {
        const pos = button.getAttribute('data-pos').split(' ');
        const row = parseInt(pos[0]);
        const col = parseInt(pos[1]);

        button.classList.add('revealed');
        button.style.color = 'black';

        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i >= 0 && i < rows && j >= 0 && j < cols) {
                    const neighborButton = buttons[i * cols + j];
                    if (!neighborButton.classList.contains('revealed')) {
                        if (neighborButton.textContent === '0') {
                            revealEmpty(buttons, neighborButton);
                        } else {
                            neighborButton.classList.add('revealed');
                            neighborButton.style.color = 'black';
                        }
                    }
                }
            }
        }
    }



}

function checkWin(buttons) {
    let count = 0;
    buttons.forEach(button => {
        if (!button.classList.contains('revealed') && button.textContent !== 'B') {
            count++;
        }
    });
    if (count === 0) {
        alert('Поздравляем! Вы победили!');
        // потом новая игра
    }
}

function rules() {
    alert('В начале игры у игрока есть планшет, заполненный закрытыми квадратными полями. ' +
        'Некоторые из этих полей скрывают мины, а некоторые нет. Задача игрока – определить под каким ' +
        ' полем скрывается мина и помечать эти поля. Игрок должен также открыть те поля, где нет мин. ' +
        'Если игрок открывает поле с миной, он проигрывает. Если игрок открывает поле без мины, появляется номер,' +
        ' указывающий, сколько мин находится в восьми соседних полях. Базируясь на этих числах,' +
        ' игрок должен определить, где находятся мины. Цель игры - нахождение всех мин, посредством открытия полей,' +
        ' в которых нет мин.')
}

function log() {
    const buttons = document.querySelectorAll('#buttonContainer button');


    console.log(`------------------ ${buttons.length} -------------------`)

    buttons.forEach(button => {
        console.log(button.textContent);
        console.log(button.id);
    });
}
