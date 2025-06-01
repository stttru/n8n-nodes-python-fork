# Инструкции по публикации n8n-nodes-python-raw

## Подготовка к публикации

### 1. Обновите package.json
Замените в `package.json`:
- `@your-npm-username` на ваш реальный npm username
- `your.email@example.com` на ваш email
- `Your Name` на ваше имя
- URLs репозитория на ваши реальные

### 2. Создайте репозиторий на GitHub
1. Создайте новый репозиторий на GitHub (например: `n8n-nodes-python-fork`)
2. Инициализируйте git и добавьте remote:
   ```bash
   git init
   git add .
   git commit -m "Initial fork with raw execution functionality"
   git branch -M main
   git remote add origin https://github.com/your-username/n8n-nodes-python-fork.git
   git push -u origin main
   ```

### 3. Проверьте сборку
```bash
npm run build
```

### 4. Протестируйте локально
```bash
npm test
```

## Публикация в npm

### 1. Войдите в npm
```bash
npm login
```

### 2. Проверьте что всё готово
```bash
npm run build
npm pack --dry-run
```

### 3. Опубликуйте
```bash
npm publish --access public
```

## После публикации

### Обновите README.md
Замените в README.md все `@your-npm-username/n8n-nodes-python-raw` на реальное имя пакета.

### Создайте releases
В GitHub создайте release с версией 1.0.0 и описанием изменений.

## Установка в n8n

### Через npm (глобальная установка n8n)
```bash
npm install -g @your-real-username/n8n-nodes-python-raw
```

### Через Docker
```dockerfile
FROM n8nio/n8n:latest
USER root
RUN cd /usr/local/lib/node_modules/n8n && npm install @your-real-username/n8n-nodes-python-raw
USER node
```

### Локальная установка
```bash
cd ~/.n8n/nodes
npm install @your-real-username/n8n-nodes-python-raw
```

## Проверка работы

1. Перезапустите n8n
2. В редакторе workflow найдите ноду "Python Function (Raw)"
3. Добавьте её в workflow
4. Настройте Python код и протестируйте

## Структура вывода ноды

Нода возвращает один элемент с данными:
```json
{
  "exitCode": 0,
  "stdout": "весь вывод из print()",
  "stderr": "ошибки и предупреждения", 
  "success": true,
  "error": null,
  "inputItemsCount": 3,
  "executedAt": "2024-01-01T12:00:00.000Z"
}
```

## Лицензионные требования

- ✅ Сохранен оригинальный LICENSE.md
- ✅ Создан NOTICE.md с описанием изменений  
- ✅ Указано авторство оригинала в package.json
- ✅ Соблюдены требования Apache 2.0 + Commons Clause

## Поддержка

- Создавайте issues в вашем GitHub репозитории
- Обновляйте документацию при добавлении новых функций
- Следите за совместимостью с новыми версиями n8n 