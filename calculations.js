// ===== CALCULATIONS.JS - ПОЛНАЯ ВЕРСИЯ С ВСЕМИ ФУНКЦИЯМИ =====
console.log('✅ calculations.js загружается...');

// ===== КОНСТАНТЫ ДЛЯ Z-SCORE =====
const Z_SCORE_CONSTANTS = {
    aortaAnnulus: { a: 2.750, b: 0.515, c: 0.088 },
    aortaSinus: { a: 3.051, b: 0.481, c: 0.092 },
    stj: { a: 2.797, b: 0.512, c: 0.098 },
    ascAorta: { a: 2.949, b: 0.486, c: 0.096 },
    proxArch: { a: 2.742, b: 0.515, c: 0.121 },
    distArch: { a: 2.572, b: 0.521, c: 0.124 },
    aorticIsthmus: { a: 2.356, b: 0.550, c: 0.146 },
    descAorta: { a: 2.518, b: 0.498, c: 0.130 },
    abdoAorta: { a: 2.352, b: 0.477, c: 0.122 },
    mvAnnulus: { a: 3.161, b: 0.471, c: 0.087 },
    laDiameter: { a: 3.402, b: 0.454, c: 0.095 },
    laArea: { a: 2.191, b: 0.894, c: 0.165 },
    lvEDV_a4ch: { a: 3.868, b: 1.405, c: 0.215 },
    lvEDV_biplane: { a: 3.870, b: 1.406, c: 0.211 },
    lvedd: { a: 3.634, b: 0.464, c: 0.091 },
    rvBasal: { a: 3.445, b: 0.499, c: 0.113 },
    rvAreaDiastole: { a: 2.443, b: 0.955, c: 0.171 },
    tvAnnulus: { a: 3.187, b: 0.466, c: 0.14 },
    raDiameter: { a: 3.450, b: 0.478, c: 0.105 },
    raArea: { a: 2.235, b: 0.911, c: 0.178 },
    pvAnnulus: { a: 2.908, b: 0.538, c: 0.113 },
    paMain: { a: 2.945, b: 0.489, c: 0.113 },
    paRight: { a: 2.397, b: 0.558, c: 0.145 },
    paLeft: { a: 2.383, b: 0.569, c: 0.159 }
};

// ===== ВАЖНО: ЭТА ФУНКЦИЯ ПЕРВАЯ! =====
function calculateBSAHaycock(weight, height) {
    // Формула Haycock: BSA = 0.024265 × вес^0.5378 × рост^0.3964
    return 0.024265 * Math.pow(weight, 0.5378) * Math.pow(height, 0.3964);
}

// ===== ОСНОВНАЯ ФУНКЦИЯ АНТРОПОМЕТРИИ =====
function calculateAnthropometry() {
    console.log('📊 calculateAnthropometry вызвана');
    
    const height = parseFloat(document.getElementById('height').value) || 0;
    const weightKg = parseFloat(document.getElementById('weight_kg').value) || 0;
    const weightG = parseFloat(document.getElementById('weight_g').value) || 0;
    
    const totalWeight = weightKg + (weightG / 1000);
    
    console.log('📐 Данные: рост=', height, 'см, вес=', totalWeight, 'кг');
    
    if (height > 0 && totalWeight > 0) {
        const heightM = height / 100;
        const bmi = (totalWeight / (heightM * heightM)).toFixed(1);
        const bsa = calculateBSAHaycock(totalWeight, height).toFixed(2);
        
        document.getElementById('bmi').value = bmi;
        document.getElementById('bsa').value = bsa;
        
        console.log('✅ Рассчитано: ИМТ=', bmi, 'ППТ=', bsa, 'м²');
        
        // ВАЖНО: Запускаем ВСЕ расчеты, зависящие от антропометрии
        setTimeout(() => {
            // 1. Расчет индексов предсердий
            if (typeof calculateLAIndex === 'function') calculateLAIndex();
            if (typeof calculateRAIndex === 'function') calculateRAIndex();
            
            // 2. Расчет Z-score для ВСЕХ полей
            if (typeof calculateAllZScores === 'function') {
                console.log('📈 Запуск расчета Z-score после расчета ППТ');
                calculateAllZScores();
            }
            
            // 3. Другие расчеты, зависящие от ППТ
            if (typeof calculateLVParameters === 'function') calculateLVParameters();
            if (typeof calculateSV === 'function') calculateSV();
            if (typeof calculateHemodynamics === 'function') calculateHemodynamics();
            
        }, 100);
        
    } else {
        document.getElementById('bmi').value = '';
        document.getElementById('bsa').value = '';
        console.log('⏳ Ожидание данных: нужны и рост, и вес');
        
        // Очищаем зависимые поля при отсутствии данных
        document.getElementById('la_volume_index').value = '';
        document.getElementById('ra_volume_index').value = '';
        document.getElementById('lvMassIndex').value = '';
    }
}

// ===== Z-SCORE РАСЧЕТЫ (ИСПРАВЛЕННЫЕ ПО НОВОЙ ФОРМУЛЕ) =====
function calculateAllZScores() {
    console.log('📈 calculateAllZScores вызвана');
    
    const bsaRaw = parseFloat(document.getElementById('bsa').value) || 0;
    const bsa = Math.round(bsaRaw * 100) / 100; // Округление до 2 знаков
    
    if (!bsa || bsa <= 0) {
        console.log('⏳ Недостаточно данных для расчета Z-score: нужна ППТ');
        clearAllZScoreFields();
        return;
    }
    
    console.log(`📊 Данные для Z-score: ППТ=${bsa} м²`);
    
    // 1. Стандартные Z-score расчеты
    calculateStandardZScores(bsa);
    
    // 2. Специальные расчеты (толщина стенок, IVC, коронарные артерии)
    calculateSpecialZScores(bsa);
    
    console.log('✅ Z-score расчеты завершены');
}

// Стандартные Z-score расчеты по формуле: Z = (ln(measurement) - (a + b * ln(bsa))) / c
function calculateStandardZScores(bsa) {
    const standardCalculations = [
        { id: 'aortaAnnulus', const: Z_SCORE_CONSTANTS.aortaAnnulus },
        { id: 'aortaSinus', const: Z_SCORE_CONSTANTS.aortaSinus },
        { id: 'stj', const: Z_SCORE_CONSTANTS.stj },
        { id: 'ascAorta', const: Z_SCORE_CONSTANTS.ascAorta },
        { id: 'proxArch', const: Z_SCORE_CONSTANTS.proxArch },
        { id: 'distArch', const: Z_SCORE_CONSTANTS.distArch },
        { id: 'aorticIsthmus', const: Z_SCORE_CONSTANTS.aorticIsthmus },
        { id: 'descAorta', const: Z_SCORE_CONSTANTS.descAorta },
        { id: 'abdoAorta', const: Z_SCORE_CONSTANTS.abdoAorta },
        { id: 'mvAnnulus', const: Z_SCORE_CONSTANTS.mvAnnulus },
        { id: 'laDiameter', const: Z_SCORE_CONSTANTS.laDiameter },
        { id: 'laArea', const: Z_SCORE_CONSTANTS.laArea },
        { id: 'lvedd', const: Z_SCORE_CONSTANTS.lvedd },
        { id: 'rvBasal', const: Z_SCORE_CONSTANTS.rvBasal },
        { id: 'rvAreaDiastole', const: Z_SCORE_CONSTANTS.rvAreaDiastole },
        { id: 'tvAnnulus', const: Z_SCORE_CONSTANTS.tvAnnulus },
        { id: 'raDiameter', const: Z_SCORE_CONSTANTS.raDiameter },
        { id: 'raArea', const: Z_SCORE_CONSTANTS.raArea },
        { id: 'pvAnnulus', const: Z_SCORE_CONSTANTS.pvAnnulus },
        { id: 'paMain', const: Z_SCORE_CONSTANTS.paMain },
        { id: 'paRight', const: Z_SCORE_CONSTANTS.paRight },
        { id: 'paLeft', const: Z_SCORE_CONSTANTS.paLeft }
    ];
    
    standardCalculations.forEach(item => {
        const measurement = parseFloat(document.getElementById(item.id).value);
        if (measurement && measurement > 0) {
            const z = (Math.log(measurement) - (item.const.a + item.const.b * Math.log(bsa))) / item.const.c;
            updateZScoreElement(`z-${item.id}`, z);
        } else {
            clearZScoreElement(`z-${item.id}`);
        }
    });
    
    // Z-score для lvEDV (Simpson) с учетом метода
    const method = document.getElementById('simpsonMethod') ? document.getElementById('simpsonMethod').value : '';
    const lvEDV = parseFloat(document.getElementById('lvEDV').value);
    
    if (lvEDV && lvEDV > 0) {
        let z;
        if (method === 'a4ch') {
            z = (Math.log(lvEDV) - (Z_SCORE_CONSTANTS.lvEDV_a4ch.a + Z_SCORE_CONSTANTS.lvEDV_a4ch.b * Math.log(bsa))) / Z_SCORE_CONSTANTS.lvEDV_a4ch.c;
        } else if (method === 'biplane') {
            z = (Math.log(lvEDV) - (Z_SCORE_CONSTANTS.lvEDV_biplane.a + Z_SCORE_CONSTANTS.lvEDV_biplane.b * Math.log(bsa))) / Z_SCORE_CONSTANTS.lvEDV_biplane.c;
        } else {
            // По умолчанию используем a4ch
            z = (Math.log(lvEDV) - (Z_SCORE_CONSTANTS.lvEDV_a4ch.a + Z_SCORE_CONSTANTS.lvEDV_a4ch.b * Math.log(bsa))) / Z_SCORE_CONSTANTS.lvEDV_a4ch.c;
        }
        updateZScoreElement('z-lvEDV', z);
    } else {
        clearZScoreElement('z-lvEDV');
    }
}

// Специальные Z-score расчеты с уникальными формулами
function calculateSpecialZScores(bsa) {
    // Z-score для толщины МЖП (Lopez et al.)
    const ivsd = parseFloat(document.getElementById('ivsd').value) / 10; // мм -> см
    if (ivsd && ivsd > 0) {
        const normalized = ivsd / Math.pow(bsa, 0.4);
        const z = (normalized - 0.58) / 0.09;
        updateZScoreElement('z-ivsd', z);
    } else {
        clearZScoreElement('z-ivsd');
    }
    
    // Z-score для толщины ЗСЛЖ (Lopez et al.)
    const lvpwd = parseFloat(document.getElementById('lvpwd').value) / 10; // мм -> см
    if (lvpwd && lvpwd > 0) {
        const normalized = lvpwd / Math.pow(bsa, 0.4);
        const z = (normalized - 0.57) / 0.09;
        updateZScoreElement('z-lvpwd', z);
    } else {
        clearZScoreElement('z-lvpwd');
    }
    
    // Z-score для нижней полой вены
    const ivcDiameter = parseFloat(document.getElementById('ivcDiameter').value);
    if (ivcDiameter && ivcDiameter > 0) {
        const z = (Math.log(ivcDiameter) - (2.406 + 0.826 * Math.log(bsa))) / 0.24;
        updateZScoreElement('z-ivcDiameter', z);
    } else {
        clearZScoreElement('z-ivcDiameter');
    }
    
    // Z-score для коронарных артерий
    calculateCoronaryArteryZScores(bsa);
}

// Z-score для коронарных артерий
function calculateCoronaryArteryZScores(bsa) {
    const sqrtBSA = Math.sqrt(bsa);
    
    // LMCA
    const lmca = parseFloat(document.getElementById('lmca').value);
    if (lmca && lmca > 0) {
        const expected = -0.1817 + 2.9238 * sqrtBSA;
        const denominator = 0.1801 + 0.253 * sqrtBSA;
        const z = (lmca - expected) / denominator;
        updateZScoreElement('z-lmca', z);
    } else {
        clearZScoreElement('z-lmca');
    }
    
    // LAD
    const lad = parseFloat(document.getElementById('lad').value);
    if (lad && lad > 0) {
        const expected = -0.1502 + 2.2672 * sqrtBSA;
        const denominator = 0.1709 + 0.2293 * sqrtBSA;
        const z = (lad - expected) / denominator;
        updateZScoreElement('z-lad', z);
    } else {
        clearZScoreElement('z-lad');
    }
    
    // LCX
    const lcx = parseFloat(document.getElementById('lcx').value);
    if (lcx && lcx > 0) {
        const expected = -0.2716 + 2.3458 * sqrtBSA;
        const denominator = 0.1142 + 0.3423 * sqrtBSA;
        const z = (lcx - expected) / denominator;
        updateZScoreElement('z-lcx', z);
    } else {
        clearZScoreElement('z-lcx');
    }
    
    // RCA
    const rca = parseFloat(document.getElementById('rca').value);
    if (rca && rca > 0) {
        const expected = -0.3039 + 2.7521 * sqrtBSA;
        const denominator = 0.1626 + 0.2881 * sqrtBSA;
        const z = (rca - expected) / denominator;
        updateZScoreElement('z-rca', z);
    } else {
        clearZScoreElement('z-rca');
    }
}

// Обновление элемента Z-score
function updateZScoreElement(elementId, zScore) {
    const zElement = document.getElementById(elementId);
    if (zElement) {
        const rounded = Math.round(zScore * 100) / 100;
        zElement.textContent = rounded;
        
        const absZ = Math.abs(rounded);
        if (absZ > 2) {
            zElement.style.color = '#e74c3c';
            zElement.style.fontWeight = 'bold';
        } else if (absZ > 1.5) {
            zElement.style.color = '#f39c12';
            zElement.style.fontWeight = 'normal';
        } else {
            zElement.style.color = '#0066cc';
            zElement.style.fontWeight = 'normal';
        }
    }
}

// Очистка элемента Z-score
function clearZScoreElement(elementId) {
    const zElement = document.getElementById(elementId);
    if (zElement) {
        zElement.textContent = '-';
        zElement.style.color = '#0066cc';
        zElement.style.fontWeight = 'normal';
    }
}

// Очистка всех Z-score полей
function clearAllZScoreFields() {
    const zScoreFields = [
        'aortaAnnulus', 'aortaSinus', 'stj', 'ascAorta', 'proxArch', 'distArch',
        'aorticIsthmus', 'descAorta', 'abdoAorta', 'mvAnnulus', 'laDiameter',
        'laArea', 'lvedd', 'ivsd', 'lvpwd', 'rvBasal', 'rvAreaDiastole',
        'tvAnnulus', 'raDiameter', 'raArea', 'pvAnnulus', 'paMain',
        'paRight', 'paLeft', 'lmca', 'lad', 'lcx', 'rca', 'ivcDiameter',
        'lvEDV'  // ДОБАВЛЕНО
    ];
    
    zScoreFields.forEach(fieldId => {
        clearZScoreElement(`z-${fieldId}`);
    });
}

// ===== ИНДЕКСЫ ПРЕДСЕРДИЙ =====
function calculateLAIndex() {
    const laVolume = parseFloat(document.getElementById('la_volume').value) || 0;
    const bsa = parseFloat(document.getElementById('bsa').value) || 0;
    
    if (laVolume > 0 && bsa > 0) {
        const index = (laVolume / bsa).toFixed(1);
        document.getElementById('la_volume_index').value = index;
        console.log('✅ LA индекс рассчитан:', index);
    } else {
        document.getElementById('la_volume_index').value = '';
    }
}

function calculateRAIndex() {
    const raVolume = parseFloat(document.getElementById('ra_volume').value) || 0;
    const bsa = parseFloat(document.getElementById('bsa').value) || 0;
    
    if (raVolume > 0 && bsa > 0) {
        const index = (raVolume / bsa).toFixed(1);
        document.getElementById('ra_volume_index').value = index;
        console.log('✅ RA индекс рассчитан:', index);
    } else {
        document.getElementById('ra_volume_index').value = '';
    }
}

// ===== ПРАВЫЙ ЖЕЛУДОЧЕК (RV FAC) =====
function calculateRVFAC() {
    const rvAreaDiastole = parseFloat(document.getElementById('rvAreaDiastole').value) || 0;
    const rvAreaSystole = parseFloat(document.getElementById('rvAreaSystole').value) || 0;
    
    if (rvAreaDiastole > 0 && rvAreaSystole > 0 && rvAreaDiastole > rvAreaSystole) {
        const rvFAC = ((rvAreaDiastole - rvAreaSystole) / rvAreaDiastole * 100).toFixed(1);
        document.getElementById('rvFAC').value = rvFAC;
        console.log('✅ RV FAC рассчитан:', rvFAC);
    } else {
        document.getElementById('rvFAC').value = '';
    }
}

// ===== ЛЕВЫЙ ЖЕЛУДОЧЕК (Teichholz) =====
function calculateLVParameters() {
    const lvedd = parseFloat(document.getElementById('lvedd').value) || 0;
    const lvesd = parseFloat(document.getElementById('lvesd').value) || 0;
    const ivsd = parseFloat(document.getElementById('ivsd').value) || 0;
    const lvpwd = parseFloat(document.getElementById('lvpwd').value) || 0;
    
    if (lvedd > 0 && lvesd > 0) {
        // Фракция укорочения
        const fs = ((lvedd - lvesd) / lvedd * 100).toFixed(1);
        document.getElementById('fs').value = fs;
        
        // ИНДЕКС МАССЫ МИОКАРДА - ИСПРАВЛЕННАЯ ФОРМУЛА
        if (ivsd > 0 && lvpwd > 0) {
            const lveddCm = lvedd / 10; // мм -> см
            const ivsdCm = ivsd / 10; // мм -> см
            const lvpwdCm = lvpwd / 10; // мм -> см
            const heightM = (parseFloat(document.getElementById('height').value) || 0) / 100; // см -> м
            
            if (heightM > 0) {
                const mass = 0.8 * (1.04 * (Math.pow(lveddCm + lvpwdCm + ivsdCm, 3) - Math.pow(lveddCm, 3))) + 0.6;
                const massIndex = mass / Math.pow(heightM, 2.7);
                document.getElementById('lvMassIndex').value = Math.round(massIndex * 100) / 100;
            }
        }
        
        console.log('✅ LV параметры рассчитаны: FS=', fs);
    } else {
        document.getElementById('fs').value = '';
        document.getElementById('lvMassIndex').value = '';
    }
}

// ===== ЛЕВЫЙ ЖЕЛУДОЧЕК (Simpson) =====
function calculateSimpsonParameters() {
    const lvEDV = parseFloat(document.getElementById('lvEDV').value) || 0;
    const lvESV = parseFloat(document.getElementById('lvESV').value) || 0;
    
    if (lvEDV > 0 && lvESV > 0 && lvEDV > lvESV) {
        const lvSV = (lvEDV - lvESV).toFixed(1);
        const lvEF = ((lvSV / lvEDV) * 100).toFixed(1);
        
        document.getElementById('lvSV').value = lvSV;
        document.getElementById('lvEFSimpson').value = lvEF;
        
        console.log('✅ Simpson параметры рассчитаны: SV=', lvSV, 'EF=', lvEF);
    } else {
        document.getElementById('lvSV').value = '';
        document.getElementById('lvEFSimpson').value = '';
    }
}

// ===== РАСЧЕТ ОТНОШЕНИЙ E/A И E/e' =====
// Функция расчета E/A (остается без изменений, вызывается из app.js)
function calculateEA() {
    const ve = parseFloat(document.getElementById('ve').value) || 0;
    const va = parseFloat(document.getElementById('va').value) || 0;
    
    if (ve > 0 && va > 0) {
        const e_a_ratio = (ve / va).toFixed(2);
        document.getElementById('e_a_ratio').value = e_a_ratio;
        console.log('✅ E/A рассчитано:', e_a_ratio);
    } else {
        document.getElementById('e_a_ratio').value = '';
    }
}

// Функция расчета E/e' (ОБНОВЛЕНА: использует среднее арифметическое e' septal и lateral)
function calculateEe() {
    const ve = parseFloat(document.getElementById('ve').value) || 0;
    const eSeptal = parseFloat(document.getElementById('e_septal').value) || 0;
    const eLateral = parseFloat(document.getElementById('e_lateral').value) || 0;
    
    // Преобразуем ve из м/с в см/с (умножаем на 100)
    const ve_cm_s = ve * 100;
    
    // Определяем знаменатель: среднее значение, если оба e' введены, иначе доступное значение
    let eAvg;
    if (eSeptal > 0 && eLateral > 0) {
        eAvg = (eSeptal + eLateral) / 2;
        console.log(`📊 Используется среднее e': ${eAvg.toFixed(1)} см/с (septal=${eSeptal}, lateral=${eLateral})`);
    } else if (eSeptal > 0) {
        eAvg = eSeptal;
        console.log(`📊 Используется e' septal: ${eAvg.toFixed(1)} см/с`);
    } else if (eLateral > 0) {
        eAvg = eLateral;
        console.log(`📊 Используется e' lateral: ${eAvg.toFixed(1)} см/с`);
    } else {
        eAvg = 0;
    }
    
    if (ve > 0 && eAvg > 0) {
        const e_e_ratio = (ve_cm_s / eAvg).toFixed(1);
        document.getElementById('e_e_ratio').value = e_e_ratio;
        console.log(`✅ E/e' рассчитано: ${e_e_ratio} (E=${ve_cm_s.toFixed(1)} см/с, среднее e'=${eAvg.toFixed(1)} см/с)`);
    } else {
        document.getElementById('e_e_ratio').value = '';
        if (ve > 0) {
            console.log('⏳ Для расчета E/e\' необходимо ввести e\' septal или e\' lateral');
        }
    }
}

// ===== РАСЧЕТ ГРАДИЕНТОВ (УРАВНЕНИЕ БЕРНУЛЛИ 4V²) =====
function calculateGradient(valveType) {
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
}

function calculateRegurgGradient(valveType) {
    if (valveType === 'tv') {
        const vmax = parseFloat(document.getElementById('tvRegurgVmax').value) || 0;
        if (vmax > 0) {
            const gradient = (4 * Math.pow(vmax, 2)).toFixed(1);
            document.getElementById('tvRegurgGradient').value = gradient;
            console.log('✅ Градиент регургитации ТК рассчитан:', gradient);
        } else {
            document.getElementById('tvRegurgGradient').value = '';
        }
    }
}

// ===== РАСЧЕТ УДАРНОГО ОБЪЕМА, СЕРДЕЧНОГО ВЫБРОСА И ИНДЕКСА =====
function calculateSV() {
    const diameter = parseFloat(document.getElementById('vtlzhDiameter').value) || 0;
    const vti = parseFloat(document.getElementById('vtlzhVTI').value) || 0;
    
    if (diameter > 0 && vti > 0) {
        const radius = diameter / 2;
        const area = Math.PI * Math.pow(radius, 2);
        const sv = (area * vti).toFixed(1);
        document.getElementById('svVTLZH').value = sv;
        console.log('✅ УО рассчитан:', sv, 'мл');
    } else {
        document.getElementById('svVTLZH').value = '';
    }
}

function calculateHemodynamics() {
    const sv = parseFloat(document.getElementById('svVTLZH').value) || 0;
    const hr = parseFloat(document.getElementById('hr').value) || 0;
    const bsa = parseFloat(document.getElementById('bsa').value) || 0;
    
    if (sv > 0 && hr > 0) {
        const co = (sv * hr / 1000).toFixed(2);
        document.getElementById('coVTLZH').value = co;
        
        if (bsa > 0) {
            const ci = (co / bsa).toFixed(2);
            document.getElementById('ciVTLZH').value = ci;
            console.log(`✅ Гемодинамика: СВ=${co} л/мин, СИ=${ci} л/мин/м²`);
        } else {
            document.getElementById('ciVTLZH').value = '';
            console.log(`✅ СВ рассчитан: ${co} л/мин (для СИ нужна ППТ)`);
        }
    } else {
        document.getElementById('coVTLZH').value = '';
        document.getElementById('ciVTLZH').value = '';
    }
}

// ===== РАСЧЕТ ДАВЛЕНИЯ В ЛЕГОЧНОЙ АРТЕРИИ =====
function calculatePAP() {
    const cvp = parseFloat(document.getElementById('cvpValue').value) || 0;
    const gradient = parseFloat(document.getElementById('tvRegurgGradient').value) || 0;
    
    if (gradient > 0) {
        const pap = (gradient + cvp).toFixed(1);
        document.getElementById('papValue').value = pap;
        console.log('✅ Давление в ЛА рассчитано:', pap, 'mmHg');
    } else {
        document.getElementById('papValue').value = '';
    }
}

// ===== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ =====
function updateWeight() {
    const weightG = parseFloat(document.getElementById('weight_g').value);
    if (weightG >= 1000) {
        const extraKg = Math.floor(weightG / 1000);
        const remainingG = weightG % 1000;
        
        const weightKgInput = document.getElementById('weight_kg');
        weightKgInput.value = (parseFloat(weightKgInput.value) || 0) + extraKg;
        document.getElementById('weight_g').value = remainingG;
    }
    calculateAnthropometry();
}

// ===== ЭКСПОРТ ВСЕХ ФУНКЦИЙ ДЛЯ ГЛОБАЛЬНОГО ДОСТУПА =====
// Эти функции будут доступны из других модулей (app.js, index.html)
window.calculateBSAHaycock = calculateBSAHaycock;
window.calculateAnthropometry = calculateAnthropometry;
window.calculateAllZScores = calculateAllZScores;
window.calculateLAIndex = calculateLAIndex;
window.calculateRAIndex = calculateRAIndex;
window.calculateRVFAC = calculateRVFAC;
window.calculateLVParameters = calculateLVParameters;
window.calculateSimpsonParameters = calculateSimpsonParameters;
window.calculateEA = calculateEA;
window.calculateEe = calculateEe;
window.calculateGradient = calculateGradient;
window.calculateRegurgGradient = calculateRegurgGradient;
window.calculateSV = calculateSV;
window.calculateHemodynamics = calculateHemodynamics;
window.calculatePAP = calculatePAP;
window.updateWeight = updateWeight;
window.updateZScoreElement = updateZScoreElement;
window.clearZScoreElement = clearZScoreElement;
window.clearAllZScoreFields = clearAllZScoreFields;

console.log('✅ calculations.js загружен! Все функции доступны:');
console.log('- calculateBSAHaycock:', typeof calculateBSAHaycock);
console.log('- calculateAnthropometry:', typeof calculateAnthropometry);
console.log('- calculateAllZScores:', typeof calculateAllZScores);
console.log('- calculateEe (обновленная):', typeof calculateEe);
