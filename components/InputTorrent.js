/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
import '../scss/inputTorrent.scss';
import { useRouter } from 'next/router';

const InputTorrent = props => {
  const router = useRouter();

  const watchTorrent = e => {
    e.preventDefault();
    const magnet = document.getElementById('torrent-link').value;

    const encoded = encodeURIComponent(magnet);

    const url = `/watch/${encoded}`;
    console.log(url);

    router.push(url);
    return false;
  };

  return (
    <div className="input-torrent-container">
      <label htmlFor="torrent-link">Enter own torrent link</label>
      <input type="text" id="torrent-link" />
      <button type="submit" onClick={watchTorrent}>
        Watch
      </button>
    </div>
  );
};

export default InputTorrent;
