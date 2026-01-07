/**
 * Выполняет релевантные расчеты на основе измененного поля
 * @param {string} changedFieldId - ID измененного поля
 */
function performRelevantCalculations(changedFieldId) {
    console.log(`🔁 Пересчет по изменению поля: ${changedFieldId}`);
    
    // 1. АНТРОПОМЕТРИЯ - ВСЕГДА при изменении любого из полей
    if (changedFieldId === 'weight_kg' || changedFieldId === 'weight_g' || changedFieldId === 'height') {
        if (typeof calculateAnthropometry === 'function') {
            // Небольшая задержка для сбора всех изменений
            setTimeout(() => {
                console.log(`📊 Запуск антропометрии после изменения ${changedFieldId}`);
                calculateAnthropometry();
            }, 50);
        }
        return; // Важно: возвращаемся, чтобы не запускать другие расчеты
    }
    
    // 2. Левый желудочек (параметры Teichholz)
    if (changedFieldId === 'lvedd' || changedFieldId === 'lvesd' || changedFieldId === 'ivsd' || changedFieldId === 'lvpwd') {
        if (typeof calculateLVParameters === 'function') {
            setTimeout(() => calculateLVParameters(), 50);
        }
    }
    
    // 3. Левый желудочек (Simpson)
    if (changedFieldId === 'lvEDV' || changedFieldId === 'lvESV') {
        if (typeof calculateSimpsonParameters === 'function') {
            setTimeout(() => calculateSimpsonParameters(), 50);
        }
        // Z-score для lvEDV при изменении Simpson объема
        if (changedFieldId === 'lvEDV') {
            setTimeout(() => {
                if (typeof calculateAllZScores === 'function') {
                    calculateAllZScores();
                }
            }, 100);
        }
    }
    
    // 4. Митральный клапан
    if (changedFieldId === 've' || changedFieldId === 'va' || changedFieldId === 'e_septal' || changedFieldId === 'e_lateral') {
        if (typeof calculateEA === 'function') calculateEA();
        if (typeof calculateEe === 'function') calculateEe();
        if (typeof calculateGradient === 'function') {
            calculateGradient('mitral');
            calculateGradient('mitralA');
        }
    }
    
    // 5. Аортальный клапан
    if (changedFieldId === 'aorticVmax') {
        if (typeof calculateGradient === 'function') calculateGradient('aortic');
    }
    
    // 6. Трикуспидальный клапан
    if (changedFieldId === 'tvVe') {
        if (typeof calculateGradient === 'function') calculateGradient('tv');
    }
    
    if (changedFieldId === 'tvRegurgVmax') {
        if (typeof calculateRegurgGradient === 'function') calculateRegurgGradient('tv');
    }
    
    // 7. Клапан легочной артерии
    if (changedFieldId === 'pvVmax') {
        if (typeof calculateGradient === 'function') calculateGradient('pv');
    }
    
    // 8. Гемодинамика (УО, СВ, СИ)
    if (changedFieldId === 'vtlzhDiameter' || changedFieldId === 'vtlzhVTI') {
        if (typeof calculateSV === 'function') {
            setTimeout(() => calculateSV(), 50);
        }
    }
    
    if (changedFieldId === 'hr') {
        if (typeof calculateHemodynamics === 'function') {
            setTimeout(() => calculateHemodynamics(), 50);
        }
    }
    
    // 9. Давление в ЛА
    if (changedFieldId === 'cvpValue' || changedFieldId === 'tvRegurgGradient') {
        if (typeof calculatePAP === 'function') calculatePAP();
    }
    
    // 10. Индексы предсердий
    if (changedFieldId === 'la_volume') {
        if (typeof calculateLAIndex === 'function') calculateLAIndex();
    }
    
    if (changedFieldId === 'ra_volume') {
        if (typeof calculateRAIndex === 'function') calculateRAIndex();
    }
    
    // 11. Фракция сокращения ПЖ
    if (changedFieldId === 'rvAreaDiastole' || changedFieldId === 'rvAreaSystole') {
        if (typeof calculateRVFAC === 'function') calculateRVFAC();
    }
    
    // 12. Z-score для любых измерений (с большой задержкой)
    const measurementFields = [
        'aortaAnnulus', 'aortaSinus', 'stj', 'ascAorta', 'proxArch', 'distArch',
        'aorticIsthmus', 'descAorta', 'abdoAorta', 'mvAnnulus', 'laDiameter',
        'laArea', 'rvBasal', 'rvAreaDiastole', 'tvAnnulus', 'raDiameter',
        'raArea', 'pvAnnulus', 'paMain', 'paRight', 'paLeft', 'lmca', 'lad', 
        'lcx', 'rca', 'ivcDiameter', 'lvedd', 'ivsd', 'lvpwd', 'lvEDV'
    ];
    
    if (measurementFields.includes(changedFieldId)) {
        clearTimeout(window.zScoreTimeout);
        window.zScoreTimeout = setTimeout(() => {
            if (typeof calculateAllZScores === 'function') {
                console.log(`📈 Запуск расчета Z-score после изменения ${changedFieldId}`);
                calculateAllZScores();
            }
        }, 800); // Большая задержка для Z-score
    }
}

/**
 * Настраивает обработчик для запятой как десятичного разделителя
 * С ДОПОЛНИТЕЛЬНЫМ ЗАПУСКОМ РАСЧЕТОВ
 */
function setupDecimalSeparatorHandler() {
    document.addEventListener('input', function(event) {
        const target = event.target;
        
        // Проверяем, что это поле ввода числа или текста
        if ((target.type === 'text' || target.type === 'number') && 
            target.value.includes(',')) {
            
            // Заменяем запятую на точку
            const newValue = target.value.replace(',', '.');
            
            // Проверяем, что получилось валидное число
            if (!isNaN(parseFloat(newValue)) && isFinite(newValue)) {
                target.value = newValue;
                
                // НЕМЕДЛЕННО запускаем расчеты для этого поля
                setTimeout(() => {
                    if (target.id && typeof performRelevantCalculations === 'function') {
                        performRelevantCalculations(target.id);
                    }
                }, 10);
                
                console.log(`🔢 Запятая заменена на точку в поле: ${target.id}`);
            }
        }
    });
    
    console.log('Обработчик десятичных разделителей настроен');
}

// ===== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ РАСЧЕТА =====

/**
 * Расчет отношения E/A
 */
window.calculateEA = function() {
    const ve = parseFloat(document.getElementById('ve').value) || 0;
    const va = parseFloat(document.getElementById('va').value) || 0;
    
    if (ve > 0 && va > 0) {
        const e_a_ratio = (ve / va).toFixed(2);
        document.getElementById('e_a_ratio').value = e_a_ratio;
        console.log('✅ E/A рассчитано:', e_a_ratio);
    } else {
        document.getElementById('e_a_ratio').value = '';
    }
};

/**
 * Расчет отношения E/e'
 */
window.calculateEe = function() {
    const ve = parseFloat(document.getElementById('ve').value) || 0;
    const e_septal = parseFloat(document.getElementById('e_septal').value) || 0;
    
    if (ve > 0 && e_septal > 0) {
        // Преобразуем ve из м/с в см/с (умножаем на 100)
        const ve_cm_s = ve * 100;
        const e_e_ratio = (ve_cm_s / e_septal).toFixed(1);
        document.getElementById('e_e_ratio').value = e_e_ratio;
        console.log('✅ E/e\' рассчитано:', e_e_ratio);
    } else {
        document.getElementById('e_e_ratio').value = '';
    }
};

/**
 * Расчет градиентов давления
 */
window.calculateGradient = function(valveType) {
    const gradientMap = {
        'mitral': { vmaxId: 've', gradientId: 'mitralPeakGradient' },
        'mitralA': { vmaxId: 'va', gradientId: 'mitralAPeakGradient' },
        'aortic': { vmaxId: 'aorticVmax', gradientId: 'aorticPeakGradient' },
        'tv': { vmaxId: 'tvVe', gradientId: 'tvPeakGradient' },
        'pv': { vmaxId: 'pvVmax', gradientId: 'pvPeakGradient' }
    };
    
    if (gradientMap[valveType]) {
        const vmax = parseFloat(document.getElementById(gradientMap[valveType].vmaxId).value) || 0;
        if (vmax > 0) {
            const gradient = (4 * Math.pow(vmax, 2)).toFixed(1);
            document.getElementById(gradientMap[valveType].gradientId).value = gradient;
            console.log(`✅ Градиент ${valveType} рассчитан:`, gradient, 'mmHg');
        } else {
            document.getElementById(gradientMap[valveType].gradientId).value = '';
        }
    }
};

/**
 * Расчет градиента регургитации
 */
window.calculateRegurgGradient = function(valveType) {
    if (valveType === 'tv') {
        const vmax = parseFloat(document.getElementById('tvRegurgVmax').value) || 0;
        if (vmax > 0) {
            const gradient = (4 * Math.pow(vmax, 2)).toFixed(1);
            document.getElementById('tvRegurgGradient').value = gradient;
            
            // Запускаем расчет давления в ЛА
            if (typeof calculatePAP === 'function') calculatePAP();
            console.log('✅ Градиент регургитации ТК рассчитан:', gradient);
        } else {
            document.getElementById('tvRegurgGradient').value = '';
        }
    }
};

/**
 * Расчет ударного объема
 */
window.calculateSV = function() {
    const diameter = parseFloat(document.getElementById('vtlzhDiameter').value) || 0;
    const vti = parseFloat(document.getElementById('vtlzhVTI').value) || 0;
    
    if (diameter > 0 && vti > 0) {
        const radius = diameter / 2;
        const area = Math.PI * Math.pow(radius, 2);
        const sv = (area * vti).toFixed(1);
        document.getElementById('svVTLZH').value = sv;
        console.log('✅ УО рассчитан:', sv, 'мл');
        
        // Запускаем расчет СВ и СИ
        if (typeof calculateHemodynamics === 'function') calculateHemodynamics();
    } else {
        document.getElementById('svVTLZH').value = '';
    }
};

/**
 * Расчет сердечного выброса и сердечного индекса
 */
window.calculateHemodynamics = function() {
    const sv = parseFloat(document.getElementById('svVTLZH').value) || 0;
    const hr = parseFloat(document.getElementById('hr').value) || 0;
    const bsa = parseFloat(document.getElementById('bsa').value) || 0;
    
    if (sv > 0 && hr > 0) {
        const co = (sv * hr / 1000).toFixed(2);
        document.getElementById('coVTLZH').value = co;
        console.log('✅ СВ рассчитан:', co, 'л/мин');
        
        if (bsa > 0) {
            const ci = (co / bsa).toFixed(2);
            document.getElementById('ciVTLZH').value = ci;
            console.log('✅ СИ рассчитан:', ci, 'л/мин/м²');
        } else {
            document.getElementById('ciVTLZH').value = '';
        }
    } else {
        document.getElementById('coVTLZH').value = '';
        document.getElementById('ciVTLZH').value = '';
    }
};

/**
 * Расчет давления в легочной артерии
 */
window.calculatePAP = function() {
    const cvp = parseFloat(document.getElementById('cvpValue').value) || 0;
    const gradient = parseFloat(document.getElementById('tvRegurgGradient').value) || 0;
    
    if (gradient > 0) {
        const pap = (gradient + cvp).toFixed(1);
        document.getElementById('papValue').value = pap;
        console.log('✅ Давление в ЛА рассчитано:', pap, 'mmHg');
    } else {
        document.getElementById('papValue').value = '';
    }
};

/**
 * Обработчик для чекбоксов e'/a'
 */
window.toggleEAPComparison = function(type) {
    const checkbox = document.getElementById(type + '_checkbox');
    const selector = document.getElementById(type + '_selector');
    
    if (checkbox && selector) {
        if (checkbox.checked) {
            selector.style.display = 'block';
        } else {
            selector.style.display = 'none';
            const display = document.getElementById(type + '_sign_display');
            if (display) display.textContent = '?';
        }
    }
};

/**
 * Обновление знака сравнения для e'/a'
 */
window.updateEAPSign = function(type) {
    const select = document.getElementById(type + '_sign');
    const display = document.getElementById(type + '_sign_display');
    
    if (select && display) {
        display.textContent = select.value || '?';
    }
};

/**
 * Скрытие селектора знака сравнения для e'/a'
 */
window.collapseEAPComparison = function(type) {
    const selector = document.getElementById(type + '_selector');
    if (selector) selector.style.display = 'none';
};

/**
 * Функция для метода Симпсона
 */
window.toggleSimpsonMethod = function() {
    const checkbox = document.getElementById('simpsonMethodCheckbox');
    const select = document.getElementById('simpsonMethod');
    
    if (checkbox && select) {
        select.style.display = checkbox.checked ? 'inline-block' : 'none';
    }
};

/**
 * Мобильный фикс: принудительный расчет при изменении поля
 */
window.forceMobileCalculation = function(fieldId) {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        console.log(`📱 Мобильный расчет для поля: ${fieldId}`);
        
        // Небольшая задержка для мобильных устройств
        setTimeout(() => {
            if (typeof performRelevantCalculations === 'function') {
                performRelevantCalculations(fieldId);
            }
        }, 200);
    }
};

/**
 * Проверка мобильного устройства
 */
window.isMobileDevice = function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Функция для отладки
 */
window.debugApp = function() {
    console.log('=== DEBUG APP ===');
    console.log('1. Проверка загрузки модулей:');
    console.log('- templates.js:', typeof templates);
    console.log('- calculations.js:', typeof calculateBSAHaycock);
    console.log('- form-manager.js:', typeof clearForm);
    console.log('- app.js:', typeof performRelevantCalculations);
    
    console.log('2. Проверка расчетов:');
    console.log('- ППТ:', document.getElementById('bsa').value);
    console.log('- Z-score элементы:', document.querySelectorAll('.z-score-cell span').length);
    
    console.log('3. Принудительный расчет антропометрии:');
    if (typeof calculateAnthropometry === 'function') {
        calculateAnthropometry();
    }
    
    console.log('=== DEBUG COMPLETE ===');
    alert('Проверка завершена. Смотрите консоль.');
};
