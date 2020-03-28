/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
import '../scss/movie.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVoteYea } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const Movie = props => {
  const c = props.class;
  const { movie } = props;
  const { title, images, year, rating, torrents } = movie;

  const torrent = torrents.en['720p'].url;

  return (
    <div className={`${c} movie-container`}>
      <div className="image-container card">
        <Link href={`/watch/${encodeURIComponent(torrent)}`}>
          <div className="detailed">
            <FontAwesomeIcon icon={faVoteYea} />
            <p>{rating.percentage / 10} / 10</p>
          </div>
        </Link>
        <img src={images.poster} alt="poster" />
      </div>
      <div className="movie-sub">
        <h4>{title}</h4>
        <p>{year}</p>
      </div>
      {/* <img src="/placeholder.png"/> */}
    </div>
  );
};

export default Movie;
