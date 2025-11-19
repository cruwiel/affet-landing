import { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import './App.css';

type LinkResponse = {
  nickname: string;
  language: LanguageCode;
};

type LanguageCode = 'tr' | 'en' | 'es' | 'fr' | 'ru';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(
  /\/$/,
  '',
);

function App() {
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token'), []);
  const [status, setStatus] = useState<'loading' | 'missing' | 'error' | 'ready'>('loading');
  const [linkData, setLinkData] = useState<LinkResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [yesScale, setYesScale] = useState(1);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [noScale, setNoScale] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [noHasMoved, setNoHasMoved] = useState(false);
  const [noDirection, setNoDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (!token) {
      setStatus('missing');
      setErrorMessage('Token not found 🤷‍♂️');
      return;
    }

    const controller = new AbortController();

    async function fetchLink() {
      try {
        setStatus('loading');
        const res = await fetch(`${API_BASE_URL}/api/links/${token}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Link expired or missing' : 'Server error');
        }

        const data = (await res.json()) as LinkResponse;
        setLinkData(data);
        setStatus('ready');
      } catch (error) {
        if (controller.signal.aborted) return;
        setStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Something went wrong fetching the link',
        );
      }
    }

    fetchLink();

    return () => controller.abort();
  }, [token]);

  const pack = linkData ? languagePacks[linkData.language] ?? languagePacks.en : null;
  const prompt = linkData && pack ? pack.promptTemplate.replace('{name}', linkData.nickname) : '';

  const moveNoButton = () => {
    setNoHasMoved(true);
    const randomDirection = (Math.random() > 0.5 ? 1 : -1) as 1 | -1;
    const nextDirection =
      randomDirection === noDirection ? ((noDirection * -1) as 1 | -1) : randomDirection;
    setNoDirection(nextDirection);
    const newX = nextDirection * (70 + Math.random() * 80);
    const newY = (Math.random() - 0.5) * 60;
    setNoOffset({ x: newX, y: newY });
    setNoScale((prev) => Math.max(0.2, prev - 0.08));
    setYesScale((prev) => Math.min(prev + 0.12, 2.6));
  };

  const handleYesHover = () => {
    setYesScale((prev) => Math.min(prev + 0.2, 2.6));
  };

  const handleNoPointerEnter = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse') {
      moveNoButton();
    }
  };

  const handleNoPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    moveNoButton();
  };

  const handleYesPointerEnter = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse') {
      handleYesHover();
    }
  };

  const handleYesPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    handleYesClick();
  };

  const handleYesClick = () => {
    handleYesHover();
    if (pack && linkData) {
      const message = pack.successTemplate.replace('{name}', linkData.nickname);
      setSuccessMessage(message);
    }
    confetti({
      particleCount: 160,
      spread: 75,
      origin: { y: 0.6 },
    });
    confetti({
      particleCount: 120,
      spread: 55,
      origin: { x: 0.2, y: 0.6 },
    });
    confetti({
      particleCount: 120,
      spread: 55,
      origin: { x: 0.8, y: 0.6 },
    });
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="status-card">
            <div className="spinner" />
            <p>Loading your link...</p>
          </div>
        );
      case 'missing':
      case 'error':
        return (
          <div className="status-card">
            <p>{errorMessage}</p>
          </div>
        );
      case 'ready':
        if (!pack || !prompt) return null;
  return (
    <>
            <div className="prompt-card">
              <p className="prompt-title">{pack.promptTitle}</p>
              <h1>{prompt}</h1>
      </div>
            <p className="subline">{pack.subline}</p>
            <div className="buttons-area">
              <button
                className="yes-button"
                style={{ transform: `scale(${yesScale})` }}
                onPointerEnter={handleYesPointerEnter}
                onPointerDown={handleYesPointerDown}
                onFocus={handleYesHover}
              >
                {pack.yesLabel}
              </button>
              <button
                className={`no-button ${noHasMoved ? 'no-button--free' : ''}`}
                style={
                  noHasMoved
                    ? {
                        transform: `translate(-50%, -50%) translate(${noOffset.x}px, ${noOffset.y}px) scale(${noScale})`,
                      }
                    : undefined
                }
                onPointerEnter={handleNoPointerEnter}
                onPointerDown={handleNoPointerDown}
                onFocus={moveNoButton}
              >
                {pack.noLabel}
              </button>
      </div>
          </>
        );
    }
  };

  return (
    <div className="page">
      <header>
        <span role="img" aria-label="love">
          💕
        </span>
        <span>Affet</span>
      </header>
      {renderContent()}
      {successMessage && (
        <div className="success-overlay">
          <div className="success-card">
            <p>{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)}>{pack?.okLabel ?? 'Close'}</button>
          </div>
        </div>
      )}
      <footer>
        <p>{pack?.footer ?? 'Made with love and a little desperation 💔✨'}</p>
      </footer>
    </div>
  );
}

type LanguagePack = {
  label: string;
  promptTemplate: string;
  promptTitle: string;
  subline: string;
  yesLabel: string;
  noLabel: string;
  footer: string;
  successTemplate: string;
  okLabel: string;
};

const languagePacks: Record<LanguageCode, LanguagePack> = {
  tr: {
    label: 'Türkçe',
    promptTemplate: 'Beni affeder misin {name}?',
    promptTitle: 'Ona söylemek istediğin şey',
    subline: 'Evet büyür, Hayır kaçar. Kaderin bu 😅',
    yesLabel: 'Evet 😍',
    noLabel: 'Hayır 🙈',
    footer: 'Link 12 saat sonra kaybolur. Çabuk cevapla!',
    successTemplate: 'Beni affedeceğini biliyordum {name}, teşekkürler! 💖',
    okLabel: 'Tamam',
  },
  en: {
    label: 'English',
    promptTemplate: 'Will you forgive me, {name}?',
    promptTitle: 'What you want them to see',
    subline: 'Yes button grows. No button flees. Choose wisely 😅',
    yesLabel: 'Yes 😍',
    noLabel: 'No 🙈',
    footer: 'Link vanishes in 12 hours. Decide fast!',
    successTemplate: 'I knew you’d forgive me, {name}! Thank you 💖',
    okLabel: 'Got it',
  },
  es: {
    label: 'Español',
    promptTemplate: '¿Me perdonas, {name}?',
    promptTitle: 'Lo que quieres que vea',
    subline: 'El sí crece, el no huye. Está escrito 😅',
    yesLabel: 'Sí 😍',
    noLabel: 'No 🙈',
    footer: 'El enlace desaparece en 12 horas. ¡Corre!',
    successTemplate: 'Sabía que me perdonarías, {name}. ¡Gracias! 💖',
    okLabel: 'Entendido',
  },
  fr: {
    label: 'Français',
    promptTemplate: 'Tu me pardonnes, {name} ?',
    promptTitle: 'Ce que tu veux lui dire',
    subline: 'Oui grossit, Non s’enfuit. Destin scellé 😅',
    yesLabel: 'Oui 😍',
    noLabel: 'Non 🙈',
    footer: 'Lien valable 12h seulement. Réponds vite !',
    successTemplate: 'Je savais que tu me pardonnerais, {name} ! Merci 💖',
    okLabel: "D'accord",
  },
  ru: {
    label: 'Русский',
    promptTemplate: 'Простишь меня, {name}?',
    promptTitle: 'Что ты хочешь сказать',
    subline: '«Да» растёт, «Нет» убегает. Судьба 😅',
    yesLabel: 'Да 😍',
    noLabel: 'Нет 🙈',
    footer: 'Ссылка исчезнет через 12 часов. Поторопись!',
    successTemplate: 'Я знал, что ты меня простишь, {name}! Спасибо 💖',
    okLabel: 'Хорошо',
  },
};

export default App;
