# Убийца Скроллинга — GitHub Pages

Игра: https://sludnikov.github.io/scroll-killer-game/. Прогресс хранится на iPhone. Кнопка «Скачать копию» создаёт файл для ручного резервирования в приватном GitHub.

## Как работает iPhone владельца

1. Новая команда `ScrollKillerGitHub` считывает Экранное время и отправляет строки прямо в GitHub Actions через GitHub API. В ней нет адреса ChatGPT Sites.
2. Workflow `.github/workflows/iphone-sync.yml` обрабатывает отчёт, сохраняет только зашифрованный файл в `feeds/` и публикует обновлённый сайт.
3. Игра читает файл с GitHub Pages. Первый отчёт после переноса задаёт новую исходную точку, сохраняя уже накопленные минуты.

Для установки команды нужен fine-grained personal access token GitHub: только репозиторий `Sludnikov/scroll-killer-game`, разрешение **Actions: Read and write**. Команда спрашивает токен при установке; опубликованный `.shortcut` его не содержит. Старую команду `ScrollKiller` и её автоматизацию надо заменить: в ней записан прежний адрес.

GitHub Actions и Pages публикуют отчёт не мгновенно. После завершения команды дождитесь окончания workflow `Receive iPhone report`, затем нажмите «Проверить полученный отчёт» в игре. При ошибке workflow откройте его журнал на вкладке Actions. GitHub Pages не принимает запросы как сервер: приём обеспечивает GitHub API и Actions.

## Друзья: собственная GitHub-копия

Друзья могут играть по общей ссылке с локальным прогрессом. Для автоматического учёта iPhone через GitHub им нужна своя копия проекта. Это отделяет их отчёты и не раскрывает токен владельца.

1. Войдите в свой GitHub и сделайте **Fork** репозитория `Sludnikov/scroll-killer-game` в свой аккаунт. Оставьте имя `scroll-killer-game` и ветку `main`.
2. В своём Fork откройте **Settings → Pages → Build and deployment → Source: GitHub Actions**. Если GitHub предлагает включить Actions в Fork, включите.
3. Откройте свою страницу Pages: `https://USERNAME.github.io/scroll-killer-game/`. Если хотите играть с иконки, сначала добавьте страницу на экран Домой и откройте именно иконку. В этой версии игры откройте «Настройки → Я новый игрок — настроить свой iPhone» и скопируйте личный код. Safari и иконка могут хранить разные локальные коды.
4. В настройках своего Fork откройте **Settings → Secrets and variables → Actions → New repository secret**. Имя: `OWNER_GAME_KEY`. Значение: личный код из игры. Секрет не публикуйте.
5. Создайте [fine-grained GitHub token](https://github.com/settings/personal-access-tokens/new?name=ScrollKiller-iPhone&expires_in=366&actions=write): **Only select repositories** → свой Fork; **Actions: Read and write**. Скопируйте токен, никому его не присылайте.
6. Установите [ScrollKillerGitHubFriends](https://sludnikov.github.io/scroll-killer-game/assets/ScrollKillerGitHubFriends.shortcut). При установке укажите адрес Fork `USERNAME/scroll-killer-game` и свой токен.
7. Один раз запустите команду. На вкладке **Actions** своего Fork дождитесь зелёного запуска **Receive iPhone report**. Обновите игру на своей странице Pages. Первый отчёт задаёт исходную точку; прежние минуты не списываются.
8. В «Командах» создайте автоматизацию **Приложение → Закрыто** для Instagram, TikTok, YouTube и VK, действие **Запустить ScrollKillerGitHubFriends**.

Для каждого друга нужна своя страница Pages. Общий токен в публичной команде не используется.

## Резервная копия

«Настройки» → «Скачать копию» сохраняет JSON-файл прогресса. Храните его в приватном репозитории или в личных «Файлах». Для восстановления используйте «Восстановить из файла».
