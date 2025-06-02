# Output File Processing - Руководство по использованию

## 📋 Обзор

Output File Processing - это функциональность n8n Python Function (Raw) node, которая автоматически обнаруживает и обрабатывает файлы, созданные Python скриптом, преобразуя их в binary данные n8n для дальнейшего использования в workflow.

## ✨ Возможности

- 🔍 **Автоматическое обнаружение** файлов в выходной директории
- 📁 **Поддержка множественных файлов** любых типов
- 🔄 **Автоматическое преобразование** в n8n binary data
- 🧹 **Автоматическая очистка** временных файлов
- 📊 **Метаданные файлов** (размер, MIME-тип, расширение)
- ⚙️ **Гибкие настройки** размера и обработки

## 🚀 Быстрый старт

### 1. Включение функциональности

В настройках n8n Python Function (Raw) node:

1. Откройте секцию **"Output File Processing"**
2. Включите **"Enable Output File Processing"**
3. Настройте параметры по необходимости

### 2. Базовый пример

```python
import os
import json

# Выходная директория автоматически доступна как переменная outputDir
# (когда функциональность будет полностью интегрирована)

# Пока используйте временную директорию
import tempfile
output_dir = tempfile.mkdtemp()

# Создание текстового файла
with open(os.path.join(output_dir, "result.txt"), "w") as f:
    f.write("Результат обработки данных")

# Создание JSON файла
data = {"status": "success", "count": 42}
with open(os.path.join(output_dir, "data.json"), "w") as f:
    json.dump(data, f)

print(f"Файлы созданы в: {output_dir}")
```

## ⚙️ Настройки

### Основные параметры

| Параметр | Описание | По умолчанию |
|----------|----------|--------------|
| **Enable Output File Processing** | Включает/выключает функциональность | `false` |
| **Max Output File Size (MB)** | Максимальный размер файла для обработки | `100` |
| **Auto-cleanup Output Directory** | Автоматическое удаление файлов после обработки | `true` |
| **Include File Metadata in Output** | Включение метаданных файлов в результат | `true` |

### Пример конфигурации

```json
{
  "outputFileProcessing": {
    "enabled": true,
    "maxOutputFileSize": 50,
    "autoCleanupOutput": true,
    "includeOutputMetadata": true
  }
}
```

## 📝 Примеры использования

### Создание отчета в Excel

```python
import pandas as pd
import os

# Создаем DataFrame
data = {
    'Name': ['Alice', 'Bob', 'Charlie'],
    'Age': [25, 30, 35],
    'City': ['New York', 'London', 'Tokyo']
}
df = pd.DataFrame(data)

# Сохраняем в Excel файл
output_file = os.path.join(outputDir, "report.xlsx")
df.to_excel(output_file, index=False)

print(f"Excel отчет создан: {output_file}")
```

### Генерация изображения

```python
import matplotlib.pyplot as plt
import os

# Создаем график
plt.figure(figsize=(10, 6))
plt.plot([1, 2, 3, 4], [1, 4, 2, 3])
plt.title('Sample Chart')
plt.xlabel('X axis')
plt.ylabel('Y axis')

# Сохраняем изображение
chart_file = os.path.join(outputDir, "chart.png")
plt.savefig(chart_file, dpi=300, bbox_inches='tight')
plt.close()

print(f"График сохранен: {chart_file}")
```

### Создание архива

```python
import zipfile
import os
import json

# Создаем несколько файлов
files_to_archive = []

# Текстовый файл
txt_file = os.path.join(outputDir, "readme.txt")
with open(txt_file, "w") as f:
    f.write("Это архив с результатами обработки")
files_to_archive.append(txt_file)

# JSON файл
json_file = os.path.join(outputDir, "metadata.json")
with open(json_file, "w") as f:
    json.dump({"created": "2024-01-15", "version": "1.0"}, f)
files_to_archive.append(json_file)

# Создаем ZIP архив
zip_file = os.path.join(outputDir, "results.zip")
with zipfile.ZipFile(zip_file, 'w') as zipf:
    for file_path in files_to_archive:
        zipf.write(file_path, os.path.basename(file_path))

print(f"Архив создан: {zip_file}")
```

## 📊 Структура результата

Когда Output File Processing включен, результат выполнения будет содержать:

### JSON результат
```json
{
  "exitCode": 0,
  "stdout": "Файлы созданы успешно",
  "stderr": "",
  "success": true,
  "outputFiles": [
    {
      "filename": "result.txt",
      "size": 1024,
      "mimetype": "text/plain",
      "extension": "txt",
      "binaryKey": "output_result.txt"
    }
  ],
  "outputFilesCount": 1
}
```

### Binary данные
```json
{
  "output_result.txt": {
    "data": "base64_encoded_content",
    "mimeType": "text/plain",
    "fileExtension": "txt",
    "fileName": "result.txt"
  }
}
```

## 🔧 Поддерживаемые типы файлов

| Расширение | MIME-тип | Описание |
|------------|-----------|----------|
| `.txt` | `text/plain` | Текстовые файлы |
| `.json` | `application/json` | JSON данные |
| `.csv` | `text/csv` | CSV таблицы |
| `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Excel файлы |
| `.pdf` | `application/pdf` | PDF документы |
| `.png` | `image/png` | PNG изображения |
| `.jpg` | `image/jpeg` | JPEG изображения |
| `.zip` | `application/zip` | ZIP архивы |
| Другие | `application/octet-stream` | Бинарные файлы |

## ⚠️ Ограничения и рекомендации

### Ограничения
- Максимальный размер файла: 1000 MB (настраивается)
- Файлы должны быть созданы в выходной директории
- Поддерживаются только обычные файлы (не директории)

### Рекомендации
- Используйте осмысленные имена файлов
- Проверяйте размер создаваемых файлов
- Используйте соответствующие расширения файлов
- Обрабатывайте ошибки при создании файлов

### Пример с обработкой ошибок
```python
import os
import json

try:
    # Создание файла с проверкой
    output_file = os.path.join(outputDir, "safe_output.json")
    
    data = {"result": "success", "timestamp": "2024-01-15"}
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Проверяем размер файла
    file_size = os.path.getsize(output_file)
    if file_size > 100 * 1024 * 1024:  # 100 MB
        print(f"Предупреждение: файл большой ({file_size} байт)")
    
    print(f"Файл успешно создан: {output_file}")
    
except Exception as e:
    print(f"Ошибка при создании файла: {e}")
```

## 🔄 Интеграция с workflow

### Использование созданных файлов в следующих узлах

1. **HTTP Request** - отправка файлов по API
2. **Email** - прикрепление файлов к письму  
3. **FTP** - загрузка файлов на сервер
4. **Google Drive** - сохранение в облако
5. **Webhook** - передача файлов через webhook

### Пример workflow
```
[Trigger] → [Python Function] → [Email] → [End]
                ↓
         (создает Excel отчет)
                ↓
         (отправляет по email)
```

## 🐛 Отладка

### Проверка создания файлов
```python
import os

# Проверяем существование выходной директории
if 'outputDir' in globals():
    print(f"Выходная директория: {outputDir}")
    print(f"Директория существует: {os.path.exists(outputDir)}")
else:
    print("Переменная outputDir не найдена")

# Создаем тестовый файл
test_file = os.path.join(outputDir, "test.txt")
with open(test_file, "w") as f:
    f.write("Тестовый файл")

# Проверяем созданные файлы
files = os.listdir(outputDir)
print(f"Файлы в выходной директории: {files}")
```

### Логирование
```python
import logging
import os

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создание файла с логированием
try:
    output_file = os.path.join(outputDir, "data.txt")
    logger.info(f"Создание файла: {output_file}")
    
    with open(output_file, "w") as f:
        f.write("Данные для обработки")
    
    logger.info(f"Файл создан успешно, размер: {os.path.getsize(output_file)} байт")
    
except Exception as e:
    logger.error(f"Ошибка создания файла: {e}")
```

## 📚 Дополнительные ресурсы

- [OUTPUT_FILE_PROCESSING_GUIDE.md](OUTPUT_FILE_PROCESSING_GUIDE.md) - Техническая документация
- [CHANGELOG.md](CHANGELOG.md) - История изменений
- [README.md](README.md) - Общая документация проекта

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте настройки Output File Processing
2. Убедитесь что файлы создаются в правильной директории
3. Проверьте размер создаваемых файлов
4. Посмотрите логи выполнения Python скрипта
5. Создайте issue в репозитории проекта

---

**Версия:** 1.11.0  
**Дата обновления:** 2024-01-15 