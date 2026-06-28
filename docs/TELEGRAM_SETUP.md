# Підключення Telegram-бота до Life Tracker

Цей посібник пояснює, як за 5 хвилин підключити Telegram-бота, щоб логувати дані і отримувати нагадування прямо в телефон.

---

## Що дає Telegram-бот

| Можливість | Команда | Приклад |
|---|---|---|
| Залогувати сон | `/sleep` | `/sleep 23:30 07:15 4` |
| Залогувати енергію | `/energy` | `/energy 8` |
| Залогувати день | `/score` | `/score 80 3 2` |
| Підсумок сьогодні | `/today` | `/today` |
| Підсумок тижня | `/week` | `/week` |
| Нагадування | (авто) | Щодня о 9:00, 13:30, 18:00, 22:00 |

---

## Крок 1 — Створити бота

1. Відкрий Telegram і знайди бот **@BotFather**
2. Надішли команду `/newbot`
3. BotFather запитає **назву бота** (відображається в чаті) — наприклад: `My Life Tracker`
4. Потім запитає **username** (технічне ім'я) — має закінчуватись на `bot`, наприклад: `mylifetracker_bot`
5. BotFather відповість повідомленням із **токеном**:

```
Done! Congratulations on your new bot.
Use this token to access the HTTP API:
123456789:AAGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Keep your token secure and store it safely
```

**Скопіюй цей токен** — він знадобиться в наступних кроках.

---

## Крок 2 — Дізнатись свій Chat ID

1. Знайди в Telegram бот **@userinfobot** (або **@getidsbot**)
2. Натисни `/start`
3. Бот відповість із твоїм **ID**, наприклад: `123456789`

Альтернативний спосіб:
1. Напиши будь-яке повідомлення своєму новому боту
2. Відкрий в браузері URL (підставивши свій токен):
   ```
   https://api.telegram.org/bot<ТОКЕН>/getUpdates
   ```
3. В JSON-відповіді знайди поле `"id"` всередині `"chat"` — це і є твій Chat ID

---

## Крок 3 — Прописати налаштування в .env

Відкрий файл `apps/api/.env` і заповни три рядки:

```env
TELEGRAM_BOT_TOKEN=123456789:AAGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_WEBHOOK_URL=https://ТВІ_ДОМЕН/telegram/webhook
TELEGRAM_CHAT_ID=123456789
```

| Змінна | Що вписати |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен від BotFather (крок 1) |
| `TELEGRAM_WEBHOOK_URL` | URL твого сервера + `/telegram/webhook` |
| `TELEGRAM_CHAT_ID` | Твій персональний Chat ID (крок 2) |

> **Якщо запускаєш локально** (без публічного домену) — дивись Крок 4 нижче про ngrok.

---

## Крок 4 — Зробити сервер доступним для Telegram

Telegram надсилає повідомлення на вказаний webhook URL. Цей URL **має бути публічним** (Telegram не може достукатись до `localhost`).

### Варіант А — ngrok (для тестування локально)

1. Завантаж [ngrok](https://ngrok.com/download) і зареєструйся (безкоштовно)
2. Запусти тунель на порт API (3000):
   ```bash
   ngrok http 3000
   ```
3. ngrok видасть публічний URL, наприклад:
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:3000
   ```
4. Використай його як `TELEGRAM_WEBHOOK_URL`:
   ```env
   TELEGRAM_WEBHOOK_URL=https://abc123.ngrok.io/telegram/webhook
   ```

> ⚠️ Безкоштовний ngrok видає новий URL при кожному запуску — доведеться оновлювати `.env` і реєструвати webhook заново.

### Варіант Б — Хостинг на сервері

Якщо додаток розгорнутий на VPS / хмарному хостингу — просто вкажи свій домен:
```env
TELEGRAM_WEBHOOK_URL=https://lifetracker.example.com/telegram/webhook
```

---

## Крок 5 — Зареєструвати webhook

Після того як заповнив `.env` і сервер доступний публічно, потрібно сказати Telegram куди надсилати повідомлення.

Відкрий в браузері (або виконай через curl / PowerShell):

```
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<TELEGRAM_WEBHOOK_URL>
```

**Приклад:**
```
https://api.telegram.org/bot123456789:AAGxxx/setWebhook?url=https://abc123.ngrok.io/telegram/webhook
```

Telegram відповість:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

Або через PowerShell:
```powershell
Invoke-WebRequest -Uri "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<WEBHOOK_URL>" -Method Get
```

---

## Крок 6 — Перезапустити API

Після змін у `.env` необхідно перезапустити сервер, щоб нові змінні підхопились:

```bash
# В терміналі де запущений API:
# Зупини (Ctrl+C) і запусти знову:
cd C:\Users\ochap\Projects\life-tracker
npm run dev:api
```

---

## Крок 7 — Перевірити що все працює

Відкрий свого бота в Telegram і надішли:
```
/start
```

Маєш отримати відповідь:
```
Life Tracker Bot Commands:

/sleep 00:30 07:40 4 — Log sleep
/energy 8 — Log energy (1-10)
/score 90 3 2 — Log daily (plan% focus energy)
/today — Today's summary
/week — This week's averages
```

---

## Як користуватись ботом

### `/sleep` — Залогувати сон

```
/sleep БЕД_ЧАС ПРОКИДАННЯ ЯКІСТЬ
```

- `БЕД_ЧАС` — коли ліг спати (формат `ГГ:ХХ`)
- `ПРОКИДАННЯ` — коли прокинувся (формат `ГГ:ХХ`)
- `ЯКІСТЬ` — від 1 (жахливо) до 5 (відмінно)

**Приклади:**
```
/sleep 23:30 07:15 4     ← ліг о 23:30, прокинувся о 7:15, якість 4/5
/sleep 00:00 08:00 3     ← ліг опівночі, спав 8 годин, якість 3/5
/sleep 01:30 06:45 2     ← ліг пізно, мало спав, якість 2/5
```

Бот відповість:
```
Sleep logged! Duration: 7h 45m, Quality: 4/5
```

---

### `/energy` — Залогувати енергію

```
/energy РІВЕНЬ
```

- `РІВЕНЬ` — від 1 (виснажений) до 10 (пік)

**Приклади:**
```
/energy 8    ← після ранкової кави
/energy 4    ← після обіду (провал)
/energy 7    ← ввечері
```

Шкала рівнів:
| 1–3 | 4–5 | 6–7 | 8–10 |
|---|---|---|---|
| Виснаженість | Нижче норми | Добре | Відмінно |

---

### `/score` — Залогувати день

```
/score ПЛАН_ВІДСОТОК ФОКУС ЕНЕРГІЯ
```

- `ПЛАН_ВІДСОТОК` — скільки % плану виконав (0–100)
- `ФОКУС` — рівень концентрації: `1` (низький), `2` (середній), `3` (високий)
- `ЕНЕРГІЯ` — запас сил до кінця дня: `1` (вичерпаний), `2` (ще є сили)

**Приклади:**
```
/score 90 3 2    ← виконав 90% плану, фокус відмінний, енергія є
/score 60 2 1    ← виконав 60%, середній фокус, втомився
/score 100 3 1   ← все виконав, але вже без сил
```

Бот відповість:
```
Day scored: 8.5/10
Plan: 90% | Focus: 3/3 | Energy: 2/2
```

---

### `/today` — Підсумок сьогодні

Показує все що залоговано за сьогодні:
```
Today's Summary:
Score: 7.5/10 (Plan: 80%)
Sleep: 7h 30m (Quality: 4/5)
Energy: 7/10
```

---

### `/week` — Підсумок тижня

Середні показники за поточний тиждень:
```
This Week's Averages:
Score: 6.8/10
Plan completion: 75%
Sleep: 7h 15m
Sleep quality: 3.5/5
Days logged: 5
```

---

## Автоматичні нагадування

Бот надсилає нагадування за розкладом (UTC час):

| Час (UTC) | Час (UTC+3) | Нагадування |
|---|---|---|
| 09:00 | 12:00 | Залогувати сон |
| 13:30 | 16:30 | Перевірка енергії (середина дня) |
| 18:00 | 21:00 | Перевірка енергії (вечір) |
| 22:00 | 01:00 | Залогувати підсумок дня |

> Якщо хочеш змінити час нагадувань — відредагуй `apps/api/src/telegram/telegram-scheduler.service.ts`, знайди декоратори `@Cron(...)` і поміняй значення.

**Формат cron:** `секунди хвилини години * * *`

Наприклад, щоб змінити ранкове нагадування на 10:00 замість 09:00 (UTC):
```typescript
@Cron('0 0 10 * * *')   // ← 10:00 UTC = 13:00 UTC+3
async morningReminder() { ... }
```

---

## Перевірка роботи webhook

Щоб перевірити що webhook зареєстрований правильно:

```
https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

Відповідь має виглядати так:
```json
{
  "ok": true,
  "result": {
    "url": "https://abc123.ngrok.io/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "last_error_date": ...,
    "last_error_message": "..."
  }
}
```

Якщо `url` порожній — webhook не зареєстровано (повтори Крок 5).

Щоб **видалити** webhook (наприклад при зміні URL):
```
https://api.telegram.org/bot<TOKEN>/deleteWebhook
```

---

## Часті проблеми

### Бот не відповідає

1. Перевір що `TELEGRAM_BOT_TOKEN` правильний
2. Перевір що webhook зареєстровано (`getWebhookInfo`)
3. Перевір що API запущений і доступний
4. Перевір логи API: `npm run dev:api` — шукай рядки з `TelegramController`

### `Unauthorized chat ID` в логах

Бот отримав повідомлення від іншого чату. Перевір що `TELEGRAM_CHAT_ID` — це твій особистий ID, а не ID групи чи канала.

### ngrok URL змінився

При перезапуску ngrok видає новий URL. Потрібно:
1. Оновити `.env`: `TELEGRAM_WEBHOOK_URL=https://НОВИЙ_URL/telegram/webhook`
2. Перезапустити API: `npm run dev:api`
3. Зареєструвати новий webhook (Крок 5)

### Нагадування не приходять

1. Перевір що `TELEGRAM_CHAT_ID` заповнений в `.env`
2. Час нагадувань у коді вказано в **UTC** — врахуй різницю з твоїм часовим поясом
3. Переконайся що сервер API не зупинявся в запланований час

---

## Підсумок — швидкий старт

```
1. BotFather → /newbot → скопіювати токен
2. @userinfobot → скопіювати свій Chat ID
3. Заповнити apps/api/.env
4. Запустити ngrok http 3000
5. Зареєструвати webhook (вставити URL в браузер)
6. Перезапустити npm run dev:api
7. Написати /start боту
```
