/**
 * Очищает все поля формы
 */
function clearForm() {
    if (!confirm('Вы уверены, что хотите очистить все поля формы?\nВсе несохраненные данные будут потеряны.')) {
        return;
    }
    
    console.log('Очистка формы...');
    
    // Очищаем все текстовые поля, числовые поля, textarea
    document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(element => {
        if (!element.id.includes('Template') && !element.readOnly) {
            element.value = '';
        }
    });
    
    // Сбрасываем все select
    document.querySelectorAll('select').forEach(element => {
        element.selectedIndex = 0;
    });
    
    // Очищаем специальные поля
    document.getElementById('birthDate').value = '';
    document.getElementById('age').value = '';
    document.getElementById('gender').selectedIndex = 0;
    
    // Устанавливаем текущую дату в studyDate
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('studyDate').value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    // Очищаем динамический контент
    document.getElementById('institutionContent').innerHTML = '';
    document.getElementById('departmentContent').innerHTML = '';
    
    // Сбрасываем все Z-score поля
    document.querySelectorAll('.z-score-cell span').forEach(el => {
        el.textContent = '-';
        el.style.color = '#0066cc';
        el.style.fontWeight = 'normal';
    });
    
    // Очищаем расчетные поля
    document.getElementById('bmi').value = '';
    document.getElementById('bsa').value = '';
    document.getElementById('la_volume_index').value = '';
    document.getElementById('ra_volume_index').value = '';
    document.getElementById('fs').value = '';
    document.getElementById('lvMassIndex').value = '';
    document.getElementById('lvSV').value = '';
    document.getElementById('lvEFSimpson').value = '';
    document.getElementById('rvFAC').value = '';
    document.getElementById('e_a_ratio').value = '';
    document.getElementById('e_e_ratio').value = '';
    document.getElementById('mitralPeakGradient').value = '';
    document.getElementById('mitralAPeakGradient').value = '';
    document.getElementById('aorticPeakGradient').value = '';
    document.getElementById('tvPeakGradient').value = '';
    document.getElementById('tvRegurgGradient').value = '';
    document.getElementById('pvPeakGradient').value = '';
    document.getElementById('svVTLZH').value = '';
    document.getElementById('coVTLZH').value = '';
    document.getElementById('ciVTLZH').value = '';
    document.getElementById('papValue').value = '';
    
    // Сбрасываем чекбоксы
    document.getElementById('segmentsCheckbox').checked = false;
    document.getElementById('segmentsContent').style.display = 'none';
    document.getElementById('segmentsTemplateControls').style.display = 'none';
    
    document.getElementById('structuresNormal').checked = false;
    document.getElementById('simpsonMethodCheckbox').checked = false;
    document.getElementById('simpsonMethod').style.display = 'none';
    
    // Сбрасываем чекбоксы e'/a'
    document.getElementById('e_septal_checkbox').checked = false;
    document.getElementById('e_septal_selector').style.display = 'none';
    document.getElementById('e_septal_sign_display').textContent = '?';
    document.getElementById('e_lateral_checkbox').checked = false;
    document.getElementById('e_lateral_selector').style.display = 'none';
    document.getElementById('e_lateral_sign_display').textContent = '?';
    
    console.log('✅ Форма очищена');
    alert('Форма очищена. Все поля готовы для ввода новых данных.');
}

// Временная заглушка для других функций
window.showSavedProtocols = function() {
    console.log('Функция сохранения протоколов будет реализована в следующей версии');
    alert('Система сохранения протоколов будет реализована в следующей версии приложения.');
};

window.saveForm = function() {
    console.log('Функция сохранения формы будет реализована в следующей версии');
    alert('Сохранение формы будет реализовано в следующей версии приложения.');
};

window.exportForm = function() {
    console.log('Функция экспорта будет реализована в следующей версии');
    alert('Экспорт данных будет реализован в следующей версии приложения.');
};

window.importForm = function() {
    console.log('Функция импорта будет реализована в следующей версии');
    alert('Импорт данных будет реализован в следующей версии приложения.');
};