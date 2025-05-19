const { ipcRenderer } = require('electron');

const app = Vue.createApp({
    data() {
        return {
            currentSection: 'partners-list',
            partners: [],
            loading: false,
            error: null
        }
    },
    methods: {
        // Переключение между секциями
        changeSection(section) {
            this.currentSection = section;
            document.querySelectorAll('.section-content').forEach(el => {
                el.style.display = 'none';
            });
            document.getElementById(`${section}-section`).style.display = 'block';

            // Обновляем заголовок окна в зависимости от секции
             let windowTitle = 'Мастер пол - Система управления';
             if (section === 'partners-list') {
                 windowTitle += ' - Список партнеров';
             } else if (section === 'partner-form') {
                 const formTitle = document.getElementById('partner-form-title').textContent;
                 if (formTitle) windowTitle += ' - ' + formTitle;
             }
             ipcRenderer.invoke('set-window-title', windowTitle);
        },

        // Загрузка списка партнеров
        async loadPartners() {
            this.loading = true;
            this.error = null;
            try {
                this.partners = await ipcRenderer.invoke('get-partners');
                 // Сортируем партнеров по наименованию для удобства
                this.partners.sort((a, b) => a.name.localeCompare(b.name));
            } catch (error) {
                this.error = 'Ошибка при загрузке партнеров.';
                console.error('Error loading partners:', error);
                 ipcRenderer.invoke('show-error-box', { // Отправляем сообщение об ошибке в main процесс для показа диалога
                    title: 'Ошибка загрузки данных',
                    message: 'Не удалось загрузить список партнеров\n' + error.message
                });
            } finally {
                this.loading = false;
            }
        },

        // Открытие формы для добавления нового партнера
        showAddPartnerForm() {
            document.getElementById('partner-form-title').textContent = 'Добавление партнера';
            document.getElementById('partner-id').value = '';
            document.getElementById('partner-name').value = '';
            document.getElementById('partner-type').value = '';
            document.getElementById('partner-rating').value = '0';
            document.getElementById('partner-director').value = '';
            document.getElementById('partner-phone').value = '';
            document.getElementById('partner-email').value = '';
            document.getElementById('partner-legal-address').value = '';
            document.getElementById('partner-inn').value = '';
            this.changeSection('partner-form');
        },

        // Открытие формы для редактирования партнера
        showEditPartnerForm(partnerId) {
            document.getElementById('partner-form-title').textContent = 'Редактирование партнера';
            
            ipcRenderer.invoke('get-partner-by-id', partnerId)
                .then(partner => {
                    if (partner) {
                        document.getElementById('partner-id').value = partner.id;
                        document.getElementById('partner-name').value = partner.name;
                        document.getElementById('partner-type').value = partner.type;
                        document.getElementById('partner-rating').value = partner.rating || 0;
                        document.getElementById('partner-director').value = partner.director;
                        document.getElementById('partner-phone').value = partner.phone;
                        document.getElementById('partner-email').value = partner.email;
                        document.getElementById('partner-legal-address').value = partner.legal_address;
                        document.getElementById('partner-inn').value = partner.inn;
                        this.changeSection('partner-form');
                    } else {
                        alert('Партнер не найден');
                    }
                })
                .catch(error => {
                    console.error('Error loading partner:', error);
                    alert('Ошибка при загрузке данных партнера');
                });
        },

        // Сохранение данных партнера (добавление или редактирование)
        savePartner(event) {
            event.preventDefault();
            
            const partnerData = {
                name: document.getElementById('partner-name').value,
                type: document.getElementById('partner-type').value,
                rating: parseInt(document.getElementById('partner-rating').value) || 0,
                director: document.getElementById('partner-director').value,
                phone: document.getElementById('partner-phone').value,
                email: document.getElementById('partner-email').value,
                legal_address: document.getElementById('partner-legal-address').value,
                inn: document.getElementById('partner-inn').value
            };

            const partnerId = document.getElementById('partner-id').value;
            const method = partnerId ? 'update-partner' : 'add-partner';
            
            const data = partnerId ? { id: partnerId, partnerData } : partnerData;
            
            ipcRenderer.invoke(method, data)
                .then(() => {
                    this.loadPartners();
                    this.changeSection('partners-list');
                })
                .catch(error => {
                    console.error('Error saving partner:', error);
                    alert('Ошибка при сохранении партнера');
                });
        },

        // Удаление партнера
        async deletePartner(partnerId) {
             // Запрашиваем подтверждение у пользователя
             const confirmed = await ipcRenderer.invoke('show-question-box', {
                 title: 'Подтверждение удаления',
                 message: 'Вы уверены, что хотите удалить этого партнера? Это действие необратимо.',
                 buttons: ['Да', 'Нет']
             });

            if (confirmed === 0) { // 'Да' - первая кнопка
                this.loading = true;
                this.error = null;
                try {
                    await ipcRenderer.invoke('delete-partner', partnerId);
                    this.loadPartners(); // Обновляем список после удаления
                     ipcRenderer.invoke('show-info-box', {
                         title: 'Успех',
                         message: 'Партнер успешно удален'
                     });
                } catch (error) {
                    this.error = 'Ошибка при удалении партнера.';
                    console.error('Error deleting partner:', error);
                     ipcRenderer.invoke('show-error-box', {
                        title: 'Ошибка удаления данных',
                        message: 'Не удалось удалить партнера. Попробуйте снова\n' + error.message
                    });
                } finally {
                    this.loading = false;
                }
            }
        },

        // Расчет скидки
        calculateDiscount(totalSales) {
            if (totalSales < 10000) {
                return '0%';
            } else if (totalSales < 50000) {
                return '5%';
            } else if (totalSales < 300000) {
                return '10%';
            } else {
                return '15%';
            }
        }
    },
    mounted() {
        this.loadPartners();

        // Обработчики кнопок
        document.getElementById('add-partner-btn').addEventListener('click', () => {
            this.showAddPartnerForm();
        });

        document.getElementById('back-to-partners-list').addEventListener('click', () => {
            this.changeSection('partners-list');
        });

        document.getElementById('cancel-partner-form').addEventListener('click', () => {
            this.changeSection('partners-list');
        });

        // Изначально показываем секцию списка партнеров
        this.changeSection('partners-list');
    }
});

app.mount('#app'); 
