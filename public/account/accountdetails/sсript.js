document.getElementById('edit-save-btn').addEventListener('click', function () {
    console.log('Кнопка нажата'); // Проверяем, вызывается ли обработчик события

    const button = this;
    const isEditMode = button.textContent.trim() === 'Edit';
    const editableFields = document.querySelectorAll('.editable');

    if (isEditMode) {
        console.log('Режим редактирования включен');
        editableFields.forEach(field => {
            field.setAttribute('contenteditable', 'true');
            field.classList.add('editing'); // Добавляем класс для отладки
            field.focus();
        });
        button.textContent = 'Save';
    } else {
        console.log('Сохранение изменений');
        editableFields.forEach(field => {
            field.setAttribute('contenteditable', 'false');
            field.classList.remove('editing'); 
        });
        button.textContent = 'Edit';
    }
});