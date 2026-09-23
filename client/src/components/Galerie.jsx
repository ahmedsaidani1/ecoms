import { useState } from 'react';
import { urlMedia } from '../api.js';

export default function Galerie({ medias = [], nom }) {
  const [index, setIndex] = useState(0);
  const actif = medias[index];

  if (!medias.length) {
    return (
      <div className="galerie">
        <div className="galerie-principale">
          <div className="sans-image">
            <img src="/logo-icone.png" alt="" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="galerie">
      <div className="galerie-principale">
        {actif.type === 'video' ? (
          <video key={actif.url} src={urlMedia(actif.url)} controls playsInline />
        ) : (
          <img key={actif.url} src={urlMedia(actif.url)} alt={nom} />
        )}
      </div>

      {medias.length > 1 && (
        <div className="galerie-vignettes">
          {medias.map((m, i) => (
            <button
              type="button"
              key={m.url + i}
              className={`vignette ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Média ${i + 1}`}
            >
              {m.type === 'video' ? (
                <>
                  <video src={urlMedia(m.url)} muted preload="metadata" />
                  <span className="badge-video">Vidéo</span>
                </>
              ) : (
                <img src={urlMedia(m.url)} alt="" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
