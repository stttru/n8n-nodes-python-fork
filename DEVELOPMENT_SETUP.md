# Настройка среды разработки n8n-nodes-python

## Требования

- Conda (установлена в `I:\ALL_PROG\conda`)
- Node.js и npm (глобально установлены)
- Git

## Быстрая настройка

### 1. Создание conda окружения

```bash
# Создать окружение из файла
I:\ALL_PROG\conda\Scripts\conda.exe env create -f environment.yml

# Или создать вручную
I:\ALL_PROG\conda\Scripts\conda.exe create -n n8n-python-dev python=3.10 pip -y
```

### 2. Активация окружения

```bash
# Инициализация conda для PowerShell (если не сделано)
I:\ALL_PROG\conda\Scripts\conda.exe init powershell

# Активация окружения
conda activate n8n-python-dev
```

### 3. Установка Python зависимостей

```bash
# Если используете готовое окружение
I:\ALL_PROG\conda\envs\n8n-python-dev\python.exe -m pip install fire

# Или если активировано окружение
pip install fire
```

### 4. Установка Node.js зависимостей

```bash
npm install
```

### 5. Сборка проекта

```bash
npm run build
```

## Тестирование

```bash
# Запуск тестов
npm test

# Тестирование Python setup
I:\ALL_PROG\conda\envs\n8n-python-dev\python.exe test_python_setup.py
```

## Публикация

1. Обновите `package.json`:
   - Измените `name` на уникальное имя
   - Обновите `version`
   - Измените `author` и `repository`

2. Соберите проект:
   ```bash
   npm run build
   ```

3. Опубликуйте в npm:
   ```bash
   npm publish
   ```

## Структура проекта

- `nodes/PythonFunction/` - основной узел
- `credentials/` - настройки переменных окружения
- `dist/` - собранные файлы (создается после `npm run build`)
- `environment.yml` - конфигурация conda окружения

## Полезные команды

```bash
# Разработка с автопересборкой
npm run watch

# Проверка кода
npm run lint

# Исправление ошибок линтера
npm run lintfix
``` 