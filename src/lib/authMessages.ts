/**
 * Перевод типичных кодов/сообщений авторизации в понятный русский текст.
 */

export function mapAuthErrorMessage(raw: string): string {
  const m = (raw || '').trim().toLowerCase();

  if (!m) {
    return 'Не удалось выполнить операцию. Попробуйте ещё раз.';
  }

  if (
    m.includes('invalid login credentials') ||
    m.includes('invalid credentials') ||
    m.includes('invalid_grant')
  ) {
    return 'Неверный email или пароль. Проверьте данные или восстановите пароль.';
  }

  if (m.includes('email not confirmed')) {
    return 'Подтвердите email по ссылке из письма, затем войдите снова.';
  }

  if (
    m.includes('user already registered') ||
    m.includes('already registered') ||
    m.includes('already been registered')
  ) {
    return 'Аккаунт с таким email уже есть. Войдите или восстановите пароль.';
  }

  if (m.includes('password') && (m.includes('at least') || m.includes('least 6') || m.includes('too short'))) {
    return 'Пароль должен быть не короче 6 символов.';
  }

  if (m.includes('weak_password') || m.includes('password is known') || m.includes('pwned')) {
    return 'Пароль слишком простой. Выберите другой.';
  }

  if (m.includes('unable to validate email') || m.includes('invalid email')) {
    return 'Некорректный формат email.';
  }

  if (m.includes('rate limit') || m.includes('too many requests') || m.includes('email rate limit')) {
    return 'Слишком много попыток. Подождите несколько минут и попробуйте снова.';
  }

  if (m.includes('signups not allowed')) {
    return 'Регистрация временно недоступна. Свяжитесь с нами другим способом.';
  }

  if (m.includes('jwt') || m.includes('session')) {
    return 'Сессия устарела. Обновите страницу и войдите снова.';
  }

  if (m.includes('permission denied') || m.includes('does not exist') || m.includes('undefined function')) {
    return 'Сервис авторизации временно недоступен. Попробуйте позже.';
  }

  return raw;
}

/** Сообщение при сбоях сети / обрыве соединения (в т.ч. net::ERR_CONNECTION_RESET). */
export function describeNetworkishFailure(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (
    /fetch failed|failed to fetch|network|connection|reset|econnrefused|etimedout|timeout|abort|load failed|terminated|ssl|tls|socket/i.test(
      raw,
    )
  ) {
    return 'Не удалось связаться с сервером авторизации. Проверьте интернет, VPN и настройки блокировщиков.';
  }
  return 'Произошла непредвиденная ошибка. Попробуйте позже.';
}
