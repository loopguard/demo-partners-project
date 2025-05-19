.PHONY: install start dev build clean build-mac build-linux import-data

# Установка зависимостей
install:
	npm install

# Запуск скрипта импорта данных в базу данных
import-data:
	node src/database/import_data.js 

# Запуск приложения в production режиме
start:
	npm start

# Запуск приложения в режиме разработки
dev:
	NODE_ENV=development npm start

# Сборка приложения
build:
	npm run build

# Сборка приложения для macOS
build-mac:
	npm run build:mac

# Сборка приложения для Linux
build-linux:
	npm run build:linux

# Очистка собранных файлов
clean:
	rm -rf dist/
	rm -rf node_modules/

# Запуск линтера
lint:
	npm run lint

# Запуск тестов
test:
	npm test

# Помощь
help:
	@echo "Доступные команды:"
	@echo "  make install     - Установка зависимостей"
	@echo "  make start       - Запуск приложения в production режиме"
	@echo "  make dev         - Запуск приложения в режиме разработки"
	@echo "  make build       - Сборка приложения"
	@echo "  make build-mac   - Сборка приложения для macOS"
	@echo "  make build-linux - Сборка приложения для Linux"
	@echo "  make clean       - Очистка собранных файлов"
	@echo "  make lint        - Запуск линтера"
	@echo "  make test        - Запуск тестов"
	@echo "  make import-data - Запуск скрипта импорта данных в базу данных"
