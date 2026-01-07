// ===== МОДУЛЬ УПРАВЛЕНИЯ ШАБЛОНАМИ =====
// Этот модуль отвечает за работу с шаблонами (учреждение, отделение, заключения и т.д.)

const templates = {
    institution: {
        'inst1': 'Федеральное государственное бюджетное учреждение «Национальный медицинский исследовательский центр детской гематологии, онкологии и иммунологии имени Дмитрия Рогачева» Министерства здравоохранения Российской Федерации г.Москва, ул.Саморы Машела, 1',
        'inst2': 'Городская клиническая больница №1 г.Москва',
        'inst3': 'Областной кардиологический центр'
    },
    department: {
        'dept1': 'ОТДЕЛЕНИЕ УЛЬТРАЗВУКОВОЙ ДИАГНОСТИКИ',
        'dept2': 'КАРДИОЛОГИЧЕСКОЕ ОТДЕЛЕНИЕ',
        'dept3': 'ОТДЕЛЕНИЕ ФУНКЦИОНАЛЬНОЙ ДИАГНОСТИКИ'
    },
    device: {
        'dev1': 'Philips EPIQ',
        'dev2': 'GE Vivid E95',
        'dev3': 'Siemens Acuson SC2000'
    },
    transducer: {
        'tr1': 'S5-1',
        'tr2': 'X5-1',
        'tr3': 'C5-1'
    },
    ward: {
        'ward1': 'Стационар кратковременного лечения',
        'ward2': 'Кардиореанимация',
        'ward3': 'Терапевтическое отделение'
    },
    rhythm: {
        'rhythm1': 'синусовый',
        'rhythm2': 'ИКС',
        'rhythm3': 'нарушения ритма'
    },
    cvp: {
        'cvp1': '5-10 mmHg',
        'cvp2': '10-15 mmHg',
        'cvp3': '15-20 mmHg'
    },
    ics: {
        'ics1': 'Электрод в правом предсердии',
        'ics2': 'Электрод в правом желудочке',
        'ics3': 'Бивентрикулярная стимуляция'
    },
    conclusion: {
        'conc1': 'Камеры нормальных размеров. Глобальная систолическая функция левого желудочка сохранена. Глобальная систолическая функция правого желудочка сохранена. Перегородки интактны.',
        'conc2': 'Камеры нормальных размеров. Легкая дилатация левого предсердия. Глобальная систолическая функция желудочков сохранена.',
        'conc3': 'Умеренная дилатация левого желудочка. Снижение глобальной систолической функции ЛЖ.'
    },
    segments: {
        'seg1': 'Абдоминальный situs solitus. Левокардия. Предсердный situs solitus. Нижняя полая вена справа от позвоночного столба, дренируется в правое предсердие. Верхняя полая вена дренируется в правое предсердие. Легочные вены дренируются в левое предсердие. Правое предсердие дренируется через трикуспидальный клапан в правый желудочек. Левое предсердие дренируется через митральный клапан в левый желудочек. Правая желудочковая петля. Аорта отходит от левого желудочка, присутствует митрально-аортальный контакт, лежит позади справа от легочной артерии, левая дуга. Легочная артерия отходит от инфундибулярного отдела правого желудочек.',
        'seg2': 'Абдоминальный situs solitus. Левая изомерия. Аспления. Общий желудочек с D-петлей. Общий атриовентрикулярный клапан. Двойное отхождение сосудов от правого желудочка. Легочный стеноз.'
    }
};

// ===== ОСНОВНЫЕ ФУНКЦИИ УПРАВЛЕНИЯ ШАБЛОНАМИ =====

/**
 * Показывает/скрывает элементы управления шаблонами
 * @param {string} type - тип шаблона (institution, department, device и т.д.)
 */
function toggleTemplate(type) {
    const checkbox = document.getElementById(`${type}TemplateCheckbox`);
    const select = document.getElementById(`${type}TemplateSelect`);
    const input = document.getElementById(`${type}TemplateInput`);
    
    if (checkbox) {
        if (checkbox.checked) {
            if (select) select.style.display = 'inline-block';
            if (input) input.style.display = 'inline-block';
            const nextElements = input.nextElementSibling;
            if (nextElements) {
                let current = nextElements;
                while (current && current.classList.contains('small-button')) {
                    current.style.display = 'inline-block';
                    current = current.nextElementSibling;
                }
            }
        } else {
            if (select) select.style.display = 'none';
            if (input) input.style.display = 'none';
            const nextElements = input.nextElementSibling;
            if (nextElements) {
                let current = nextElements;
                while (current && current.classList.contains('small-button')) {
                    current.style.display = 'none';
                    current = current.nextElementSibling;
                }
            }
        }
    }
}

/**
 * Добавляет новый шаблон
 * @param {string} type - тип шаблона
 */
function addTemplate(type) {
    const input = document.getElementById(`${type}TemplateInput`);
    const select = document.getElementById(`${type}TemplateSelect`);
    
    if (input && input.value.trim()) {
        const newKey = `${type}${Object.keys(templates[type]).length + 1}`;
        templates[type][newKey] = input.value.trim();
        
        updateTemplateSelect(type);
        
        select.value = newKey;
        applyTemplate(type);
        
        input.value = '';
        console.log(`Шаблон "${type}" добавлен: ${newKey}`);
    } else {
        alert('Введите текст шаблона');
    }
}

/**
 * Редактирует существующий шаблон
 * @param {string} type - тип шаблона
 */
function editTemplate(type) {
    const select = document.getElementById(`${type}TemplateSelect`);
    const input = document.getElementById(`${type}TemplateInput`);
    
    if (select && select.value && input) {
        const currentValue = templates[type][select.value];
        const newValue = prompt(`Редактировать шаблон "${currentValue.substring(0, 50)}..."`, currentValue);
        
        if (newValue !== null && newValue.trim()) {
            templates[type][select.value] = newValue.trim();
            updateTemplateSelect(type);
            applyTemplate(type);
            console.log(`Шаблон "${type}" отредактирован: ${select.value}`);
        }
    } else {
        alert('Сначала выберите шаблон для редактирования');
    }
}

/**
 * Удаляет выбранный шаблон
 * @param {string} type - тип шаблона
 */
function deleteTemplate(type) {
    const select = document.getElementById(`${type}TemplateSelect`);
    
    if (select && select.value && confirm('Удалить выбранный шаблон?')) {
        const keyToDelete = select.value;
        delete templates[type][keyToDelete];
        updateTemplateSelect(type);
        
        // Очищаем поле, если оно связано с этим шаблоном
        const fieldId = type === 'conclusion' ? 'conclusion' : 
                       type === 'segments' ? 'segments' : type;
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
        
        // Очищаем динамический контент для institution и department
        if (type === 'institution') {
            document.getElementById('institutionContent').innerHTML = '';
        } else if (type === 'department') {
            document.getElementById('departmentContent').innerHTML = '';
        }
        
        console.log(`Шаблон "${type}" удален: ${keyToDelete}`);
    }
}

/**
 * Применяет выбранный шаблон к соответствующему полю
 * @param {string} type - тип шаблона
 */
function applyTemplate(type) {
    const select = document.getElementById(`${type}TemplateSelect`);
    
    if (select && select.value && templates[type][select.value]) {
        const value = templates[type][select.value];
        
        switch(type) {
            case 'institution':
                document.getElementById('institutionContent').innerHTML = `<h2>${value}</h2>`;
                break;
            case 'department':
                document.getElementById('departmentContent').innerHTML = `<h3>${value}</h3>`;
                break;
            case 'conclusion':
                document.getElementById('conclusion').value = value;
                break;
            case 'segments':
                document.getElementById('segments').value = value;
                break;
            default:
                const field = document.getElementById(type);
                if (field) field.value = value;
                break;
        }
        
        console.log(`Шаблон "${type}" применен: ${select.value}`);
    }
}

/**
 * Обновляет выпадающий список шаблонов для указанного типа
 * @param {string} type - тип шаблона
 */
function updateTemplateSelect(type) {
    const select = document.getElementById(`${type}TemplateSelect`);
    if (!select) {
        console.warn(`Элемент select для типа "${type}" не найден`);
        return;
    }
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">Выберите шаблон</option>';
    
    for (const [key, value] of Object.entries(templates[type])) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = value.length > 50 ? value.substring(0, 50) + '...' : value;
        select.appendChild(option);
    }
    
    if (currentValue && templates[type][currentValue]) {
        select.value = currentValue;
    }
}

/**
 * Инициализирует все выпадающие списки шаблонов
 */
function initializeAllTemplateSelects() {
    for (const type in templates) {
        updateTemplateSelect(type);
    }
    
    // Устанавливаем значения по умолчанию
    const deviceSelect = document.getElementById('deviceTemplateSelect');
    if (deviceSelect) {
        deviceSelect.value = 'dev1';
        applyTemplate('device');
    }
    
    const rhythmSelect = document.getElementById('rhythmTemplateSelect');
    if (rhythmSelect) {
        rhythmSelect.value = 'rhythm1';
        applyTemplate('rhythm');
    }
    
    console.log('Все списки шаблонов инициализированы');
}

/**
 * Шаблон "НОРМА" для описания структур
 */
function applyStructuresNormal() {
    const checkbox = document.getElementById('structuresNormal');
    
    if (checkbox.checked) {
        document.getElementById('lvDescription').value = 'Кинетика всех сегментов не нарушена';
        document.getElementById('rvDescription').value = 'Кинетика не изменена';
        document.getElementById('mitralValve').value = 'створки тонкие, пролабирования нет (PLAX). Регургитация не отмечается';
        document.getElementById('aorticValve').value = '3-створчатый, створки тонкие, регургитация не отмечается';
        document.getElementById('tricuspidValve').value = 'створки тонкие, регургитация не отмечается. TAPSE мм';
        document.getElementById('pulmonaryValve').value = 'створки тонкие, регургитация физиологическая';
        document.getElementById('pericardium').value = 'признаки жидкости не визуализируются';
        
        console.log('Шаблон "Норма" применен к структурам');
    } else {
        document.getElementById('lvDescription').value = '';
        document.getElementById('rvDescription').value = '';
        document.getElementById('mitralValve').value = '';
        document.getElementById('aorticValve').value = '';
        document.getElementById('tricuspidValve').value = '';
        document.getElementById('pulmonaryValve').value = '';
        document.getElementById('pericardium').value = '';
        
        console.log('Шаблон "Норма" сброшен');
    }
}

/**
 * Показывает/скрывает блок формирования сегментов
 */
function toggleSegments() {
    const checkbox = document.getElementById('segmentsCheckbox');
    const content = document.getElementById('segmentsContent');
    const controls = document.getElementById('segmentsTemplateControls');
    
    if (checkbox) {
        content.style.display = checkbox.checked ? 'block' : 'none';
        controls.style.display = checkbox.checked ? 'inline-flex' : 'none';
        
        console.log(`Блок сегментов: ${checkbox.checked ? 'показан' : 'скрыт'}`);
    }
}

// ===== ЭКСПОРТ ФУНКЦИЙ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ МОДУЛЯХ =====
// Делаем функции доступными глобально для работы с HTML-атрибутами (onchange, onclick)

window.toggleTemplate = toggleTemplate;
window.addTemplate = addTemplate;
window.editTemplate = editTemplate;
window.deleteTemplate = deleteTemplate;
window.applyTemplate = applyTemplate;
window.updateTemplateSelect = updateTemplateSelect;
window.initializeAllTemplateSelects = initializeAllTemplateSelects;
window.applyStructuresNormal = applyStructuresNormal;
window.toggleSegments = toggleSegments;

// Экспортируем объект шаблонов для возможного использования в других модулях
window.templates = templates;

console.log('Модуль templates.js загружен');